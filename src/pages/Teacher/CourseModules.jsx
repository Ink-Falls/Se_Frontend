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
} from "lucide-react";
import EditModuleModal from "../../components/common/Modals/Edit/EditModuleModal";
import DeleteModal from "../../components/common/Modals/Delete/DeleteModal";

const CourseModules = () => {
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
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleToDelete, setModuleToDelete] = useState(null);
  const [isAddModuleOpen, setIsAddModuleOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: "", description: "" });

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

  const handleEdit = (module) => {
    setEditingModule(module);
    setDropdownOpen(null);
  };

  const saveModuleChanges = (updatedModule) => {
    setModules((prev) =>
      prev.map((m) => (m.id === updatedModule.id ? updatedModule : m))
    );
    setEditingModule(null);
  };

  const confirmDelete = () => {
    setModules((prev) => prev.filter((m) => m.id !== moduleToDelete.id));
    setModuleToDelete(null);
  };

  const handleAddModule = () => {
    if (newModule.title.trim() && newModule.description.trim()) {
      const newId = modules.length + 1;
      setModules([...modules, { id: newId, ...newModule, resources: [] }]);
      setIsAddModuleOpen(false);
      setNewModule({ title: "", description: "" });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <Sidebar
        navItems={[
          {
            text: "Home",
            icon: <Home size={20} />,
            route: "/Teacher/Dashboard",
          },
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
            route: "/Teacher/Assessments",
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

                {/* Expand Arrow and Menu */}
                <div className="relative flex items-center space-x-2">
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
                        className="flex items-center px-4 py-2 text-sm hover:bg-gray-100 w-full"
                        onClick={() => setModuleToDelete(module)}
                      >
                        <Trash2 size={16} className="mr-2" /> Delete
                      </button>
                    </div>
                  )}
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

        {isAddModuleOpen && (
          <Modal
            isOpen={isAddModuleOpen}
            onClose={() => setIsAddModuleOpen(false)}
          >
            <h2 className="text-xl font-semibold mb-4">Add New Module</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddModule();
              }}
            >
              <div className="mb-4">
                <label className="block font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  placeholder="Enter title"
                  value={newModule.title}
                  onChange={(e) =>
                    setNewModule({ ...newModule, title: e.target.value })
                  }
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={newModule.description}
                  placeholder="Enter desciption"
                  onChange={(e) =>
                    setNewModule({ ...newModule, description: e.target.value })
                  }
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

export default CourseModules;
