import { apiClient } from './api.service';

/**
 * Dịch vụ API AI Chatbot
 * Xử lý tương tác với AI chatbot
 */
const chatbotAPI = {
    /**
     * @param {string} message
     */
    sendMessage: async (message) => {
        try {
            const response = await apiClient.post('/api/AIChat/message', {
                message,
            }, {
                timeout: 60000
            });
            return response;
        } catch (error) {
            console.error('Error sending message to chatbot:', error);
            throw error;
        }
    },

    /**
     * Khởi động lại cuộc trò chuyện chatbot
     */
    clearHistory: async () => {
        try {
            const response = await apiClient.post('/api/AIChat/restart');
            return response;
        } catch (error) {
            console.error('Error restarting chatbot:', error);
            throw error;
        }
    },
};

export default chatbotAPI;
