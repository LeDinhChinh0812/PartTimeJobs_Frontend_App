import { apiClient } from './api.service';

/**
 * Upload a file to the server
 * @param {object} file - File object (uri, name, type)
 * @returns {Promise<object>} Response containing file URL or ID
 */
export const uploadFile = async (file) => {
    try {
        const formData = new FormData();

        // Handling file for React Native FormData
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
                // Axios on React Native needs this to not mess up FormData
                // Return data as is, don't let axios stringify it
                return data;
            },
        });

        return response;
    } catch (error) {
        throw error;
    }
};
