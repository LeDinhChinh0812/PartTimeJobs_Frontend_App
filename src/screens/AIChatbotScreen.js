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
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { chatbotAPI } from '../services';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

/**
 * AI Chatbot Screen
 * Conversational AI assistant for job-related queries
 */
const AIChatbotScreen = ({ navigation }) => {
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            message: 'Xin chào! Tôi là AI Assistant của bạn. Tôi có thể giúp bạn:\n\n• Tìm kiếm việc làm phù hợp\n• Tư vấn cải thiện CV\n• Chuẩn bị phỏng vấn\n• Trả lời các câu hỏi về nghề nghiệp\n\nBạn cần hỗ trợ gì hôm nay?',
            sender: 'bot',
            created_at: new Date().toISOString(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationHistory, setConversationHistory] = useState([]);
    const [suggestedQuestions] = useState([
        'Tìm việc làm phù hợp với tôi',
        'Làm sao để cải thiện CV?',
        'Chuẩn bị phỏng vấn như thế nào?',
        'Xu hướng việc làm hiện nay',
    ]);

    const flatListRef = useRef(null);

    // Set navigation header
    useEffect(() => {
        navigation.setOptions({
            headerTitle: () => (
                <View style={styles.headerTitleContainer}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="sparkles" size={24} color={COLORS.white} />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>AI Assistant</Text>
                        <Text style={styles.headerSubtitle}>Luôn sẵn sàng hỗ trợ bạn</Text>
                    </View>
                </View>
            ),
            headerRight: () => (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearHistory}
                >
                    <Ionicons name="trash-outline" size={22} color={COLORS.primary} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Send message to AI
    const sendMessage = useCallback(
        async (messageText) => {
            const trimmedText = messageText || inputText.trim();
            if (!trimmedText || loading) return;

            setLoading(true);
            const userMessage = {
                id: `user-${Date.now()}`,
                message: trimmedText,
                sender: 'user',
                created_at: new Date().toISOString(),
            };

            // Add user message
            setMessages((prev) => [...prev, userMessage]);
            setInputText('');

            // Update conversation history
            const newHistory = [
                ...conversationHistory,
                { role: 'user', content: trimmedText },
            ];
            setConversationHistory(newHistory);

            try {
                // Get AI response
                const response = await chatbotAPI.sendMessage(trimmedText, newHistory);

                const botMessage = {
                    id: `bot-${Date.now()}`,
                    message: response.reply || response.message,
                    sender: 'bot',
                    created_at: new Date().toISOString(),
                    suggestions: response.suggestions,
                };

                setMessages((prev) => [...prev, botMessage]);

                // Update conversation history with bot response
                setConversationHistory([
                    ...newHistory,
                    { role: 'assistant', content: botMessage.message },
                ]);

                // Scroll to bottom
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 100);
            } catch (error) {
                // Use warn instead of error to prevent Red Screen in Expo Go
                console.warn('Error sending message to chatbot:', error.message);

                const errorMessage = {
                    id: `error-${Date.now()}`,
                    // Show the real error message if it's from our server, otherwise generic
                    message: error.message || 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
                    sender: 'bot',
                    created_at: new Date().toISOString(),
                    isError: true,
                };

                setMessages((prev) => [...prev, errorMessage]);
            } finally {
                setLoading(false);
            }
        },
        [inputText, loading, conversationHistory]
    );

    // Clear conversation history
    const handleClearHistory = useCallback(() => {
        Alert.alert(
            'Xóa lịch sử',
            'Bạn có chắc muốn xóa toàn bộ lịch sử trò chuyện?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await chatbotAPI.clearHistory();
                            setMessages([
                                {
                                    id: 'welcome',
                                    message: 'Lịch sử đã được xóa. Bạn cần tôi giúp gì?',
                                    sender: 'bot',
                                    created_at: new Date().toISOString(),
                                },
                            ]);
                            setConversationHistory([]);
                        } catch (error) {
                            console.error('Error clearing history:', error);
                            Alert.alert('Lỗi', 'Không thể xóa lịch sử');
                        }
                    },
                },
            ]
        );
    }, []);

    // Handle suggested question
    const handleSuggestedQuestion = useCallback((question) => {
        setInputText(question);
        sendMessage(question);
    }, [sendMessage]);

    // Format timestamp
    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Render message item
    const renderMessageItem = ({ item }) => {
        const isUser = item.sender === 'user';

        return (
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessage : styles.botMessage,
                ]}
            >
                {!isUser && (
                    <View style={styles.botIconContainer}>
                        <Ionicons name="sparkles" size={16} color={COLORS.white} />
                    </View>
                )}

                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.botBubble,
                        item.isError && styles.errorBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isUser ? styles.userText : styles.botText,
                        ]}
                    >
                        {item.message}
                    </Text>

                    {item.suggestions && item.suggestions.length > 0 && (
                        <View style={styles.suggestionsContainer}>
                            {item.suggestions.map((suggestion, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.suggestionChip}
                                    onPress={() => handleSuggestedQuestion(suggestion)}
                                >
                                    <Text style={styles.suggestionText}>{suggestion}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    <Text
                        style={[
                            styles.messageTime,
                            isUser ? styles.userTime : styles.botTime,
                        ]}
                    >
                        {formatMessageTime(item.created_at)}
                    </Text>
                </View>
            </View>
        );
    };

    // Render suggested questions
    const renderSuggestedQuestions = () => {
        if (messages.length > 1) return null;

        return (
            <View style={styles.suggestedQuestionsContainer}>
                <Text style={styles.suggestedQuestionsTitle}>
                    Câu hỏi gợi ý:
                </Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.suggestedQuestionsScroll}
                >
                    {suggestedQuestions.map((question, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.suggestedQuestionCard}
                            onPress={() => handleSuggestedQuestion(question)}
                        >
                            <Ionicons name="bulb-outline" size={20} color={COLORS.primary} />
                            <Text style={styles.suggestedQuestionText}>{question}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        );
    };

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
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.messagesList}
                ListHeaderComponent={renderSuggestedQuestions}
            />

            {/* Typing Indicator */}
            {loading && (
                <View style={styles.typingIndicator}>
                    <View style={styles.botIconContainer}>
                        <Ionicons name="sparkles" size={16} color={COLORS.white} />
                    </View>
                    <View style={styles.typingBubble}>
                        <View style={styles.typingDots}>
                            <View style={[styles.typingDot, styles.typingDot1]} />
                            <View style={[styles.typingDot, styles.typingDot2]} />
                            <View style={[styles.typingDot, styles.typingDot3]} />
                        </View>
                    </View>
                </View>
            )}

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    placeholder="Hỏi AI Assistant..."
                    value={inputText}
                    onChangeText={setInputText}
                    multiline
                    maxLength={1000}
                    placeholderTextColor={COLORS.gray}
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[
                        styles.sendButton,
                        (!inputText.trim() || loading) && styles.sendButtonDisabled,
                    ]}
                    onPress={() => sendMessage()}
                    disabled={!inputText.trim() || loading}
                >
                    {loading ? (
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
        backgroundColor: '#F5F7FA',
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.sm,
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.gray,
    },
    clearButton: {
        padding: SPACING.sm,
        marginRight: SPACING.xs,
    },
    messagesList: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
    },
    suggestedQuestionsContainer: {
        marginVertical: SPACING.md,
    },
    suggestedQuestionsTitle: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.gray,
        marginBottom: SPACING.sm,
    },
    suggestedQuestionsScroll: {
        gap: SPACING.sm,
    },
    suggestedQuestionCard: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        marginRight: SPACING.sm,
    },
    suggestedQuestionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.primary,
        fontWeight: '500',
    },
    messageContainer: {
        marginVertical: SPACING.xs,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    userMessage: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
    },
    botMessage: {
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
    },
    botIconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.xs,
    },
    messageBubble: {
        maxWidth: '75%',
        padding: SPACING.md,
        borderRadius: 16,
    },
    userBubble: {
        backgroundColor: COLORS.primary,
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: COLORS.white,
        borderBottomLeftRadius: 4,
    },
    errorBubble: {
        backgroundColor: '#FFEBEE',
    },
    messageText: {
        fontSize: FONT_SIZES.md,
        lineHeight: 20,
    },
    userText: {
        color: COLORS.white,
    },
    botText: {
        color: COLORS.text,
    },
    suggestionsContainer: {
        marginTop: SPACING.sm,
        gap: SPACING.xs,
    },
    suggestionChip: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    suggestionText: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.white,
    },
    messageTime: {
        fontSize: FONT_SIZES.xs,
        marginTop: 4,
    },
    userTime: {
        color: COLORS.white,
        opacity: 0.8,
        textAlign: 'right',
    },
    botTime: {
        color: COLORS.gray,
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingBottom: SPACING.sm,
    },
    typingBubble: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        marginLeft: SPACING.xs,
    },
    typingDots: {
        flexDirection: 'row',
        gap: 4,
    },
    typingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.gray,
    },
    typingDot1: {
        animation: 'typing 1.4s infinite',
    },
    typingDot2: {
        animation: 'typing 1.4s infinite 0.2s',
    },
    typingDot3: {
        animation: 'typing 1.4s infinite 0.4s',
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
    textInput: {
        flex: 1,
        maxHeight: 100,
        backgroundColor: '#F5F7FA',
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

export default AIChatbotScreen;
