import { apiClient } from './api.service';

/**
 * Chat API Service
 * Handles all chat-related API calls
 */
const chatAPI = {
    /**
     * Get all conversations for the current user
     */
    getConversations: async () => {
        try {
            const response = await apiClient.get('/api/chat/conversations');
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    },

    /**
     * Get messages for a specific conversation
     * @param {string} conversationId - ID of the conversation
     * @param {number} page - Page number for pagination
     * @param {number} limit - Number of messages per page
     */
    getMessages: async (conversationId, page = 1, limit = 50) => {
        try {
            const response = await apiClient.get(
                `/api/chat/conversations/${conversationId}/messages`,
                { params: { page, limit } }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    },

    /**
     * Send a message in a conversation
     * @param {string} conversationId - ID of the conversation
     * @param {string} message - Message content
     * @param {Array} attachments - Optional file attachments
     */
    sendMessage: async (conversationId, message, attachments = []) => {
        try {
            const formData = new FormData();
            formData.append('message', message);

            if (attachments.length > 0) {
                attachments.forEach((file, index) => {
                    formData.append(`attachment_${index}`, file);
                });
            }

            const response = await apiClient.post(
                `/api/chat/conversations/${conversationId}/messages`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    },

    /**
     * Create a new conversation
     * @param {string} recipientId - ID of the recipient user
     * @param {string} initialMessage - Optional initial message
     */
    createConversation: async (recipientId, initialMessage = '') => {
        try {
            console.log('=== CREATE CONVERSATION ===');
            console.log('RecipientId (employerId):', recipientId);
            console.log('RecipientId type:', typeof recipientId);
            console.log('Initial message:', initialMessage);

            const payload = {
                recipient_id: recipientId,
                initial_message: initialMessage,
            };

            console.log('Payload:', JSON.stringify(payload, null, 2));
            console.log('Request URL:', '/api/chat/conversations');

            const response = await apiClient.post('/api/chat/conversations', payload);

            console.log('Create conversation response:', response);
            return response.data;
        } catch (error) {
            console.error('=== CREATE CONVERSATION ERROR ===');
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);
            console.error('Status code:', error.response?.status);
            console.error('RecipientId was:', recipientId);
            throw error;
        }
    },

    /**
     * Mark messages as read
     * @param {string} conversationId - ID of the conversation
     */
    markAsRead: async (conversationId) => {
        try {
            const response = await apiClient.put(
                `/api/chat/conversations/${conversationId}/read`
            );
            return response.data;
        } catch (error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    },

    /**
     * Delete a conversation
     * @param {string} conversationId - ID of the conversation
     */
    deleteConversation: async (conversationId) => {
        try {
            const response = await apiClient.delete(
                `/api/chat/conversations/${conversationId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting conversation:', error);
            throw error;
        }
    },

    /**
     * Search messages
     * @param {string} query - Search query
     */
    searchMessages: async (query) => {
        try {
            const response = await apiClient.get('/api/chat/search', {
                params: { q: query },
            });
            return response.data;
        } catch (error) {
            console.error('Error searching messages:', error);
            throw error;
        }
    },
};

export default chatAPI;
