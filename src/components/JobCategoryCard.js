/**
 * JobCategoryCard Component
 * Card displaying job category with count
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const JobCategoryCard = ({
    title,
    count,
    backgroundColor,
    icon = 'briefcase',
    onPress
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, { backgroundColor }]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                <Feather name={icon} size={32} color={COLORS.primary} />
            </View>

            <Text style={styles.count}>{count}</Text>
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 140,
        height: 160,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        justifyContent: 'space-between',
        marginRight: SPACING.sm,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    count: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
    title: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
    },
});

export default JobCategoryCard;
