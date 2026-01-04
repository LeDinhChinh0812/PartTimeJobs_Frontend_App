import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

/**
 * Message Bubble Component
 * Reusable component for displaying chat messages
 */
const MessageBubble = ({
    message,
    isCurrentUser = false,
    timestamp,
    isRead = false,
    isSending = false,
    onLongPress,
}) => {
    const formatTime = (time) => {
        const date = new Date(time);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <TouchableOpacity
            onLongPress={onLongPress}
            activeOpacity={0.8}
            style={[
                styles.container,
                isCurrentUser ? styles.currentUserContainer : styles.otherUserContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble,
                ]}
            >
                <Text
                    style={[
                        styles.messageText,
                        isCurrentUser ? styles.currentUserText : styles.otherUserText,
                    ]}
                >
                    {message}
                </Text>

                <View style={styles.footer}>
                    <Text
                        style={[
                            styles.time,
                            isCurrentUser ? styles.currentUserTime : styles.otherUserTime,
                        ]}
                    >
                        {formatTime(timestamp)}
                    </Text>

                    {isCurrentUser && (
                        <Ionicons
                            name={
                                isSending
                                    ? 'time-outline'
                                    : isRead
                                        ? 'checkmark-done'
                                        : 'checkmark'
                            }
                            size={14}
                            color={isRead ? COLORS.primary : COLORS.white}
                            style={styles.readIcon}
                        />
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: SPACING.xs,
        maxWidth: '75%',
    },
    currentUserContainer: {
        alignSelf: 'flex-end',
    },
    otherUserContainer: {
        alignSelf: 'flex-start',
    },
    bubble: {
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
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        justifyContent: 'flex-end',
    },
    time: {
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
});

export default MessageBubble;
