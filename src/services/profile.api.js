/**
 * Profile API Service
 * Handles all profile-related API calls
 */

import { apiClient } from './api.service';

/**
 * Get my profile (for logged-in user)
 * @returns {Promise<object>} User profile data
 */
export const getMyProfile = async () => {
    try {
        const response = await apiClient.get('/api/Profiles/me');
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Get profile by ID
 * @param {number} id - Profile ID
 * @returns {Promise<object>} Profile data
 */
export const getProfileById = async (id) => {
    try {
        const response = await apiClient.get(`/api/Profiles/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Create or update profile
 * @param {object} profileData - Profile data to save
 * @returns {Promise<object>} Updated profile
 */
export const createOrUpdateProfile = async (profileData) => {
    try {
        const response = await apiClient.post('/api/Profiles', profileData);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Delete profile
 * @param {number} id - Profile ID
 * @returns {Promise<object>} Deletion response
 */
export const deleteProfile = async (id) => {
    try {
        const response = await apiClient.delete(`/api/Profiles/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};
