import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell, ClipboardList } from "lucide-react";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";

const LearnerDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navItems = [
    { text: "Courses", icon: <Book size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Notifications",
      icon: <Bell size={20} />,
      route: "/Learner/Notifications",
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
                    studentCount: 32,
                  },
                  {
                    name: "Computer Programming",
                    code: "CS-101",
                    description: "Introduction to programming concepts.",
                    studentCount: 28,
                  },
                  {
                    name: "Digital Arts",
                    code: "ART-201",
                    description: "Explore digital art and design.",
                    studentCount: 24,
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
    navigate("/Learner/CourseAnnouncements", {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div
                key={course.code}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
                onClick={() => handleCourseClick(course)}
              >
                {/* Image Container with Gradient Overlay */}
                <div className="relative h-40">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <img
                    src={course.imageUrl}
                    alt={course.name}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content Section */}
                <div className="p-5 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-yellow-600 transition-colors">
                        {course.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        {course.code}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                  </p>

                  {/* Course Metadata */}
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <div className="flex justify-start items-center text-sm text-gray-600">
                      <span className="flex items-center">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        {course.studentCount} Learners
                      </span>
                    </div>
                  </div>
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

export default LearnerDashboard;
