import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import Sidebar from "../../components/common/layout/Sidebar";
import Header from "../../components/common/layout/Header";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  Home,
  Megaphone,
  BookOpen,
  ClipboardList,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Check,
  Save,
  FileText, // Add this import
} from "lucide-react";
import {
  createSubmission,
  saveQuestionAnswer,
  submitAssessment,
  getAssessmentById,
} from "../../services/assessmentService";

const LearnerAssessmentAttempt = () => {
  const { selectedCourse } = useCourse();
  const navigate = useNavigate();
  const location = useLocation();
  const { assessment, submission: existingSubmission } = location.state || {};
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [timer, setTimer] = useState(null);

  const fetchQuestionsWithMedia = async (assessmentId) => {
    try {
      const response = await getAssessmentById(assessmentId, true);
      if (response.success) {
        // Ensure questions have media_url field
        const questionsWithMedia = response.assessment.questions.map(
          (question) => ({
            ...question,
            media_url: question.media_url || null,
          })
        );
        setQuestions(questionsWithMedia);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      setError("Failed to load questions");
    }
  };

  useEffect(() => {
    const initializeAttempt = async () => {
      try {
        // Add this check at the start of initializeAttempt
        if (!assessment || !location.state) {
          // If there's no assessment in state, redirect to assessments page
          navigate("/Learner/Assessment");
          return;
        }

        const currentPath = location.pathname;
        const pathAssessmentId = currentPath.split("/").pop();

        // Check if URL assessment ID matches the assessment from state
        if (pathAssessmentId !== assessment.id.toString()) {
          navigate("/Learner/Assessment");
          return;
        }

        setLoading(true);

        // First get assessment details with questions
        await fetchQuestionsWithMedia(assessment.id);

        // Then create or fetch existing submission
        const submissionResponse = await createSubmission(assessment.id);

        if (submissionResponse.success) {
          const currentSubmission = submissionResponse.submission;
          setSubmissionId(currentSubmission.id);

          // Initialize answers if they exist
          if (
            submissionResponse.isExisting &&
            submissionResponse.savedAnswers?.length > 0
          ) {
            const savedAnswers = {};
            submissionResponse.savedAnswers.forEach((answer) => {
              savedAnswers[answer.question_id] = answer.selected_option_id
                ? { optionId: answer.selected_option_id }
                : { textResponse: answer.text_response };
            });
            setAnswers(savedAnswers);
            setSavedAnswers(
              Object.keys(savedAnswers).reduce((acc, key) => {
                acc[key] = true;
                return acc;
              }, {})
            );
          }

          // Setup timer
          const startTime = new Date(currentSubmission.start_time).getTime();
          const currentTime = new Date().getTime();
          const elapsedMilliseconds = currentTime - startTime;
          const totalMilliseconds = assessment.duration_minutes * 60 * 1000;
          const remainingMilliseconds = Math.max(
            0,
            totalMilliseconds - elapsedMilliseconds
          );
          const remainingSeconds = Math.floor(remainingMilliseconds / 1000);

          if (remainingSeconds > 0) {
            setTimeRemaining(remainingSeconds);
          } else {
            await handleSubmitAssessment();
            return;
          }
        }
      } catch (err) {
        if (err.message?.includes("Maximum assessment attempts reached:")) {
          const cleanMessage = err.message
            .split("Maximum assessment attempts reached:")[1]
            .trim();
          navigate(`/Learner/Assessment/View/${assessment.id}`, {
            state: {
              assessment,
              error: "Maximum attempts reached",
              errorDetails: cleanMessage,
              submission: existingSubmission,
            },
          });
          return;
        }
        setError(err.message || "Failed to start assessment");
      } finally {
        setLoading(false);
      }
    };

    initializeAttempt();
  }, [assessment, navigate]);

  // Timer effect with cleanup
  useEffect(() => {
    let timerInterval;

    if (timeRemaining === null || !submissionId) return;

    if (!localStorage.getItem(`assessment_end_${submissionId}`)) {
      const endTime = Date.now() + timeRemaining * 1000;
      localStorage.setItem(`assessment_end_${submissionId}`, endTime);
    }

    timerInterval = setInterval(() => {
      const endTime = parseInt(
        localStorage.getItem(`assessment_end_${submissionId}`)
      );
      const remaining = Math.floor((endTime - Date.now()) / 1000);

      if (remaining <= 0) {
        handleSubmitAssessment();
        clearInterval(timerInterval);
        localStorage.removeItem(`assessment_end_${submissionId}`);
        localStorage.removeItem(`timer_${assessment.id}`);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    setTimer(timerInterval);

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timeRemaining, submissionId]);

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer,
    }));
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    if (answer) {
      try {
        setSavingAnswer(true);
        await saveQuestionAnswer(submissionId, currentQuestion.id, answer);
        setSavedAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: true,
        }));
      } catch (err) {
        console.error("Failed to save answer:", err);
      } finally {
        setSavingAnswer(false);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      await handleSubmitAssessment();
    }
  };

  // Clean up localStorage when assessment is submitted
  const handleSubmitAssessment = async () => {
    try {
      const response = await submitAssessment(submissionId, assessment.id);
      if (response.success) {
        // Clean up timer-related data from localStorage
        localStorage.removeItem(`assessment_end_${submissionId}`);
        localStorage.removeItem(`ongoing_assessment_${assessment.id}`);
        localStorage.removeItem(`timer_${assessment.id}`);

        // Clear the timer interval
        if (timer) {
          clearInterval(timer);
        }

        navigate(`/Learner/Assessment/View/${assessment.id}`, {
          state: { assessment, submission: response.submission },
        });
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const renderSaveIndicator = () => {
    const currentQuestionId = questions[currentQuestionIndex]?.id;
    const isAnswered = Boolean(answers[currentQuestionId]);
    const isSaved = savedAnswers[currentQuestionId];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;

    return (
      <div className="flex items-center gap-2 mt-4 text-sm">
        {savingAnswer ? (
          <div className="flex items-center text-yellow-600">
            <Save className="w-4 h-4 animate-pulse mr-1" />
            Saving...
          </div>
        ) : isSaved ? (
          <div className="flex items-center text-green-600">
            <Check className="w-4 h-4 mr-1" />
            Answer saved
          </div>
        ) : isAnswered ? (
          <div className="text-gray-500">
            {isLastQuestion
              ? "Click Submit to save your answer"
              : "Click Next to save your answer"}
          </div>
        ) : null}
      </div>
    );
  };

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    const renderOptions = () => {
      switch (currentQuestion.question_type) {
        case "multiple_choice":
        case "true_false":
          return (
            <div className="space-y-3 mt-8">
              {currentQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center space-x-3 p-4 border-2 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                    answers[currentQuestion.id]?.optionId === option.id
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleAnswerChange({ optionId: option.id })}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id]?.optionId === option.id
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-gray-300"
                    }`}
                  >
                    {answers[currentQuestion.id]?.optionId === option.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <label className="flex-1 cursor-pointer font-medium">
                    {option.option_text}
                  </label>
                </div>
              ))}
            </div>
          );

        case "short_answer":
          return (
            <input
              type="text"
              value={answers[currentQuestion.id]?.textResponse || ""}
              onChange={(e) =>
                handleAnswerChange({ textResponse: e.target.value })
              }
              className="w-full p-4 mt-8 border-2 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              placeholder="Type your answer here..."
            />
          );

        case "essay":
          return (
            <div className="mt-8">
              {currentQuestion.word_limit && (
                <p className="text-sm text-gray-500 mb-2">
                  Word limit: {currentQuestion.word_limit} words
                </p>
              )}
              <textarea
                value={answers[currentQuestion.id]?.textResponse || ""}
                onChange={(e) =>
                  handleAnswerChange({ textResponse: e.target.value })
                }
                className="w-full p-4 border-2 rounded-xl h-40 focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                placeholder="Write your essay answer here..."
              />
            </div>
          );

        default:
          return null;
      }
    };

    const isVideoUrl = (url) => {
      return url.match(/(youtube\.com|youtu\.be)/i);
    };

    const getYoutubeEmbedUrl = (url) => {
      const videoIdMatch = url.match(
        /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      return videoIdMatch
        ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
        : url;
    };

    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-b-2xl shadow-sm overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 mb-4">
                  Question {currentQuestionIndex + 1}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mt-2">
                  {currentQuestion.question_text}
                </h3>
              </div>
              <span className="ml-4 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {currentQuestion.points} Points
              </span>
            </div>

            {currentQuestion.media_url && (
              <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                {currentQuestion.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                  <img
                    src={currentQuestion.media_url}
                    alt="Question media"
                    className="max-w-full rounded-lg mx-auto"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                ) : isVideoUrl(currentQuestion.media_url) ? (
                  <div className="relative w-full h-0 pt-[56.25%]">
                    <iframe
                      src={getYoutubeEmbedUrl(currentQuestion.media_url)}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      frameBorder="0"
                    />
                  </div>
                ) : (
                  <a
                    href={currentQuestion.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <FileText size={20} />
                    View attached media
                  </a>
                )}
              </div>
            )}

            {renderOptions()}
            {renderSaveIndicator()}
          </div>

          <div className="px-8 py-4 bg-gray-50 border-t flex justify-between items-center">
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
              }
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 text-gray-600 bg-white rounded-md shadow-sm disabled:opacity-50 hover:bg-gray-50 border border-gray-200 transition-colors"
            >
              Previous
            </button>

            <button
              onClick={handleNextQuestion}
              className={`px-6 py-2 rounded-md shadow-sm font-medium transition-colors ${
                currentQuestionIndex === questions.length - 1
                  ? "bg-yellow-400 hover:bg-yellow-500 text-gray-900"
                  : "bg-[#212529] hover:bg-[#F6BA18] hover:text-[#212529] text-white"
              }`}
            >
              {currentQuestionIndex === questions.length - 1
                ? "Submit Assessment"
                : "Next Question"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderHeader = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const isLowTime = timeRemaining <= 300; // 5 minutes or less

    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white shadow-md rounded-t-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{assessment?.title}</h2>
              <p className="text-gray-300 mt-1">{assessment?.description}</p>
            </div>
            <div
              className={`text-right p-4 rounded-xl backdrop-blur-sm ${
                isLowTime
                  ? "bg-red-500/20 border-2 border-red-500/50 animate-pulse"
                  : "bg-black/30 border border-white/10"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <Clock
                  className={`w-5 h-5 ${
                    isLowTime ? "text-red-300" : "text-yellow-400"
                  }`}
                />
                <div className="font-mono text-2xl font-bold tracking-wider">
                  <span
                    className={isLowTime ? "text-red-300" : "text-yellow-400"}
                  >
                    {minutes.toString().padStart(2, "0")}
                  </span>
                  <span
                    className={`animate-pulse ${
                      isLowTime ? "text-red-300" : "text-yellow-400"
                    }`}
                  >
                    :
                  </span>
                  <span
                    className={isLowTime ? "text-red-300" : "text-yellow-400"}
                  >
                    {seconds.toString().padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div
                className={`text-sm mt-1 ${
                  isLowTime ? "text-red-200" : "text-gray-300"
                }`}
              >
                {isLowTime ? "Time running out!" : "Time remaining"}
              </div>
            </div>
          </div>
          {/* Progress bar remains unchanged */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

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

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar navItems={navItems} />
      <div className="flex-1 overflow-auto">
        <Header
          title={selectedCourse?.name || "Assessment"}
          subtitle={selectedCourse?.code}
        />

        {/* Changed: Removed max-width constraint and adjusted padding */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="max-w-7xl mx-auto text-center py-8 rounded-2xl">
              {" "}
              {/* Added max-width constraint */}
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <h3 className="text-xl font-medium text-gray-900 mt-4 mb-2">
                {error === "Invalid request"
                  ? "Maximum number of attempts has been reached for this assessment"
                  : error}
              </h3>
              <button
                onClick={() => navigate("/Learner/Assessment")}
                className="mt-4 px-6 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
              >
                Back to Assessments
              </button>
            </div>
          ) : (
            <div className="max-w-7xl mx-auto">
              {" "}
              {/* Added max-width constraint */}
              {renderHeader()}
              {/* Question section - removed bg-white since header has its own style */}
              <div>{renderQuestion()}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerAssessmentAttempt;
