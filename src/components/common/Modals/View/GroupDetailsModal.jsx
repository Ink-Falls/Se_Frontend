import React, { useState, useEffect } from "react";
import { X, Users, Loader, PencilIcon, Trash2 } from "lucide-react";
import {
  getAllGroups,
  getAvailableMembers,
  updateGroup,
  deleteGroups,
  getGroupMembers,
  assignUsersToGroup,
  removeMember,
} from "../../../../services/groupService";
import GroupMembersModal from "./GroupMembersModal";
import EditGroupModal from "../Edit/EditGroupModal";
import { useTheme } from "../../../../contexts/ThemeContext";

const GroupDetailsModal = ({ isOpen, onClose }) => {
  const { isDarkMode } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [existingGroups, setExistingGroups] = useState([]);
  const [animate, setAnimate] = useState(false);
  const [activeTab, setActiveTab] = useState("groups");
  const [memberType, setMemberType] = useState("learner");
  const [availableMembers, setAvailableMembers] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroupMembers, setSelectedGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAvailableMembers, setSelectedAvailableMembers] = useState([]);
  const [assigningMembers, setAssigningMembers] = useState(false);
  const [selectedGroupForAssignment, setSelectedGroupForAssignment] =
    useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Add school mapping
  const schoolMapping = {
    1001: "University of Santo Tomas (UST)",
    1002: "Asuncion Consunji Elementary School (ACES)",
  };

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
        setError("Failed to load existing groups");
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
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }
        const members = await getAvailableMembers(memberType);
        setAvailableMembers(members);
      } catch (err) {
        console.error("Error fetching members:", err);
        setError("Failed to load available members");
        setAvailableMembers([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (activeTab === "members") {
      fetchMembers();
    }
  }, [activeTab, memberType]);

  const handleGroupSelect = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleDeleteSelected = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await deleteGroups(selectedGroups);
      // Refresh groups list
      const updatedGroups = await getAllGroups();
      setExistingGroups(updatedGroups);
      setSelectedGroups([]);
      setSuccessMessage(result.message || "Groups deleted successfully");
    } catch (err) {
      console.error("Error deleting groups:", err);
      setError(err.message || "Failed to delete selected groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateGroup = async (group) => {
    setEditingGroup(group);
    setShowEditModal(true);
  };

  const handleGroupUpdated = async () => {
    try {
      setIsLoading(true);
      const updatedGroups = await getAllGroups();
      setExistingGroups(updatedGroups);
      setEditingGroup(null);
      setShowEditModal(false);
      // Add success message
      setSuccessMessage("Group updated successfully");
    } catch (err) {
      setError("Failed to refresh groups");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMembers = async (group) => {
    try {
      setLoadingMembers(true);
      setSelectedGroup(group);

      const groupId = group.group_id || group.id;
      const members = await getGroupMembers(groupId);

      if (Array.isArray(members)) {
        setSelectedGroupMembers(members);
      } else {
        console.error("Invalid members data received:", members);
        setError("Invalid member data format received");
      }

      setShowMembersModal(true);
    } catch (err) {
      console.error("Error loading members:", err);
      setError("Failed to load group members: " + err.message);
    } finally {
      setLoadingMembers(false);
    }
  };

  const getCompatibleGroups = (memberType) => {
    return existingGroups.filter(
      (group) => group.groupType.toLowerCase() === memberType.toLowerCase()
    );
  };

  const refreshGroups = async () => {
    try {
      setIsLoading(true);
      const updatedGroups = await getAllGroups();
      setExistingGroups(updatedGroups || []);
    } catch (err) {
      setError("Failed to refresh groups");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshMembers = async () => {
    try {
      const members = await getAvailableMembers(memberType);
      setAvailableMembers(members);
    } catch (err) {
      console.error("Error refreshing members:", err);
      setError("Failed to refresh member list");
    }
  };

  const handleAssignMembers = async () => {
    if (!selectedGroupForAssignment) {
      setError("Please select a group to assign members to");
      return;
    }

    try {
      setAssigningMembers(true);
      await assignUsersToGroup(
        selectedGroupForAssignment.id,
        selectedAvailableMembers,
        selectedGroupForAssignment.groupType
      );

      // Refresh both groups and available members
      await Promise.all([refreshGroups(), refreshMembers()]);

      // Clear selections and show success message
      setSelectedAvailableMembers([]);
      setSelectedGroupForAssignment(null);
      setError("");
      setSuccessMessage("Members assigned successfully");
    } catch (error) {
      console.error("Assignment error:", error);
      setError(error.message || "Failed to assign members");
    } finally {
      setAssigningMembers(false);
    }
  };

  const handleSelectAvailableMember = (memberId) => {
    setSelectedAvailableMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleMemberRemoved = async (groupId) => {
    try {
      // Refresh the members list for the group
      const updatedMembers = await getGroupMembers(groupId);
      setSelectedGroupMembers(updatedMembers);

      // Also refresh the groups list to update member counts
      const updatedGroups = await getAllGroups();
      setExistingGroups(updatedGroups);
    } catch (error) {
      console.error("Error refreshing after member removal:", error);
      setError("Failed to refresh member list: " + error.message);
    }
  };

  // Modify this function to handle type change
  const handleMemberTypeChange = (e) => {
    // Clear selected members when switching types
    setSelectedAvailableMembers([]);
    setMemberType(e.target.value);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-dark-xl w-full max-w-[700px] max-h-[90vh] relative transition-colors ${
          animate ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="overflow-y-auto h-full max-h-[90vh] px-4 md:px-8 py-6 pr-6 md:pr-10">
          <button
            aria-label="Close"
            className="absolute top-6 right-4 md:right-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            onClick={onClose}
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100 transition-colors">Group List</h2>

          <div className="flex flex-col md:flex-row gap-2 md:space-x-4 mb-6">
            <button
              className={`px-4 py-2 rounded-lg flex-1 md:flex-none ${
                activeTab === "groups"
                  ? "bg-[#F6BA18] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              }`}
              onClick={() => setActiveTab("groups")}
            >
              Existing Groups
            </button>
            <button
              className={`px-4 py-2 rounded-lg flex-1 md:flex-none ${
                activeTab === "members"
                  ? "bg-[#F6BA18] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
              }`}
              onClick={() => setActiveTab("members")}
            >
              Available Members
            </button>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg transition-colors">
              {successMessage}
            </div>
          )}

          {activeTab === "groups" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Users size={20} className="text-gray-700 dark:text-gray-300 transition-colors" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Existing Groups ({existingGroups?.length || 0})
                  </h3>
                </div>
                {selectedGroups.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 px-3 py-1 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                  >
                    <Trash2 size={18} />
                    <span>Delete Selected ({selectedGroups.length})</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-[250px] md:max-h-[400px] overflow-y-auto pr-2">
                {existingGroups.map((group) => (
                  <div
                    key={group.id}
                    className="flex items-center space-x-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGroups.includes(group.id)}
                      onChange={() => handleGroupSelect(group.id)}
                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-yellow-600 focus:ring-yellow-500 dark:bg-gray-600 dark:checked:bg-yellow-500"
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors">{group.name}</span>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
                          <span className="capitalize">{group.groupType}</span>
                          <span>|</span>
                          <span>ID: {group.id}</span>
                          {/* Add members list if this group's members are loaded */}
                          {selectedGroupMembers.length > 0 &&
                            group.id === selectedGroupMembers[0]?.groupId && (
                              <div className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600 transition-colors">
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 transition-colors">
                                  Members:
                                </p>
                                <div className="space-y-1">
                                  {selectedGroupMembers.map((member) => (
                                    <div
                                      key={member.id}
                                      className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                                    >
                                      <span>
                                        {member.first_name} {member.last_name} (
                                        {member.role})
                                      </span>
                                      <button
                                        onClick={() =>
                                          handleRemoveMember(group, member)
                                        }
                                        className="p-1 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                        disabled={loadingMembers}
                                        title="Remove member"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewMembers(group)}
                          className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                          disabled={loadingMembers}
                        >
                          {loadingMembers ? (
                            <Loader className="animate-spin" size={16} />
                          ) : (
                            <Users size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => handleUpdateGroup(group)}
                          className="p-1 text-gray-600 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-500 transition-colors"
                        >
                          <PencilIcon size={16} />
                        </button>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            group.groupType === "learner"
                              ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                              : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                          } transition-colors`}
                        >
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
                  <Users size={20} className="text-gray-700 dark:text-gray-300 transition-colors" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Available Members ({availableMembers.length})
                  </h3>
                </div>
                <select
                  value={memberType}
                  onChange={handleMemberTypeChange}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                >
                  <option value="learner">Learners</option>
                  <option value="student_teacher">Student Teachers</option>
                </select>
              </div>

              <div className="flex items-center justify-between mb-4">
                <select
                  value={selectedGroupForAssignment?.id || ""}
                  onChange={(e) => {
                    const group = existingGroups.find(
                      (g) => g.id === parseInt(e.target.value)
                    );
                    setSelectedGroupForAssignment(group);
                  }}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                >
                  <option value="">Select a group to assign to...</option>
                  {getCompatibleGroups(memberType).map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.groupType})
                    </option>
                  ))}
                </select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader className="animate-spin text-gray-700 dark:text-gray-300" size={24} />
                </div>
              ) : (
                <div className="max-h-[200px] md:max-h-[300px] overflow-y-auto pr-2">
                  {availableMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-2 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedAvailableMembers.includes(member.id)}
                          onChange={() =>
                            handleSelectAvailableMember(member.id)
                          }
                          className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-600 dark:checked:bg-yellow-500"
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
                            {member.first_name} {member.last_name}
                          </span>
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex gap-2 transition-colors">
                            <span>{member.email}</span>
                            {member.school_id && (
                              <span>• {schoolMapping[member.school_id]}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedAvailableMembers.length > 0 && (
                <div className="flex justify-end mt-4 items-center gap-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    {selectedGroupForAssignment
                      ? `Assigning to: ${selectedGroupForAssignment.name}`
                      : "Please select a group"}
                  </span>
                  <button
                    onClick={handleAssignMembers}
                    disabled={assigningMembers || !selectedGroupForAssignment}
                    className="px-4 py-2 bg-[#212529] dark:bg-[#333333] text-white rounded-lg hover:bg-[#F6BA18] dark:hover:bg-[#F6BA18] hover:text-black transition-colors disabled:opacity-50"
                  >
                    {assigningMembers
                      ? "Assigning..."
                      : `Assign Selected (${selectedAvailableMembers.length})`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add GroupMembersModal */}
        {showMembersModal && selectedGroup && (
          <GroupMembersModal
            isOpen={showMembersModal}
            onClose={() => {
              setShowMembersModal(false);
              setSelectedGroup(null);
              setSelectedGroupMembers([]);
            }}
            group={selectedGroup}
            members={selectedGroupMembers}
            isLoading={loadingMembers}
            onMemberRemoved={handleMemberRemoved}
          />
        )}

        {showEditModal && editingGroup && (
          <EditGroupModal
            group={editingGroup}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingGroup(null);
            }}
            onUpdate={handleGroupUpdated}
          />
        )}
      </div>
    </div>
  );
};

export default GroupDetailsModal;
