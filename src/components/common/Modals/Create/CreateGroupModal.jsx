import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Users } from "lucide-react";

const CreateGroupModal = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState("details");
  const [groupData, setGroupData] = useState({
    name: "",
    description: "",
    type: "learner", // or "student_teacher"
    members: []
  });
  const [animate, setAnimate] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);

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
      members: [...prev.members, { id: member.id, name: member.name }]
    }));
  };

  const removeMember = (memberId) => {
    setGroupData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const handleSubmit = () => {
    onSave(groupData);
    onClose();
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
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={groupData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  rows="3"
                  placeholder="Enter group description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Group Type</label>
                <select
                  name="type"
                  value={groupData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                >
                  <option value="learner">Learner Group</option>
                  <option value="student_teacher">Student-Teacher Group</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Users size={20} />
                <h3 className="text-lg font-semibold">Members ({groupData.members.length})</h3>
              </div>
              
              <div className="space-y-2">
                {groupData.members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <span>{member.name}</span>
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={() => console.log("Add member")}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
              >
                <Plus size={20} />
                <span>Add Member</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-[#212529] text-white rounded-lg hover:bg-[#F6BA18]"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
