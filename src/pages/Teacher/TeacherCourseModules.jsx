import React, { useState, useEffect } from "react";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import Modal from "../../components/common/Button/Modal";
import MobileNavBar from "../../components/common/layout/MobileNavbar";
import BlackHeader from "../../components/common/layout/BlackHeader";
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
  ArrowUpDown,
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
  deleteModuleContent,
} from "../../services/moduleService";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const moduleColors = {
  blue: {
    bg: "#3B82F6",
    accent: "#60A5FA",
    light: "#EFF6FF",
  },
  purple: {
    bg: "#8B5CF6",
    accent: "#A78BFA",
    light: "#F5F3FF",
  },
  green: {
    bg: "#22C55E",
    accent: "#4ADE80",
    light: "#F0FDF4",
  },
  pink: {
    bg: "#EC4899",
    accent: "#F472B6",
    light: "#FDF2F8",
  },
  orange: {
    bg: "#F97316",
    accent: "#FB923C",
    light: "#FFF7ED",
  },
};

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
      route: "/Teacher/ProgressTracker",
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
  const [successMessage, setSuccessMessage] = useState("");
  const [resourceToDelete, setResourceToDelete] = useState(null);
  const [isSorted, setIsSorted] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
        setError(
          "No course selected. Please select a course from the dashboard."
        );
        setLoading(false);
        return;
      }

      const response = await getModulesByCourseId(selectedCourse.id);
      let modulesArray = response?.modules || [];

      if (modulesArray.length === 0 && response.length > 0) {
        modulesArray = response;
      }

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

      setModules(modulesWithContents);
    } catch (error) {
      console.error("Error fetching modules:", error);
      setError("Failed to connect to server. Please try again later.");
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

        const response = await getModulesByCourseId(selectedCourse.id);
        let modulesArray = response?.modules || [];

        if (modulesArray.length === 0 && response.length > 0) {
          modulesArray = response;
        }

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
        throw new Error("No course selected");
      }

      const formattedData = {
        name: moduleData.name || moduleData.title,
        description: moduleData.description,
        course_id: parseInt(selectedCourse.id),
      };

      const newModule = await createModule(selectedCourse.id, formattedData);

      if (!newModule) {
        throw new Error("Failed to create module");
      }

      await fetchModules();

      setIsCreateModuleOpen(false);
      setIsAddModuleOpen(false);
      setSuccessMessage("Module created successfully");

      return newModule;
    } catch (error) {
      console.error("Error creating module:", error);
      throw error;
    }
  };

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
      setSuccessMessage("Module updated successfully");
    } catch (error) {
      console.error("Error updating module:", error);
      setError("Failed to update module");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteModule(moduleToDelete.id);
      await fetchModules();
      setModuleToDelete(null);
      setSuccessMessage("Module deleted successfully");
    } catch (error) {
      console.error("Error deleting module:", error);
      setError("Failed to delete module");
    }
  };

  const handleCreateContent = async (contentData) => {
    try {
      await addModuleContent(selectedModuleId, {
        title: contentData.title.trim(),
        type: "link",
        content: contentData.content.trim(),
      });

      const updatedContents = await getModuleContents(selectedModuleId);

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
      setSuccessMessage("Learning resource added successfully");
    } catch (error) {
      console.error("Error creating content:", error);
      setError("Failed to add learning resource");
    }
  };

  const handleAddContent = (module) => {
    setSelectedModuleId(module.id);
    setSelectedModule(module);
    setIsCreateContentOpen(true);
  };

  const handleDeleteContent = async (resourceId) => {
    try {
      await deleteModuleContent(resourceId);
      setModules((currentModules) =>
        currentModules.map((module) => ({
          ...module,
          resources: module.resources.filter(
            (resource) => resource.id !== resourceId
          ),
        }))
      );
      setSuccessMessage("Resource deleted successfully");
      setResourceToDelete(null);
    } catch (error) {
      console.error("Error deleting resource:", error);
      setError("Failed to delete resource");
    }
  };

  const handleSort = () => {
    const sortedModules = [...modules].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      
      // Compare dates - when isSorted is false, newest first (descending)
      // when isSorted is true, oldest first (ascending)
      return isSorted ? dateA - dateB : dateB - dateA;
    });
    setModules(sortedModules);
    setIsSorted(!isSorted);
  };

  const renderModulesList = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="divide-y divide-gray-100">
          {modules.map((module, index) => {
            const color =
              moduleColors[
                Object.keys(moduleColors)[
                  index % Object.keys(moduleColors).length
                ]
              ];
            const resourceCount = module.resources?.length || 0;
            const hasResources = resourceCount > 0;

            return (
              <div
                key={module.id}
                className={`p-6 first:rounded-t-lg last:rounded-b-lg ${
                  hasResources ? `border-${color.bg}` : ""
                } group hover:bg-gray-50 transition-colors duration-200`}
              >
                <div className="flex items-start gap-4">
                  {/* Module Number Badge */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold text-white transform transition hover:scale-105"
                      style={{ backgroundColor: color.bg }}
                    >
                      {index + 1}
                    </div>
                  </div>

                  {/* Module Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800 hover:text-yellow-600 transition-colors">
                        {module.title}
                      </h3>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: color.light,
                          color: color.bg,
                        }}
                      >
                        {hasResources
                          ? `${resourceCount} Resources`
                          : "No Resources"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(module.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {module.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(module)}
                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                        title="Edit module"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => setModuleToDelete(module)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete module"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Resources Section */}
                    <div
                      className="mt-4 rounded-lg p-4 ml-[-4rem]"
                      style={{ backgroundColor: color.light }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4
                          className="text-sm font-medium"
                          style={{ color: color.bg }}
                        >
                          Learning Resources
                        </h4>
                        <button
                          onClick={() => handleAddContent(module)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors hover:bg-white/80"
                          style={{ color: color.bg, backgroundColor: "white" }}
                        >
                          <Plus size={14} className="inline mr-1" />
                          Add Resource
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {module.resources && module.resources.length > 0 ? (
                          module.resources.map((resource) => (
                            <div
                              key={resource.id}
                              className="flex items-center bg-white p-3 rounded-lg group hover:shadow-md transition-all duration-200 border border-transparent hover:border-yellow-500"
                            >
                              <div
                                className="p-2 rounded-lg mr-3 transition-colors"
                                style={{
                                  backgroundColor: `${color.bg}20`,
                                  color: color.bg,
                                }}
                              >
                                <FileText size={16} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <a
                                  href={resource.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate text-sm font-medium text-gray-900 group-hover:text-yellow-600"
                                >
                                  {resource.title}
                                </a>
                                <p className="text-xs text-gray-500 truncate">
                                  {resource.link}
                                </p>
                              </div>
                              <button
                                onClick={() => setResourceToDelete(resource)}
                                className="p-1.5 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                                title="Delete resource"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div
                            className="col-span-2 text-center py-8 bg-white rounded-lg border-2 border-dashed"
                            style={{ borderColor: `${color.bg}40` }}
                          >
                            <div className="mb-2">
                              <FileText
                                size={24}
                                className="mx-auto"
                                style={{ color: color.bg }}
                              />
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              No resources added yet
                            </p>
                            <button
                              onClick={() => handleAddContent(module)}
                              className="text-sm font-medium inline-flex items-center"
                              style={{ color: color.bg }}
                            >
                              <Plus size={16} className="mr-1" />
                              Add your first resource
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Modules Yet
      </h3>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Get started by creating your first module for this course.
      </p>
      <button
        onClick={() => setIsAddModuleOpen(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] transition-colors duration-300"
      >
        <Plus size={20} className="mr-2" />
        Create Your First Module
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Modules"}
          subtitle={selectedCourse?.code}
        />
        <div className="relative z-50">
          <MobileNavBar navItems={navItems} />
        </div>

        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-[#212529] rounded-t-lg shadow-md">
          <BlackHeader title="Modules" count={modules.length}>
            <button
              onClick={() => setIsAddModuleOpen(true)}
              className="p-2 rounded hover:bg-gray-700"
            >
              <Plus size={20} />
            </button>
            <button
              onClick={handleSort}
              className="p-2 rounded hover:bg-gray-700"
              aria-label="Sort modules"
            >
              <ArrowUpDown size={20} />
            </button>
          </BlackHeader>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : modules.length === 0 ? (
          <EmptyState />
        ) : (
          renderModulesList()
        )}

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
                  description: e.target.description.value,
                };
                await handleCreateModule(formData);
                setIsAddModuleOpen(false);
              }}
            >
              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="block font-medium text-gray-700"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="Enter title"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="block font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
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

        {resourceToDelete && (
          <DeleteModal
            onClose={() => setResourceToDelete(null)}
            onConfirm={() => handleDeleteContent(resourceToDelete.id)}
            message={`Are you sure you want to delete "${resourceToDelete.title}"?`}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherCourseModules;
