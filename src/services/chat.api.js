import { apiClient } from './api.service';

/**
 * Dịch vụ API Chat
 * Xử lý tất cả cuộc gọi API liên quan đến chat
 */
const chatAPI = {
    /**
     * Lấy tất cả cuộc trò chuyện của người dùng hiện tại
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
     * Lấy tin nhắn của một cuộc trò chuyện cụ thể
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
     * Gửi tin nhắn
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
     * Tạo cuộc trò chuyện mới
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
     * Đánh dấu tin nhắn là đã đọc
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
     * Lấy số lượng tin nhắn chưa đọc
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
