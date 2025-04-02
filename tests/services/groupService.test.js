import { describe, it, expect, beforeEach, vi } from 'vitest';
import { API_BASE_URL } from '../../src/utils/constants';
import {
  getGroupsByType,
  getUserGroupIds,
  getGroupById,
  getAvailableMembers,
  createGroup,
  deleteGroups,
  getAllGroups,
  getGroupMembers,
  updateGroupMembers,
  updateGroup,
  assignUsersToGroup,
  removeMember
} from '../../src/services/groupService';
import { getUserById } from '../../src/services/userService';

// Mock userService
vi.mock('../../src/services/userService', () => ({
  getUserById: vi.fn()
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('Group Service', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      role: 'learner'
    }));
    global.fetch.mockClear();
  });

  describe('getAvailableMembers', () => {
    it('should fetch available members by type', async () => {
      const mockMembers = [
        { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com', school_id: '123', learner: {} },
        { id: 2, first_name: 'Jane', last_name: 'Smith', email: 'jane@test.com', school_id: '124', learner: {} }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ users: mockMembers })
      });

      const result = await getAvailableMembers('learner');
      
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/users/available-learners`,
        expect.any(Object)
      );
      expect(result.length).toBe(2);
      expect(result[0].role).toBe('learner');
    });
  });

  describe('createGroup', () => {
    it('should create a group with members', async () => {
      const mockGroupData = {
        name: 'Test Group',
        type: 'learner',
        memberIds: [1, 2]
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 1, group_id: 1, name: 'Test Group' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true })
        });

      const result = await createGroup(mockGroupData);
      
      expect(result.message).toBe('Group created and members assigned successfully!');
    });
  });

  describe('deleteGroups', () => {
    it('should delete multiple groups', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await deleteGroups([1, 2]);
      
      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(2);
    });
  });

  describe('getAllGroups', () => {
    it('should fetch all groups', async () => {
      const mockGroups = [
        { group_id: 1, name: 'Group 1', group_type: 'learner' },
        { group_id: 2, name: 'Group 2', group_type: 'student_teacher' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      });

      const result = await getAllGroups();
      
      expect(result.length).toBe(2);
      expect(result[0].id).toBe(1);
    });
  });

  describe('getGroupMembers', () => {
    it('should fetch group members with user details', async () => {
      const mockMembers = [
        { id: 1, user_id: 1, group_id: 1 }
      ];

      const mockUserDetails = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@test.com',
        school_id: '123',
        role: 'learner'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers)
      });

      getUserById.mockResolvedValueOnce(mockUserDetails);

      const result = await getGroupMembers(1);
      
      expect(result[0].first_name).toBe('John');
      expect(result[0].role).toBe('learner');
    });
  });

  describe('updateGroupMembers', () => {
    it('should update group members', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await updateGroupMembers(1, [2, 3], [4]);
      
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/groups/1/members`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({
            addMembers: [2, 3],
            removeMembers: [4]
          })
        })
      );
    });
  });

  describe('updateGroup', () => {
    it('should update group details', async () => {
      const updateData = {
        name: 'Updated Group',
        groupType: 'learner',
        // Include these fields to match the actual implementation
        addUserIds: [],
        removeUserIds: []
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...updateData, id: 1 })
      });

      const result = await updateGroup(1, updateData);
      
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/groups/1`,
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(updateData)
        })
      );
    });
  });

  describe('assignUsersToGroup', () => {
    it('should assign users to group', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await assignUsersToGroup(1, [2, 3], 'learner');
      
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/groups/assign-learners`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            groupId: 1,
            userIds: [2, 3]
          })
        })
      );
    });
  });

  describe('removeMember', () => {
    it('should remove member from group', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const result = await removeMember(1, 2);
      
      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/groups/1/members/2`,
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({
            action: 'remove',
            userId: 2
          })
        })
      );
    });
  });

  describe('getGroupsByType', () => {
    it('should fetch groups by type', async () => {
      const mockGroups = [
        { id: 1, name: 'Group 1', group_type: 'learner', group_id: 1 },
        { id: 2, name: 'Group 2', group_type: 'learner', group_id: 2 }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      });

      const result = await getGroupsByType('learner');
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/groups?group_type=learner`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockGroups.map(group => ({
        id: group.group_id,
        name: group.name,
        type: group.group_type
      })));
    });
    
    it('should handle unauthorized errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ message: 'Unauthorized' })
      });

      await expect(getGroupsByType('learner')).rejects.toThrow();
    });
  });

  describe('getUserGroupIds', () => {
    it('should fetch user group IDs', async () => {
      // Mock getUserById response
      global.fetch
        .mockResolvedValueOnce({ // getUserById
          ok: true,
          json: () => Promise.resolve({ role: 'learner' })
        })
        .mockResolvedValueOnce({ // getGroupById
          ok: true,
          json: () => Promise.resolve({ group_type: 'learner' })
        })
        .mockResolvedValueOnce({ // getUserGroupIds
          ok: true,
          json: () => Promise.resolve([
            { user_id: 1, group_id: 1 },
            { user_id: 1, group_id: 2 }
          ])
        });

      const result = await getUserGroupIds(1);
      expect(result).toEqual([1, 2]);
    });
  });

  describe('getGroupById', () => {
    it('should fetch a group by ID', async () => {
      // Mock with what the API actually returns
      const mockGroup = {
        group_type: 'learner'
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockGroup)
      });

      const result = await getGroupById(1);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/groups/1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      // Just check that we're getting the response without modifying it
      expect(result).toEqual(mockGroup);
    });
  });
});
