/**
 * JobCard Component
 * Card displaying job listing information
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const JobCard = ({ job, onPress, onBookmark }) => {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.9}
        >
            {/* Company Logo */}
            <View style={styles.header}>
                <Image
                    source={{ uri: job.companyLogo }}
                    style={styles.logo}
                    defaultSource={require('../../assets/icon.png')}
                />

                <TouchableOpacity
                    style={styles.bookmarkButton}
                    onPress={() => onBookmark?.(job.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather
                        name={job.isSaved ? 'bookmark' : 'bookmark'}
                        size={20}
                        color={job.isSaved ? COLORS.primary : COLORS.gray400}
                        fill={job.isSaved ? COLORS.primary : 'transparent'}
                    />
                </TouchableOpacity>
            </View>

            {/* Job Info */}
            <Text style={styles.title} numberOfLines={1}>
                {job.title}
            </Text>

            <View style={styles.infoRow}>
                <Text style={styles.company} numberOfLines={1}>
                    {job.company}
                </Text>
                <View style={styles.dot} />
                <Text style={styles.location} numberOfLines={1}>
                    {job.location}
                </Text>
                <View style={styles.dot} />
                <Text style={styles.time}>{job.postedTime}</Text>
            </View>

            {/* Job Type Badge */}
            <View style={styles.footer}>
                <View style={[styles.badge, getBadgeColor(job.jobType)]}>
                    <Text style={styles.badgeText}>{job.jobType}</Text>
                </View>

                {job.salary && (
                    <Text style={styles.salary}>{job.salary}</Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const getBadgeColor = (jobType) => {
    switch (jobType) {
        case 'Remote':
            return { backgroundColor: COLORS.jobCategoryCyan };
        case 'Full-Time':
            return { backgroundColor: COLORS.jobCategoryPurple };
        case 'Part-Time':
            return { backgroundColor: COLORS.jobCategoryPeach };
        default:
            return { backgroundColor: COLORS.gray200 };
    }
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.cardBackground,
        borderRadius: RADIUS.lg,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,

        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,

        // Shadow for Android
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.gray100,
    },
    bookmarkButton: {
        padding: SPACING.xs,
    },
    title: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.semibold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
        flexWrap: 'wrap',
    },
    company: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        maxWidth: '30%',
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.gray400,
        marginHorizontal: SPACING.xs,
    },
    location: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        maxWidth: '30%',
    },
    time: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs / 2,
        borderRadius: RADIUS.sm,
    },
    badgeText: {
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: TYPOGRAPHY.weight.medium,
        color: COLORS.primary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
    },
    salary: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.accentOrange,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
    },
});

export default JobCard;
