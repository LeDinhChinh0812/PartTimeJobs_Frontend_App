/**
 * Custom Button Component
 */

import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ActivityIndicator,
    View,
} from 'react-native';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

export const Button = ({
    variant = 'primary',
    children,
    onPress,
    loading = false,
    disabled = false,
    icon = null,
    style,
    textStyle,
}) => {
    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.btnPrimary;
            case 'secondary':
                return styles.btnSecondary;
            case 'google':
                return styles.btnGoogle;
            default:
                return styles.btnPrimary;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.textPrimary;
            case 'secondary':
                return styles.textSecondary;
            case 'google':
                return styles.textGoogle;
            default:
                return styles.textPrimary;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.btn,
                getButtonStyle(),
                (disabled || loading) && styles.btnDisabled,
                style,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator
                    color={variant === 'primary' ? COLORS.white : COLORS.primary}
                />
            ) : (
                <View style={styles.btnContent}>
                    {icon && <View style={styles.iconContainer}>{icon}</View>}
                    <Text style={[getTextStyle(), textStyle]}>{children}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING['2xl'],
        borderRadius: RADIUS.lg,
        minHeight: 48,
    },
    btnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    btnPrimary: {
        backgroundColor: COLORS.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    btnSecondary: {
        backgroundColor: COLORS.accentPurpleLight,
        borderWidth: 1,
        borderColor: COLORS.accentPurple,
    },
    btnGoogle: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    textPrimary: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
    textSecondary: {
        color: COLORS.primary,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
    textGoogle: {
        color: COLORS.textPrimary,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
});

export default Button;
