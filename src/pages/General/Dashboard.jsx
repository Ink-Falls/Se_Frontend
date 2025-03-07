import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell } from "lucide-react";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar"; // Import the bottom nav bar

const Dashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Notifications",
    },
  ];

  const placeholderImageUrl =
    "https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIyLTA2L3RwMjAxLXNhc2ktMjkta20xa25vNzkuanBn.jpg";

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
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

  const handleCourseClick = (course) => {
    navigate("/CourseAnnouncements", {
      state: { courseTitle: course.name, courseCode: course.code },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar (Large Screens Only) */}
      <div className="hidden lg:flex">
        <Sidebar navItems={navItems} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-md:p-5 overflow-y-auto">
        <Header title="My Courses" />
        {loading && <p>Loading courses...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {courses.map((course) => (
              <div
                key={course.code}
                className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
                onClick={() => handleCourseClick(course)}
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

      {/* Mobile Bottom Navigation */}
      <MobileNavBar />
    </div>
  );
};

export default Dashboard;
