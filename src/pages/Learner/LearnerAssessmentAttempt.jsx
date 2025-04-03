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
  Save
} from "lucide-react";
import { 
  createSubmission,
  saveQuestionAnswer,
  submitAssessment,
  getAssessmentById,
  getUserSubmission
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

  useEffect(() => {
    const initializeAttempt = async () => {
      try {
        setLoading(true);
        
        // Create or fetch existing submission
        const submissionResponse = await createSubmission(assessment.id);
        
        if (submissionResponse.success) {
          const currentSubmission = submissionResponse.submission;
          setSubmissionId(currentSubmission.id);
          
          // Initialize answers if they exist
          if (submissionResponse.isExisting && submissionResponse.savedAnswers?.length > 0) {
            const savedAnswers = {};
            submissionResponse.savedAnswers.forEach(answer => {
              savedAnswers[answer.question_id] = answer.selected_option_id 
                ? { optionId: answer.selected_option_id }
                : { textResponse: answer.text_response };
            });
            setAnswers(savedAnswers);
            setSavedAnswers(Object.keys(savedAnswers).reduce((acc, key) => {
              acc[key] = true;
              return acc;
            }, {}));
          }

          // Setup timer
          const startTime = new Date(currentSubmission.start_time).getTime();
          const currentTime = new Date().getTime();
          const elapsedMilliseconds = currentTime - startTime;
          const totalMilliseconds = assessment.duration_minutes * 60 * 1000;
          const remainingMilliseconds = Math.max(0, totalMilliseconds - elapsedMilliseconds);
          const remainingSeconds = Math.floor(remainingMilliseconds / 1000);
          
          if (remainingSeconds > 0) {
            setTimeRemaining(remainingSeconds);
          } else {
            await handleSubmitAssessment();
            return;
          }
        }
      } catch (err) {
        // Use the message from createSubmission service
        if (err.message?.includes('Maximum assessment attempts reached:')) {
          const cleanMessage = err.message.split('Maximum assessment attempts reached:')[1].trim();
          navigate(`/Learner/Assessment/View/${assessment.id}`, {
            state: { 
              assessment,
              error: 'Maximum attempts reached',
              errorDetails: cleanMessage,
              submission: existingSubmission
            }
          });
          return;
        }
        setError(err.message || 'Failed to start assessment');
      } finally {
        setLoading(false);
      }
    };

    initializeAttempt();
  }, [assessment, navigate]);

  // Timer effect with more precise tracking
  useEffect(() => {
    if (timeRemaining === null || !submissionId) return;

    // Store end time in localStorage if not already set
    if (!localStorage.getItem(`assessment_end_${submissionId}`)) {
      const endTime = Date.now() + (timeRemaining * 1000);
      localStorage.setItem(`assessment_end_${submissionId}`, endTime);
    }

    const timer = setInterval(() => {
      const endTime = parseInt(localStorage.getItem(`assessment_end_${submissionId}`));
      const remaining = Math.floor((endTime - Date.now()) / 1000);

      if (remaining <= 0) {
        handleSubmitAssessment();
        clearInterval(timer);
        localStorage.removeItem(`assessment_end_${submissionId}`);
        setTimeRemaining(0);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [timeRemaining, submissionId]);

  const handleAnswerChange = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: answer
    }));
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const answer = answers[currentQuestion.id];

    if (answer) {
      try {
        setSavingAnswer(true);
        await saveQuestionAnswer(submissionId, currentQuestion.id, answer);
        setSavedAnswers(prev => ({
          ...prev,
          [currentQuestion.id]: true
        }));
      } catch (err) {
        console.error('Failed to save answer:', err);
      } finally {
        setSavingAnswer(false);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      await handleSubmitAssessment();
    }
  };

  // Clean up localStorage when assessment is submitted
  const handleSubmitAssessment = async () => {
    try {
      const response = await submitAssessment(submissionId, assessment.id); // Add assessment.id here
      if (response.success) {
        // Clean up localStorage
        localStorage.removeItem(`assessment_end_${submissionId}`);
        localStorage.removeItem(`ongoing_assessment_${assessment.id}`);
        
        navigate(`/Learner/Assessment/View/${assessment.id}`, {
          state: { assessment, submission: response.submission }
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
            {isLastQuestion ? 'Click Submit to save your answer' : 'Click Next to save your answer'}
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
        case 'multiple_choice':
          return (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAnswerChange({
                    optionId: option.id
                  })}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id]?.optionId === option.id}
                    onChange={() => {}}
                    className="h-4 w-4 text-yellow-600"
                  />
                  <label className="flex-1 cursor-pointer">{option.option_text}</label>
                </div>
              ))}
            </div>
          );

        case 'true_false':
          return (
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <div 
                  key={option.id}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAnswerChange({
                    optionId: option.id
                  })}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id]?.optionId === option.id}
                    onChange={() => {}}
                    className="h-4 w-4 text-yellow-600"
                  />
                  <label className="flex-1 cursor-pointer">{option.option_text}</label>
                </div>
              ))}
            </div>
          );

        case 'short_answer':
          return (
            <input
              type="text"
              value={answers[currentQuestion.id]?.textResponse || ''}
              onChange={(e) => handleAnswerChange({
                textResponse: e.target.value
              })}
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter your answer"
            />
          );

        case 'essay':
          return (
            <div>
              {currentQuestion.word_limit && (
                <p className="text-sm text-gray-500 mb-2">Word limit: {currentQuestion.word_limit}</p>
              )}
              <textarea
                value={answers[currentQuestion.id]?.textResponse || ''}
                onChange={(e) => handleAnswerChange({
                  textResponse: e.target.value
                })}
                className="w-full p-4 border rounded-lg h-32 focus:ring-2 focus:ring-yellow-500"
                placeholder="Write your essay answer"
              />
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium text-gray-900">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <span className="text-sm text-gray-500">Points: {currentQuestion.points}</span>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <p className="text-lg text-gray-800 mb-6">{currentQuestion.question_text}</p>
          {renderOptions()}
          {renderSaveIndicator()}
        </div>
      </div>
    );
  };

  const renderHeader = () => (
    <div className="bg-gray-800 p-6 text-white">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{assessment?.title}</h2>
          <p className="text-gray-300 mt-1">{assessment?.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-mono">
            Time remaining: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </div>
          <div className="text-sm text-gray-300">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </div>
    </div>
  );

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
        
        <div className="max-w-4xl mx-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center py-8">
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
            <div className="space-y-6">
              {renderHeader()}
              
              {/* Question section */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                {renderQuestion()}
                
                {/* Navigation buttons */}
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  <button
                    onClick={handleNextQuestion}
                    className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearnerAssessmentAttempt;
