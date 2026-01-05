import { apiClient } from './api.service';

/**
 * AI Chatbot API Service
 * Handles AI chatbot interactions
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
     * Restart chatbot conversation
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
