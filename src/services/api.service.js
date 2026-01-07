/**
 * Dịch vụ API
 * Xử lý tất cả các yêu cầu HTTP đến backend
 * Chuyển đổi từ js/api.js
 */

import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearAuthData } from './storage.service';
import { API_BASE_URL } from '../config';

// Cấu hình

const API_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    REVOKE: '/api/auth/revoke',
};

// Tạo instance axios
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Xuất apiClient để sử dụng ở các dịch vụ khác
export { apiClient };

// Request interceptor - Thêm token xác thực vào yêu cầu
apiClient.interceptors.request.use(
    async (config) => {
        const token = await getAccessToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý lỗi
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // Nếu lỗi 401 và chưa thử lại, thử refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Thử làm mới refresh token
                const refreshResponse = await refreshToken();

                // Lấy token mới (hàm refreshToken trả về object data)
                const newToken = refreshResponse.data.accessToken;

                // Cập nhật header auth cho request gốc
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Thử lại request gốc
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Nếu làm mới thất bại, xóa dữ liệu auth và từ chối
                await clearAuthData();
                return Promise.reject(refreshError);
            }
        }

        // Handle error response
        if (error.response?.data) {
            console.log('API Error Data:', error.response.data);

            const status = error.response.status;
            let errorDetail = '';

            if (typeof error.response.data === 'string') {
                errorDetail = error.response.data;
            } else if (typeof error.response.data === 'object') {
                // Try typical fields, otherwise dump the whole object
                errorDetail = error.response.data.message ||
                    error.response.data.title ||
                    JSON.stringify(error.response.data);
            }

            // Construct a very descriptive error message for debugging
            throw new Error(`Server Error (${status}): ${errorDetail}`);
        } else if (error.request) {
            throw new Error('Network error. Unable to reach server.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
);

/**
 * Đăng nhập người dùng
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @returns {Promise<object>} Phản hồi đăng nhập
 */
export const login = async (email, password) => {
    try {
        const response = await apiClient.post(API_ENDPOINTS.LOGIN, {
            email,
            password,
        });

        // Store tokens and user data if successful
        if (response.success && response.data) {
            await saveTokens(response.data.accessToken, response.data.refreshToken);
        }

        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Đăng ký người dùng mới
 * @param {string} fullName - Tên đầy đủ
 * @param {string} email - Email người dùng
 * @param {string} password - Mật khẩu
 * @param {string} confirmPassword - Xác nhận mật khẩu
 * @param {string} phoneNumber - Số điện thoại (tùy chọn)
 * @returns {Promise<object>} Phản hồi đăng ký
 */
export const register = async (
    fullName,
    email,
    password,
    confirmPassword,
    phoneNumber = null
) => {
    try {
        const requestBody = {
            email,
            password,
            confirmPassword,
            fullName,
        };

        if (phoneNumber) {
            requestBody.phoneNumber = phoneNumber;
        }

        const response = await apiClient.post(API_ENDPOINTS.REGISTER, requestBody);
        return response;
    } catch (error) {
        throw error;
    }
};

/**
 * Làm mới access token
 * @returns {Promise<object>} Phản hồi làm mới
 */
export const refreshToken = async () => {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        // Use direct axios call to avoid interceptor loop
        const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.REFRESH}`, {
            refreshToken,
        });

        const data = response.data;

        // Update tokens
        if (data.success && data.data) {
            await saveTokens(data.data.accessToken, data.data.refreshToken);
            return data;
        }

        throw new Error(data.message || 'Refresh failed');
    } catch (error) {
        throw error;
    }
};

/**
 * Đăng xuất người dùng (thu hồi refresh token)
 * @returns {Promise<object>} Phản hồi đăng xuất
 */
export const logout = async () => {
    try {
        const refreshToken = await getRefreshToken();

        if (!refreshToken) {
            await clearAuthData();
            return { success: true, message: 'Logged out successfully' };
        }

        const response = await apiClient.post(API_ENDPOINTS.REVOKE, {
            refreshToken,
        });

        await clearAuthData();
        return response;
    } catch (error) {
        // Clear data even if API call fails
        await clearAuthData();
        throw error;
    }
};
