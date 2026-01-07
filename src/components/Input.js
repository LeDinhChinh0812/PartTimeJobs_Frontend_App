/**
 * Component Input tùy chỉnh
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const Input = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    error,
    autoCapitalize = 'none',
    keyboardType = 'default',
    autoComplete = 'off',
    editable = true,
    style,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isSecureField = secureTextEntry;

    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputWrapper,
                    isFocused && styles.inputFocused,
                    error && styles.inputError,
                ]}
            >
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray400}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={isSecureField && !showPassword}
                    autoCapitalize={autoCapitalize}
                    keyboardType={keyboardType}
                    autoComplete={autoComplete}
                    editable={editable}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {isSecureField && (
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <Feather
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={COLORS.gray400}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.xl,
    },
    label: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        borderRadius: RADIUS.lg,
        paddingHorizontal: SPACING.lg,
    },
    input: {
        flex: 1,
        paddingVertical: SPACING.md,
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textPrimary,
    },
    inputFocused: {
        backgroundColor: COLORS.white,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    iconButton: {
        padding: SPACING.xs,
    },
    errorText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.error,
        marginTop: SPACING.sm,
    },
});

export default Input;
