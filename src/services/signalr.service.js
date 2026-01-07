/**
 * Dịch vụ SignalR
 * Xử lý chat thời gian thực qua SignalR
 */

import * as signalR from '@microsoft/signalr';
import { API_BASE_URL } from '../config';
import { getAccessToken } from './storage.service';

class SignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.messageHandlers = [];
        this.typingHandlers = [];
        this.connectionStateHandlers = [];
    }

    /**
     * Khởi tạo kết nối SignalR
     */
    async connect() {
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            console.log('SignalR already connected');
            this.isConnected = true;
            return this.connection;
        }

        try {
            // Create connection
            this.connection = new signalR.HubConnectionBuilder()
                .withUrl(`${API_BASE_URL}/hubs/chat`, {
                    accessTokenFactory: async () => {
                        try {
                            const token = await getAccessToken();
                            return token;
                        } catch (e) {
                            console.error('SignalR: Error in accessTokenFactory', e);
                            return null;
                        }
                    },
                    // Remove forced LongPolling to allow WebSockets (preferred for real-time)
                })
                .withAutomaticReconnect()
                .configureLogging(signalR.LogLevel.Information)
                .build();

            // Setup event handlers
            this.setupEventHandlers();

            // Start connection
            await this.connection.start();
            this.isConnected = true;

            console.log('SignalR connected successfully');
            this.notifyConnectionState('connected');

            return this.connection;
        } catch (error) {
            console.error('Error connecting to SignalR:', error);
            this.isConnected = false;
            this.notifyConnectionState('disconnected', error);
            throw error;
        }
    }

    /**
     * Thiết lập các trình xử lý sự kiện SignalR
     */
    setupEventHandlers() {
        if (!this.connection) return;

        // Nhận tin nhắn
        this.connection.on('ReceiveMessage', (message) => {
            console.log('SignalR: Received raw message:', message);
            if (message) {
                this.notifyMessageHandlers(message);
            }
        });

        // Người dùng đang gõ
        this.connection.on('UserTyping', (userId, isTyping) => {
            console.log(`SignalR: User ${userId} typing status: ${isTyping}`);
            this.notifyTypingHandlers({ userId, isTyping });
        });

        // Kết nối đã đóng
        this.connection.onclose((error) => {
            console.log('SignalR connection closed', error);
            this.isConnected = false;
            this.notifyConnectionState('disconnected', error);
        });

        // Đang kết nối lại
        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting...', error);
            this.isConnected = false;
            this.notifyConnectionState('reconnecting', error);
        });

        // Đã kết nối lại
        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected:', connectionId);
            this.isConnected = true;
            this.notifyConnectionState('connected');
        });
    }

    /**
     * Gửi tin nhắn
     * @param {string} conversationId - Conversation ID
     * @param {string} message - Message text
     */
    async sendMessage(conversationId, message) {
        if (!this.connection || !this.isConnected) {
            throw new Error('SignalR not connected');
        }

        try {
            await this.connection.invoke('SendMessage', conversationId, message);
            console.log('Message sent via SignalR');
        } catch (error) {
            console.error('Error sending message via SignalR:', error);
            throw error;
        }
    }

    /**
     * Gửi trạng thái đang gõ
     * @param {string} conversationId - Conversation ID
     * @param {boolean} isTyping - Is typing status
     */
    async sendTypingIndicator(conversationId, isTyping) {
        if (!this.connection || !this.isConnected) {
            return;
        }

        try {
            await this.connection.invoke('SendTypingIndicator', conversationId, isTyping);
        } catch (error) {
            // Silently log error as this is a non-critical feature
            console.warn('SignalR: SendTypingIndicator not supported or failed', error.message);
        }
    }

    /**
     * Tham gia phòng chat
     * @param {string} conversationId - Conversation ID
     */
    async joinConversation(conversationId) {
        if (!this.connection || !this.isConnected) {
            return;
        }

        try {
            await this.connection.invoke('JoinConversation', conversationId);
            console.log(`Joined conversation: ${conversationId}`);
        } catch (error) {
            console.warn(`SignalR: JoinConversation failed for ${conversationId}`, error.message);
        }
    }

    /**
     * Rời phòng chat
     * @param {string} conversationId - Conversation ID
     */
    async leaveConversation(conversationId) {
        if (!this.connection || !this.isConnected) {
            return;
        }

        try {
            await this.connection.invoke('LeaveConversation', conversationId);
            console.log(`Left conversation: ${conversationId}`);
        } catch (error) {
            console.warn(`SignalR: LeaveConversation failed for ${conversationId}`, error.message);
        }
    }

    /**
     * Ngắt kết nối SignalR
     */
    async disconnect() {
        if (this.connection) {
            try {
                await this.connection.stop();
                this.isConnected = false;
                console.log('SignalR disconnected');
            } catch (error) {
                console.error('Error disconnecting SignalR:', error);
            }
        }
    }

    /**
     * Đăng ký xử lý tin nhắn
     * @param {Function} handler - Handler function
     * @returns {Function} Unsubscribe function
     */
    onMessage(handler) {
        this.messageHandlers.push(handler);

        // Return unsubscribe function
        return () => {
            this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Đăng ký xử lý trạng thái gõ
     * @param {Function} handler - Handler function
     * @returns {Function} Unsubscribe function
     */
    onTyping(handler) {
        this.typingHandlers.push(handler);

        return () => {
            this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Đăng ký xử lý trạng thái kết nối
     * @param {Function} handler - Handler function
     * @returns {Function} Unsubscribe function
     */
    onConnectionStateChange(handler) {
        this.connectionStateHandlers.push(handler);

        return () => {
            this.connectionStateHandlers = this.connectionStateHandlers.filter(h => h !== handler);
        };
    }

    /**
     * Thông báo cho các trình xử lý tin nhắn
     */
    notifyMessageHandlers(message) {
        this.messageHandlers.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }

    /**
     * Thông báo cho các trình xử lý trạng thái gõ
     */
    notifyTypingHandlers(data) {
        this.typingHandlers.forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error('Error in typing handler:', error);
            }
        });
    }

    /**
     * Thông báo cho các trình xử lý trạng thái kết nối
     */
    notifyConnectionState(state, error = null) {
        this.connectionStateHandlers.forEach(handler => {
            try {
                handler(state, error);
            } catch (err) {
                console.error('Error in connection state handler:', err);
            }
        });
    }

    /**
     * Lấy trạng thái kết nối
     */
    getConnectionState() {
        if (!this.connection) return 'disconnected';

        switch (this.connection.state) {
            case signalR.HubConnectionState.Connected:
                return 'connected';
            case signalR.HubConnectionState.Connecting:
                return 'connecting';
            case signalR.HubConnectionState.Reconnecting:
                return 'reconnecting';
            case signalR.HubConnectionState.Disconnected:
                return 'disconnected';
            default:
                return 'disconnected';
        }
    }
}

// Xuất instance singleton
const signalRService = new SignalRService();
export default signalRService;
