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
import { useAuth } from '../context';

/**
 * Chuẩn hóa tin nhắn để xử lý các khóa API/SignalR không nhất quán
 */
const normalizeMessage = (msg) => {
    if (!msg) return null;
    const normalized = {
        ...msg,
        id: msg.id || msg.Id,
        message: msg.message || msg.content || msg.Content || '',
        content: msg.content || msg.message || msg.Content || '',
        sender_id: msg.sender_id || msg.senderId || msg.SenderId,
        senderId: msg.senderId || msg.sender_id || msg.SenderId,
        created_at: (msg.created_at || msg.createdAt || msg.CreatedAt) ?
            ((msg.created_at || msg.createdAt || msg.CreatedAt).endsWith('Z') ?
                (msg.created_at || msg.createdAt || msg.CreatedAt) :
                (msg.created_at || msg.createdAt || msg.CreatedAt) + 'Z') : new Date().toISOString(),
        createdAt: (msg.createdAt || msg.created_at || msg.CreatedAt) ?
            ((msg.createdAt || msg.created_at || msg.CreatedAt).endsWith('Z') ?
                (msg.createdAt || msg.created_at || msg.CreatedAt) :
                (msg.createdAt || msg.created_at || msg.CreatedAt) + 'Z') : new Date().toISOString(),
        is_read: msg.is_read || msg.isRead || msg.IsRead || false,
        conversationId: msg.conversationId || msg.conversation_id || msg.ConversationId
    };

    return normalized;
};


/**
 * Màn hình phòng chat
 * Giao diện cuộc trò chuyện cá nhân
 */
const ChatRoomScreen = ({ route, navigation }) => {
    const { user } = useAuth();
    const currentUserId = user?.userId;
    const { conversationId, participantName, participantAvatar, jobPostId: initialJobPostId, jobTitle: initialJobTitle } = route.params;

    // Sử dụng jobPostId từ tham số nếu có
    const [jobId, setJobId] = useState(initialJobPostId);
    const [jobTitle, setJobTitle] = useState(initialJobTitle);
    const [application, setApplication] = useState(null);
    const [withdrawing, setWithdrawing] = useState(false);

    const [messages, setMessages] = useState([]);
    const [typingText, setTypingText] = useState('');
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [loadingJobDetail, setLoadingJobDetail] = useState(false);

    const flatListRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Tải chi tiết công việc và đơn ứng tuyển nếu có jobId
    useEffect(() => {
        const fetchJobAndApp = async () => {
            if (!jobId) return;

            try {
                setLoadingJobDetail(true);
                const { getJobById, getMyApplications } = await import('../services');

                // Tải thông tin công việc để lấy tiêu đề nếu chưa được cung cấp
                if (!jobTitle && jobId) {
                    try {
                        const jobRes = await getJobById(jobId);
                        if (jobRes && jobRes.success) {
                            setJobTitle(jobRes.data.title);
                        }
                    } catch (jobErr) {
                        console.log('ChatRoom: Could not fetch job title, using route param if available');
                    }
                }

                // Tải trạng thái đơn ứng tuyển
                if (jobId) {
                    try {
                        const appRes = await getMyApplications(1, 100);
                        if (appRes && appRes.success) {
                            const foundApp = appRes.data.items?.find(app => (app.jobPostId || app.jobId) === parseInt(jobId, 10));
                            if (foundApp) {
                                setApplication(foundApp);
                            }
                        }
                    } catch (appErr) {
                        console.log('ChatRoom: Could not fetch application status');
                    }
                }
            } catch (err) {
                // Ghi log lỗi lớn một cách âm thầm để tránh làm hỏng chat
                console.log('Silent: Error in fetchJobAndApp sequence');
            } finally {
                setLoadingJobDetail(false);
            }
        };

        fetchJobAndApp();
    }, [jobId, jobTitle]);

    const handleWithdraw = async () => {
        if (!application) return;

        Alert.alert(
            'Rút đơn ứng tuyển',
            `Bạn có chắc chắn muốn rút đơn ứng tuyển cho vị trí "${jobTitle}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rút đơn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setWithdrawing(true);
                            const { withdrawApplication } = await import('../services');
                            const response = await withdrawApplication(application.id);

                            if (response.success) {
                                Alert.alert('Thành công', 'Đã rút đơn ứng tuyển');
                                // Cập nhật trạng thái đơn ứng tuyển cục bộ
                                setApplication(prev => ({ ...prev, statusName: 'Withdrawn' }));
                            } else {
                                Alert.alert('Lỗi', response.message || 'Không thể rút đơn');
                            }
                        } catch (err) {
                            console.error('Error in handleWithdraw:', err);
                            Alert.alert('Lỗi', 'Có lỗi xảy ra khi rút đơn');
                        } finally {
                            setWithdrawing(false);
                        }
                    }
                }
            ]
        );
    };

    // Tải tin nhắn
    const loadMessages = useCallback(async (pageNum = 1, append = false) => {
        try {
            const data = await chatAPI.getMessages(conversationId, pageNum, 50);
            const rawMessages = Array.isArray(data) ? data : (data.messages || data.items || []);
            const newMessages = rawMessages.map(normalizeMessage);

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
        // Đánh dấu tin nhắn đã đọc
        chatAPI.markAsRead(conversationId).catch(console.error);
    }, [conversationId, loadMessages]);

    // Thiết lập kết nối SignalR
    useEffect(() => {
        let unsubscribeMessage;
        let unsubscribeConnectionState;
        let unsubscribeTyping;

        const setupSignalR = async () => {
            // Đăng ký nhận tin nhắn mới trước để tránh race conditions
            unsubscribeMessage = signalRService.onMessage((rawMessage) => {
                console.log('ChatRoom: Raw SignalR message:', rawMessage);
                const message = normalizeMessage(rawMessage);

                // Debug logging
                console.log('ChatRoom: Comparing Conversation IDs:', {
                    screen_conversationId: conversationId,
                    msg_conversationId: message.conversationId,
                    match_loose: message.conversationId == conversationId,
                    match_strict: message.conversationId === conversationId,
                    match_int: message.conversationId === parseInt(conversationId)
                });

                // Thêm tin nhắn nếu thuộc cuộc trò chuyện này
                // compare loosely to handle string/number differences
                if (message.conversationId == conversationId) {
                    setMessages((prev) => {
                        // Kiểm tra xem tin nhắn đã tồn tại chưa
                        const exists = prev.some(m => m.id && message.id && m.id === message.id);
                        if (exists) {
                            console.log('ChatRoom: Message already exists, skipping:', message.id);
                            return prev;
                        }

                        console.log('ChatRoom: Adding new message to list:', message);

                        // Đảm bảo tin nhắn có ID để tránh lỗi key
                        if (!message.id) {
                            message.id = `signalr-${Date.now()}-${Math.random()}`;
                        }

                        return [...prev, message];
                    });

                    // Cuộn xuống dưới cùng
                    setTimeout(() => {
                        flatListRef.current?.scrollToEnd({ animated: true });
                    }, 100);
                } else {
                    console.log('ChatRoom: Message discarded (wrong conversation)');
                }
            });

            // Đăng ký sự kiện đang nhập (typing)
            unsubscribeTyping = signalRService.onTyping(({ userId, isTyping }) => {
                // Kiểm tra xem có phải người khác đang nhập không (không phải chúng ta)
                if (parseInt(userId) !== parseInt(currentUserId)) {
                    if (isTyping) {
                        setTypingText(`${participantName || 'Người khác'} đang nhập...`);
                    } else {
                        setTypingText('');
                    }
                }
            });

            // Đăng ký thay đổi trạng thái kết nối
            unsubscribeConnectionState = signalRService.onConnectionStateChange((state) => {
                console.log('SignalR connection state:', state);
                setIsConnected(state === 'connected');
            });

            try {
                // Kết nối với SignalR
                await signalRService.connect();
                setIsConnected(true);

                // Tham gia phòng chat
                await signalRService.joinConversation(conversationId);

            } catch (error) {
                console.error('Error setting up SignalR:', error);
                setIsConnected(false);
            }
        };

        setupSignalR();

        // Dọn dẹp khi unmount
        return () => {
            if (unsubscribeMessage) unsubscribeMessage();
            if (unsubscribeTyping) unsubscribeTyping();
            if (unsubscribeConnectionState) unsubscribeConnectionState();

            // Rời khỏi cuộc trò chuyện
            signalRService.leaveConversation(conversationId).catch(console.error);
        };
    }, [conversationId]);

    // Thiết lập tiêu đề điều hướng
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

    // Gửi tin nhắn
    const sendMessage = useCallback(async () => {
        const trimmedText = inputText.trim();
        if (!trimmedText || sending) return;

        // Đảm bảo có conversationId hợp lệ
        if (!conversationId) {
            Alert.alert('Lỗi', 'Không tìm thấy cuộc trò chuyện');
            return;
        }

        setSending(true);
        const tempId = `temp-${Date.now()}`;
        const tempMessage = {
            id: tempId,
            content: trimmedText,
            message: trimmedText,
            senderId: currentUserId || 'current_user',
            sender_id: currentUserId || 'current_user',
            created_at: new Date().toISOString(),
            is_sending: true,
        };

        // Thêm tin nhắn một cách lạc quan (Optimistic update)
        setMessages((prev) => [...prev, tempMessage]);
        setInputText('');

        try {
            // Luôn sử dụng REST API để gửi nhằm tránh các vấn đề gọi SignalR
            const response = await chatAPI.sendMessage(conversationId, trimmedText);
            console.log('Message sent via REST API:', response);
            const normalizedRes = normalizeMessage(response);

            // Thay thế tin nhắn tạm thời bằng tin nhắn thực
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempId ? { ...normalizedRes, is_sending: false } : msg
                )
            );

            // Cuộn xuống dưới cùng
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        } catch (error) {
            console.error('Error sending message via REST:', error);

            // Xóa tin nhắn tạm thời và hiển thị lỗi
            setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
            Alert.alert('Lỗi', 'Không thể gửi tin nhắn. Vui lòng thử lại.');
            setInputText(trimmedText);
        } finally {
            setSending(false);
        }
    }, [inputText, conversationId, sending]);

    // Xử lý chỉ báo đang nhập
    const handleTextChange = useCallback((text) => {
        setInputText(text);

        if (isConnected) {
            // Xóa timeout trước đó
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Gửi chỉ báo đang nhập
            signalRService.sendTypingIndicator(conversationId, true);

            // Ngừng trạng thái đang nhập sau 2 giây không nhập liệu
            typingTimeoutRef.current = setTimeout(() => {
                signalRService.sendTypingIndicator(conversationId, false);
            }, 2000);
        }
    }, [conversationId, isConnected]);

    // Tải thêm tin nhắn
    const loadMoreMessages = useCallback(() => {
        if (!loading && hasMore) {
            setLoading(true);
            loadMessages(page + 1, true);
        }
    }, [loading, hasMore, page, loadMessages]);

    // Định dạng thời gian tin nhắn
    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return ''; // Return empty if invalid date

        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render mục tin nhắn
    const renderMessageItem = ({ item, index }) => {
        // So sánh với ID người dùng hiện tại từ context xác thực
        const isCurrentUser = item.senderId === currentUserId || item.sender_id === currentUserId || item.sender_id === 'current_user';

        const itemDate = new Date(item.created_at);
        const isValidDate = !isNaN(itemDate.getTime());

        const prevItem = index > 0 ? messages[index - 1] : null;
        const prevDate = prevItem ? new Date(prevItem.created_at) : null;

        const showDate = isValidDate && (
            index === 0 ||
            (prevDate && !isNaN(prevDate.getTime()) && prevDate.toDateString() !== itemDate.toDateString())
        );

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
            {/* Thanh thông tin công việc */}
            {jobId && jobTitle && (
                <View style={styles.jobInfoBar}>
                    <View style={styles.jobInfoMain}>
                        <Ionicons name="briefcase-outline" size={16} color={COLORS.primary} />
                        <Text style={styles.jobInfoTitle} numberOfLines={1}>
                            {jobTitle}
                        </Text>
                    </View>

                    {application && (application.statusName === 'Pending' || application.statusName === 'Đang chờ') ? (
                        <TouchableOpacity
                            style={styles.withdrawSmallButton}
                            onPress={handleWithdraw}
                            disabled={withdrawing}
                        >
                            {withdrawing ? (
                                <ActivityIndicator size="small" color={COLORS.error} />
                            ) : (
                                <Text style={styles.withdrawSmallText}>Hủy CV</Text>
                            )}
                        </TouchableOpacity>
                    ) : application && (application.statusName === 'Withdrawn' || application.statusName === 'Đã rút') ? (
                        <Text style={styles.statusSmallText}>Đã rút đơn</Text>
                    ) : null}
                </View>
            )}

            {/* Danh sách tin nhắn */}
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessageItem}
                keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
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

            {/* Chỉ báo đang nhập */}
            {typingText ? (
                <View style={styles.typingContainer}>
                    <Text style={styles.typingText}>{typingText}</Text>
                </View>
            ) : null}

            {/* Khu vực nhập liệu */}
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
    jobInfoBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#BBDEFB',
    },
    jobInfoMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: SPACING.sm,
    },
    jobInfoTitle: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: 6,
    },
    withdrawSmallButton: {
        backgroundColor: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.error,
    },
    withdrawSmallText: {
        fontSize: 12,
        color: COLORS.error,
        fontWeight: 'bold',
    },
    statusSmallText: {
        fontSize: 12,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
    typingContainer: {
        paddingHorizontal: SPACING.md,
        paddingVertical: 5,
        backgroundColor: COLORS.background,
    },
    typingText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
        fontStyle: 'italic',
    },
});

export default ChatRoomScreen;
