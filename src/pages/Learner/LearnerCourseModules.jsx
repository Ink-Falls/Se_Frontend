import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
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

const LearnerCourseModules = () => {
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
  const location = useLocation();
  const courseData = location.state?.course;
  const navigate = useNavigate();

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug courseData
      console.log('Attempting to fetch modules with courseData:', courseData);
      
      if (!courseData?.id) {
        console.error('Missing course data:', location.state);
        setError('No course selected. Please select a course from the dashboard.');
        setLoading(false);
        return;
      }

      // Fetch modules for the course
      const response = await getModulesByCourseId(courseData.id);
      console.log('API Response:', response);

      let modulesArray = Array.isArray(response) ? response : response?.modules || [];
      
      // Fetch contents for each module
      const modulesWithContents = await Promise.all(
        modulesArray.map(async (module) => {
          try {
            const moduleId = module.module_id || module.id;
            const contentsResponse = await getModuleContents(moduleId);
            console.log(`Contents for module ${moduleId}:`, contentsResponse);
            
            return {
              id: moduleId,
              title: module.name,
              description: module.description,
              resources: (contentsResponse?.contents || []).map(content => ({
                id: content.content_id || content.id,
                title: content.name,
                link: content.link,
                content: content.link
              }))
            };
          } catch (error) {
            console.error(`Error fetching contents for module ${module.id}:`, error);
            return {
              id: module.module_id || module.id,
              title: module.name,
              description: module.description,
              resources: []
            };
          }
        })
      );

      console.log('Final formatted modules:', modulesWithContents);
      setModules(modulesWithContents);
      
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update useEffect to add better debugging
  useEffect(() => {
    console.log('CourseData changed:', courseData);
    if (courseData?.id) {
      fetchModules();
    } else {
      console.log('No course data available:', location.state);
      setError('Please select a course from the dashboard');
      setLoading(false);
    }
  }, [courseData]);

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
          <Header title={courseData?.name || 'Course Modules'} subtitle={courseData?.code} />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-red-500 mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{error}</h3>
            <button
              onClick={() => navigate('/Learner/Dashboard')}
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
          <Header title={courseData?.name || 'Course Modules'} subtitle={courseData?.code} />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-full max-w-md text-center">
              <div className="mx-auto w-24 h-24 bg-yellow-50 rounded-full flex items-center justify-center mb-6">
                <BookOpen size={40} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Modules Available
              </h3>
              <p className="text-gray-500 mb-6">
                There are no learning modules available for this course yet. 
                The teacher will add modules soon.
              </p>
              <button
                onClick={() => navigate('/Learner/Dashboard')}
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
        <Header title={courseData?.name || 'Course Modules'} subtitle={courseData?.code} />
        
        <div className="flex flex-col gap-4 mt-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg"
            >
              {/* Module Header */}
              <div className="flex justify-between items-center cursor-pointer">
                <div className="w-full" onClick={() => toggleModule(module.id)}>
                  <p className="text-xs text-gray-500">MODULE {module.id}</p>
                  <h3 className="font-bold text-lg text-gray-800">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-600">{module.description}</p>
                </div>

                {/* Expand Arrow */}
                <div className="flex items-center">
                  <ChevronDown
                    size={20}
                    className={`cursor-pointer transition-transform ${
                      expandedModules.includes(module.id) ? "rotate-180" : ""
                    }`}
                    onClick={() => toggleModule(module.id)}
                  />
                </div>
              </div>

              {/* Learning Resources */}
              {expandedModules.includes(module.id) && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Learning Resources
                  </h4>
                  <div className="space-y-3">
                    {module.resources.length > 0 ? (
                      module.resources.map((resource, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm"
                        >
                          <FileText size={18} className="text-gray-700 mr-2" />
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex-1"
                          >
                            {resource.title}
                          </a>
                          <ExternalLink size={18} className="text-gray-500" />
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">
                        No resources available.
                      </p>
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
