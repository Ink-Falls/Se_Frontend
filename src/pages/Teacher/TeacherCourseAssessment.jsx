import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
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
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";
import { useNavigate } from "react-router-dom";
import CreateAssessmentModal from "../../components/common/Modals/Create/CreateAssessmentModal";

const TeacherCourseAssessment = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate("/Teacher/Dashboard");
    }
  }, [selectedCourse, navigate]);

  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: "Midterm Exam",
      status: "Not Started",
      dueDate: "2024-03-15",
    },
    {
      id: 2,
      title: "Final Project",
      status: "In Progress",
      dueDate: "2024-03-20",
    },
    {
      id: 3,
      title: "Quiz 1",
      status: "Completed",
      dueDate: "2024-03-10",
    },
  ]);

  const [expandedAssessments, setExpandedAssessments] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);
  const [isAddAssessmentOpen, setIsAddAssessmentOpen] = useState(false);
  const [newAssessment, setNewAssessment] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "Not Started",
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const toggleAssessment = (id) => {
    setExpandedAssessments((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleDropdown = (id, event) => {
    event.stopPropagation();
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const handleEdit = (assessment) => {
    setEditingAssessment(assessment);
    setDropdownOpen(null);
  };

  const saveAssessmentChanges = (updatedAssessment) => {
    setAssessments((prev) =>
      prev.map((a) => (a.id === updatedAssessment.id ? updatedAssessment : a))
    );
    setEditingAssessment(null);
  };

  const confirmDelete = () => {
    setAssessments((prev) =>
      prev.filter((a) => a.id !== assessmentToDelete.id)
    );
    setAssessmentToDelete(null);
  };

  const handleAddAssessment = () => {
    if (
      newAssessment.title.trim() &&
      newAssessment.description.trim() &&
      newAssessment.dueDate.trim()
    ) {
      const newId = assessments.length + 1;
      setAssessments([...assessments, { id: newId, ...newAssessment }]);
      setIsAddAssessmentOpen(false);
      setNewAssessment({
        title: "",
        description: "",
        dueDate: "",
        status: "Not Started",
      });
    }
  };

  const handleAssessmentClick = (assessment) => {
    navigate(`/Teacher/Assessment/View/${assessment.id}`, {
      state: { assessment },
    });
  };

  const handleCreateAssessment = async (assessmentData) => {
    try {
      // TODO: Add API call to create assessment
      const newAssessment = {
        id: assessments.length + 1,
        ...assessmentData,
        status: "Not Started",
      };

      setAssessments([...assessments, newAssessment]);
    } catch (error) {
      console.error("Error creating assessment:", error);
      throw error; // This will be caught by the modal
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
            route: "/Teacher/Progress",
          },
        ]}
      />
      <div className="flex-1 p-6 overflow-auto">
        <Header
          title={selectedCourse?.name || "Course Assessment"}
          subtitle={selectedCourse?.code}
        />

        {/* Assessment List */}
        <div className="flex flex-col gap-4 mt-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg cursor-pointer"
              onClick={() => handleAssessmentClick(assessment)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    ASSESSMENT {assessment.id}
                  </p>
                  <h3 className="font-bold text-lg text-gray-800 mt-1">
                    {assessment.title}
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        assessment.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : assessment.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {assessment.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Due: {new Date(assessment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Assessment Button */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="fixed bottom-8 right-8 bg-yellow-500 text-white rounded-full p-4 shadow-lg hover:bg-yellow-600 transition-colors"
        >
          <Plus size={24} />
        </button>

        {/* Create Assessment Modal */}
        {isCreateModalOpen && (
          <CreateAssessmentModal
            onClose={() => setIsCreateModalOpen(false)}
            onSubmit={handleCreateAssessment}
          />
        )}
      </div>
    </div>
  );
};

export default TeacherCourseAssessment;
