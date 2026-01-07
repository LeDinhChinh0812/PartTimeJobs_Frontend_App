/**
 * Dịch vụ Lưu trữ
 * Wrapper cho AsyncStorage để quản lý token và dữ liệu người dùng
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    USER_DATA: 'userData',
};

/**
 * Lưu dữ liệu vào storage
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
 * Lấy dữ liệu từ storage
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
 * Xóa dữ liệu khỏi storage
 */
export const removeData = async (key) => {
    try {
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing data:', error);
    }
};

/**
 * Xóa tất cả storage
 */
export const clearAll = async () => {
    try {
        await AsyncStorage.clear();
    } catch (error) {
        console.error('Error clearing storage:', error);
    }
};

/**
 * Lưu token xác thực
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
 * Lấy access token
 */
export const getAccessToken = async () => {
    return await getData(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Lấy refresh token
 */
export const getRefreshToken = async () => {
    return await getData(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Lưu dữ liệu người dùng
 */
export const saveUserData = async (userData) => {
    await saveData(STORAGE_KEYS.USER_DATA, userData);
};

/**
 * Lấy dữ liệu người dùng
 */
export const getUserData = async () => {
    return await getData(STORAGE_KEYS.USER_DATA);
};

/**
 * Xóa tất cả dữ liệu xác thực
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
