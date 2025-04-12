import React, { useState } from 'react';
import { X, Users, Loader, Trash2 } from 'lucide-react';
import { removeMember } from '../../../../services/groupService';
import { useTheme } from '../../../../contexts/ThemeContext';

const GroupMembersModal = ({ isOpen, onClose, group, members, isLoading, onMemberRemoved }) => {
  const { isDarkMode } = useTheme();
  const [removingMember, setRemovingMember] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Add the schoolMapping object here
  const schoolMapping = {
    1001: "UST",
    1002: "ACES",
  };

  const handleRemoveMember = async (member) => {
    try {
      setRemovingMember(true);
      setError('');
      
      const groupId = parseInt(group.id || group.group_id);
      const userId = parseInt(member.user_id || member.id);

      if (!groupId || !userId) {
        throw new Error('Invalid group or member ID');
      }

      const result = await removeMember(groupId, userId);
      
      // Update the local state to remove the member
      const updatedMembers = members.filter(m => 
        (m.user_id || m.id) !== (member.user_id || member.id)
      );
      
      setSuccessMessage(`Successfully removed ${member.first_name} ${member.last_name}`);
      
      // Notify parent component to refresh the members list
      if (onMemberRemoved) {
        try {
          await onMemberRemoved(groupId);
        } catch (err) {
          console.error('Error in parent refresh:', err);
        }
      }

      return result;
    } catch (error) {
      console.error('Error removing member:', error);
      setError('Failed to remove member: ' + error.message);
    } finally {
      setRemovingMember(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl shadow-xl dark:shadow-dark-xl transition-colors">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100 transition-colors">
            <Users size={20} className="text-gray-700 dark:text-gray-300 transition-colors" />
            <span>{group.name} - Members ({members?.length || 0})</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

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

        <div className="border-t dark:border-gray-700 pt-4 transition-colors">
          {isLoading ? (
            <div className="text-center py-4 text-gray-700 dark:text-gray-300 transition-colors">Loading members...</div>
          ) : !members || members.length === 0 ? ( // Improved check for empty members
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 transition-colors">
              No members found in this group (ID: {group.group_id || group.id})
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {members.map((member) => {

  return (
    <div
      key={member.id || member.user_id}
      className="flex items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg transition-colors"
    >
      {/* Main content container with flex-grow */}
      <div className="flex-grow">
        <span className="font-medium text-gray-900 dark:text-gray-100 transition-colors">
          {member.first_name} {member.last_name}
        </span>
        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">
          <span>{member.email}</span>
          {member.school_id && (
            <span className="ml-2">
              • School: {schoolMapping[member.school_id] || "Unknown School"}
            </span>
          )}
          {member.year_level && (
            <span className="ml-2">• Year Level: {member.year_level}</span>
          )}
        </div>
      </div>

      {/* Right side container with fixed layout */}
      <div className="flex items-center gap-3 ml-4">
        {member.role && (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
              member.role.includes("learner")
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                : "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
            } transition-colors`}
          >
            {member.role}
          </span>
        )}
        <button
          onClick={() => handleRemoveMember(member)}
          disabled={removingMember}
          className="p-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors flex-shrink-0"
          title="Remove member"
        >
          {removingMember ? (
            <Loader size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </div>
    </div>
  );
})}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
