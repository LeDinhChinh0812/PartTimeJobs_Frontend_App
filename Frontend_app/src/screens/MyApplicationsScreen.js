/**
 * MyApplicationsScreen
 * Display user's job applications
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { ApplicationCard, EmptyState } from '../components';
import { getMyApplications, withdrawApplication, deleteApplication, chatAPI } from '../services';
import { DEFAULT_PAGE_SIZE } from '../utils/constants';

const MyApplicationsScreen = () => {
    const navigation = useNavigation();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplications = async (page = 1, refresh = false) => {
        try {
            if (page === 1) {
                refresh ? setRefreshing(true) : setLoading(true);
            } else {
                setLoadingMore(true);
            }

            const response = await getMyApplications(page, DEFAULT_PAGE_SIZE);

            if (response.success && response.data) {
                const newApplications = response.data.items || [];

                // DEBUG: Check if employerId exists
                console.log('=== Applications Data ===');
                console.log('Total applications:', newApplications.length);
                if (newApplications.length > 0) {
                    console.log('First application:', JSON.stringify(newApplications[0], null, 2));
                    console.log('Has employerId?', !!newApplications[0].employerId);
                }

                if (page === 1) {
                    setApplications(newApplications);
                } else {
                    setApplications(prev => [...prev, ...newApplications]);
                }

                setHasMore(newApplications.length === DEFAULT_PAGE_SIZE);
                setPageNumber(page);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError(err.message || 'Không thể tải danh sách ứng tuyển');
            if (page === 1) {
                setApplications([]);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
            setLoadingMore(false);
        }
    };

    // Fetch applications when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchApplications(1);
        }, [])
    );

    const handleRefresh = () => {
        fetchApplications(1, true);
    };

    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            fetchApplications(pageNumber + 1);
        }
    };

    const handleWithdraw = async (applicationId) => {
        try {
            const response = await withdrawApplication(applicationId);

            if (response.success) {
                Alert.alert('Thành công', 'Đã rút đơn ứng tuyển');
                // Refresh list
                fetchApplications(1);
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể rút đơn');
            }
        } catch (err) {
            console.error('Error withdrawing application:', err);
            Alert.alert('Lỗi', err.message || 'Không thể rút đơn ứng tuyển');
        }
    };

    const handleApplicationPress = (application) => {
        navigation.navigate('JobDetail', { jobId: application.jobPostId });
    };

    const handleChatWithEmployer = async (application) => {
        try {
            // Debug log
            console.log('=== CHAT BUTTON CLICKED ===');
            console.log('Application data:', {
                id: application.id,
                jobPostId: application.jobPostId,
                jobTitle: application.jobTitle,
                employerId: application.employerId,
                companyName: application.companyName,
                companyId: application.companyId,
                allFields: Object.keys(application)
            });

            let employerId = application.employerId;
            let companyName = application.companyName || 'Nhà tuyển dụng';

            // If no employerId in application, try to get from job detail
            if (!employerId && application.jobPostId) {
                console.log('No employerId in application, fetching job detail...');

                try {
                    const { getJobById } = await import('../services');
                    const jobResponse = await getJobById(application.jobPostId);

                    console.log('Job detail response:', jobResponse);

                    if (jobResponse && jobResponse.data) {
                        employerId = jobResponse.data.employerId;
                        companyName = jobResponse.data.companyName || companyName;

                        console.log('Got employerId from job:', employerId);
                    }
                } catch (jobError) {
                    console.error('Error fetching job detail:', jobError);
                }
            }

            // Check if we have employerId now
            if (!employerId) {
                Alert.alert(
                    'Không thể chat',
                    `Không tìm thấy thông tin nhà tuyển dụng.\n\n` +
                    `Application ID: ${application.id}\n` +
                    `Job ID: ${application.jobPostId}\n` +
                    `Job: ${application.jobTitle}\n\n` +
                    `Vui lòng thử lại sau hoặc liên hệ hỗ trợ.`,
                    [{ text: 'OK' }]
                );
                return;
            }

            console.log('Creating conversation with employer:', employerId);

            // Create or get conversation with employer
            const response = await chatAPI.createConversation(
                employerId,
                `Xin chào, tôi đã ứng tuyển vào vị trí ${application.jobTitle}`
            );

            console.log('Chat API response:', response);

            if (response && response.conversation) {
                console.log('Navigating to ChatRoom...');

                // Navigate to ChatRoom
                navigation.navigate('Chat', {
                    screen: 'ChatRoom',
                    params: {
                        conversationId: response.conversation.id,
                        participantName: companyName,
                        participantAvatar: null,
                    }
                });
            } else {
                Alert.alert('Lỗi', 'Không thể tạo cuộc trò chuyện');
            }
        } catch (error) {
            console.error('Error in handleChatWithEmployer:', error);
            Alert.alert(
                'Lỗi',
                `Không thể mở chat.\n\nChi tiết: ${error.message}\n\nVui lòng thử lại.`
            );
        }
    };

    const handleDeleteApplication = async (applicationId) => {
        try {
            const response = await deleteApplication(applicationId);

            if (response.success) {
                Alert.alert('Thành công', 'Đã xóa đơn ứng tuyển');
                // Refresh list
                fetchApplications(1);
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể xóa đơn');
            }
        } catch (err) {
            console.error('Error deleting application:', err);
            Alert.alert('Lỗi', err.message || 'Không thể xóa đơn ứng tuyển');
        }
    };

    const handleReapply = (application) => {
        // Navigate to job detail to apply again
        navigation.navigate('JobDetail', {
            jobId: application.jobPostId,
            reapply: true  // Flag to show application form
        });
    };

    const renderApplicationCard = ({ item }) => {
        const isWithdrawn = item.statusName === 'Withdrawn' || item.statusName === 'Đã rút';
        const isPending = item.statusName === 'Pending' || item.statusName === 'Đang chờ';

        // Feature flags - enable when backend ready
        const DELETE_ENABLED = false; // TODO: Set true khi backend có DELETE endpoint
        const REAPPLY_ENABLED = true;

        return (
            <ApplicationCard
                application={item}
                onPress={() => handleApplicationPress(item)}
                onWithdraw={handleWithdraw}
                onChat={handleChatWithEmployer}
                onDelete={handleDeleteApplication}
                onReapply={handleReapply}
                showWithdraw={isPending}
                showChat={true}
                showDelete={isWithdrawn && DELETE_ENABLED}  // Tạm tắt
                showReapply={isWithdrawn && REAPPLY_ENABLED}
            />
        );
    };

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.accentOrange} />
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.accentOrange} />
            </View>
        );
    }

    if (error && applications.length === 0) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <Text style={styles.title}>Đơn ứng tuyển</Text>
                </View>
                <EmptyState
                    icon="alert-circle-outline"
                    title="Có lỗi xảy ra"
                    description={error}
                    actionText="Thử lại"
                    onAction={() => fetchApplications(1)}
                />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <Text style={styles.title}>Đơn ứng tuyển</Text>
                <Text style={styles.subtitle}>
                    {applications.length} đơn ứng tuyển
                </Text>
            </View>

            <FlatList
                data={applications}
                renderItem={renderApplicationCard}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={[
                    styles.listContent,
                    applications.length === 0 && styles.emptyList
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
                    <EmptyState
                        icon="document-text-outline"
                        title="Chưa có đơn ứng tuyển"
                        description="Bạn chưa ứng tuyển công việc nào. Hãy tìm và ứng tuyển công việc phù hợp!"
                        actionText="Tìm việc làm"
                        onAction={() => navigation.navigate('Jobs')}
                    />
                }
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
    listContent: {
        padding: SPACING.lg,
    },
    emptyList: {
        flex: 1,
    },
    footerLoader: {
        paddingVertical: SPACING.md,
        alignItems: 'center',
    },
});

export default MyApplicationsScreen;
