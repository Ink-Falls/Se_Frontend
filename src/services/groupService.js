import { API_BASE_URL } from '../utils/constants';

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

export const createGroupWithMembers = async (groupData, memberIds) => {
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
        member_ids: memberIds // Send members along with group data
      }),
    });

    if (!response.ok) throw new Error('Failed to create group');
    return await response.json();
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
