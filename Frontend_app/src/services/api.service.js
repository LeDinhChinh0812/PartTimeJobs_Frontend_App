/**
 * API Service
 * Handles all HTTP requests to the backend
 * Migrated from js/api.js
 */

import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens, clearAuthData } from './storage.service';
import { API_BASE_URL } from '../config';

// Configuration

const API_ENDPOINTS = {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    REVOKE: '/api/auth/revoke',
};

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Export apiClient for use in other services
export { apiClient };

// Request interceptor - Add auth token to requests
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

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Attempt token refresh
                const refreshResponse = await refreshToken();

                // Get the new token (refreshToken function returns the data object)
                const newToken = refreshResponse.data.accessToken;

                // Update auth header for the original request
                originalRequest.headers.Authorization = `Bearer ${newToken}`;

                // Retry original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear auth and reject
                await clearAuthData();
                return Promise.reject(refreshError);
            }
        }

        // Handle error response
        if (error.response?.data) {
            const errorMessage = error.response.data.message || 'An error occurred';
            throw new Error(errorMessage);
        } else if (error.request) {
            throw new Error('Network error. Please check your connection.');
        } else {
            throw new Error(error.message || 'An unexpected error occurred');
        }
    }
);

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Login response
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
 * Register new user
 * @param {string} fullName - User's full name
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} confirmPassword - Password confirmation
 * @param {string} phoneNumber - Optional phone number
 * @returns {Promise<object>} Registration response
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
 * Refresh access token
 * @returns {Promise<object>} Refresh response
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
 * Logout user (revoke refresh token)
 * @returns {Promise<object>} Logout response
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
