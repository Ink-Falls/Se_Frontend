import React, { useState } from "react";
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
  const [modules, setModules] = useState([
    {
      id: 1,
      title: "Module Title 1",
      description: "Description of module",
      resources: [
        { title: "Introduction to AI", link: "https://example.com/ai" },
        { title: "Machine Learning Basics", link: "https://example.com/ml" },
      ],
    },
    {
      id: 2,
      title: "Module Title 2",
      description: "Description of module",
      resources: [
        { title: "Data Science 101", link: "https://example.com/ds" },
      ],
    },
  ]);

  const [expandedModules, setExpandedModules] = useState([]);

  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar
        navItems={[
          {
            text: "Home",
            icon: <Home size={20} />,
            route: "/Learner/Dashboard",
          },
          {
            text: "Announcements",
            icon: <Megaphone size={20} />,
            route: "/Learner/CourseAnnouncements",
          },
          {
            text: "Modules",
            icon: <BookOpen size={20} />,
            route: "/Learner/CourseModules",
          },
          {
            text: "Assessments",
            icon: <ClipboardList size={20} />,
            route: "/Learner/Assessments",
          },
        ]}
      />
      <div className="flex-1 p-6 overflow-auto">
        <Header title="Environmental Science" subtitle="ENVI 101" />
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
