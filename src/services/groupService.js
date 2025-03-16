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
 * @param {string} groupId - ID of the group to fetch available members for
 * @returns {Promise<Array>} Array of available users that can be added to the group
 * @throws {Error} If the API request fails
 */
export const getAvailableMembers = async (type) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Use the correct endpoints for initial member fetch
    const endpoint = type === 'student_teacher' 
      ? '/users/available-student-teachers' 
      : '/users/available-learners';

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Your session has expired. Please login again.');
      }
      const error = await response.json();
      throw new Error(error.message || 'Failed to retrieve available members');
    }
    
    const data = await response.json();
    
    // Transform the response data based on member type
    return (data.users || data).map(member => ({
      id: member.id,
      first_name: member.first_name,
      last_name: member.last_name,
      email: member.email,
      school_id: member.school_id,
      role: type === 'student_teacher' ? 'student_teacher' : 'learner'
    }));
  } catch (error) {
    console.error('Error fetching available members:', error);
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
    if (!token) {
      throw new Error('Not authenticated');
    }
    // First create the group
    const createPayload = {
      name: groupData.name,
      groupType: groupData.type
    };

    const createResponse = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createPayload),
    });

    if (!createResponse.ok) {
      const errorData = await createResponse.json();
      throw new Error(errorData.message || 'Failed to create group');
    }

    const createdGroup = await createResponse.json();

    // Then assign members if there are any
    if (groupData.memberIds?.length > 0) {
      // Choose endpoint based on group type
      const assignEndpoint = groupData.type === 'learner' 
        ? '/groups/assign-learners'
        : '/groups/assign-student-teachers';

      const assignPayload = {
        group_id: createdGroup.group_id, // Changed from createdGroup.id to createdGroup.group_id
        member_ids: groupData.memberIds // Changed from user_ids to member_ids to match backend
      };

      const assignResponse = await fetch(`${API_BASE_URL}${assignEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignPayload),
      });

      if (!assignResponse.ok) {
        const errorData = await assignResponse.json();
        console.error('Member assignment error:', errorData);
        throw new Error(errorData.message || 'Failed to assign members to group');
      }

      const assignResult = await assignResponse.json();
      return { ...createdGroup, members: assignResult.members };
    }

    return createdGroup;
  } catch (error) {
    console.error('Error in createGroup:', error);
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
    if (!token) throw new Error('Authentication token not found');

    const response = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update group');
    }

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

export const deleteGroups = async (groupIds) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication token not found');

    await Promise.all(groupIds.map(groupId => 
      fetch(`${API_BASE_URL}/group/${groupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      })
    ));

    return true;
  } catch (error) {
    throw error;
  }
};

export const getAllGroups = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Your session has expired. Please login again.');
      }
      throw new Error('Failed to fetch groups');
    }

    const data = await response.json();
    return data.map(group => ({
      id: group.group_id,
      name: group.name,
      groupType: group.group_type,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt
    }));
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
