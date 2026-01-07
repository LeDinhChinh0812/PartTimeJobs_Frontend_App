import { apiClient } from './api.service';

/**
 * Tải tập tin lên server
 * @param {object} file - File object (uri, name, type)
 * @returns {Promise<object>} Response containing file URL or ID
 */
export const uploadFile = async (file) => {
    try {
        const formData = new FormData();

        // Xử lý tập tin cho React Native FormData
        const fileToUpload = {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf', // Default to pdf if unknown, or infer from extension
        };

        formData.append('file', fileToUpload);

        const response = await apiClient.post('/api/Files/upload', formData, {
            headers: {
                // 'Content-Type': 'multipart/form-data', // Do not set manually, let axios/browser set it with boundary
            },
            transformRequest: (data, headers) => {
                // Axios trên React Native cần cái này để không làm hỏng FormData
                // Return data as is, don't let axios stringify it
                return data;
            },
        });

        return response;
    } catch (error) {
        throw error;
    }
};
