import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import { Book, Bell } from "lucide-react";
import Header from "../../components/common/layout/Header";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import { getLearnerCourses } from "../../services/courseService"; // Add this import
import EmptyState from "../../components/common/states/EmptyState";
import LoadingSpinner from "../../components/common/LoadingSpinner"; // Add this import

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

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const coursesData = await getLearnerCourses();
      console.log("Fetched courses:", coursesData); // For debugging
      setCourses(coursesData);
    } catch (error) {
      setError(error.message || "Failed to fetch courses");
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCourseClick = (course) => {
    // Debug log the course data
    console.log("Clicking course:", course);

    navigate("/Learner/CourseModules", {
      state: {
        course: {
          id: course.id || course.course_id, // Handle both possible ID fields
          name: course.name,
          code: course.code,
        },
      },
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

        {loading && <LoadingSpinner />}

        {error && (
          <div className="flex flex-col items-center justify-center h-[60vh] p-4">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Failed to Load Courses
                </h3>
                <p className="text-sm text-gray-500 mb-6">{error}</p>
                <button
                  onClick={() => fetchCourses()}
                  className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <EmptyState
            title="No Subjects Available"
            message="You are not enrolled in any subjects at the moment. Please wait for your enrollment to be processed or contact your administrator."
          />
        )}

        {!loading && !error && courses.length > 0 && (
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
