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

// Popular categories
const POPULAR_CATEGORIES = [
    { id: 1, name: 'Graphics & Design', count: '257 vị trí', icon: 'color-palette-outline', type: 'Design', iconColor: '#3B82F6', bgColor: '#EFF6FF' },
    { id: 2, name: 'Code & Programing', count: '212 vị trí', icon: 'code-slash-outline', type: 'IT', iconColor: '#6366F1', bgColor: '#EEF2FF' },
    { id: 3, name: 'Digital Marketing', count: '250 vị trí', icon: 'megaphone-outline', type: 'Marketing', iconColor: '#F59E0B', bgColor: '#FFFBEB' },
    { id: 4, name: 'Video & Animation', count: '247 vị trí', icon: 'videocam-outline', type: 'Multimedia', iconColor: '#EF4444', bgColor: '#FEF2F2' },
    { id: 5, name: 'Music & Audio', count: '304 vị trí', icon: 'musical-notes-outline', type: 'Music', iconColor: '#10B981', bgColor: '#ECFDF5' },
    { id: 6, name: 'Account & Finance', count: '107 vị trí', icon: 'calculator-outline', type: 'Finance', iconColor: '#8B5CF6', bgColor: '#F5F3FF' },
    { id: 7, name: 'Health & Care', count: '125 vị trí', icon: 'medkit-outline', type: 'Health', iconColor: '#EC4899', bgColor: '#FDF2F8' },
    { id: 8, name: 'Data & Science', count: '57 vị trí', icon: 'server-outline', type: 'Data', iconColor: '#14B8A6', bgColor: '#F0FDFA' },
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
            // Instead of showing error, silently fail with empty data
            setJobs([]);
            setError(null); // Don't show error to user
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
            params: { filter: category.type }
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

                {/* Popular Categories Section */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Danh mục phổ biến</Text>
                        <TouchableOpacity onPress={handleSeeAllJobs}>
                            <Text style={styles.seeAllText}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.categoriesGrid}>
                        {POPULAR_CATEGORIES.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={styles.categoryCard}
                                onPress={() => handleCategoryPress(category)}
                            >
                                <View style={[styles.categoryIcon, { backgroundColor: category.bgColor }]}>
                                    <Ionicons name={category.icon} size={24} color={category.iconColor} />
                                </View>
                                <Text style={styles.categoryName} numberOfLines={2}>{category.name}</Text>
                                <Text style={styles.categoryCount}>{category.count}</Text>
                            </TouchableOpacity>
                        ))}
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
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    categoryCard: {
        width: '47%', // 2 columns with gap
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.xs,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
        borderWidth: 1,
        borderColor: COLORS.gray100,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    categoryName: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: 4,
        height: 44, // Fixed height for 2 lines
    },
    categoryCount: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    loadingContainer: {
        paddingVertical: SPACING['2xl'],
        alignItems: 'center',
    },
});

export default HomeScreen;
