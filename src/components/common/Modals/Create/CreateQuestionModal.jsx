import React, { useState, useEffect } from "react"; // Add useEffect import
import { X, Plus, Trash2 } from "lucide-react";

const CreateQuestionModal = ({
  isOpen,
  onClose,
  onSubmit,
  maxScore,
  questions,
}) => {
  const initialState = {
    question_text: "",
    question_type: "multiple_choice",
    points: 5,
    order_index: 1,
    media_url: "",
    options: [{ text: "", is_correct: false }], // Keep text for internal use
    correct_answer: "", // For identification and true/false
    answer_key: "",
    word_limit: 500,
  };

  const [questionData, setQuestionData] = useState(initialState);
  const [error, setError] = useState(null); // Add error state

  // Add effect to reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuestionData(initialState);
      setError(null); // Reset error when modal closes
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Allow empty value for word_limit
    if (name === "word_limit") {
      setQuestionData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseInt(value),
      }));
    } else {
      setQuestionData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
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

  const validateMediaUrl = (url) => {
    if (!url) return true;
    const imageRegex = /\.(jpg|jpeg|png|gif)$/i;
    const videoRegex = /\.(mp4|webm|ogg)$/i;
    return (
      imageRegex.test(url) ||
      videoRegex.test(url) ||
      url.includes("youtube.com") ||
      url.includes("youtu.be")
    );
  };

  const isVideoUrl = (url) => {
    if (!url) return false;
    const videoRegex = /\.(mp4|webm|ogg)$/i;
    return (
      videoRegex.test(url) ||
      url.includes("youtube.com") ||
      url.includes("youtu.be")
    );
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error on new submission

    try {
      // Get current total points
      const currentPoints =
        questions?.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0) || 0;
      const newPoints = parseInt(questionData.points) || 0;

      // Check if adding this question's points would exceed max score
      if (currentPoints + newPoints > maxScore) {
        throw new Error(
          `Total points would exceed max score (${maxScore}). Current total: ${currentPoints}, Attempting to add: ${newPoints}`
        );
      }

      // Multiple choice validation - check for at least 2 options
      if (
        questionData.question_type === "multiple_choice" &&
        questionData.options.filter((opt) => opt.text.trim()).length < 2
      ) {
        throw new Error(
          "Multiple choice questions must have at least 2 options"
        );
      }

      const basicData = {
        question_text: questionData.question_text.trim(),
        question_type: questionData.question_type,
        points: parseInt(questionData.points),
        media_url: questionData.media_url || "",
        answer_key: null,
      };

      switch (questionData.question_type) {
        case "multiple_choice":
          if (!questionData.options.some((opt) => opt.is_correct)) {
            throw new Error("Please select a correct answer");
          }
          basicData.options = questionData.options
            .filter((opt) => opt.text.trim())
            .map((opt) => ({
              text: opt.text.trim(),
              is_correct: opt.is_correct,
            }));
          // Remove answer_key for multiple_choice
          delete basicData.answer_key;
          break;

        case "true_false":
          if (!questionData.correct_answer) {
            throw new Error("Please select the correct answer");
          }
          // Remove answer_key for true_false
          delete basicData.answer_key;
          basicData.options = [
            {
              text: "True",
              is_correct: questionData.correct_answer === "true",
            },
            {
              text: "False",
              is_correct: questionData.correct_answer === "false",
            },
          ];
          break;

        case "short_answer":
        case "essay":
          if (!questionData.answer_key?.trim()) {
            throw new Error("Please provide the correct answer");
          }
          basicData.answer_key = questionData.answer_key.trim();
          if (questionData.question_type === "essay") {
            basicData.word_limit = parseInt(questionData.word_limit) || 500;
          }
          break;

        default:
          throw new Error("Invalid question type");
      }

      console.log("Formatted question data:", basicData);
      await onSubmit(basicData);
      // If we get here, submission was successful
      onClose();
    } catch (err) {
      console.error("Error submitting question:", err);
      setError(err.message || "Error creating question. Please try again.");
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
              ) : isVideoUrl(questionData.media_url) ? (
                <div className="relative w-full max-w-2xl pt-[40%]">
                  <iframe
                    src={getYoutubeEmbedUrl(questionData.media_url)}
                    className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-200"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
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
              Select Correct Answer
            </label>
            <div className="space-y-2">
              {[
                { text: "True", id: "true" },
                { text: "False", id: "false" },
              ].map((option) => (
                <div
                  key={option.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                    questionData.correct_answer === option.id
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id={option.id}
                      name="correct_answer"
                      value={option.id}
                      checked={questionData.correct_answer === option.id}
                      onChange={handleInputChange}
                      className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300"
                      required
                    />
                    <label
                      htmlFor={option.id}
                      className="text-sm text-gray-700"
                    >
                      {option.text}
                    </label>
                  </div>
                  {questionData.correct_answer === option.id && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
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
              name="answer_key"
              value={questionData.answer_key || ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter the exact correct answer"
              required
            />
          </div>
        )}

        {questionData.question_type === "essay" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grading Guidelines
              </label>
              <textarea
                name="answer_key"
                value={questionData.answer_key || ""}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter detailed guidelines for grading the essay"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Word Limit
              </label>
              <input
                type="number"
                name="word_limit"
                value={questionData.word_limit}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                min="50"
                max="5000"
                required
              />
              <span className="text-xs text-gray-500 mt-1">
                Must be between 50 and 5000 words
              </span>
            </div>
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
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              {error}
            </div>
          )}

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
