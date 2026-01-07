/**
 * Dịch vụ API Việc làm
 * Xử lý các cuộc gọi API liên quan đến việc làm
 */

import { apiClient } from './api.service';

/**
 * Lấy tất cả bài đăng việc làm có phân trang
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise<object>} Jobs list with pagination
 */
export const getAllJobs = async (pageNumber = 1, pageSize = 10) => {
    try {
        const response = await apiClient.get('/api/JobPosts', {
            params: { pageNumber, pageSize }
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Tìm kiếm bài đăng việc làm với bộ lọc
 * @param {object} searchParams - Search parameters
 * @param {string} searchParams.SearchTerm - Search term for job title/description
 * @param {number} searchParams.PageNumber - Page number
 * @param {number} searchParams.PageSize - Items per page
 * @param {string} searchParams.SortBy - Sort field (optional: CreatedDate, Salary, etc.)
 * @param {boolean} searchParams.SortDescending - Sort descending (optional)
 * @returns {Promise<object>} Search results with pagination
 */
export const searchJobs = async (searchParams) => {
    try {
        const response = await apiClient.get('/api/JobPosts/search', {
            params: searchParams
        });
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy bài đăng việc làm theo ID
 * @param {number} id - Job post ID
 * @returns {Promise<object>} Job post details
 */
export const getJobById = async (id) => {
    try {
        const response = await apiClient.get(`/api/JobPosts/${id}`);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy bài đăng việc làm theo ID công ty
 * @param {number} companyId - Company ID
 * @param {number} pageNumber - Page number (default: 1)
 * @param {number} pageSize - Items per page (default: 10)
 * @returns {Promise<object>} Company's job posts
 */
export const getJobsByCompany = async (companyId, pageNumber = 1, pageSize = 10) => {
    try {
        const response = await apiClient.get(`/api/JobPosts/company/${companyId}`, {
            params: { pageNumber, pageSize }
        });
        return response;
    } catch (error) {
        throw error;
    }
};
