import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Users, Loader } from "lucide-react";
import { getAvailableMembers, updateGroup, getGroupMembers, updateGroupMembers } from "../../../../services/groupService";

const EditGroupModal = ({ group, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: group.name,
    groupType: group.groupType
  });
  const [availableMembers, setAvailableMembers] = useState([]);
  const [currentMembers, setCurrentMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [membersToAdd, setMembersToAdd] = useState([]);
  const [membersToRemove, setMembersToRemove] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [members, currentGroupMembers] = await Promise.all([
          getAvailableMembers(group.groupType),
          getGroupMembers(group.id)
        ]);
        setAvailableMembers(members);
        setCurrentMembers(currentGroupMembers);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [group]);

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAddMember = (member) => {
    setMembersToAdd(prev => [...prev, member.id]);
    setAvailableMembers(prev => prev.filter(m => m.id !== member.id));
    setCurrentMembers(prev => [...prev, member]);
  };

  const handleRemoveMember = (member) => {
    setMembersToRemove(prev => [...prev, member.id]);
    setCurrentMembers(prev => prev.filter(m => m.id !== member.id));
    setAvailableMembers(prev => [...prev, member]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      
      // Format update data according to API requirements
      const updateData = {
        name: formData.name,
        groupType: formData.groupType,
        addUserIds: membersToAdd,
        removeUserIds: membersToRemove
      };

      await updateGroup(group.id, updateData);
      onUpdate();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Group</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Group Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Group Type</label>
              <select
                name="groupType"
                value={formData.groupType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                required
              >
                <option value="learner">Learner</option>
                <option value="student_teacher">Student Teacher</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Current Members</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {currentMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(member)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Available Members</h3>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {availableMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium">{member.first_name} {member.last_name}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAddMember(member)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <Loader className="animate-spin mr-2" size={16} />
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGroupModal;
