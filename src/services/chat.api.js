import { apiClient } from './api.service';

/**
 * Chat API Service
 * Handles all chat-related API calls
 */
const chatAPI = {
    /**
     * Get all conversations for the current user
     * @param {number} pageNumber - Page number
     * @param {number} pageSize - Page size
     */
    getConversations: async (pageNumber = 1, pageSize = 20) => {
        try {
            const response = await apiClient.get('/api/chat/conversations', {
                params: { pageNumber, pageSize },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    },

    /**
     * Get messages for a specific conversation
     * @param {string} conversationId - ID of the conversation
     * @param {number} pageNumber - Page number
     * @param {number} pageSize - Page size
     */
    getMessages: async (conversationId, pageNumber = 1, pageSize = 50) => {
        try {
            const response = await apiClient.get(
                `/api/chat/conversations/${conversationId}/messages`,
                { params: { pageNumber, pageSize } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    /**
     * Send a message
     * @param {string} conversationId - ID of the conversation
     * @param {string} content - Message content
     * @param {string} recipientId - Optional recipient ID
     * @param {string} jobPostId - Optional job post ID
     */
    sendMessage: async (conversationId, content, recipientId = null, jobPostId = null) => {
        try {
            const payload = {
                conversationId,
                content,
            };

            if (recipientId) payload.recipientId = recipientId;
            if (jobPostId) payload.jobPostId = jobPostId;

            const response = await apiClient.post('/api/chat/messages', payload);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    /**
     * Create a new conversation
     * @param {number} recipientId - ID of the recipient user
     * @param {number} jobPostId - Optional Job Post ID
     */
    createConversation: async (recipientId, jobPostId = null) => {
        try {
            const payload = {
                recipientId: recipientId,
            };

            if (jobPostId) {
                payload.jobPostId = jobPostId;
            }

            const response = await apiClient.post('/api/chat/conversations', payload);
            return response.data;
        } catch (error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    },

    /**
     * Mark messages as read
     * @param {string} conversationId - ID of the conversation
     */
    markAsRead: async (conversationId) => {
        try {
            const response = await apiClient.post(
                `/api/chat/conversations/${conversationId}/read`
            );
            return response.data;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    /**
     * Get unread messages count
     */
    getUnreadCount: async () => {
        try {
            const response = await apiClient.get('/api/chat/unread-count');
            return response.data;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    },
};

export default chatAPI;
