import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader } from "lucide-react";
import { editQuestion } from "../../../../services/assessmentService";

const EditQuestionModal = ({
  isOpen,
  onClose,
  question,
  assessmentId,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    question_text: "",
    question_type: "multiple_choice",
    points: 0,
    order_index: 0,
    media_url: "",
    options: [],
    answer_key: "",
    word_limit: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || "",
        question_type: question.question_type || "multiple_choice",
        points: question.points || 0,
        order_index: question.order_index || 0,
        media_url: question.media_url || "",
        options:
          question.options?.map((opt) => ({
            id: opt.id,
            text: opt.option_text || opt.text,
            is_correct: opt.is_correct,
          })) || [],
        answer_key: question.answer_key || "",
        word_limit: question.word_limit || 0,
      });
    }
  }, [question]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (parseInt(formData.points) <= 0) {
        throw new Error("Points must be greater than 0");
      }

      const requestData = {
        question_text: formData.question_text.trim(),
        question_type: formData.question_type,
        points: parseInt(formData.points),
        media_url: formData.media_url?.trim() || "",
      };

      // Handle different question types
      switch (formData.question_type) {
        case "multiple_choice":
          if (!formData.options.some((opt) => opt.is_correct)) {
            throw new Error("Please select a correct answer");
          }
          requestData.options = formData.options
            .filter((opt) => opt.text?.trim())
            .map((opt) => ({
              text: opt.text.trim(),
              is_correct: Boolean(opt.is_correct),
            }));
          break;

        case "true_false":
          // For true/false, explicitly format options
          const trueOption = formData.options.find(
            (opt) => opt.text === "True" || opt.option_text === "True"
          );
          const falseOption = formData.options.find(
            (opt) => opt.text === "False" || opt.option_text === "False"
          );

          requestData.options = [
            { text: "True", is_correct: trueOption?.is_correct || false },
            { text: "False", is_correct: falseOption?.is_correct || false },
          ];
          break;

        case "short_answer":
        case "essay":
          if (!formData.answer_key?.trim()) {
            throw new Error("Please provide answer key or guidelines");
          }
          requestData.answer_key = formData.answer_key.trim();
          if (formData.question_type === "essay") {
            requestData.word_limit = parseInt(formData.word_limit) || 500;
          }
          delete requestData.options;
          break;

        default:
          throw new Error("Invalid question type");
      }

      const response = await editQuestion(
        assessmentId,
        question.id,
        requestData
      );

      if (response.success) {
        onSuccess(response.question);
        onClose();
      } else {
        throw new Error(response.message || "Failed to update question");
      }
    } catch (err) {
      console.error("Error updating question:", err);
      setError(err.message || "Failed to update question");
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { text: "", is_correct: false }],
    }));
  };

  const removeOption = (index) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const renderQuestionFields = () => {
    switch (formData.question_type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Options
            </label>
            {formData.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <div className="flex items-center h-5">
                  <input
                    type="radio"
                    checked={option.is_correct}
                    onChange={() => {
                      const updatedOptions = formData.options.map((opt, i) => ({
                        ...opt,
                        is_correct: i === index,
                      }));
                      setFormData((prev) => ({
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
                  onChange={(e) => updateOption(index, "text", e.target.value)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  aria-label="Remove Option"
                  className="p-2 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addOption}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Plus size={16} />
              Add Option
            </button>
          </div>
        );

      case "true_false":
        return (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Correct Answer
            </label>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="true"
                  name="correct_answer"
                  checked={
                    formData.options.find((opt) => opt.text === "True")
                      ?.is_correct || false
                  }
                  onChange={() => {
                    setFormData((prev) => ({
                      ...prev,
                      options: [
                        { text: "True", is_correct: true },
                        { text: "False", is_correct: false },
                      ],
                    }));
                  }}
                  className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300"
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
                  checked={
                    formData.options.find((opt) => opt.text === "False")
                      ?.is_correct || false
                  }
                  onChange={() => {
                    setFormData((prev) => ({
                      ...prev,
                      options: [
                        { text: "True", is_correct: false },
                        { text: "False", is_correct: true },
                      ],
                    }));
                  }}
                  className="focus:ring-yellow-500 h-4 w-4 text-yellow-600 border-gray-300"
                />
                <label htmlFor="false" className="text-sm text-gray-700">
                  False
                </label>
              </div>
            </div>
          </div>
        );

      // ...rest of the question types (short_answer, essay)...
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Question</h2>
          <button onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="question_text"
                className="block text-sm font-medium text-gray-700"
              >
                Question Text
              </label>
              <textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    question_text: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
              />
            </div>

            <div>
              <label
                htmlFor="media_url"
                className="block text-sm font-medium text-gray-700"
              >
                Media URL (Optional)
              </label>
              <input
                id="media_url"
                type="url"
                value={formData.media_url || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    media_url: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder="Enter image URL (jpg, jpeg, png, gif)"
              />
              {formData.media_url && validateMediaUrl(formData.media_url) && (
                <div className="mt-2">
                  {formData.media_url.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <img
                      src={formData.media_url}
                      alt="Question media preview"
                      className="max-w-xs rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = "none";
                        setError("Failed to load image preview");
                      }}
                    />
                  ) : isVideoUrl(formData.media_url) ? (
                    <div className="relative w-full max-w-2xl pt-[40%]">
                      <iframe
                        src={getYoutubeEmbedUrl(formData.media_url)}
                        className="absolute top-0 left-0 w-full h-full rounded-lg border border-gray-200"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <div className="p-2 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-200">
                      Media URL: {formData.media_url}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="question_type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Question Type
                </label>
                <select
                  id="question_type"
                  value={formData.question_type}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      question_type: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Points
                </label>
                <input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      points: parseInt(e.target.value),
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>

            {renderQuestionFields()}

            {["short_answer", "essay"].includes(formData.question_type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Answer Key
                </label>
                <textarea
                  value={formData.answer_key}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      answer_key: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows={3}
                />
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-white bg-[#212529] rounded-md hover:bg-[#F6BA18] hover:text-[#212529] flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
