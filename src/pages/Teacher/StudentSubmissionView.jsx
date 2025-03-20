import React, { useState } from "react";
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
  Clock,
  X,
} from "lucide-react";

const StudentSubmissionView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessment, submission } = location.state || {};
  const [isGrading, setIsGrading] = useState(false);
  const [score, setScore] = useState(submission?.score || 0);

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
      route: "/Teacher/Progress",
    },
  ];

  const handleSubmitGrade = () => {
    // TODO: Implement grade submission to backend
    setIsGrading(false);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header title="Student Submission" />

        <div className="w-full">
          {" "}
          {/* Removed max-w-5xl and mx-auto */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-white">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-100 hover:text-[#F6BA18] transition-colors mb-4 group"
              >
                <ArrowLeft
                  size={20}
                  className="group-hover:-translate-x-1 transition-transform"
                />
                <span>Back to Assessment</span>
              </button>

              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {assessment?.title}
                  </h1>
                  <div className="text-gray-200 flex flex-col gap-1">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">
                        Student: {submission?.studentName}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">
                        ID: {submission?.studentId}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium
                    ${
                      submission?.status === "Submitted"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {submission?.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FileText size={20} className="text-gray-500" />
                  Instructions
                </h3>
                <div className="prose max-w-none text-gray-600">
                  {assessment?.description || "No instructions provided."}
                </div>
              </div>

              <div className="mt-6 border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">
                    Student's Submission
                  </h3>
                  <button
                    onClick={() => setIsGrading(true)}
                    className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
                  >
                    {submission?.score ? "Edit Grade" : "Grade Submission"}
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  {submission?.textAnswer ? (
                    <>
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">
                        {submission.textAnswer}
                      </p>
                      {submission.fileName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText size={16} className="mr-2" />
                          {submission.fileName}
                        </div>
                      )}
                      {submission.pdfUrl && (
                        <div className="mt-4 border rounded-lg overflow-hidden">
                          <iframe
                            src={submission.pdfUrl}
                            className="w-full h-[500px]"
                            title="PDF Preview"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">
                      No submission content available.
                    </p>
                  )}
                </div>

                {submission?.score && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-green-800 font-medium">
                        Current Score:
                      </span>
                      <span className="text-2xl font-bold text-green-800">
                        {submission.score}/100
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGrading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Grade Submission
              </h3>
              <button
                onClick={() => setIsGrading(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (out of 100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) =>
                  setScore(Math.min(100, Math.max(0, e.target.value)))
                }
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsGrading(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitGrade}
                className="px-6 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
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

export default StudentSubmissionView;
