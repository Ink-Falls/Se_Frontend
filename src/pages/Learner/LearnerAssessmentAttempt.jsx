import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCourse } from "../../contexts/CourseContext";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Clock, AlertTriangle, Check, Save, FileText, X } from "lucide-react";
import {
  createSubmission,
  saveQuestionAnswer,
  submitAssessment,
  getAssessmentById,
  getSubmissionDetails,
} from "../../services/assessmentService";
import CountdownTimer from "../../components/assessment/CountdownTimer";

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
  const [showExitModal, setShowExitModal] = useState(false);

  const initializationRef = useRef(false);
  const submissionAttemptRef = useRef(false);
  const submissionCreatedRef = useRef(false);
  const initializeAttemptRef = useRef(false);

  const fetchQuestionsWithMedia = async (assessmentId) => {
    console.log(
      "1. fetchQuestionsWithMedia called with assessmentId:",
      assessmentId
    );
    try {
      const response = await getAssessmentById(assessmentId, true);
      if (response.success) {
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

  const loadSavedAnswers = async (submissionId) => {
    try {
      const response = await getSubmissionDetails(submissionId);
      if (response.success && response.submission?.answers) {
        const savedAnswerMap = {};
        const savedAnswersStatus = {};

        response.submission.answers.forEach((answer) => {
          if (answer.selected_option_id) {
            savedAnswerMap[answer.question_id] = {
              optionId: answer.selected_option_id,
            };
          } else if (answer.text_response) {
            savedAnswerMap[answer.question_id] = {
              textResponse: answer.text_response,
            };
          }
          savedAnswersStatus[answer.question_id] = true;
        });

        setAnswers(savedAnswerMap);
        setSavedAnswers(savedAnswersStatus);
        console.log("Loaded saved answers:", savedAnswerMap);
      }
    } catch (error) {
      console.error("Error loading saved answers:", error);
    }
  };

  useEffect(() => {
    const initializeAttempt = async () => {
      // Guard against double initialization from Strict Mode
      if (initializeAttemptRef.current || submissionCreatedRef.current) {
        console.log("Initialization already attempted");
        return;
      }

      initializeAttemptRef.current = true;

      try {
        if (!assessment || !location.state) {
          navigate("/Learner/Assessment");
          return;
        }

        setLoading(true);
        await fetchQuestionsWithMedia(assessment.id);

        // Check for existing submission in localStorage
        const existingData = localStorage.getItem(
          `ongoing_assessment_${assessment.id}`
        );
        if (existingData) {
          const parsed = JSON.parse(existingData);
          console.log("Found existing submission:", parsed);
          if (parsed.submissionId) {
            // Load existing submission and its answers
            setSubmissionId(parsed.submissionId);
            await loadSavedAnswers(parsed.submissionId);

            // Calculate remaining time
            const startTime = new Date(parsed.startTime).getTime();
            const currentTime = new Date().getTime();
            const elapsedMilliseconds = currentTime - startTime;
            const totalMilliseconds = assessment.duration_minutes * 60 * 1000;
            const remainingMilliseconds = Math.max(
              0,
              totalMilliseconds - elapsedMilliseconds
            );

            setTimeRemaining(Math.floor(remainingMilliseconds / 1000));
            submissionCreatedRef.current = true;
            return;
          }
        }

        // Continue with new submission creation if no existing one found
        if (location.state.isNewAttempt && !submissionCreatedRef.current) {
          console.log("Creating new submission attempt");
          const submissionResponse = await createSubmission(assessment.id);

          // Mark submission as created to prevent duplicates
          submissionCreatedRef.current = true;
          console.log("New submission created:", submissionResponse);

          if (!submissionResponse?.success || !submissionResponse?.submission) {
            throw new Error("Failed to initialize assessment attempt");
          }

          const currentSubmission = submissionResponse.submission;
          setSubmissionId(currentSubmission.id);

          // Calculate timer after submission is confirmed
          const startTime = new Date(currentSubmission.start_time).getTime();
          const currentTime = new Date().getTime();
          const elapsedMilliseconds = currentTime - startTime;
          const totalMilliseconds = assessment.duration_minutes * 60 * 1000;
          const remainingMilliseconds = Math.max(
            0,
            totalMilliseconds - elapsedMilliseconds
          );

          setTimeRemaining(Math.floor(remainingMilliseconds / 1000));
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setError(err.message || "Failed to start assessment");
      } finally {
        setLoading(false);
      }
    };

    initializeAttempt();

    return () => {
      initializeAttemptRef.current = false;
      submissionCreatedRef.current = false;
    };
  }, [assessment?.id]);

  const handleAnswerChange = (answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer,
    }));
  };

  const handleNextQuestion = async () => {
    console.log("10. handleNextQuestion called");
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    if (answer) {
      console.log("11. Saving answer for question:", currentQuestion.id);
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
      console.log(
        "12. Last question reached, calling handleSubmitAssessment (#3)"
      );
      await handleSubmitAssessment();
    }
  };

  const handleSubmitAssessment = async (submissionIdOverride = null) => {
    console.log("13. handleSubmitAssessment called with:", {
      submissionIdOverride,
      currentSubmissionId: submissionId,
      assessmentId: assessment.id,
    });

    try {
      const submitId = submissionIdOverride || submissionId;
      if (!submitId) {
        throw new Error("Submission ID is required");
      }

      // First, save the current question answer if there is one
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion && answers[currentQuestion.id]) {
        try {
          console.log("Saving final answer before submission for question:", currentQuestion.id);
          await saveQuestionAnswer(submitId, currentQuestion.id, answers[currentQuestion.id]);
        } catch (saveErr) {
          console.error("Error saving final answer before submission:", saveErr);
          // Continue with submission even if saving fails
        }
      }

      const response = await submitAssessment(submitId, assessment.id);
      if (response.success) {
        localStorage.removeItem(`assessment_end_${submitId}`);
        localStorage.removeItem(`ongoing_assessment_${assessment.id}`);
        localStorage.removeItem(`timer_${assessment.id}`);

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
          const wordCount =
            answers[currentQuestion.id]?.textResponse?.trim()?.split(/\s+/)
              ?.length || 0;
          const isOverLimit =
            currentQuestion.word_limit &&
            wordCount > currentQuestion.word_limit;

          const handleEssayChange = (e) => {
            const newText = e.target.value;
            const newWordCount = newText.trim().split(/\s+/).length;

            // Only update if under word limit or if deleting text
            if (
              !currentQuestion.word_limit ||
              newWordCount <= currentQuestion.word_limit ||
              newText.length <
                (answers[currentQuestion.id]?.textResponse?.length || 0)
            ) {
              handleAnswerChange({ textResponse: newText });
            }
          };

          return (
            <div className="mt-8">
              {currentQuestion.word_limit && (
                <div className="flex justify-between text-sm mb-2">
                  <p className="text-gray-500">
                    Word limit: {currentQuestion.word_limit} words
                  </p>
                  <p
                    className={`${
                      isOverLimit
                        ? "text-red-500"
                        : wordCount === currentQuestion.word_limit
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {wordCount}/{currentQuestion.word_limit} words
                  </p>
                </div>
              )}
              <textarea
                value={answers[currentQuestion.id]?.textResponse || ""}
                onChange={handleEssayChange}
                className={`w-full p-4 border-2 rounded-xl h-40 focus:border-transparent
              ${
                isOverLimit
                  ? "border-red-300"
                  : wordCount === currentQuestion.word_limit
                  ? "border-red-500"
                  : "border-gray-300"
              }`}
                placeholder="Write your essay answer here..."
              />
              {isOverLimit ? (
                <p className="mt-1 text-sm text-red-500">
                  Your response exceeds the word limit
                </p>
              ) : wordCount === currentQuestion.word_limit ? (
                <p className="mt-1 text-sm text-red-500">Word limit reached</p>
              ) : null}
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
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 text-white shadow-md rounded-t-2xl">
        <div className="max-w-6xl mx-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold">{assessment?.title}</h2>
              <p className="text-gray-300 mt-1">{assessment?.description}</p>
            </div>
            <CountdownTimer
              timeRemaining={timeRemaining}
              setTimeRemaining={setTimeRemaining}
              onTimeUp={handleSubmitAssessment}
              submissionId={submissionId}
            />
          </div>
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

  const ExitConfirmationModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Exit Assessment?
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to exit? Your progress will be saved.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowExitModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={() => navigate("/Learner/Assessment")}
              className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              Confirm Exit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {showExitModal && <ExitConfirmationModal />}

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="max-w-7xl mx-auto text-center py-8 rounded-2xl">
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
        <div className="max-w-6xl w-full mx-auto relative bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => setShowExitModal(true)}
            className="absolute top-4 right-4 z-20 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Exit assessment"
          >
            <X size={24} className="text-gray-600" />
          </button>

          {renderHeader()}
          <div>{renderQuestion()}</div>
        </div>
      )}
    </div>
  );
};

export default LearnerAssessmentAttempt;
