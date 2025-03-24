import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Users, Loader } from "lucide-react";
import { getAvailableMembers, createGroup, getAllGroups } from "../../../../services/groupService";

const CreateGroupModal = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [groupData, setGroupData] = useState({
    name: "",
    type: "learner", // default value matches database enum
    members: []
  });
  const [animate, setAnimate] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [availableMembers, setAvailableMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);

  useEffect(() => {
    fetchAvailableMembers(groupData.type);
  }, [groupData.type]);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const groupsData = await getAllGroups();
        setGroups(groupsData);
      } catch (err) {
        setError("Failed to fetch groups");
      }
    };
    fetchGroups();
  }, []);

  const fetchAvailableMembers = async (type) => {
    try {
      setIsLoading(true);
      setError("");
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Please login to continue");
        return;
      }

      const members = await getAvailableMembers(type);
      setAvailableMembers(members);
    } catch (err) {
      if (err.message.includes('session has expired')) {
        // Handle expired token
        setError("Your session has expired. Please login again.");
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else {
        setError(err.message || "Failed to fetch available members");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setGroupData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addMember = (member) => {
    setGroupData(prev => ({
      ...prev,
      members: [...prev.members, {
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        school_id: member.school_id,
        role: member.role
      }]
    }));
  };

  const removeMember = (memberId) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!groupData.name) {
        setError("Group name is required");
        return;
      }

      const createData = {
        name: groupData.name.trim(),
        type: groupData.type,
        memberIds: groupData.members.map(m => m.id)
      };

      const createdGroup = await createGroup(createData);
      setError(''); // Clear any existing errors
      // Set a success message from the response
      setSuccessMessage(createdGroup.message || 'Group created successfully!');
      
      // Wait a moment to show the success message before closing
      setTimeout(() => {
        onSave(createdGroup);
        onClose();
      }, 1500);

    } catch (err) {
      setError(err.message || "Failed to create group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className={`bg-white rounded-2xl shadow-lg w-[700px] p-8 relative ${
        animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}>
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6">Create New Group</h2>

        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "details"
                ? "bg-[#F6BA18] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Group Details
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "members"
                ? "bg-[#F6BA18] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setActiveTab("members")}
          >
            Members
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="mt-6">
          {activeTab === "details" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  type="text"
                  name="name"
                  value={groupData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">Group Type</label>
                <select
                  id="type"
                  name="type"
                  value={groupData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="learner">Learner</option>
                  <option value="student_teacher">Student Teacher</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Users size={20} />
                <h3 className="text-lg font-semibold">
                  Available {groupData.type === 'student_teacher' ? 'Student Teachers' : 'Learners'} ({availableMembers.length})
                </h3>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="animate-spin" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {availableMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium">{member.first_name} {member.last_name}</span>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{member.email}</span>
                          <span>|</span>
                          <span>ID: {member.school_id}</span>
                          <span>|</span>
                          <span className="capitalize">{member.role.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addMember(member)}
                        className="text-blue-500 hover:text-blue-700"
                        aria-label="Add member"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 border-t pt-4">
                <h4 className="font-medium mb-2">Selected Members ({groupData.members.length})</h4>
                {groupData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg mb-2">
                    <div className="flex flex-col">
                      <span className="font-medium">{member.first_name} {member.last_name}</span>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{member.email}</span>
                        <span>|</span>
                        <span>ID: {member.school_id}</span>
                        <span>|</span>
                        <span className="capitalize">
                          {member.role?.replace?.('_', ' ') || 'No Role'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#F6BA18] disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading && <Loader className="animate-spin" size={16} />}
            {isLoading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
