// src/components/Courses.jsx
import React, { useEffect, useState } from "react";
import Sidebar, { SidebarItem } from "./common/layout/Sidebar";
import { Home, Book, Bell, FileText, MoreVertical } from "lucide-react";
import Header from "./common/layout/Header"; // Import the Header component

const Courses = () => {
  const navItems = [
    { text: "Users", icon: <Home size={20} />, route: "/StudentDashboard" },
    { text: "Courses", icon: <Book size={20} />, route: "/Courses" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/notifications",
    },
    {
      text: "Announcements",
      icon: <FileText size={20} />,
      route: "/announcements",
    },
  ];

  const [courses, setCourses] = useState([]);
  const [activeCourses, setActiveCourses] = useState([]); // Track active courses for dropdowns

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses");
        const data = await response.json();

        setCourses(data.courses || getPlaceholderCourses());
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCourses(getPlaceholderCourses());
      }
    };

    fetchCourses();
  }, []);

  const getPlaceholderCourses = () => {
    return [
      {
        id: 1,
        code: "CS101",
        name: "Introduction to React",
        description: "Learn the basics of React.",
        learnerGroup: "Learner Group 1",
        teacherGroup: "Teacher Group 1",
        teacher: "Jane Doe",
        image: "img.png",
      },
      {
        id: 2,
        code: "JS102",
        name: "Advanced JavaScript",
        description: "Deep dive into JavaScript ES6 and beyond.",
        learnerGroup: "Learner Group 2",
        teacherGroup: "Teacher Group 2",
        teacher: "John Doe",
        image: "img.png",
      },
      // Add more courses as needed
    ];
  };

  const toggleDropdown = (courseId) => {
    setActiveCourses(
      (prev) =>
        prev.includes(courseId)
          ? prev.filter((id) => id !== courseId) // Remove courseId if it's already active
          : [...prev, courseId] // Add courseId if it's not active
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar>
        {navItems.map((item) => (
          <SidebarItem
            key={item.text}
            icon={item.icon}
            text={item.text}
            route={item.route}
          />
        ))}
      </Sidebar>

      <div className="flex-1 p-6 overflow-auto">
        <Header title="Courses" /> {/* Pass the title prop */}
        <div className="mt-4">
          <div className="bg-white shadow rounded-lg">
            <ul className="divide-y divide-gray-200">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <li key={course.id}>
                    <div
                      className={`flex justify-between items-center p-4 hover:bg-gray-50 cursor-pointer border-l-4 ${
                        activeCourses.includes(course.id)
                          ? "border-yellow-500"
                          : "border-transparent"
                      }`}
                      onClick={() => toggleDropdown(course.id)}
                    >
                      <div>
                        <h3 className="text-lg font-medium text-[#334155]">
                          {course.name}
                        </h3>
                        <p className="text-sm text-gray-500">{course.code}</p>
                      </div>
                      <MoreVertical size={20} />
                    </div>
                    {activeCourses.includes(course.id) && (
                      <div className="p-4 bg-gray-50 shadow-md">
                        {" "}
                        {/* Added shadow for the dropdown */}
                        <p className="font-semibold">Description</p>
                        <p className="text-gray-700">{course.description}</p>
                        <div className="mt-2"></div>
                        <p className="font-semibold">Teacher</p>
                        <p className="text-gray-700">{course.teacher}</p>
                        <div className="mt-2">
                          <p className="font-semibold">Learner Group:</p>
                          <p>{course.learnerGroup}</p>
                        </div>
                        <div className="mt-2">
                          <p className="font-semibold">
                            Student Teacher Group:
                          </p>
                          <p>{course.teacherGroup}</p>
                        </div>
                        <div className="mt-2">
                          <p className="font-semibold">Image:</p>
                          <p>{course.image}</p>
                        </div>
                      </div>
                    )}
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-gray-600">
                  No courses available
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Courses;
