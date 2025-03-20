import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  User,
  LineChart,
  ArrowLeft,
  FileText,
  Edit2,
  Clock,
} from "lucide-react";

const TeacherAssessmentView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessment } = location.state || {};
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isGrading, setIsGrading] = useState(false);
  const [grade, setGrade] = useState(0);

  // Mock data - replace with actual API calls
  const [students] = useState([
    {
      id: 1,
      name: "John Doe",
      submitted: true,
      submissionDate: "2023-12-10T10:30:00",
      grade: 85,
      submission: {
        textAnswer: "This is my submission...",
        fileName: "assignment.pdf",
        submittedAt: "2023-12-10T10:30:00",
      },
    },
    {
      id: 2,
      name: "Jane Smith",
      submitted: false,
      grade: null,
    },
  ]);

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

  const handleSubmitGrade = () => {
    // Update the student's grade
    const updatedStudents = students.map((student) => {
      if (student.id === selectedStudent.id) {
        return { ...student, grade };
      }
      return student;
    });
    setIsGrading(false);
  };

  const renderStudentSubmission = () => {
    if (!selectedStudent) return null;
    if (!selectedStudent.submitted) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No submission yet</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap mb-4">
            {selectedStudent.submission.textAnswer}
          </p>
          {selectedStudent.submission.fileName && (
            <div className="flex items-center text-sm text-gray-600">
              <FileText size={16} className="mr-2" />
              {selectedStudent.submission.fileName}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <Clock size={14} className="inline mr-1" />
            Submitted:{" "}
            {new Date(selectedStudent.submission.submittedAt).toLocaleString()}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Grade:{" "}
              {selectedStudent.grade
                ? `${selectedStudent.grade}/100`
                : "Not graded"}
            </span>
            <button
              onClick={() => setIsGrading(true)}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
            >
              {selectedStudent.grade ? "Edit Grade" : "Grade"}
            </button>
          </div>
        </div>

        {isGrading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-96">
              <h3 className="text-lg font-semibold mb-4">Grade Submission</h3>
              <input
                type="number"
                min="0"
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-2 border rounded-md mb-4"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsGrading(false)}
                  className="px-4 py-2 border rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitGrade}
                  className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
                >
                  Save Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const [submissions] = useState([
    {
      id: 1,
      studentName: "John Doe",
      studentId: "2021-0001",
      status: "Submitted",
      submissionDate: "2023-12-10T10:30:00",
      score: 85,
    },
    {
      id: 2,
      studentName: "Jane Smith",
      studentId: "2021-0002",
      status: "Late",
      submissionDate: "2023-12-11T15:45:00",
      score: 75,
    },
    {
      id: 3,
      studentName: "Bob Wilson",
      studentId: "2021-0003",
      status: "Pending",
      submissionDate: null,
      score: null,
    },
  ]);

  const getStatusColor = (status, score) => {
    if (status === "Not Submitted") return "bg-gray-100 text-gray-600";
    if (status === "Late") return "bg-yellow-100 text-yellow-700";
    if (status === "Submitted") {
      if (score >= 75) return "bg-green-100 text-green-700";
      if (score < 75) return "bg-red-100 text-red-700";
    }
    return "bg-blue-100 text-blue-700";
  };

  const handleSubmissionClick = (submission) => {
    navigate(`/Teacher/Assessment/Submission/${submission.id}`, {
      state: {
        assessment,
        submission,
      },
    });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Header title="Assessment" />

          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-white">
              <button
                onClick={() => navigate("/Teacher/Assessment")}
                className="flex items-center gap-2 text-gray-100 hover:text-[#F6BA18] transition-colors mb-4 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span>Back to Assessments</span>
              </button>

              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {assessment?.title}
                  </h1>
                  <p className="text-gray-200 flex items-center gap-2">
                    <Clock size={16} />
                    Due: {new Date(assessment?.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions Section */}
            <div className="p-6 border-b border-gray-200">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  Instructions
                </h3>
                <div className="prose max-w-none text-gray-600">
                  {assessment?.description || "No instructions provided."}
                </div>
              </div>
            </div>

            {/* Submissions Section */}
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Student Submissions
                </h3>
                <div className="flex gap-2">
                  {/* Add any action buttons here if needed */}
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Student ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Submission Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr
                        key={submission.id}
                        onClick={() => handleSubmissionClick(submission)}
                        className="hover:bg-gray-50 cursor-pointer transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {submission.studentName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {submission.studentId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              submission.status,
                              submission.score
                            )}`}
                          >
                            {submission.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">
                            {submission.submissionDate
                              ? new Date(
                                  submission.submissionDate
                                ).toLocaleString()
                              : "Not submitted"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium">
                            {submission.score ? (
                              <span
                                className={`${
                                  submission.score >= 75
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {submission.score}/100
                              </span>
                            ) : (
                              <span className="text-gray-400">Not graded</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssessmentView;
