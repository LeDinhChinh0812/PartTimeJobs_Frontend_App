/**
 * EmptyState Component
 * Displays when there's no data to show
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const EmptyState = ({
    icon = 'folder-open-outline',
    title = 'Không có dữ liệu',
    description = '',
    actionText = '',
    onAction = null
}) => {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={80} color={COLORS.gray300} />
            <Text style={styles.title}>{title}</Text>
            {description ? (
                <Text style={styles.description}>{description}</Text>
            ) : null}
            {actionText && onAction ? (
                <TouchableOpacity style={styles.button} onPress={onAction}>
                    <Text style={styles.buttonText}>{actionText}</Text>
                </TouchableOpacity>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING['2xl'],
    },
    title: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginTop: SPACING.lg,
        textAlign: 'center',
    },
    description: {
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginTop: SPACING.sm,
        textAlign: 'center',
        lineHeight: 22,
    },
    button: {
        marginTop: SPACING.lg,
        backgroundColor: COLORS.accentOrange,
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.md,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.white,
    },
});

export default EmptyState;
