import { describe, it, expect, beforeEach, vi } from 'vitest';
import { API_BASE_URL } from '../../src/utils/constants';
import {
  getModulesByCourseId,
  createModule,
  getModuleContents,
  updateModule,
  deleteModule
} from '../../src/services/moduleService';

// Mock fetch globally
global.fetch = vi.fn();

describe('Module Service', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'test-token');
    global.fetch.mockClear();
  });

  describe('getModulesByCourseId', () => {
    it('should fetch modules for a course', async () => {
      const courseId = 1;
      const mockModules = [
        { id: 1, name: 'Module 1', description: 'Description 1' },
        { id: 2, name: 'Module 2', description: 'Description 2' }
      ];

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ modules: mockModules })
      });

      const result = await getModulesByCourseId(courseId);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/modules/course/${courseId}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockModules);
    });

    it('should handle errors when fetching modules', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ message: 'Modules not found' })
      });

      await expect(getModulesByCourseId(999)).rejects.toThrow();
    });
  });

  describe('createModule', () => {
    it('should create a new module', async () => {
      const mockModuleData = {
        name: 'New Module',
        description: 'New module description',
        course_id: 1
      };

      const mockResponse = {
        id: 3,
        ...mockModuleData
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await createModule(mockModuleData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/modules`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(mockModuleData)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getModuleContents', () => {
    it('should fetch module contents', async () => {
      const moduleId = 1;
      const mockContents = {
        id: moduleId,
        name: 'Module 1',
        contents: [
          { id: 1, type: 'text', content: 'Text content' },
          { id: 2, type: 'video', content: 'Video URL' }
        ]
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockContents)
      });

      const result = await getModuleContents(moduleId);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/modules/${moduleId}/contents`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockContents);
    });
  });

  describe('updateModule', () => {
    it('should update a module', async () => {
      const moduleId = 1;
      const updateData = {
        name: 'Updated Module',
        description: 'Updated description'
      };

      const mockResponse = {
        id: moduleId,
        ...updateData
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await updateModule(moduleId, updateData);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/modules/${moduleId}`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token',
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify(updateData)
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteModule', () => {
    it('should delete a module', async () => {
      const moduleId = 1;
      const mockResponse = { success: true, message: 'Module deleted' };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await deleteModule(moduleId);
      
      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/modules/${moduleId}`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
