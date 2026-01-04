/**
 * Validation Utilities
 * Migrated from js/utils.js
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate password (minimum 6 characters)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Validate form before submission
 * @param {object} formData - Form data to validate
 * @param {string} formType - Type of form ('login' or 'signup')
 * @returns {object} { isValid: boolean, errors: object }
 */
export const validateForm = (formData, formType) => {
    const errors = {};
    let isValid = true;

    // Email validation
    if (!formData.email) {
        errors.email = 'Email is required';
        isValid = false;
    } else if (!isValidEmail(formData.email)) {
        errors.email = 'Invalid email format';
        isValid = false;
    }

    // Password validation
    if (!formData.password) {
        errors.password = 'Password is required';
        isValid = false;
    } else if (!isValidPassword(formData.password)) {
        errors.password = 'Password must be at least 6 characters';
        isValid = false;
    }

    // Signup-specific validation
    if (formType === 'signup') {
        if (!formData.fullName) {
            errors.fullName = 'Full name is required';
            isValid = false;
        }

        // Confirm password validation
        if (formData.password !== formData.confirmPassword) {
            errors.password = 'Passwords do not match';
            isValid = false;
        }
    }

    return { isValid, errors };
};
