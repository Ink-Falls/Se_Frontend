import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import { Book, Bell } from "lucide-react";
import Header from "./Header";

const TeacherDashboard = () => {
  // Sidebar Navigation Items
  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/TeacherDashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/TeacherNotification",
    },
  ];

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const placeholderImageUrl =
    "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg";

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Simulated API call with setTimeout
        const response = await new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: () =>
                Promise.resolve([
                  {
                    name: "Environmental Science",
                    code: "ENV-101",
                    description: "An introduction to environmental science.",
                  },
                  {
                    name: "Course Name 2",
                    code: "COURSE-002",
                    description: "Another fascinating course.",
                  },
                  {
                    name: "Course Name 3",
                    code: "COURSE-003",
                    description: "Description of course 3.",
                  },
                  {
                    name: "Course Name 4",
                    code: "COURSE-004",
                    description: "Description of course 4.",
                  },
                  {
                    name: "Course Name 5",
                    code: "COURSE-005",
                    description: "Description of course 5.",
                  },
                  {
                    name: "Course Name 6",
                    code: "COURSE-006",
                    description: "Description of course 6.",
                  },
                ]),
            });
          }, 500);
        });

        if (response.ok) {
          const data = await response.json();
          const coursesWithImages = data.map((course) => ({
            ...course,
            imageUrl: placeholderImageUrl,
          }));
          setCourses(coursesWithImages);
        } else {
          throw new Error("Failed to fetch courses.");
        }
      } catch (error) {
        setError(error.message);
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar now accepts navItems as a prop */}
      <Sidebar navItems={navItems} />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Header title="My Courses" />

        {loading && <p>Loading courses...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}

        {/* Course Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.code}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform transform hover:scale-105 hover:shadow-lg"
              >
                <div className="h-32">
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 flex-grow">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-600">{course.code}</p>
                  <p className="text-gray-500 mt-2 text-sm">
                    {course.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
