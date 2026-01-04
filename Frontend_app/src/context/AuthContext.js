/**
 * Authentication Context
 * Manages authentication state throughout the app
 */

import React, { createContext, useState, useContext, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../services/api.service';
import { getUserData, saveUserData, clearAuthData, getAccessToken } from '../services/storage.service';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on app start
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await getAccessToken();
            const userData = await getUserData();

            if (token && userData) {
                setUser(userData);
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const response = await apiLogin(email, password);

            if (response.success && response.data) {
                const userData = {
                    userId: response.data.userId,
                    email: response.data.email,
                    fullName: response.data.fullName,
                    roles: response.data.roles,
                };

                await saveUserData(userData);
                setUser(userData);
                setIsAuthenticated(true);

                return { success: true, data: response.data };
            }

            return response;
        } catch (error) {
            throw error;
        }
    };

    const register = async (fullName, email, password, confirmPassword) => {
        try {
            const response = await apiRegister(fullName, email, password, confirmPassword);
            return response;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiLogout();
            setUser(null);
            setIsAuthenticated(false);
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear local state even if API fails
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
