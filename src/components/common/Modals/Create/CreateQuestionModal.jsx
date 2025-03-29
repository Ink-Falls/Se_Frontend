import React, { useState, useEffect } from "react"; // Add useEffect import
import { X, Plus, Trash2 } from "lucide-react";

const CreateQuestionModal = ({ isOpen, onClose, onSubmit }) => {
  const initialState = {
    question_text: "",
    question_type: "multiple_choice",
    points: 5,
    order_index: 1,
    media_url: "",
    options: [{ text: "", is_correct: false }], // Keep text for internal use
    correct_answer: "", // For identification and true/false
  };

  const [questionData, setQuestionData] = useState(initialState);

  // Add effect to reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestionData(initialState);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setQuestionData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOptionChange = (index, field, value) => {
    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) =>
        i === index
          ? { ...option, [field]: field === "is_correct" ? value : value }
          : field === "is_correct" && value
          ? { ...option, is_correct: false }
          : option
      ),
    }));
  };

  const addOption = () => {
    setQuestionData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", is_correct: false }],
    }));
  };

  const removeOption = (index) => {
    setQuestionData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const basicData = {
        question_text: questionData.question_text.trim(),
        question_type: questionData.question_type,
        points: parseInt(questionData.points),
        media_url: questionData.media_url || "",
      };

      switch (questionData.question_type) {
        case "multiple_choice":
          if (!questionData.options.some((opt) => opt.is_correct)) {
            alert("Please select a correct answer");
            return;
          }
          basicData.options = questionData.options
            .filter((opt) => opt.text.trim())
            .map((opt) => ({
              text: opt.text.trim(),
              is_correct: opt.is_correct,
            }));
          break;

        case "true_false":
          if (!questionData.correct_answer) {
            alert("Please select the correct answer");
            return;
          }
          basicData.correct_answer = questionData.correct_answer;
          break;

        case "short_answer":
        case "essay":
          if (!questionData.correct_answer?.trim()) {
            alert("Please provide an answer key or guidelines");
            return;
          }
          basicData.correct_answer = questionData.correct_answer.trim();
          break;

        default:
          throw new Error("Invalid question type");
      }

      await onSubmit(basicData);
    } catch (err) {
      console.error("Error submitting question:", err);
      alert(err.message || "Error creating question. Please try again.");
    }
  };

  const renderQuestionFields = () => {
    return (
      <>
        <div>
          <label
            htmlFor="media_url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Media URL (Optional)
          </label>
          <input
            id="media_url"
            type="url"
            name="media_url"
            value={questionData.media_url}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border rounded-md"
            placeholder="Enter image or video URL"
          />
          {questionData.media_url && (
            <div className="mt-2">
              {questionData.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={questionData.media_url}
                  alt="Question media"
                  className="max-h-40 rounded-md"
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-md text-sm text-gray-600">
                  Media URL: {questionData.media_url}
                </div>
              )}
            </div>
          )}
        </div>

        {questionData.question_type === "multiple_choice" && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="select_ans"
                className="block text-sm font-medium text-gray-700"
              >
                Options
              </label>
              <span className="text-sm text-gray-500">
                Select the correct answer
              </span>
            </div>
            <div
              className={`pr-2 ${
                questionData.options.length > 3
                  ? "max-h-[180px] overflow-y-auto"
                  : ""
              }`}
            >
              {questionData.options.map((option, index) => (
                <div key={index} className="flex gap-2 items-center mb-2">
                  <div className="flex items-center h-5">
                    <input
                      id="select_ans"
                      type="radio"
                      name="correct_option"
                      checked={option.is_correct}
                      onChange={(e) => {
                        // Update all options to false first
                        const updatedOptions = questionData.options.map(
                          (opt) => ({
                            ...opt,
                            is_correct: false,
                          })
                        );
                        // Set the selected option to true
                        updatedOptions[index].is_correct = true;
                        setQuestionData((prev) => ({
                          ...prev,
                          options: updatedOptions,
                        }));
                      }}
                      className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300"
                    />
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) =>
                      handleOptionChange(index, "text", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border rounded-md"
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                    aria-label="trash"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center gap-2"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>
        )}

        {questionData.question_type === "true_false" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="true"
                  name="correct_answer"
                  value="true"
                  checked={questionData.correct_answer === "true"}
                  onChange={handleInputChange}
                  className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300"
                  required
                />
                <label htmlFor="true" className="text-sm text-gray-700">
                  True
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="false"
                  name="correct_answer"
                  value="false"
                  checked={questionData.correct_answer === "false"}
                  onChange={handleInputChange}
                  className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300"
                  required
                />
                <label htmlFor="false" className="text-sm text-gray-700">
                  False
                </label>
              </div>
            </div>
          </div>
        )}

        {questionData.question_type === "short_answer" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correct Answer
            </label>
            <input
              type="text"
              name="correct_answer"
              value={questionData.correct_answer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter the correct answer"
              required
            />
          </div>
        )}

        {questionData.question_type === "essay" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer Guidelines
            </label>
            <textarea
              name="correct_answer"
              value={questionData.correct_answer}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter guidelines for grading the essay"
              rows={3}
              required
            />
          </div>
        )}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Question</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Question Text section */}
            <div>
              <label
                htmlFor="question_text"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Question Text
              </label>
              <textarea
                id="question_text"
                name="question_text"
                value={questionData.question_text}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            {/* Question Type and Points section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="question_type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Question Type
                </label>
                <select
                  id="question_type"
                  name="question_type"
                  value={questionData.question_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="points"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Points
                </label>
                <input
                  id="points"
                  type="number"
                  name="points"
                  value={questionData.points}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  required
                />
              </div>
            </div>

            {renderQuestionFields()}

            {/* Form buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                aria-label="add question"
                type="submit"
                className="px-4 py-2 bg-[#212529] text-white rounded-md hover:bg-[#F6BA18] hover:text-[#212529]"
              >
                Add Question
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateQuestionModal;
