/**
 * HomeScreen Component
 * Main dashboard with job categories and recommended jobs
 */

import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context';
import { JobCategoryCard, JobCard, SearchBar, EmptyState } from '../components';
import { getAllJobs } from '../services';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

// Job categories
const JOB_CATEGORIES = [
    { id: 1, name: 'IT & Software', value: 'IT', count: 120, backgroundColor: '#E3F2FD', icon: 'code-slash' },
    { id: 2, name: 'Marketing', value: 'Marketing', count: 85, backgroundColor: '#FCE4EC', icon: 'megaphone' },
    { id: 3, name: 'Design', value: 'Design', count: 65, backgroundColor: '#F3E5F5', icon: 'color-palette' },
    { id: 4, name: 'Sales', value: 'Sales', count: 95, backgroundColor: '#E8F5E9', icon: 'trending-up' },
];

const HomeScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchJobs = async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true);

            const response = await getAllJobs(1, 6); // Get first 6 jobs

            if (response.success && response.data) {
                setJobs(response.data.items || []);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError(err.message || 'Không thể tải danh sách việc làm');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchJobs();
        }, [])
    );

    const handleRefresh = () => {
        fetchJobs(true);
    };

    const handleSearch = () => {
        if (searchQuery.trim()) {
            navigation.navigate('Jobs', {
                screen: 'JobsList',
                params: { searchQuery: searchQuery.trim() }
            });
        }
    };

    const handleCategoryPress = (category) => {
        navigation.navigate('Jobs', {
            screen: 'JobsList',
            params: { filter: category.value || category.type }
        });
    };

    const handleJobPress = (job) => {
        navigation.navigate('JobDetail', { jobId: job.id });
    };

    const handleSeeAllJobs = () => {
        navigation.navigate('Jobs');
    };

    // Get recommended/featured jobs (first 3)
    const recommendedJobs = jobs.slice(0, 3);

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.accentOrange]}
                        tintColor={COLORS.accentOrange}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>Xin chào</Text>
                        <Text style={styles.userName}>{user?.fullName || 'Bạn'}</Text>
                    </View>

                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View style={styles.searchSection}>
                    <SearchBar
                        placeholder="Tìm kiếm công việc..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        showFilter={true}
                        onFilter={() => navigation.navigate('Jobs')}
                        onSubmitEditing={handleSearch}
                    />
                </View>

                {/* Find Your Job Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Find Your Job</Text>

                    <View style={styles.jobTypesGrid}>
                        {/* Remote Job Card */}
                        <TouchableOpacity
                            style={[styles.jobTypeCard, { backgroundColor: '#B3E5FC' }]}
                            onPress={() => navigation.navigate('Jobs', { filter: 'Remote' })}
                        >
                            <Ionicons name="laptop-outline" size={32} color={COLORS.textPrimary} />
                            <Text style={styles.jobTypeCount}>44.5k</Text>
                            <Text style={styles.jobTypeLabel}>Remote Job</Text>
                        </TouchableOpacity>

                        <View style={styles.jobTypeColumn}>
                            {/* Full Time Card */}
                            <TouchableOpacity
                                style={[styles.jobTypeCardSmall, { backgroundColor: '#D1C4E9' }]}
                                onPress={() => navigation.navigate('Jobs', { filter: 'FullTime' })}
                            >
                                <Text style={styles.jobTypeCount}>66.8k</Text>
                                <Text style={styles.jobTypeLabel}>Full Time</Text>
                            </TouchableOpacity>

                            {/* Part Time Card */}
                            <TouchableOpacity
                                style={[styles.jobTypeCardSmall, { backgroundColor: '#FFE0B2' }]}
                                onPress={() => navigation.navigate('Jobs', { filter: 'PartTime' })}
                            >
                                <Text style={styles.jobTypeCount}>38.9k</Text>
                                <Text style={styles.jobTypeLabel}>Part Time</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Recommended Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Việc làm đề xuất</Text>
                        <TouchableOpacity onPress={handleSeeAllJobs}>
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && !refreshing ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.accentOrange} />
                        </View>
                    ) : error ? (
                        <EmptyState
                            icon="alert-circle-outline"
                            title="Có lỗi xảy ra"
                            description={error}
                            actionText="Thử lại"
                            onAction={() => fetchJobs()}
                        />
                    ) : recommendedJobs.length > 0 ? (
                        recommendedJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onPress={() => handleJobPress(job)}
                            />
                        ))
                    ) : (
                        <EmptyState
                            icon="briefcase-outline"
                            title="Chưa có việc làm"
                            description="Hiện chưa có việc làm nào được đăng tuyển"
                        />
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.screenBackground,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
    },
    greeting: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textSecondary,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
    },
    userName: {
        fontSize: TYPOGRAPHY.size['2xl'],
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginTop: SPACING.xs / 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.accentOrange,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.white,
    },
    searchSection: {
        paddingHorizontal: SPACING.lg,
    },
    section: {
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
    },
    seeAllText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.accentOrange,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        fontWeight: TYPOGRAPHY.weight.medium,
    },
    categoriesScroll: {
        marginTop: SPACING.md,
        marginLeft: -SPACING.lg,
        paddingLeft: SPACING.lg,
    },
    jobTypesGrid: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.md,
    },
    jobTypeCard: {
        flex: 1,
        aspectRatio: 0.8,
        borderRadius: 16,
        padding: SPACING.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobTypeColumn: {
        flex: 1,
        gap: SPACING.md,
    },
    jobTypeCardSmall: {
        flex: 1,
        borderRadius: 16,
        padding: SPACING.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    jobTypeCount: {
        fontSize: TYPOGRAPHY.size['2xl'],
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
        marginTop: SPACING.sm,
    },
    jobTypeLabel: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textPrimary,
        marginTop: 4,
    },
    loadingContainer: {
        paddingVertical: SPACING['2xl'],
        alignItems: 'center',
    },
});

export default HomeScreen;
