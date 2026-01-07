/**
 * Dịch vụ API Ứng tuyển
 * Xử lý các cuộc gọi API liên quan đến ứng tuyển
 */

import { apiClient } from './api.service';

/**
 * 3.1 Lấy chi tiết đơn ứng tuyển
 * @param {number} id - Application ID
 * @returns {Promise<object>} Application details
 */
export const getApplicationById = async (id) => {
    try {
        const response = await apiClient.get(`/api/applications/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 3.2 Lấy danh sách ứng tuyển theo bài đăng việc làm (Nhà tuyển dụng)
 * @param {number} jobPostId
 * @param {number} pageNumber
 * @param {number} pageSize
 * @returns {Promise<object>} List of applications for the job
 */
export const getApplicationsByJobPost = async (jobPostId, pageNumber = 1, pageSize = 10) => {
    try {
        const response = await apiClient.get(`/api/applications/job/${jobPostId}`, {
            params: { pageNumber, pageSize }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 3.3 Lấy danh sách đơn ứng tuyển của tôi (Sinh viên)
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise<object>} User's applications with pagination
 */
export const getMyApplications = async (pageNumber = 1, pageSize = 10) => {
    try {
        const response = await apiClient.get('/api/applications/me', {
            params: { pageNumber, pageSize }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 3.4 Nộp đơn ứng tuyển (Sinh viên)
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

        const response = await apiClient.post('/api/applications', requestBody);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 3.5 Cập nhật trạng thái ứng tuyển (Nhà tuyển dụng)
 * @param {number} id - Application ID
 * @param {number} statusId - 1=Pending, 2=Approved, 3=Rejected
 * @param {string} notes - Notes
 * @returns {Promise<object>} Updated application
 */
export const updateApplicationStatus = async (id, statusId, notes = '') => {
    try {
        const response = await apiClient.patch(`/api/applications/${id}/status`, {
            statusId,
            notes
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * 3.6 Rút đơn ứng tuyển (Sinh viên)
 * @param {number} id - Application ID
 * @returns {Promise<object>} Withdraw response
 */
export const withdrawApplication = async (id) => {
    try {
        console.log('=== WITHDRAW APPLICATION ===');
        console.log('Application ID:', id);
        const response = await apiClient.post(`/api/applications/${id}/withdraw`);
        console.log('Withdraw Response:', response);
        return response;
    } catch (error) {
        console.error('Withdraw application error:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        throw error;
    }
};

/**
 * Xóa đơn ứng tuyển (Legacy/Admin)
 * @param {number} id - Application ID
 * @returns {Promise<object>} Deletion response
 */
export const deleteApplication = async (id) => {
    try {
        console.log('=== DELETE APPLICATION ===');
        const response = await apiClient.delete(`/api/applications/${id}`);
        return response;
    } catch (error) {
        console.error('Delete application error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: `/api/applications/${id}`
        });
        throw error;
    }
};
