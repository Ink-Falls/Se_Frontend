import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  Upload,
  Clock,
  Edit2,
  FileText,
  ArrowLeft,
} from "lucide-react";
import { useCourse } from "../../contexts/CourseContext";

const AssessmentView = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const { assessment } = location.state || {};
  const [textAnswer, setTextAnswer] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl);
      }
    };
  }, [pdfPreviewUrl]);

  useEffect(() => {
    if (!selectedCourse?.id) {
      navigate('/Learner/Dashboard');
      return;
    }
  }, [selectedCourse, navigate]);

  if (!assessment) {
    navigate("/Learner/Assessment");
    return null;
  }

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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file);
        if (pdfPreviewUrl) {
          URL.revokeObjectURL(pdfPreviewUrl);
        }
        setPdfPreviewUrl(URL.createObjectURL(file));
        setError("");
      } else if (
        file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setSelectedFile(file);
        setPdfPreviewUrl(null);
        setError("");
      } else {
        setError("Please upload only PDF or DOCX files");
        setSelectedFile(null);
        setPdfPreviewUrl(null);
        e.target.value = null;
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentTime = new Date();

    const newSubmission = {
      id: Date.now(),
      textAnswer,
      fileName: selectedFile?.name,
      submittedAt: currentTime,
      lastEdited: null,
    };

    setSubmission(newSubmission);
    setSubmissionHistory([...submissionHistory, newSubmission]);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleUpdateSubmission = async (e) => {
    e.preventDefault();
    const currentTime = new Date();

    const updatedSubmission = {
      ...submission,
      textAnswer,
      fileName: selectedFile?.name,
      lastEdited: currentTime,
    };

    setSubmission(updatedSubmission);
    setSubmissionHistory([...submissionHistory, updatedSubmission]);
    setIsEditing(false);
  };

  const renderPdfPreview = () => {
    if (!pdfPreviewUrl) return null;

    return (
      <div className="mt-4 border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium text-gray-700 mb-2">PDF Preview</h4>
        <div className="overflow-auto" style={{ height: "500px" }}>
          <iframe
            src={pdfPreviewUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 p-6 overflow-auto">
        <Header 
          title={selectedCourse?.name || "Assessment"}
          subtitle={selectedCourse?.code} 
        />
        <div className="max-w-7xl mx-auto">

          <div className="mt-6 bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-gray-800 to-gray-700 p-8 text-white">
              <button
                onClick={() => navigate("/Learner/Assessment")}
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
                <div className="text-right">
                  <div
                    className={`inline-block px-4 py-2 rounded-full text-sm font-medium
                    ${
                      assessment.status === "Submitted"
                        ? "bg-green-100 text-green-800"
                        : assessment.status === "Missing"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {assessment.status}
                  </div>
                  <p className="mt-3 text-lg font-semibold">
                    Score: {assessment.score || "Not graded"}
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

            {/* Submission Section */}
            <div className="p-6">
              {!submission || isEditing ? (
                <form
                  onSubmit={isEditing ? handleUpdateSubmission : handleSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                      placeholder="Type your answer here..."
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end space-x-4">
                    <div className="relative">
                      <input
                        type="file"
                        onChange={handleFileSelect}
                        accept=".pdf,.docx"
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Upload className="h-5 w-5 mr-2" />
                        {selectedFile ? selectedFile.name : "Upload File"}
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
                    >
                      {isEditing ? "Update Submission" : "Submit Assessment"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-6">
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-semibold text-lg">Your Submission</h3>
                      <button
                        onClick={handleEdit}
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#F6BA18]"
                      >
                        <Edit2 size={16} className="mr-1" />
                        Edit Submission
                      </button>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">
                        {submission.textAnswer}
                      </p>
                      {submission.fileName && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FileText size={16} className="mr-2" />
                          {submission.fileName}
                        </div>
                      )}
                      {selectedFile?.type === "application/pdf" &&
                        renderPdfPreview()}
                    </div>

                    <div className="flex justify-end mt-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock size={14} className="mr-1" />
                        Submitted:{" "}
                        {new Date(submission.submittedAt).toLocaleString()}
                        {submission.lastEdited && (
                          <span className="ml-4">
                            Last edited:{" "}
                            {new Date(submission.lastEdited).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {submissionHistory.length > 1 && (
                <div className="mt-8 border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">
                    Submission History
                  </h4>
                  <div className="space-y-3">
                    {submissionHistory.slice(0, -1).map((entry, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-600">
                          Version {index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.submittedAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentView;
