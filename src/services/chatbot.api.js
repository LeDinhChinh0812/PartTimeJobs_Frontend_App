import { apiClient } from './api.service';

/**
 * AI Chatbot API Service
 * Handles AI chatbot interactions
 */
const chatbotAPI = {
    /**
     * Send a message to the AI chatbot
     * @param {string} message - User's message
     * @param {Array} conversationHistory - Previous messages for context
     */
    sendMessage: async (message) => {
        try {
            const response = await apiClient.post('/api/AIChat/message', {
                message,
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
            console.error('Error clearing chatbot history:', error);
            throw error;
        }
    },

    /**
     * Get job recommendations from AI
     * @param {Object} preferences - User preferences for job recommendations
     */
    getJobRecommendations: async (preferences = {}) => {
        try {
            const response = await apiClient.post('/api/chatbot/recommend-jobs', preferences);
            return response.data;
        } catch (error) {
            console.error('Error getting job recommendations:', error);
            throw error;
        }
    },

    /**
     * Ask chatbot about a specific job
     * @param {string} jobId - ID of the job
     * @param {string} question - User's question about the job
     */
    askAboutJob: async (jobId, question) => {
        try {
            const response = await apiClient.post('/api/chatbot/job-query', {
                job_id: jobId,
                question,
            });
            return response.data;
        } catch (error) {
            console.error('Error asking about job:', error);
            throw error;
        }
    },

    /**
     * Get CV/Resume assistance from chatbot
     * @param {string} cvContent - Current CV content
     * @param {string} query - User's query about CV improvement
     */
    getCVAssistance: async (cvContent, query) => {
        try {
            const response = await apiClient.post('/api/chatbot/cv-assistance', {
                cv_content: cvContent,
                query,
            });
            return response.data;
        } catch (error) {
            console.error('Error getting CV assistance:', error);
            throw error;
        }
    },

    /**
     * Get interview preparation tips
     * @param {string} jobTitle - Job title for interview preparation
     * @param {string} company - Company name
     */
    getInterviewTips: async (jobTitle, company) => {
        try {
            const response = await apiClient.post('/api/chatbot/interview-tips', {
                job_title: jobTitle,
                company,
            });
            return response.data;
        } catch (error) {
            console.error('Error getting interview tips:', error);
            throw error;
        }
    },
};

export default chatbotAPI;
