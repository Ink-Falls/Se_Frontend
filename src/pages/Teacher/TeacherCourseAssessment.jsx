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

const TeacherCourseAssessment = () => {
  const [assessments, setAssessments] = useState([
    {
      id: 1,
      title: "Midterm Exam",
      status: "Not Started",
    },
    {
      id: 2,
      title: "Final Project",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Quiz 1",
      status: "Completed",
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
        <Header title="Environmental Science" subtitle="ENVI 101" />

        {/* Assessment List */}
        <div className="flex flex-col gap-4 mt-4">
          {assessments.map((assessment) => (
            <div
              key={assessment.id}
              className="relative bg-white rounded-lg p-5 border-l-4 border-yellow-500 transition-all shadow-sm hover:shadow-lg"
            >
              {/* Assessment Header */}
              <div className="flex justify-between items-center cursor-pointer">
                <div
                  className="w-full"
                  onClick={() => toggleAssessment(assessment.id)}
                >
                  <p className="text-xs text-gray-500">ASSESSMENT</p>
                  <h3 className="font-bold text-lg text-gray-800">
                    {assessment.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        assessment.status === "Completed"
                          ? "text-green-600"
                          : assessment.status === "In Progress"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {assessment.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherCourseAssessment;