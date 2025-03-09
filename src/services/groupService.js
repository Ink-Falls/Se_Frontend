/**
 * @module groupService
 * @description Service module for handling group-related API operations
 */

import { API_BASE_URL } from '../utils/constants';

/**
 * Fetches available members for a group based on type.
 * @async
 * @function getAvailableMembers
 * @param {string} type - The type of group ('student_teacher' or 'student')
 * @param {Array} groups - Array of existing groups to exclude their members
 * @returns {Promise<Array>} Array of available users that can be added to the group
 * @throws {Error} If the API request fails
 */
export const getAvailableMembers = async (type, groups) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    const users = data.users || [];

    // Filter users and return more details
    const filteredUsers = users.filter(user => {
      const hasRole = type === 'student_teacher' ? 
        user.role === 'student_teacher' : 
        user.role === 'student';
      
      const isNotInGroup = !groups.some(group => 
        group.members?.some(member => member.id === user.id)
      );

      return hasRole && isNotInGroup;
    }).map(user => ({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      school_id: user.school_id
    }));

    return filteredUsers;
  } catch (error) {
    throw error;
  }
};

/**
 * Creates a new group.
 * @async
 * @function createGroup
 * @param {Object} groupData - The group data to be created
 * @param {string} groupData.name - Name of the group
 * @param {string} groupData.type - Type of the group ('student_teacher' or 'student')
 * @param {Array} groupData.memberIds - Array of user IDs to be added to the group
 * @returns {Promise<Object>} Created group object
 * @throws {Error} If the API request fails
 */
export const createGroup = async (groupData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...groupData,
        member_ids: groupData.memberIds // Send members along with group data
      }),
    });

    if (!response.ok) throw new Error('Failed to create group');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Updates an existing group.
 * @async
 * @function updateGroup
 * @param {number|string} groupId - ID of the group to update
 * @param {Object} updateData - The updated group data
 * @returns {Promise<Object>} Updated group object
 * @throws {Error} If the API request fails
 */
export const updateGroup = async (groupId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) throw new Error('Failed to update group');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a group.
 * @async
 * @function deleteGroup
 * @param {number|string} groupId - ID of the group to delete
 * @returns {Promise<void>}
 * @throws {Error} If the API request fails
 */
export const deleteGroup = async (groupId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to delete group');
  } catch (error) {
    throw error;
  }
};

export const assignMembers = async (groupId, memberIds, type) => {
  try {
    const token = localStorage.getItem('token');
    const endpoint = type === 'student_teacher' ? '/groups/assign-student-teachers' : '/groups/assign-learners';
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        group_id: groupId,
        member_ids: memberIds
      }),
    });

    if (!response.ok) throw new Error('Failed to assign members');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const getAllGroups = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch groups');
    const data = await response.json();
    return data.groups || [];
  } catch (error) {
    throw error;
  }
};

export const getGroupById = async (groupId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch group');
    return await response.json();
  } catch (error) {
    throw error;
  }
};
