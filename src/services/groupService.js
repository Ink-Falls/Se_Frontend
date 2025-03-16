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
    
    // Filter out members based on type and null check
    const filteredData = (data.users || data).filter(member => {
      if (type === 'learner') {
        return member.learner !== null;
      } else if (type === 'student_teacher') {
        return member.studentTeacher !== null;
      }
      return true;
    });

    return filteredData.map(member => ({
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
    let result = { 
      ...createdGroup,
      message: 'Group created successfully!'
    };

    if (groupData.memberIds?.length > 0) {
      let newGroupId = createdGroup.group_id || createdGroup.id;
      
      if (!newGroupId) {
        const allGroups = await getAllGroups();
        newGroupId = Math.max(...allGroups.map(g => g.id));
      }

      const assignEndpoint = groupData.type === 'learner' 
        ? '/groups/assign-learners'
        : '/groups/assign-student-teachers';

      const assignPayload = {
        groupId: parseInt(newGroupId),
        userIds: groupData.memberIds.map(id => parseInt(id))
      };

      const assignResponse = await fetch(`${API_BASE_URL}${assignEndpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignPayload),
      });

      const assignResponseData = await assignResponse.json();

      if (!assignResponse.ok) {
        throw new Error(assignResponseData.message || 'Failed to assign members to group');
      }

      result = {
        ...result,
        members: assignResponseData.members,
        message: 'Group created and members assigned successfully!'
      };
    }

    return result;
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

export const getGroupsByType = async (type) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Update the endpoint to use group_type instead of type
    const response = await fetch(`${API_BASE_URL}/groups?group_type=${type}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    const data = await response.json();
    
    // Filter groups based on type before returning
    const filteredGroups = data.filter(group => 
      group.group_type.toLowerCase() === type.toLowerCase()
    );

    return filteredGroups.map(group => ({
      id: group.group_id,
      name: group.name,
      type: group.group_type
    }));
  } catch (error) {
    console.error(`Error fetching ${type} groups:`, error);
    throw error;
  }
};
