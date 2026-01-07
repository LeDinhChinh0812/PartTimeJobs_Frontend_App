import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

/**
 * Component ChatInput
 * Component nhập liệu tái sử dụng cho giao diện chat
 */
const ChatInput = ({
    value,
    onChangeText,
    onSend,
    onAttach,
    placeholder = 'Nhập tin nhắn...',
    maxLength = 1000,
    sending = false,
    disabled = false,
    showAttachButton = true,
}) => {
    const [inputHeight, setInputHeight] = useState(40);

    const handleSend = () => {
        if (value.trim() && !sending && !disabled) {
            onSend();
        }
    };

    const handleContentSizeChange = (event) => {
        const height = event.nativeEvent.contentSize.height;
        setInputHeight(Math.min(Math.max(40, height), 100));
    };

    return (
        <View style={styles.container}>
            {showAttachButton && (
                <TouchableOpacity
                    style={styles.attachButton}
                    onPress={onAttach}
                    disabled={disabled || sending}
                >
                    <Ionicons
                        name="add-circle-outline"
                        size={28}
                        color={disabled ? COLORS.gray : COLORS.primary}
                    />
                </TouchableOpacity>
            )}

            <TextInput
                style={[
                    styles.textInput,
                    { height: inputHeight },
                    disabled && styles.textInputDisabled,
                ]}
                placeholder={placeholder}
                value={value}
                onChangeText={onChangeText}
                multiline
                maxLength={maxLength}
                placeholderTextColor={COLORS.gray}
                editable={!disabled && !sending}
                onContentSizeChange={handleContentSizeChange}
                returnKeyType={Platform.OS === 'ios' ? 'default' : 'send'}
                blurOnSubmit={false}
            />

            <TouchableOpacity
                style={[
                    styles.sendButton,
                    (!value.trim() || sending || disabled) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!value.trim() || sending || disabled}
            >
                {sending ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                    <Ionicons name="send" size={20} color={COLORS.white} />
                )}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
        minHeight: 40,
        maxHeight: 100,
        backgroundColor: COLORS.background || '#F5F7FA',
        borderRadius: 20,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        textAlignVertical: 'center',
    },
    textInputDisabled: {
        backgroundColor: COLORS.lightGray,
        color: COLORS.gray,
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

export default ChatInput;
