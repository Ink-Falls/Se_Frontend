import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import Modal from "../../components/common/Button/Modal";
import {
  MoreVertical,
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
  FileText,
  ExternalLink,
  InboxIcon,
  AlertTriangle,
} from "lucide-react";
import EditModuleModal from "../../components/common/Modals/Edit/EditModuleModal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";
import CreateModuleModal from "../../components/common/Modals/Create/CreateModuleModal";
import CreateContentModal from "../../components/common/Modals/Create/CreateContentModal";
import {
  getModulesByCourseId,
  createModule,
  updateModule,
  deleteModule,
  getModuleContents,
  addModuleContent,
} from "../../services/moduleService";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";

const TeacherCourseModules = () => {
  const { selectedCourse } = useCourse();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { text: "Home", icon: <Home size={20} />, route: "/Teacher/Dashboard" },
    {
      text: "Announcements",
      icon: <Megaphone size={20} />,
      route: "/Teacher/CourseAnnouncements",
    },
    {
      text: "Modules",
      icon: <BookOpen size={20} />,
      route: "/Teacher/CourseModules",
    },
    {
      text: "Assessments",
      icon: <ClipboardList size={20} />,
      route: "/Teacher/Assessment",
    },
    {
      text: "Attendance",
      icon: <User size={20} />,
      route: "/Teacher/Attendance",
    },
    {
      text: "Progress Tracker",
      icon: <LineChart size={20} />,
      route: "/TeacherProgress",
    },
  ];

  const [modules, setModules] = useState([]);
  const [expandedModules, setExpandedModules] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModuleOpen, setIsCreateModuleOpen] = useState(false);
  const [isCreateContentOpen, setIsCreateContentOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);

  const toggleModule = (id) => {
    setExpandedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".dropdown-menu") &&
        !event.target.closest(".menu-btn")
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedCourse?.id) {
        setError('No course selected. Please select a course from the dashboard.');
        setLoading(false);
        return;
      }
      
      // Get base module data
      const response = await getModulesByCourseId(selectedCourse.id);
      let modulesArray = response?.modules || [];
      
      if (modulesArray.length === 0 && response.length > 0) {
        modulesArray = response;
      }

      // Fetch contents for each module
      const modulesWithContents = await Promise.all(
        modulesArray.map(async (module) => {
          try {
            const moduleId = module.module_id || module.id;
            const contentsResponse = await getModuleContents(moduleId);
            const contents = contentsResponse?.contents || [];
            
            return {
              id: moduleId,
              title: module.name,
              description: module.description,
              resources: contents.map(content => ({
                id: content.content_id || content.id,
                title: content.name,
                link: content.link,
                content: content.link,
                type: content.type || 'link'
              })),
              createdAt: module.createdAt,
              updatedAt: module.updatedAt
            };
          } catch (error) {
            console.error(`Error fetching contents for module ${module.id}:`, error);
            return {
              id: module.module_id || module.id,
              title: module.name,
              description: module.description,
              resources: [],
              createdAt: module.createdAt,
              updatedAt: module.updatedAt
            };
          }
        })
      );

      setModules(modulesWithContents);
    } catch (error) {
      console.error('Error fetching modules:', error);
      setError('Failed to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Teacher/Dashboard");
      return;
    }

    const fetchModules = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!selectedCourse?.id) {
          setError(
            "No course selected. Please select a course from the dashboard."
          );
          setLoading(false);
          return;
        }

        // Get base module data
        const response = await getModulesByCourseId(selectedCourse.id);
        let modulesArray = response?.modules || [];

        if (modulesArray.length === 0 && response.length > 0) {
          modulesArray = response;
        }

        // Fetch contents for each module
        const modulesWithContents = await Promise.all(
          modulesArray.map(async (module) => {
            try {
              const moduleId = module.module_id || module.id;
              const contentsResponse = await getModuleContents(moduleId);
              const contents = contentsResponse?.contents || [];

              return {
                id: moduleId,
                title: module.name,
                description: module.description,
                resources: contents.map((content) => ({
                  id: content.content_id || content.id,
                  title: content.name,
                  link: content.link,
                  content: content.link,
                  type: content.type || "link",
                })),
                createdAt: module.createdAt,
                updatedAt: module.updatedAt,
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
                createdAt: module.createdAt,
                updatedAt: module.updatedAt,
              };
            }
          })
        );

        console.log("Modules with contents:", modulesWithContents);
        setModules(modulesWithContents);
      } catch (error) {
        console.error("Error fetching modules:", error);
        setError("Failed to connect to server. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [selectedCourse?.id, navigate]);

  const handleCreateModule = async (moduleData) => {
    try {
      if (!selectedCourse?.id) {
        throw new Error('No course selected');
      }

      // Format the data before sending
      const formattedData = {
        name: moduleData.name || moduleData.title,
        description: moduleData.description,
        course_id: parseInt(selectedCourse.id)
      };

      const newModule = await createModule(selectedCourse.id, formattedData);
      
      if (!newModule) {
        throw new Error('Failed to create module');
      }

      // Explicitly wait for fetchModules to complete
      await fetchModules();
      
      // Close modals after successful creation and refresh
      setIsCreateModuleOpen(false);
      setIsAddModuleOpen(false);
      
      return newModule;
    } catch (error) {
      console.error('Error creating module:', error);
      throw error;
    }
  };

  // Add debug logging
  useEffect(() => {
    console.log("Location state:", location.state);
    console.log("Course data:", selectedCourse);
  }, [location.state, selectedCourse]);

  const handleEdit = (module) => {
    setEditingModule(module);
    setDropdownOpen(null);
  };

  const saveModuleChanges = async (updatedModule) => {
    try {
      await updateModule(updatedModule.id, {
        name: updatedModule.title,
        description: updatedModule.description,
      });
      setModules((prev) =>
        prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
      );
      setEditingModule(null);
    } catch (error) {
      console.error("Error updating module:", error);
      // TODO: Show error message to user
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteModule(moduleToDelete.id);
      await fetchModules(); // Refresh modules after deletion
      setModuleToDelete(null);
    } catch (error) {
      console.error("Error deleting module:", error);
      // TODO: Show error message to user
    }
  };

  const handleCreateContent = async (contentData) => {
    try {
      console.log("Creating content for module:", selectedModuleId);

      await addModuleContent(selectedModuleId, {
        title: contentData.title.trim(),
        type: "link",
        content: contentData.content.trim(),
      });

      // Fetch updated contents for the module
      const updatedContents = await getModuleContents(selectedModuleId);

      // Update the specific module with new contents
      setModules((currentModules) =>
        currentModules.map((module) => {
          if (module.id === selectedModuleId) {
            return {
              ...module,
              resources: (updatedContents?.contents || []).map((content) => ({
                id: content.content_id || content.id,
                title: content.name,
                link: content.link,
                content: content.link,
                type: content.type || "link",
              })),
            };
          }
          return module;
        })
      );

      setIsCreateContentOpen(false);
    } catch (error) {
      console.error("Error creating content:", error);
      alert(error.message || "Failed to add content");
    }
  };

  const handleAddContent = (module) => {
    setSelectedModuleId(module.id);
    setSelectedModule(module);
    setIsCreateContentOpen(true);
  };

  const renderModulesList = () => (
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

            {/* Actions Menu */}
            <div className="relative flex items-center space-x-2">
              <button
                onClick={() => handleAddContent(module)}
                className="p-2 text-gray-600 hover:text-yellow-600"
                title="Add Content"
              >
                <Plus size={20} />
              </button>
              <ChevronDown
                size={20}
                className={`cursor-pointer transition-transform ${
                  expandedModules.includes(module.id) ? "rotate-180" : ""
                }`}
                onClick={() => toggleModule(module.id)}
              />
              <button
                onClick={(e) => toggleDropdown(module.id, e)}
                className="menu-btn relative z-20"
              >
                <MoreVertical size={20} className="cursor-pointer" />
              </button>
              {dropdownOpen === module.id && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg w-28 z-30 dropdown-menu">
                  <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                    onClick={() => handleEdit(module)}
                  >
                    <Edit size={16} className="mr-2" /> Edit
                  </button>
                  <button
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full text-red-600"
                    onClick={() => setModuleToDelete(module)}
                  >
                    <Trash2 size={16} className="mr-2" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content List */}
          {expandedModules.includes(module.id) && (
            <div className="mt-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-gray-700">
                  Learning Resources
                </h4>
              </div>
              <div className="space-y-3">
                {module.resources && module.resources.length > 0 ? (
                  module.resources.map((resource, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 p-3 rounded-lg shadow-sm"
                    >
                      <FileText size={18} className="text-gray-700 mr-2" />
                      <a
                        href={resource.link || resource.content}
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
  );

  // 1. No Course Selected State
  if (!selectedCourse?.id) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header title="Course Modules" />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No Course Selected
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              Please select a course from the dashboard to view its modules.
            </p>
            <button
              onClick={() => navigate("/Teacher/Dashboard")}
              className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Loading State
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="w-16 h-16 border-4 border-[#F6BA18] border-t-[#212529] rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Error State
  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <AlertTriangle size={64} className="text-red-500 mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Failed to Load Modules
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-8">
              We encountered an error while trying to fetch the module data.
              This could be due to network issues or server unavailability.
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300 flex items-center gap-2"
              >
                Try Again
              </button>
              <span className="text-sm text-gray-500 mt-2">
                You can try refreshing the page or contact support if the issue
                persists
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 4. Empty State
  if (!loading && modules.length === 0) {
    return (
      <div className="flex h-screen bg-gray-100">
        <Sidebar navItems={navItems} />
        <div className="flex-1 p-6">
          <Header
            title={selectedCourse?.name || "Course Modules"}
            subtitle={selectedCourse?.code}
          />
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <InboxIcon size={64} className="text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Modules Found
            </h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              There are currently no modules in this course. Get started by
              creating your first module.
            </p>
            <button
              onClick={() => setIsCreateModuleOpen(true)}
              className="px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
            >
              Create First Module
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Normal render with data
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Modules"}
          subtitle={selectedCourse?.code}
        />
        {renderModulesList()}

        {/* Add Module Button */}
        <button
          onClick={() => setIsAddModuleOpen(true)}
          className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus size={24} />
        </button>

        {/* Modals */}
        {editingModule && (
          <EditModuleModal
            module={editingModule}
            onSave={saveModuleChanges}
            onClose={() => setEditingModule(null)}
          />
        )}

        {moduleToDelete && (
          <DeleteModal
            module={moduleToDelete}
            onConfirm={confirmDelete}
            onCancel={() => setModuleToDelete(null)}
            onClose={() => {
              setModuleToDelete(null);
            }}
          />
        )}

        {isCreateModuleOpen && (
          <CreateModuleModal
            courseId={selectedCourse.id}
            onClose={() => setIsCreateModuleOpen(false)}
            onSubmit={handleCreateModule}
          />
        )}

        {isCreateContentOpen && (
          <CreateContentModal
            moduleId={selectedModuleId}
            onClose={() => {
              setIsCreateContentOpen(false);
              setSelectedModule(null);
            }}
            onSubmit={handleCreateContent}
          />
        )}

        {isAddModuleOpen && (
          <Modal
            isOpen={isAddModuleOpen}
            onClose={() => setIsAddModuleOpen(false)}
          >
            <h2 className="text-xl font-semibold mb-4">Add New Module</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = {
                  name: e.target.title.value,
                  description: e.target.description.value
                };
                await handleCreateModule(formData);
                setIsAddModuleOpen(false);
              }}
            >
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter description"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModuleOpen(false)}
                  className="mr-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-600"
                >
                  Add Module
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default TeacherCourseModules;
