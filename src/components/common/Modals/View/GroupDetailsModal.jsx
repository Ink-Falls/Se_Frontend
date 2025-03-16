import React, { useState, useEffect } from "react";
import { X, Users, Loader, PencilIcon, Trash2 } from "lucide-react";
import { getAllGroups, getAvailableMembers, updateGroup, deleteGroups } from "../../../../services/groupService";

const GroupDetailsModal = ({ onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingGroups, setExistingGroups] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  const [memberType, setMemberType] = useState("learner");
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 50);
  }, []);

  useEffect(() => {
    const fetchExistingGroups = async () => {
      try {
        setIsLoading(true);
        const groupsData = await getAllGroups();
        setExistingGroups(groupsData || []);
      } catch (err) {
        setError('Failed to load existing groups');
        setExistingGroups([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExistingGroups();
  }, []);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        const members = await getAvailableMembers(memberType);
        setAvailableMembers(members);
      } catch (err) {
        setError('Failed to load available members');
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab, memberType]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      await deleteGroups(selectedGroups);
      // Refresh groups list
      const updatedGroups = await getAllGroups();
      setExistingGroups(updatedGroups);
      setSelectedGroups([]);
    } catch (err) {
      setError('Failed to delete selected groups');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async (group) => {
    setEditingGroup(group);
    // Implement update modal/form logic here
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

        <h2 className="text-2xl font-bold mb-6">Group List</h2>

        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "groups" ? "bg-[#F6BA18] text-white" : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setActiveTab("groups")}
          >
            Existing Groups
          </button>
          <button
            className={`px-4 py-2 rounded-lg ${
              activeTab === "members" ? "bg-[#F6BA18] text-white" : "bg-gray-100 text-gray-600"
            }`}
            onClick={() => setActiveTab("members")}
          >
            Available Members
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {activeTab === "groups" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Users size={20} />
                <h3 className="text-lg font-semibold">
                  Existing Groups ({existingGroups?.length || 0})
                </h3>
              </div>
              {selectedGroups.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-3 py-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={18} />
                  <span>Delete Selected ({selectedGroups.length})</span>
                </button>
              )}
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {existingGroups.map((group) => (
                <div key={group.id} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-lg">
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.id)}
                    onChange={() => handleGroupSelect(group.id)}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium">{group.name}</span>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span className="capitalize">{group.groupType}</span>
                        <span>|</span>
                        <span>ID: {group.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleUpdateGroup(group)}
                        className="p-1 text-gray-600 hover:text-yellow-600"
                      >
                        <PencilIcon size={16} />
                      </button>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        group.groupType === 'learner' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {group.groupType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Users size={20} />
                <h3 className="text-lg font-semibold">
                  Available Members ({availableMembers.length})
                </h3>
              </div>
              <select
                value={memberType}
                onChange={(e) => setMemberType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="learner">Learners</option>
                <option value="student_teacher">Student Teachers</option>
              </select>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader className="animate-spin" size={24} />
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
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
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupDetailsModal;
