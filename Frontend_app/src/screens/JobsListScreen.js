/**
 * JobsListScreen Component
 * Browse, search and filter jobs with real API integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { JobCard, SearchBar, FilterModal, EmptyState } from '../components';
import { searchJobs, getAllJobs } from '../services';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

const JobsListScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [filters, setFilters] = useState({
        keyword: '',
        location: '',
        salaryMin: '',
        salaryMax: '',
        workType: '',
        category: route.params?.filter || '',
    });

    // Debounce search
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchJobs = async (page = 1, refresh = false) => {
        try {
            if (page === 1) {
                refresh ? setRefreshing(true) : setLoading(true);
            } else {
                setLoadingMore(true);
            }

            // Build search params
            const hasFilters =
                debouncedSearch ||
                filters.keyword ||
                filters.location ||
                filters.salaryMin ||
                filters.salaryMax ||
                filters.workType ||
                filters.category;

            let response;

            if (hasFilters) {
                // Use search API with correct parameter names
                const searchParams = {
                    SearchTerm: debouncedSearch || filters.keyword || undefined,
                    PageNumber: page,
                    PageSize: DEFAULT_PAGE_SIZE,
                    SortBy: undefined, // Optional: CreatedDate, Salary, etc.
                    SortDescending: false, // Optional: true/false
                };

                // Remove undefined values to avoid sending them to backend
                Object.keys(searchParams).forEach(key =>
                    searchParams[key] === undefined && delete searchParams[key]
                );

                response = await searchJobs(searchParams);
            } else {
                // Use getAll API
                response = await getAllJobs(page, DEFAULT_PAGE_SIZE);
            }

            if (response.success && response.data) {
                const newJobs = response.data.items || [];

                if (page === 1) {
                    setJobs(newJobs);
                } else {
                    setJobs(prev => [...prev, ...newJobs]);
                }

                setHasMore(newJobs.length === DEFAULT_PAGE_SIZE);
                setPageNumber(page);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError(err.message || 'Không thể tải danh sách việc làm');
            if (page === 1) {
                setJobs([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    // Fetch jobs when filters or search changes
    useEffect(() => {
        fetchJobs(1);
    }, [debouncedSearch, filters]);

    // Refresh when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchJobs(1);
        }, [])
    );

    const handleRefresh = () => {
        fetchJobs(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchJobs(pageNumber + 1);
        }
    };

    const handleJobPress = (job) => {
        navigation.navigate('JobDetail', { jobId: job.id });
    };

    const handleFilterPress = () => {
        setShowFilterModal(true);
    };

    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
        setPageNumber(1);
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.accentOrange} />
            </View>
        );
    };

    const renderJobCard = ({ item }) => (
        <JobCard
            job={item}
            onPress={() => handleJobPress(item)}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Tìm việc làm</Text>
                <Text style={styles.subtitle}>
                    {jobs.length} công việc
                </Text>
            </View>

            <View style={styles.content}>
                {/* Search Bar */}
                <SearchBar
                    placeholder="Tìm kiếm công việc..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    showFilter={true}
                    onFilter={handleFilterPress}
                />

                {/* Active Filters */}
                {(searchQuery || filters.category || filters.location || filters.workType || filters.salaryMin || filters.salaryMax) && (
                    <View style={styles.activeFilters}>
                        <View style={styles.filterHeader}>
                            <View style={styles.filterHeaderLeft}>
                                <Ionicons name="funnel" size={14} color={COLORS.accentOrange} />
                                <Text style={styles.activeFiltersLabel}>Đang áp dụng:</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setSearchQuery('');
                                    setFilters({
                                        keyword: '',
                                        location: '',
                                        salaryMin: '',
                                        salaryMax: '',
                                        workType: '',
                                        category: '',
                                    });
                                }}
                            >
                                <Text style={styles.clearAllText}>Xóa tất cả</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.filterChips}>
                            {searchQuery && (
                                <View style={styles.filterChip}>
                                    <Ionicons name="search" size={14} color={COLORS.accentOrange} />
                                    <Text style={styles.filterChipText} numberOfLines={1}>{searchQuery}</Text>
                                    <TouchableOpacity onPress={() => setSearchQuery('')}>
                                        <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {filters.category && (
                                <View style={styles.filterChip}>
                                    <Ionicons name="briefcase" size={14} color={COLORS.accentOrange} />
                                    <Text style={styles.filterChipText} numberOfLines={1}>{filters.category}</Text>
                                    <TouchableOpacity onPress={() => setFilters({ ...filters, category: '' })}>
                                        <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {filters.location && (
                                <View style={styles.filterChip}>
                                    <Ionicons name="location" size={14} color={COLORS.accentOrange} />
                                    <Text style={styles.filterChipText} numberOfLines={1}>{filters.location}</Text>
                                    <TouchableOpacity onPress={() => setFilters({ ...filters, location: '' })}>
                                        <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {filters.workType && (
                                <View style={styles.filterChip}>
                                    <Ionicons name="time" size={14} color={COLORS.accentOrange} />
                                    <Text style={styles.filterChipText} numberOfLines={1}>{filters.workType}</Text>
                                    <TouchableOpacity onPress={() => setFilters({ ...filters, workType: '' })}>
                                        <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                            {(filters.salaryMin || filters.salaryMax) && (
                                <View style={styles.filterChip}>
                                    <Ionicons name="cash" size={14} color={COLORS.accentOrange} />
                                    <Text style={styles.filterChipText} numberOfLines={1}>
                                        {filters.salaryMin && filters.salaryMax
                                            ? `${filters.salaryMin}tr - ${filters.salaryMax}tr`
                                            : filters.salaryMin
                                                ? `Từ ${filters.salaryMin}tr`
                                                : `Đến ${filters.salaryMax}tr`}
                                    </Text>
                                    <TouchableOpacity onPress={() => setFilters({ ...filters, salaryMin: '', salaryMax: '' })}>
                                        <Ionicons name="close-circle" size={16} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                )}



                {/* Jobs List */}
                <FlatList
                    data={jobs}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderJobCard}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.listContent,
                        jobs.length === 0 && styles.emptyList
                    ]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            colors={[COLORS.accentOrange]}
                            tintColor={COLORS.accentOrange}
                        />
                    }
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={renderFooter}
                    ListEmptyComponent={
                        loading ? (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.accentOrange} />
                                <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
                            </View>
                        ) : error ? (
                            <EmptyState
                                icon="alert-circle-outline"
                                title="Có lỗi xảy ra"
                                description={error}
                                actionText="Thử lại"
                                onAction={() => fetchJobs(1)}
                            />
                        ) : (
                            <EmptyState
                                icon="search-outline"
                                title="Không tìm thấy công việc"
                                description={
                                    debouncedSearch || filters.keyword
                                        ? 'Không có công việc phù hợp với tìm kiếm của bạn'
                                        : 'Chưa có công việc nào được đăng tuyển'
                                }
                            />
                        )
                    }
                />
            </View>

            {/* Filter Modal */}
            <FilterModal
                visible={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                onApply={handleApplyFilters}
                initialFilters={filters}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.screenBackground,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.screenBackground,
    },
    header: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    title: {
        fontSize: TYPOGRAPHY.size['2xl'],
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
    },
    subtitle: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    activeFiltersContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 8,
        marginTop: SPACING.sm,
    },
    activeFiltersText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        marginLeft: SPACING.xs,
        flex: 1,
    },
    clearFiltersText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.accentOrange,
    },
    activeFilters: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: '#F5F7FA',
        marginTop: SPACING.sm,
        borderRadius: 12,
    },
    filterHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs,
    },
    filterHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    activeFiltersLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textPrimary,
    },
    filterChips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.xs,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderRadius: 20,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        gap: 4,
        borderWidth: 1,
        borderColor: '#FFE0B2',
    },
    filterChipText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textPrimary,
        maxWidth: 120,
    },
    clearAllText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.accentOrange,
    },
    listContent: {
        paddingTop: SPACING.md,
        paddingBottom: SPACING.xl,
    },
    emptyList: {
        flex: 1,
    },
    footerLoader: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    loadingText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
    },
});

export default JobsListScreen;
