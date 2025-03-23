import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getModulesByCourseId,
  getModuleContents,
} from "../../services/moduleService";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import {
  ChevronDown,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  FileText,
  ExternalLink,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";

const LearnerCourseModules = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Learner/Dashboard" },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Learner/CourseModules",
    },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Learner/CourseAnnouncements",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: "/Learner/Assessment",
    },
  ];

  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Learner/Dashboard");
      return;
    }

    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedCourse?.id) {
          console.error("Missing course data:", selectedCourse);
          setError(
            "No course selected. Please select a course from the dashboard."
          );
          setLoading(false);
          return;
        }

        // Fetch modules for the course
        const response = await getModulesByCourseId(selectedCourse.id);

        let modulesArray = Array.isArray(response)
          ? response
          : response?.modules || [];

        // Fetch contents for each module
        const modulesWithContents = await Promise.all(
          modulesArray.map(async (module) => {
            try {
              const moduleId = module.module_id || module.id;
              const contentsResponse = await getModuleContents(moduleId);

              return {
                id: moduleId,
                title: module.name,
                description: module.description,
                resources: (contentsResponse?.contents || []).map(
                  (content) => ({
                    id: content.content_id || content.id,
                    title: content.name,
                    link: content.link,
                    content: content.link,
                  })
                ),
              };
            } catch (error) {
              console.error(
                `Error fetching contents for module ${module.id}:`,
                error
              );
              return {
                id: module.module_id || module.id,
                title: module.name,
                description: module.description,
                resources: [],
              };
            }
          })
        );

        setModules(modulesWithContents);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setError("Failed to load modules. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [selectedCourse, navigate]);

  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
      <MobileNavBar navItems={navItems} />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <button
              onClick={() => navigate("/Learner/Dashboard")}
              className="mt-4 px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Add this condition before the normal render
  if (!loading && modules.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
      <MobileNavBar navItems={navItems} />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Modules Available
              </h3>
              <p className="text-gray-500 mb-6">
                There are no learning modules available for this course yet. The
                teacher will add modules soon.
              </p>
              <button
                onClick={() => navigate("/Learner/Dashboard")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529]"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal render
  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Modules"}
          subtitle={selectedCourse?.code}
        />
      <MobileNavBar navItems={navItems} />

        <div className="flex flex-col gap-4 mt-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg"
            >
              <div className="flex justify-between items-center cursor-pointer">
                <div className="w-full" onClick={() => toggleModule(module.id)}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                      MODULE {module.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {module.createdAt &&
                        new Date(module.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-yellow-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {module.description}
                  </p>
                </div>

                <button
                  className="p-2 text-gray-600 hover:text-yellow-600 transition-colors"
                  onClick={() => toggleModule(module.id)}
                >
                  <ChevronDown
                    size={20}
                    className={`transform transition-transform duration-200 ${
                      expandedModules.includes(module.id) ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {/* Content List */}
              {expandedModules.includes(module.id) && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="flex items-center gap-2 text-gray-700 font-semibold">
                      <FileText size={18} className="text-yellow-500" />
                      Learning Resources
                      <span className="text-xs text-gray-500 font-normal">
                        ({module.resources?.length || 0} items)
                      </span>
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {module.resources && module.resources.length > 0 ? (
                      module.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-50 hover:bg-gray-100 p-4 rounded-lg transition-all duration-200 group"
                        >
                          <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                            <FileText size={18} className="text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <a
                              href={resource.link || resource.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block"
                            >
                              <h5 className="font-medium text-gray-800 mb-0.5 group-hover:text-yellow-600">
                                {resource.title}
                              </h5>
                              <p className="text-sm text-gray-500 truncate">
                                {resource.link}
                              </p>
                            </a>
                          </div>
                          <div className="flex items-center">
                            <a
                              href={resource.link || resource.content}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                            >
                              <ExternalLink size={18} />
                            </a>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">
                          No resources available yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearnerCourseModules;
