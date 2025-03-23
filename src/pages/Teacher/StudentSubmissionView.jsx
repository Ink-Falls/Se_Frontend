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
  Clock,
  X,
  AlertTriangle,
} from "lucide-react";
import { getUserSubmission, getAssessmentById, gradeSubmission, getSubmissionDetails } from "../../services/assessmentService";
import EditGradeModal from '../../components/common/Modals/Edit/EditGradeModal';

const StudentSubmissionView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assessment, submission } = location.state || {};
  const [isGrading, setIsGrading] = useState(false);
  const [score, setScore] = useState(submission?.score || 0);
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [gradingData, setGradingData] = useState({
    grades: [],
    feedback: ''
  });
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [isGradingModalOpen, setIsGradingModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [isEditGradeModalOpen, setIsEditGradeModalOpen] = useState(false);
  const [answersWithDetails, setAnswersWithDetails] = useState({});
  const [isConfirmAutoGradeModalOpen, setIsConfirmAutoGradeModalOpen] = useState(false);
  const [autoGradeLoading, setAutoGradeLoading] = useState(false);
  const [autoGradeStats, setAutoGradeStats] = useState({ total: 0, processed: 0 });

  const calculateTotalPoints = (questions) => {
    return questions?.reduce((total, question) => total + (parseInt(question.points) || 0), 0) || 0;
  };

  const calculateAutoGradedScore = (submission) => {
    if (!submission?.answers) return { total: 0, possible: 0 };
    
    const scores = submission.answers.reduce((acc, answer) => {
      const question = submission.assessment?.questions?.find(q => q.id === answer.question_id);
      
      if (!question) return acc;

      // Auto-grade multiple choice and true/false questions
      if (question.question_type === 'multiple_choice' || question.question_type === 'true_false') {
        const correctOption = question.options?.find(opt => opt.is_correct);
        const isCorrect = answer.selected_option_id === correctOption?.id;
        
        return {
          total: acc.total + (isCorrect ? question.points : 0),
          possible: acc.possible + question.points
        };
      }
      
      // For manual grading questions, use points_awarded if available
      return {
        total: acc.total + (parseInt(answer.points_awarded) || 0),
        possible: acc.possible + question.points
      };
    }, { total: 0, possible: 0 });

    return scores;
  };

  const processSubmissionAnswers = (submissionData) => {
    if (!submissionData?.answers) return submissionData;

    const processedAnswers = submissionData.answers.map(answer => {
      const question = submissionData.assessment?.questions?.find(q => q.id === answer.question_id);
      
      // Auto-grade multiple choice and true/false questions if not already graded
      if ((question?.question_type === 'multiple_choice' || question?.question_type === 'true_false') 
          && answer.points_awarded === null) {
        const correctOption = question.options?.find(opt => opt.is_correct);
        const isCorrect = answer.selected_option_id === correctOption?.id;
        
        return {
          ...answer,
          points_awarded: isCorrect ? question.points : 0,
          is_auto_graded: true,
          feedback: isCorrect ? 'Correct' : 'Incorrect'
        };
      }
      
      return answer;
    });

    return {
      ...submissionData,
      answers: processedAnswers
    };
  };

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!location.state?.submission?.id) return;
      
      try {
        setLoading(true);
        const response = await getSubmissionDetails(location.state.submission.id);
        
        if (response.success && response.submission) {
          // Process each answer and auto-grade MC/TF questions
          const processedAnswers = await Promise.all(response.submission.answers.map(async (answer) => {
            const question = response.submission.assessment.questions.find(
              q => q.id === answer.question_id
            );
            
            if (!question) return answer;

            // Auto-grade multiple choice and true/false questions
            if ((question.question_type === 'multiple_choice' || question.question_type === 'true_false')) {
              const selectedOption = question.options?.find(opt => opt.id === answer.selected_option_id);
              const isCorrect = selectedOption?.is_correct || false;
              const points = isCorrect ? question.points : 0;

              // Auto-save grade using gradeSubmission
              try {
                const gradeResponse = await gradeSubmission(response.submission.id, {
                  grades: [{
                    questionId: answer.question_id,
                    points: points,
                    feedback: isCorrect ? 'Correct answer' : 'Incorrect answer'
                  }],
                  feedback: ''
                });

                if (gradeResponse.success) {
                  return {
                    ...answer,
                    points_awarded: points,
                    is_auto_graded: true,
                    feedback: isCorrect ? 'Correct answer' : 'Incorrect answer'
                  };
                }
              } catch (err) {
                console.error('Error auto-grading question:', err);
              }
            }

            return answer;
          }));

          // Update submission details with processed answers
          setSubmissionDetails({
            ...response.submission,
            answers: processedAnswers
          });

          // Update answersWithDetails
          const answersWithDetailsMap = {};
          processedAnswers.forEach(answer => {
            const question = response.submission.assessment.questions.find(
              q => q.id === answer.question_id
            );
            
            if (question) {
              answersWithDetailsMap[answer.question_id] = {
                ...answer,
                questionText: question.question_text,
                questionType: question.question_type,
                maxPoints: question.points,
                selectedAnswer: answer.selected_option?.option_text || answer.text_response || 'No answer provided',
                isCorrect: answer.selected_option?.is_correct || false,
                selectedOptionId: answer.selected_option_id,
                allOptions: question.options || [],
                answerKey: question.answer_key,
                isAutoGraded: answer.is_auto_graded
              };
            }
          });

          setAnswersWithDetails(answersWithDetailsMap);
          setQuestions(response.submission.assessment.questions || []);
        }
      } catch (err) {
        console.error('Error fetching submission:', err);
        setSubmissionError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [location.state?.submission?.id]);

  useEffect(() => {
    const fetchAssessmentDetails = async () => {
      try {
        setLoading(true);
        const response = await getAssessmentById(assessment.id);
        
        if (response.success) {
          setAssessmentDetails(response.assessment);
          // Initialize grading data with questions
          setGradingData(prev => ({
            ...prev,
            grades: response.assessment.questions.map(q => ({
              questionId: q.id,
              points: 0,
              feedback: ''
            }))
          }));
        }
      } catch (err) {
        setSubmissionError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (assessment?.id) {
      fetchAssessmentDetails();
    }
  }, [assessment?.id]);

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

  const handleSubmitGrade = async () => {
    try {
      setLoading(true);
      const response = await gradeSubmission(submission.id, gradingData);
      
      if (response.success) {
        // Update submission details with new grades
        setSubmissionDetails(response.submission);
        setIsGrading(false);
      } else {
        throw new Error(response.message || 'Failed to submit grades');
      }
    } catch (err) {
      console.error('Error submitting grades:', err);
      alert('Failed to submit grades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (questionId, points, feedback) => {
    setGradingData(prev => ({
      ...prev,
      grades: prev.grades.map(grade => 
        grade.questionId === questionId 
          ? { ...grade, points, feedback }
          : grade
      )
    }));
  };

  const handleOverallFeedbackChange = (feedback) => {
    setGradingData(prev => ({
      ...prev,
      feedback
    }));
  };

  useEffect(() => {
    if (submissionDetails?.answers) {
      // Ensure answers exist and are in an array before mapping
      const answersArray = Array.isArray(submissionDetails.answers) ? submissionDetails.answers : [];
      
      setGradingData({
        grades: answersArray.map(answer => ({
          questionId: answer.id,
          points: answer.pointsAwarded || 0,
          feedback: answer.feedback || ''
        })),
        feedback: submissionDetails.feedback || ''
      });
    }
  }, [submissionDetails]);

  const handleGradeUpdate = async (updatedSubmission) => {
    try {
      // Refresh full submission details after grade update
      const response = await getSubmissionDetails(submission.id);
      if (response.success) {
        // Update submission details with the fresh data
        setSubmissionDetails(response.submission);
        
        // Update answers with details
        const newAnswers = {};
        response.submission.answers.forEach(answer => {
          const question = response.submission.assessment.questions.find(
            q => q.id === answer.question_id
          );
          
          if (question) {
            newAnswers[answer.question_id] = {
              ...answer,
              questionText: question.question_text,
              questionType: question.question_type,
              maxPoints: question.points,
              selectedAnswer: answer.selected_option?.option_text || answer.text_response || 'No answer provided',
              isCorrect: answer.selected_option?.is_correct || false,
              pointsAwarded: answer.points_awarded, // Make sure this is updated
              allOptions: question.options || [],
              answerKey: question.answer_key
            };
          }
        });
        
        setAnswersWithDetails(newAnswers);
      }
    } catch (err) {
      console.error('Error refreshing submission details:', err);
    }
  };

  const handleAutoGrade = async () => {
    try {
      setAutoGradeLoading(true);
      
      // Filter only multiple choice and true/false questions that need grading
      const autoGradeableAnswers = submissionDetails.answers.filter(answer => {
        const question = submissionDetails.assessment.questions.find(q => q.id === answer.question_id);
        return (question?.question_type === 'multiple_choice' || question?.question_type === 'true_false');
      });
      
      setAutoGradeStats({
        total: autoGradeableAnswers.length,
        processed: 0
      });
      
      // Create grading data structure for submission
      const gradingData = {
        grades: [],
        feedback: 'Auto-graded multiple choice and true/false questions'
      };
      
      // Process each auto-gradeable answer
      for (const answer of autoGradeableAnswers) {
        const question = submissionDetails.assessment.questions.find(q => q.id === answer.question_id);
        
        if (!question) continue;
        
        // Find the correct option
        const correctOption = question.options?.find(opt => opt.is_correct);
        const isCorrect = answer.selected_option_id === correctOption?.id;
        const points = isCorrect ? question.points : 0;
        
        // Add to grading data
        gradingData.grades.push({
          questionId: answer.question_id,
          points: points,
          feedback: isCorrect ? 'Correct answer' : 'Incorrect answer'
        });
        
        setAutoGradeStats(prev => ({...prev, processed: prev.processed + 1}));
      }
      
      // Submit the grades if we have any
      if (gradingData.grades.length > 0) {
        const response = await gradeSubmission(submissionDetails.id, gradingData);
        
        if (response.success) {
          // Refresh the submission data
          await handleGradeUpdate(response.submission);
          alert('Auto-grading completed successfully!');
        }
      } else {
        alert('No auto-gradeable questions found.');
      }
      
    } catch (err) {
      console.error('Error auto-grading submission:', err);
      alert('Failed to auto-grade submission. Please try again.');
    } finally {
      setAutoGradeLoading(false);
      setIsConfirmAutoGradeModalOpen(false);
    }
  };

  const renderQuestionAnswer = (answer, index) => {
    const details = answersWithDetails[answer.question_id];
    if (!details) return null;

    return (
      <div key={answer.id} className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between">
          <p className="font-medium">Question {index + 1}</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {answer.points_awarded !== null ? 
                `${answer.points_awarded}/${details.maxPoints} points` : 
                'Not graded'}
            </span>
            {details.isAutoGraded && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Auto-graded
              </span>
            )}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-sm font-medium text-gray-600">Question:</p>
          <p className="mt-1 text-gray-800">{details.questionText}</p>

          <p className="text-sm font-medium text-gray-600 mt-3">Student's Answer:</p>
          <div className="mt-1 p-2 bg-gray-50 rounded">
            <span className={`${details.isCorrect ? 'text-green-600 font-medium' : 'text-gray-800'}`}>
              {details.selectedAnswer}
            </span>
            {details.isCorrect && <span className="text-green-500 ml-2">✓</span>}
          </div>

          {details.questionType === 'multiple_choice' && (
            <div className="mt-3">
              <p className="text-sm font-medium text-green-600">All Options:</p>
              <div className="mt-1 space-y-1">
                {details.allOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`p-2 rounded ${
                      option.is_correct ? 'bg-green-50 text-green-700 font-medium' : 
                      option.id === details.selectedOptionId ? 
                        `bg-${details.isCorrect ? 'green' : 'red'}-50` : ''
                    }`}
                  >
                    {option.is_correct && '✓ '}{option.option_text}
                    {option.id === details.selectedOptionId && !option.is_correct && ' (Student\'s choice)'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.questionType === 'true_false' && (
            <div className="mt-3">
              <p className="text-sm font-medium text-green-600">Correct Answer:</p>
              <div className="mt-1 space-y-1">
                {details.allOptions.map(option => (
                  <div 
                    key={option.id}
                    className={`p-2 rounded ${
                      option.is_correct ? 'bg-green-50 text-green-700 font-medium' : 
                      option.id === details.selectedOptionId ? 
                        `bg-${details.isCorrect ? 'green' : 'red'}-50` : ''
                    }`}
                  >
                    {option.is_correct && '✓ '}{option.option_text}
                    {option.id === details.selectedOptionId && !option.is_correct && ' (Student\'s choice)'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {details.questionType === 'short_answer' && (
            <div className="mt-3">
              <p className="text-sm font-medium text-green-600">Answer Key:</p>
              <div className="mt-1 p-2 bg-green-50 rounded text-green-700">
                {details.answerKey || 'No answer key provided'}
              </div>
            </div>
          )}

          {details.questionType === 'essay' && (
            <div className="mt-3">
              <p className="text-sm font-medium text-green-600">Grading Guidelines:</p>
              <div className="mt-1 p-2 bg-green-50 rounded text-green-700">
                {details.answerKey || 'No grading guidelines provided'}
              </div>
            </div>
          )}

          {answer.feedback && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-600">Feedback:</p>
              <div className="mt-1 p-2 bg-blue-50 rounded text-blue-700">
                {answer.feedback}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => {
              setSelectedQuestion(answer);
              setIsEditGradeModalOpen(true);
            }}
            className="px-3 py-1 text-sm bg-[#212529] text-white rounded hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
          >
            Edit Grade
          </button>
        </div>
      </div>
    );
  };

  const renderSubmissionContent = () => {
    if (loading) return <div>Loading...</div>;
    if (submissionError) return <div className="text-red-600">{submissionError}</div>;
    if (!submissionDetails?.answers) return <div>No submission found.</div>;

    // Format the submission date consistently
    const formattedSubmitTime = submissionDetails.submit_time ? 
      new Date(submissionDetails.submit_time).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : 'Not submitted';

    // Calculate total awarded points and total possible points
    const totalAwarded = submissionDetails.answers.reduce((sum, answer) => 
      sum + (parseInt(answer.points_awarded) || 0), 0);
    const totalPossible = submissionDetails.assessment.questions.reduce((sum, question) => 
      sum + (parseInt(question.points) || 0), 0);

    // Check if all questions have been answered
    const allQuestionsAnswered = submissionDetails.answers.every(answer => {
      return answer.selected_option_id !== null || answer.text_response !== null;
    });

    // Check if all questions have been graded
    const allQuestionsGraded = submissionDetails.answers.every(answer => 
      answer.points_awarded !== null && answer.points_awarded !== undefined
    );

    // Determine submission status based on answer completion and grading status
    const submissionStatus = !allQuestionsAnswered ? 'Not Submitted' :
                           allQuestionsGraded ? 'Graded' : 
                           'Submitted';

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-4">
          {submissionDetails.answers.map((answer, index) => renderQuestionAnswer(answer, index))}
        </div>

        {/* Updated submission meta data section with total score */}
        <div className="mt-6 p-6 bg-white rounded-lg border">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Submission Status:</p>
              <p className="font-medium capitalize">{submissionStatus}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Submitted:</p>
              <p className="font-medium">
                {formattedSubmitTime}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600 mb-1">Total Score:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">
                  {totalAwarded}/{totalPossible}
                  <span className="text-sm text-gray-500 ml-2">
                    ({((totalAwarded / totalPossible) * 100).toFixed(1)}%)
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderGradingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Grade Submission</h3>
          <button onClick={() => setIsGrading(false)} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {assessmentDetails?.questions.map((question, index) => (
            <div key={question.id} className="p-4 border rounded-lg">
              <div className="flex justify-between mb-2">
                <h4 className="font-medium">Question {index + 1}</h4>
                <span className="text-sm text-gray-500">Max: {question.points} points</span>
              </div>
              
              <p className="text-gray-700 mb-4">{question.question_text}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points Awarded
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={question.points}
                    value={gradingData.grades.find(g => g.questionId === question.id)?.points || 0}
                    onChange={(e) => handleGradeChange(
                      question.id,
                      Math.min(question.points, Math.max(0, parseInt(e.target.value) || 0)),
                      gradingData.grades.find(g => g.questionId === question.id)?.feedback || ''
                    )}
                    className="w-full p-2 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <input
                    type="text"
                    value={gradingData.grades.find(g => g.questionId === question.id)?.feedback || ''}
                    onChange={(e) => handleGradeChange(
                      question.id,
                      gradingData.grades.find(g => g.questionId === question.id)?.points || 0,
                      e.target.value
                    )}
                    className="w-full p-2 border rounded"
                    placeholder="Optional feedback for this question"
                  />
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Overall Feedback
            </label>
            <textarea
              value={gradingData.feedback}
              onChange={(e) => setGradingData(prev => ({ ...prev, feedback: e.target.value }))}
              className="w-full p-2 border rounded"
              rows={3}
              placeholder="Provide overall feedback for the submission"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsGrading(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitGrade}
              className="px-6 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#F6BA18] hover:text-[#212529]"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Grades'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAutoGradeConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex items-center mb-4 text-amber-600">
          <AlertTriangle size={24} className="mr-2" />
          <h3 className="text-xl font-semibold">Confirm Auto-Grading</h3>
        </div>
        
        <p className="text-gray-600 mb-4">
          This will automatically grade all multiple-choice and true/false questions in this submission.
          Existing grades for these questions will be overwritten.
        </p>
        
        <p className="text-gray-600 mb-6">
          Do you want to continue?
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setIsConfirmAutoGradeModalOpen(false)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            disabled={autoGradeLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleAutoGrade}
            className="px-6 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#F6BA18] hover:text-[#212529]"
            disabled={autoGradeLoading}
          >
            {autoGradeLoading ? 'Processing...' : 'Proceed'}
          </button>
        </div>
        
        {autoGradeLoading && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Processing questions: {autoGradeStats.processed}/{autoGradeStats.total}</p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div 
                className="bg-[#F6BA18] h-2.5 rounded-full" 
                style={{width: `${(autoGradeStats.processed / Math.max(1, autoGradeStats.total)) * 100}%`}}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

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
                    onClick={() => setIsConfirmAutoGradeModalOpen(true)}
                    className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529] transition-colors"
                  >
                    Auto Grade MCQs & T/F
                  </button>
                </div>

                {renderSubmissionContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGradingModalOpen && renderGradingModal()}
      {isConfirmAutoGradeModalOpen && renderAutoGradeConfirmModal()}
      <EditGradeModal
        isOpen={isEditGradeModalOpen}
        onClose={() => setIsEditGradeModalOpen(false)}
        submission={submissionDetails}
        question={selectedQuestion}
        onSave={handleGradeUpdate}
      />
    </div>
  );
};

export default StudentSubmissionView;
