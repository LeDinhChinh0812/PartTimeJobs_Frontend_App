import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Image,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI, signalRService } from '../services';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

/**
 * Chat Room Screen
 * Individual chat conversation interface
 */
const ChatRoomScreen = ({ route, navigation }) => {
    const { conversationId, participantName, participantAvatar } = route.params;

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Load messages
    const loadMessages = useCallback(async (pageNum = 1, append = false) => {
        try {
            const data = await chatAPI.getMessages(conversationId, pageNum, 50);
            const newMessages = data.messages || [];

            if (append) {
                setMessages((prev) => [...newMessages, ...prev]);
            } else {
                setMessages(newMessages);
            }

            setHasMore(newMessages.length === 50);
            setPage(pageNum);
        } catch (error) {
            console.error('Error loading messages:', error);
            Alert.alert('Lỗi', 'Không thể tải tin nhắn');
        } finally {
            setLoading(false);
        }
    }, [conversationId]);

    useEffect(() => {
        loadMessages();
        // Mark messages as read
        chatAPI.markAsRead(conversationId).catch(console.error);
    }, [conversationId, loadMessages]);

    // Setup SignalR connection
    useEffect(() => {
        let unsubscribeMessage;
        let unsubscribeConnectionState;

        const setupSignalR = async () => {
            try {
                // Connect to SignalR
                await signalRService.connect();
                setIsConnected(true);

                // Join conversation room
                await signalRService.joinConversation(conversationId);

                // Subscribe to new messages
                unsubscribeMessage = signalRService.onMessage((message) => {
                    console.log('New message received via SignalR:', message);

                    // Add message if it's for this conversation
                    if (message.conversationId === conversationId) {
                        setMessages((prev) => {
                            // Check if message already exists
                            const exists = prev.some(m => m.id === message.id);
                            if (exists) return prev;

                            return [...prev, message];
                        });

                        // Scroll to bottom
                        setTimeout(() => {
                            flatListRef.current?.scrollToEnd({ animated: true });
                        }, 100);
                    }
                });

                // Subscribe to connection state changes
                unsubscribeConnectionState = signalRService.onConnectionStateChange((state) => {
                    console.log('SignalR connection state:', state);
                    setIsConnected(state === 'connected');
                });

            } catch (error) {
                console.error('Error setting up SignalR:', error);
                setIsConnected(false);
            }
        };

        setupSignalR();

        // Cleanup on unmount
        return () => {
            if (unsubscribeMessage) unsubscribeMessage();
            if (unsubscribeConnectionState) unsubscribeConnectionState();

            // Leave conversation
            signalRService.leaveConversation(conversationId).catch(console.error);
        };
    }, [conversationId]);

    // Set navigation header
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitleContainer}>
                    {participantAvatar ? (
                        <Image
                            source={{ uri: participantAvatar }}
                            style={styles.headerAvatar}
                        />
                    ) : (
                        <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
                            <Text style={styles.headerAvatarText}>
                                {participantName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    )}
                    <Text style={styles.headerTitle}>{participantName}</Text>
                </View>
            ),
        });
    }, [navigation, participantName, participantAvatar]);

    // Send message
    const sendMessage = useCallback(async () => {
        const trimmedText = inputText.trim();
        if (!trimmedText || sending) return;

        setSending(true);
        const tempMessage = {
            id: `temp-${Date.now()}`,
            message: trimmedText,
            sender_id: 'current_user',
            created_at: new Date().toISOString(),
            is_sending: true,
        };

        // Optimistically add message
        setMessages((prev) => [...prev, tempMessage]);
        setInputText('');

        try {
            // Try to send via SignalR if connected
            if (isConnected) {
                await signalRService.sendMessage(conversationId, trimmedText);

                // Remove temp message (will be replaced by SignalR event)
                setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
            } else {
                // Fallback to HTTP API
                const response = await chatAPI.sendMessage(conversationId, trimmedText);

                // Replace temp message with real message
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempMessage.id ? { ...response.message, is_sending: false } : msg
                    )
                );
            }

            // Scroll to bottom
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Error sending message:', error);

            // Remove temp message and show error
            setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
            setInputText(trimmedText);
        } finally {
            setSending(false);
        }
    }, [inputText, conversationId, sending, isConnected]);

    // Handle typing indicator
    const handleTextChange = useCallback((text) => {
        setInputText(text);

        if (isConnected) {
            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Send typing indicator
            signalRService.sendTypingIndicator(conversationId, true);

            // Stop typing after 2 seconds of no input
            typingTimeoutRef.current = setTimeout(() => {
                signalRService.sendTypingIndicator(conversationId, false);
            }, 2000);
        }
    }, [conversationId, isConnected]);

    // Load more messages
    const loadMoreMessages = useCallback(() => {
        if (!loading && hasMore) {
            setLoading(true);
            loadMessages(page + 1, true);
        }
    }, [loading, hasMore, page, loadMessages]);

    // Format message timestamp
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render message item
    const renderMessageItem = ({ item, index }) => {
        const isCurrentUser = item.sender_id === 'current_user'; // Replace with actual user ID
        const showDate =
            index === 0 ||
            new Date(messages[index - 1].created_at).toDateString() !==
            new Date(item.created_at).toDateString();

        return (
            <>
                {showDate && (
                    <View style={styles.dateSeparator}>
                        <Text style={styles.dateText}>
                            {new Date(item.created_at).toLocaleDateString('vi-VN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </Text>
                    </View>
                )}

                <View
                    style={[
                        styles.messageContainer,
                        isCurrentUser ? styles.currentUserMessage : styles.otherUserMessage,
                    ]}
                >
                    <View
                        style={[
                            styles.messageBubble,
                            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                        ]}
                    >
                        <Text
                            style={[
                                styles.messageText,
                                isCurrentUser ? styles.currentUserText : styles.otherUserText,
                            ]}
                        >
                            {item.message}
                        </Text>
                        <View style={styles.messageFooter}>
                            <Text
                                style={[
                                    styles.messageTime,
                                    isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
                                ]}
                            >
                                {formatMessageTime(item.created_at)}
                            </Text>
                            {isCurrentUser && (
                                <Ionicons
                                    name={item.is_sending ? 'time-outline' : item.is_read ? 'checkmark-done' : 'checkmark'}
                                    size={14}
                                    color={item.is_read ? COLORS.primary : COLORS.white}
                                    style={styles.readIcon}
                                />
                            )}
                        </View>
                    </View>
                </View>
            </>
        );
    };

    if (loading && messages.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            {/* Messages List */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.messagesList}
                onEndReached={loadMoreMessages}
                onEndReachedThreshold={0.1}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubble-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyText}>
                            Hãy bắt đầu cuộc trò chuyện!
                        </Text>
                    </View>
                }
                ListFooterComponent={
                    loading && messages.length > 0 ? (
                        <ActivityIndicator color={COLORS.primary} style={styles.loadingMore} />
                    ) : null
                }
            />

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TouchableOpacity style={styles.attachButton}>
                    <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
                </TouchableOpacity>

                <TextInput
                    style={styles.textInput}
                    placeholder="Nhập tin nhắn..."
                    value={inputText}
                    onChangeText={handleTextChange}
                    multiline
                    maxLength={1000}
                    placeholderTextColor={COLORS.gray}
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!inputText.trim() || sending) && styles.sendButtonDisabled,
                    ]}
                    onPress={sendMessage}
                    disabled={!inputText.trim() || sending}
                >
                    {sending ? (
                        <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                        <Ionicons name="send" size={20} color={COLORS.white} />
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: SPACING.sm,
    },
    headerAvatarPlaceholder: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerAvatarText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.sm,
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    messagesList: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    dateSeparator: {
        alignItems: 'center',
        marginVertical: SPACING.md,
    },
    dateText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        backgroundColor: COLORS.lightGray,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 12,
    },
    messageContainer: {
        marginVertical: SPACING.xs,
        maxWidth: '75%',
    },
    currentUserMessage: {
        alignSelf: 'flex-end',
    },
    otherUserMessage: {
        alignSelf: 'flex-start',
    },
    messageBubble: {
        padding: SPACING.md,
        borderRadius: 16,
    },
    currentUserBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    otherUserBubble: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4,
    },
    messageText: {
        fontSize: FONT_SIZES.md,
        lineHeight: 20,
    },
    currentUserText: {
        color: COLORS.white,
    },
    otherUserText: {
        color: COLORS.text,
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        justifyContent: 'flex-end',
    },
    messageTime: {
        fontSize: FONT_SIZES.xs,
    },
    currentUserTime: {
        color: COLORS.white,
        opacity: 0.8,
    },
    otherUserTime: {
        color: COLORS.gray,
    },
    readIcon: {
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl * 3,
    },
    emptyText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
    },
    loadingMore: {
        marginVertical: SPACING.md,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.lightGray,
    },
    attachButton: {
        padding: SPACING.xs,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    textInput: {
        flex: 1,
        maxHeight: 100,
        backgroundColor: COLORS.background,
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
});

export default ChatRoomScreen;
