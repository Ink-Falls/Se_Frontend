import { API_BASE_URL } from '../utils/constants';
import fetchWithInterceptor from './apiService';

/**
 * Gets all modules for a specific course
 * @param {number} courseId - The ID of the course
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} Modules data with pagination info
 */
export const getModulesByCourseId = async (courseId, page = 1) => {
  if (!courseId) {
    throw new Error('Course ID is required');
  }

  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/course/${courseId}?page=${page}`
    );

    const data = await response.json();

    return data.modules || data;
  } catch (error) {
    console.error('❌ Error fetching modules:', error);
    throw error;
  }
};

/**
 * Creates a new module for a course
 * @param {number} courseId - The ID of the course
 * @param {Object} moduleData - The module data
 * @returns {Promise<Object>} Created module data
 */
export const createModule = async (courseId, moduleData) => {
  try {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const formattedData = {
      course_id: parseInt(courseId),
      name: moduleData.name || moduleData.title,
      description: moduleData.description || ''
    };

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/course/${courseId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create module (${response.status})`);
    }

    const data = await response.json();
    
    return data.module || data;
  } catch (error) {
    console.error('Error in createModule:', error);
    throw error;
  }
};

/**
 * Updates an existing module
 * @param {number} moduleId - The ID of the module to update
 * @param {Object} updateData - The updated module data
 * @returns {Promise<Object>} Updated module data
 */
export const updateModule = async (moduleId, updateData) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/${moduleId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error updating module:', error);
    throw error;
  }
};

/**
 * Deletes a module
 * @param {number} moduleId - The ID of the module to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteModule = async (moduleId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/${moduleId}`,
      {
        method: 'DELETE',
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error deleting module:', error);
    throw error;
  }
};

/**
 * Gets all contents for a specific module
 * @param {number} moduleId - The ID of the module
 * @param {number} page - Page number for pagination
 * @returns {Promise<Object>} Contents data with pagination info
 */
export const getModuleContents = async (moduleId, page = 1) => {
  try {
    
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/${moduleId}/contents?page=${page}`
    );
    
    const data = await response.json();
    
    return {
      contents: data.contents || data,
      totalCount: data.totalCount,
      currentPage: data.currentPage
    };
  } catch (error) {
    console.error('Error fetching module contents:', error);
    throw error;
  }
};

/**
 * Adds new content to a module
 * @param {number} moduleId - The ID of the module
 * @param {Object} contentData - The content data to add
 * @returns {Promise<Object>} Created content data
 */
export const addModuleContent = async (moduleId, contentData) => {
  try {

    const formattedData = {
      name: contentData.title,
      link: contentData.content 
    };

    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/${moduleId}/content`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      }
    );

    const responseData = await response.json();
    
    return {
      id: responseData.id || responseData.content_id,
      title: responseData.name || contentData.title,
      link: responseData.link || contentData.content,
      content: responseData.link || contentData.content,
      type: 'link'
    };
  } catch (error) {
    console.error('Error adding module content:', error);
    throw error;
  }
};

/**
 * Updates existing module content
 * @param {number} contentId - The ID of the content to update
 * @param {Object} updateData - The updated content data
 * @returns {Promise<Object>} Updated content data
 */
export const updateModuleContent = async (contentId, updateData) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/content/${contentId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error updating module content:', error);
    throw error;
  }
};

/**
 * Deletes module content
 * @param {number} contentId - The ID of the content to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteModuleContent = async (contentId) => {
  try {
    const response = await fetchWithInterceptor(
      `${API_BASE_URL}/modules/content/${contentId}`,
      {
        method: 'DELETE',
      }
    );
    return await response.json();
  } catch (error) {
    console.error('Error deleting module content:', error);
    throw error;
  }
};
