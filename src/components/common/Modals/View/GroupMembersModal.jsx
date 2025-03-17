import React from "react";
import { X, Users } from "lucide-react";

const GroupMembersModal = ({ isOpen, onClose, group, members, isLoading }) => {
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
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {member.first_name} {member.last_name}
                    </span>
                    <div className="flex gap-4 text-sm text-gray-600">
                      <span>{member.email}</span>
                      {member.school_id && (
                        <>
                          <span>|</span>
                          <span>ID: {member.school_id}</span>
                        </>
                      )}
                      {member.year_level && (
                        <>
                          <span>|</span>
                          <span>Year Level: {member.year_level}</span>
                        </>
                      )}
                    </div>
                  </div>
                  {member.role && (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role.includes('learner')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {member.role}
                    </span>
                  )}
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
