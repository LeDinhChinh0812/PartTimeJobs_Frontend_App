/**
 * Dịch vụ API Hồ sơ
 * Xử lý các cuộc gọi API liên quan đến hồ sơ
 */

import { apiClient } from './api.service';

/**
 * Lấy hồ sơ của tôi (cho người dùng đã đăng nhập)
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
 * Lấy hồ sơ theo ID
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
 * Tạo hoặc cập nhật hồ sơ
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
 * Xóa hồ sơ
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
