import React, { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import {
  gradeSubmission,
  getSubmissionDetails,
} from "../../../../services/assessmentService";

const EditGradeModal = ({ isOpen, onClose, submission, question, onSave }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissionDetails, setSubmissionDetails] = useState(null);
  const [gradingData, setGradingData] = useState({
    questionId: null,
    points: 0,
    feedback: "",
  });

  useEffect(() => {
    const fetchSubmissionDetails = async () => {
      if (!submission?.id || !question?.id) return;

      try {
        setLoading(true);
        const response = await getSubmissionDetails(submission.id);

        if (response.success) {
          // Find the specific answer and its corresponding question
          const answer = response.submission.answers.find(
            (ans) => ans.id === question.id
          );

          const questionDetails = response.submission.assessment.questions.find(
            (q) => q.id === answer?.question_id
          );

          if (answer && questionDetails) {
            const yourAnswer = answer?.selected_option_id
              ? answer?.selected_option?.option_text ||
                answer?.selected_option?.text ||
                "No answer text"
              : answer?.text_response || "No response provided";

            setGradingData({
              questionId: answer.question_id,
              points: answer.points_awarded || 0,
              feedback: answer.feedback || "",
            });

            // Set submission details with all necessary data
            setSubmissionDetails({
              answer: {
                questionText: questionDetails.question_text,
                questionType: questionDetails.question_type,
                maxPoints: questionDetails.points,
                selectedAnswer: yourAnswer,
                isCorrect: answer.selected_option?.is_correct || false,
                selectedOptionId: answer.selected_option_id,
                allOptions: questionDetails.options || [],
                answerKey: questionDetails.answer_key,
              },
            });
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionDetails();
  }, [submission?.id, question?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate points before submitting
    if (gradingData.points === "") {
      setError("Please enter points before saving");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        grade: {
            questionId: gradingData.questionId,
            points: parseInt(gradingData.points),
            feedback: gradingData.feedback,
          },
        feedback: "",
      };

      const response = await gradeSubmission(submission.id, payload);

      if (response.success) {
        // Get fresh submission details
        const updatedDetails = await getSubmissionDetails(submission.id);
        if (updatedDetails.success) {
          // Update the submission details immediately
          const answer = updatedDetails.submission.answers.find(
            (ans) => ans.id === question.id
          );

          if (answer) {
            // Update the points in the local state
            setGradingData((prev) => ({
              ...prev,
              points: answer.points_awarded || 0,
              feedback: answer.feedback || "",
            }));
          }

          // Pass the full updated submission to parent
          onSave(updatedDetails.submission);
          onClose();
        }
      } else {
        throw new Error(response.message || "Failed to save grade");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePointsChange = (value) => {
    setGradingData((prev) => ({
      ...prev,
      points:
        value === ""
          ? ""
          : Math.min(
              submissionDetails?.answer.maxPoints || 0,
              Math.max(0, parseInt(value) || 0)
            ),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Grade Question</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="animate-spin" />
              <span className="ml-3">Loading...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} id="gradeForm" className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Question
                </label>
                <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                  {submissionDetails?.answer.questionText}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Student's Answer
                </label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p
                    className={`text-gray-600 ${
                      submissionDetails?.answer.isCorrect
                        ? "text-green-600"
                        : ""
                    }`}
                  >
                    {submissionDetails?.answer.selectedAnswer}
                  </p>
                </div>
              </div>

              {/* All Options Section */}
              {(submissionDetails?.answer.questionType === "multiple_choice" ||
                submissionDetails?.answer.questionType === "true_false") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    All Options
                  </label>
                  <div className="space-y-2">
                    {submissionDetails?.answer.allOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`p-2 rounded-lg ${
                          option.is_correct
                            ? "bg-green-50 text-green-700"
                            : option.id ===
                              submissionDetails.answer.selectedOptionId
                            ? "bg-gray-100 text-gray-700"
                            : "bg-white text-gray-600"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>
                            {option?.option_text ||
                              option?.text ||
                              "No option text"}
                          </span>
                          {(option.is_correct ||
                            option.id ===
                              submissionDetails.answer.selectedOptionId) && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                option.is_correct
                                  ? "bg-green-100 text-green-600"
                                  : "bg-gray-200 text-gray-600"
                              }`}
                            >
                              {option.is_correct
                                ? "Correct Answer"
                                : "Student's Answer"}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Key for text-based questions */}
              {(submissionDetails?.answer.questionType === "short_answer" ||
                submissionDetails?.answer.questionType === "essay") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Answer Key
                  </label>
                  <div className="bg-green-50 p-3 rounded-lg text-green-700">
                    {submissionDetails?.answer.answerKey ||
                      "No answer key provided"}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div>
                  <label
                    htmlFor="points"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Points (max: {submissionDetails?.answer.maxPoints || 0})
                  </label>
                  <input
                    id="points"
                    type="number"
                    min="0"
                    max={submissionDetails?.answer.maxPoints || 0}
                    value={gradingData.points}
                    onChange={(e) => handlePointsChange(e.target.value)}
                    className="w-full p-3 border rounded-md"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="feedback"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    value={gradingData.feedback}
                    onChange={(e) =>
                      setGradingData((prev) => ({
                        ...prev,
                        feedback: e.target.value,
                      }))
                    }
                    className="w-full p-3 border rounded-md"
                    rows={4}
                    placeholder="Provide feedback for this answer"
                  />
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer with buttons */}
        <div className="p-6 border-t bg-white">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="gradeForm"
              disabled={loading}
              className="px-6 py-2.5 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
            >
              {loading ? "Saving..." : "Save Grade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditGradeModal;
