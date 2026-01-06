import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatAPI } from '../services';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

/**
 * Normalizes conversation object to handle inconsistent API keys
 */
const normalizeConversation = (conv) => {
    if (!conv) return null;

    // Deep search for participant name
    const participantName =
        conv.employerName ||
        conv.employer_name ||
        conv.participant_name ||
        conv.participantName ||
        conv.ParticipantName ||
        conv.participant?.fullName ||
        conv.participant?.fullName ||
        conv.otherUser?.fullName ||
        conv.fullName ||
        conv.employer?.employerName ||
        conv.employer?.companyName ||
        conv.employer?.fullName ||
        (conv.job_title ? `Nhà tuyển dụng (${conv.job_title})` : 'Người dùng');

    return {
        ...conv,
        id: conv.id || conv.Id,
        participant_name: participantName,
        participant_avatar: conv.participant_avatar || conv.participantAvatar || conv.ParticipantAvatar || conv.participant?.avatarUrl || null,
        last_message: conv.last_message || conv.lastMessage || conv.LastMessage || 'Chưa có tin nhắn',
        last_message_at: conv.last_message_at || conv.lastMessageAt || conv.LastMessageAt ?
            (conv.last_message_at || conv.lastMessageAt || conv.LastMessageAt).endsWith('Z') ?
                (conv.last_message_at || conv.lastMessageAt || conv.LastMessageAt) :
                (conv.last_message_at || conv.lastMessageAt || conv.LastMessageAt) + 'Z' : null,
        unread_count: conv.unread_count || conv.unreadCount || conv.UnreadCount || 0,
        is_online: conv.is_online || conv.isOnline || conv.IsOnline || false,
        job_post_id: conv.job_post_id || conv.jobPostId || conv.JobPostId,
        job_title: conv.job_title || conv.jobTitle || conv.JobTitle,
    };
};

/**
 * Chat List Screen
 * Displays all conversations for the current user
 */
const ChatListScreen = ({ navigation }) => {
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            const data = await chatAPI.getConversations();
            console.log('DEBUG: ChatList data raw:', JSON.stringify(data, null, 2));
            const rawList = Array.isArray(data) ? data : (data.conversations || data.items || []);
            const list = rawList.map(normalizeConversation);

            // Deduplicate logic
            const uniqueList = list.filter((item, index, self) =>
                index === self.findIndex((t) => String(t.id) === String(item.id))
            );

            setConversations(uniqueList);
            setFilteredConversations(uniqueList);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    // Handle refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadConversations();
    }, [loadConversations]);

    // Search conversations
    const handleSearch = useCallback((query) => {
        setSearchQuery(query);
        if (query.trim() === '') {
            setFilteredConversations(conversations);
        } else {
            const filtered = conversations.filter((conv) =>
                conv.participant_name?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredConversations(filtered);
        }
    }, [conversations]);

    // Navigate to chat room
    const openChat = useCallback((conversation) => {
        navigation.navigate('ChatRoom', {
            conversationId: conversation.id,
            participantName: conversation.participant_name,
            participantAvatar: conversation.participant_avatar,
            jobPostId: conversation.job_post_id || conversation.jobPostId,
            jobTitle: conversation.job_title || conversation.jobTitle,
        });
    }, [navigation]);

    // Navigate to AI Chatbot
    const openAIChatbot = useCallback(() => {
        navigation.navigate('AIChatbot');
    }, [navigation]);

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return '';

        const now = new Date();
        const msgDate = new Date(date);

        if (msgDate.toDateString() === now.toDateString()) {
            return date.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }

        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);
        if (msgDate.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        }
        else {
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
            });
        }
    };

    // Render conversation item
    const renderConversationItem = ({ item }) => (
        <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => openChat(item)}
        >
            <View style={styles.avatarContainer}>
                {item.participant_avatar ? (
                    <Image
                        source={{ uri: item.participant_avatar }}
                        style={styles.avatar}
                    />
                ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                        <Text style={styles.avatarText}>
                            {item.participant_name?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                )}
                {item.is_online && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.conversationContent}>
                <View style={styles.conversationHeader}>
                    <Text style={styles.participantName} numberOfLines={1}>
                        {item.participant_name || 'Unknown User'}
                    </Text>
                    <Text style={styles.timestamp}>
                        {formatTime(item.last_message_at)}
                    </Text>
                </View>

                <View style={styles.messagePreview}>
                    <Text
                        style={[
                            styles.lastMessage,
                            (item.unread_count > 0 || item.unreadCount > 0) && styles.unreadMessage,
                        ]}
                        numberOfLines={1}
                    >
                        {item.last_message || 'Chưa có tin nhắn'}
                    </Text>
                    {item.unread_count > 0 && (
                        <View style={styles.unreadBadge}>
                            <Text style={styles.unreadCount}>
                                {item.unread_count > 99 ? '99+' : item.unread_count}
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    // Render AI Chatbot card
    const renderAIChatbotCard = () => (
        <TouchableOpacity
            style={styles.aiChatbotCard}
            onPress={openAIChatbot}
        >
            <View style={styles.aiChatbotIconContainer}>
                <Ionicons name="sparkles" size={28} color={COLORS.white} />
            </View>
            <View style={styles.aiChatbotContent}>
                <Text style={styles.aiChatbotTitle}>AI Chatbot Assistant</Text>
                <Text style={styles.aiChatbotDescription}>
                    Hỏi đáp về việc làm, CV, phỏng vấn và nhiều hơn nữa
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Tin nhắn</Text>
                <TouchableOpacity style={styles.newChatButton}>
                    <Ionicons name="create-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={COLORS.gray} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Tìm kiếm cuộc trò chuyện..."
                    value={searchQuery}
                    onChangeText={handleSearch}
                    placeholderTextColor={COLORS.gray}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch('')}>
                        <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                    </TouchableOpacity>
                )}
            </View>

            {/* Conversations List */}
            <FlatList
                data={filteredConversations}
                renderItem={renderConversationItem}
                keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
                ListHeaderComponent={renderAIChatbotCard}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray} />
                        <Text style={styles.emptyText}>
                            {searchQuery
                                ? 'Không tìm thấy cuộc trò chuyện'
                                : 'Chưa có tin nhắn nào'}
                        </Text>
                    </View>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[COLORS.primary]}
                    />
                }
                contentContainerStyle={
                    filteredConversations.length === 0 && styles.emptyListContainer
                }
            />
        </View>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    headerTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    newChatButton: {
        padding: SPACING.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginVertical: SPACING.md,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: COLORS.lightGray,
    },
    searchInput: {
        flex: 1,
        marginLeft: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
    },
    aiChatbotCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginBottom: SPACING.md,
        padding: SPACING.md,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    aiChatbotIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
    },
    aiChatbotContent: {
        flex: 1,
    },
    aiChatbotTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
    },
    aiChatbotDescription: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
    },
    conversationItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.lightGray,
    },
    avatarContainer: {
        position: 'relative',
        marginRight: SPACING.md,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: COLORS.white,
        fontSize: FONT_SIZES.lg,
        fontWeight: 'bold',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    conversationContent: {
        flex: 1,
        justifyContent: 'center',
    },
    conversationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    participantName: {
        flex: 1,
        fontSize: FONT_SIZES.md,
        fontWeight: '600',
        color: COLORS.text,
        marginRight: SPACING.sm,
    },
    timestamp: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    messagePreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    lastMessage: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.gray,
        marginRight: SPACING.sm,
    },
    unreadMessage: {
        fontWeight: '600',
        color: COLORS.text,
    },
    unreadBadge: {
        backgroundColor: COLORS.primary,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    unreadCount: {
        color: COLORS.white,
        fontSize: FONT_SIZES.xs,
        fontWeight: 'bold',
    },
    emptyListContainer: {
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xxl * 2,
    },
    emptyText: {
        marginTop: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.gray,
    },
});

export default ChatListScreen;
