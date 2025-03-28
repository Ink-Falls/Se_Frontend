import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader } from 'lucide-react';
import { editQuestion } from '../../../../services/assessmentService';

const EditQuestionModal = ({ isOpen, onClose, question, assessmentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    points: 0,
    order_index: 0,
    media_url: '',
    options: [],
    answer_key: '',
    word_limit: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text || '',
        question_type: question.question_type || 'multiple_choice',
        points: question.points || 0,
        order_index: question.order_index || 0,
        media_url: question.media_url || '',
        options: question.options?.map(opt => ({
          id: opt.id,
          text: opt.option_text || opt.text,
          is_correct: opt.is_correct
        })) || [],
        answer_key: question.answer_key || '',
        word_limit: question.word_limit || 0
      });
    }
  }, [question]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await editQuestion(assessmentId, question.id, formData);
      if (response.success) {
        onSuccess(response.question);
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update question');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', is_correct: false }]
    }));
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => 
        i === index ? { ...opt, [field]: value } : opt
      )
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Edit Question</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="question_text"className="block text-sm font-medium text-gray-700">Question Text</label>
              <textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="question_type" className="block text-sm font-medium text-gray-700">Question Type</label>
                <select
                  id="question_type"
                  value={formData.question_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, question_type: e.target.value }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>

              <div>
                <label htmlFor="points" className="block text-sm font-medium text-gray-700">Points</label>
                <input
                  id="points"
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  required
                />
              </div>
            </div>

            {['multiple_choice', 'true_false'].includes(formData.question_type) && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Options</label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2"
                      placeholder="Option text"
                    />
                    <input
                      type="checkbox"
                      checked={option.is_correct}
                      onChange={(e) => updateOption(index, 'is_correct', e.target.checked)}
                      className="h-4 w-4 text-yellow-600 rounded"
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
            )}

            {['short_answer', 'essay'].includes(formData.question_type) && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Answer Key</label>
                <textarea
                  value={formData.answer_key}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer_key: e.target.value }))}
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
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuestionModal;
