import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import { Book, Bell } from "lucide-react";

function StudentDashboard() {
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: "Introduction to Environmental Science",
      code: "ENV101",
      description: "Learn the basics of environmental science and sustainability.",
      image: "https://via.placeholder.com/300x200.png?text=ENV101",
    },
    {
      id: 2,
      title: "Advanced Machine Learning",
      code: "ML501",
      description: "Explore advanced topics in machine learning and AI.",
      image: "https://via.placeholder.com/300x200.png?text=ML501",
    },
    {
      id: 3,
      title: "Web Development Fundamentals",
      code: "WEB101",
      description: "Master the basics of HTML, CSS, and JavaScript.",
      image: "https://via.placeholder.com/300x200.png?text=WEB101",
    },
    {
      id: 4,
      title: "Data Structures and Algorithms",
      code: "DSA201",
      description: "Understand the core concepts of data structures and algorithms.",
      image: "https://via.placeholder.com/300x200.png?text=DSA201",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false); // Simulate loading state

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Student/Courses" },
    { text: "Notifications", icon: <Bell size={20} />, route: "/Student/Notifications" },
  ];

  if (isLoading) {
    return <div>Loading...</div>; // Render loading indicator
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header title="My Courses" />

        {/* Course Grid */}
        <div className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Course Image */}
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-32 object-cover"
                  />

                  {/* Course Details */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{course.code}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {course.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600">
                No courses available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;