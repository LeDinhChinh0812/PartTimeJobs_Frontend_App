/**
 * Tiện ích kiểm tra hợp lệ
 * Chuyển đổi từ js/utils.js
 */

/**
 * Kiểm tra định dạng email
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Kiểm tra mật khẩu (tối thiểu 6 ký tự)
 * @param {string} password - Password to validate
 * @returns {boolean} True if valid
 */
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Kiểm tra form trước khi gửi
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

    // Kiểm tra riêng cho đăng ký
    if (formType === 'signup') {
        if (!formData.fullName) {
            errors.fullName = 'Full name is required';
            isValid = false;
        }

        // Kiểm tra xác nhận mật khẩu
        if (formData.password !== formData.confirmPassword) {
            errors.password = 'Passwords do not match';
            isValid = false;
        }
    }

    return { isValid, errors };
};
