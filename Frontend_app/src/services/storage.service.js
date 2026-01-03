/**
 * Storage Service
 * Wrapper around AsyncStorage for token and user data management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
};

/**
 * Save data to storage
 */
export const saveData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
        console.error('Error saving data:', error);
        throw error;
    }
};

/**
 * Get data from storage
 */
export const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
        console.error('Error getting data:', error);
        return null;
    }
};

/**
 * Remove data from storage
 */
export const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data:', error);
    }
};

/**
 * Clear all storage
 */
export const clearAll = async () => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
};

/**
 * Save authentication tokens
 */
export const saveTokens = async (accessToken, refreshToken) => {
    try {
        await saveData(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await saveData(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
        console.error('Error saving tokens:', error);
        throw error;
    }
};

/**
 * Get access token
 */
export const getAccessToken = async () => {
    return await getData(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Get refresh token
 */
export const getRefreshToken = async () => {
    return await getData(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Save user data
 */
export const saveUserData = async (userData) => {
    await saveData(STORAGE_KEYS.USER_DATA, userData);
};

/**
 * Get user data
 */
export const getUserData = async () => {
    return await getData(STORAGE_KEYS.USER_DATA);
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async () => {
    try {
        await removeData(STORAGE_KEYS.ACCESS_TOKEN);
        await removeData(STORAGE_KEYS.REFRESH_TOKEN);
        await removeData(STORAGE_KEYS.USER_DATA);
    } catch (error) {
        console.error('Error clearing auth data:', error);
    }
};
