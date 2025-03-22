import React, { useState } from 'react';
import { X, Users, Loader, Trash2 } from 'lucide-react';
import { removeMember } from '../../../../services/groupService';

const GroupMembersModal = ({ isOpen, onClose, group, members, isLoading, onMemberRemoved }) => {
  const [removingMember, setRemovingMember] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  console.log('GroupMembersModal rendered with:', { group, members }); // Add logging

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={20} />
            <span>{group.name} - Members ({members?.length || 0})</span>
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
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

        <div className="border-t pt-4">
          {isLoading ? (
            <div className="text-center py-4">Loading members...</div>
          ) : !members || members.length === 0 ? ( // Improved check for empty members
            <div className="text-center py-4 text-gray-500">
              No members found in this group (ID: {group.group_id || group.id})
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {members.map((member) => (
                <div
                  key={member.id || member.user_id}
                  className="flex items-center bg-gray-50 p-3 rounded-lg"
                >
                  {/* Main content container with flex-grow */}
                  <div className="flex-grow">
                    <span className="font-medium">
                      {member.first_name} {member.last_name}
                    </span>
                    <div className="text-sm text-gray-600 mt-1">
                      <span>{member.email}</span>
                      {member.school_id && (
                        <span className="ml-2">• ID: {member.school_id}</span>
                      )}
                      {member.year_level && (
                        <span className="ml-2">• Year Level: {member.year_level}</span>
                      )}
                    </div>
                  </div>

                  {/* Right side container with fixed layout */}
                  <div className="flex items-center gap-3 ml-4">
                    {member.role && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        member.role.includes('learner')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {member.role}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveMember(member)}
                      disabled={removingMember}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      title="Remove member"
                    >
                      {removingMember ? <Loader size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembersModal;
