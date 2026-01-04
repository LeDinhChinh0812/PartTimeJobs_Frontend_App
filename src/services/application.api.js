/**
 * Application API Service
 * Handles all application-related API calls
 */

import { apiClient } from './api.service';

/**
 * Get my applications (for logged-in student)
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise<object>} User's applications with pagination
 */
export const getMyApplications = async (pageNumber = 1, pageSize = 10) => {
    try {
        const response = await apiClient.get('/api/Applications/me', {
            params: { pageNumber, pageSize }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Create a new job application
 * @param {number} jobPostId - Job post ID to apply for
 * @param {string} coverLetter - Cover letter text
 * @param {string} resumeUrl - Resume URL (optional)
 * @returns {Promise<object>} Created application
 */
export const createApplication = async (jobPostId, coverLetter, resumeUrl = null) => {
    try {
        const requestBody = {
            jobPostId,
            coverLetter
        };

        if (resumeUrl) {
            requestBody.resumeUrl = resumeUrl;
        }

        const response = await apiClient.post('/api/Applications', requestBody);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Withdraw an application
 * @param {number} id - Application ID
 * @returns {Promise<object>} Withdrawal response
 */
export const withdrawApplication = async (id) => {
    try {
        const response = await apiClient.post(`/api/Applications/${id}/withdraw`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get application by ID
 * @param {number} id - Application ID
 * @returns {Promise<object>} Application details
 */
export const getApplicationById = async (id) => {
    try {
        const response = await apiClient.get(`/api/Applications/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete an application
 * @param {number} id - Application ID
 * @returns {Promise<object>} Deletion response
 */
export const deleteApplication = async (id) => {
    try {
        console.log('=== DELETE APPLICATION ===');
        console.log('Application ID:', id);
        console.log('URL:', `/api/Applications/${id}`);

        const response = await apiClient.delete(`/api/Applications/${id}`);

        console.log('Delete response:', response);
        return response;
    } catch (error) {
        console.error('Delete application error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: `/api/Applications/${id}`
        });
        throw error;
    }
};
