/**
 * MyApplicationsScreen
 * Hiển thị các đơn ứng tuyển của người dùng
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
import { DEFAULT_PAGE_SIZE, STATUS_MAPPING } from '../utils/constants';

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

                // DEBUG: Kiểm tra xem employerId có tồn tại không
                console.log('=== Applications Data ===');
                console.log('Total applications:', newApplications.length);
                if (newApplications.length > 0) {
                    console.log('First application:', JSON.stringify(newApplications[0], null, 2));
                    console.log('Has employerId?', !!newApplications[0].employerId);
                }

                // Logic loại bỏ mục mới trùng lặp nội bộ trước
                const uniqueNewApps = newApplications.filter((item, index, self) =>
                    index === self.findIndex((t) => String(t.id) === String(item.id))
                );

                // Thêm key duy nhất cho mỗi mục để tránh vấn đề trùng lặp key
                const timestamp = Date.now();
                const appsWithUniqueKeys = uniqueNewApps.map((item, idx) => ({
                    ...item,
                    _uniqueKey: `${item.id}_${item.jobPostId || 'nojob'}_${page}_${idx}_${timestamp}`
                }));

                if (page === 1) {
                    setApplications(appsWithUniqueKeys);
                } else {
                    setApplications(prev => {
                        const existingIds = new Set(prev.map(item => String(item.id)));
                        const newItems = appsWithUniqueKeys.filter(item => !existingIds.has(String(item.id)));
                        return [...prev, ...newItems];
                    });
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

    // Tải đơn ứng tuyển khi màn hình được focus
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
            // Ghi log debug
            console.log('=== CHAT BUTTON CLICKED ===');
            console.log('Application raw data:', JSON.stringify(application, null, 2));

            let employerId = application.employerId ||
                application.recruiterId ||
                application.employer_id ||
                application.recruiter_id ||
                application.job?.employerId ||
                application.employer?.id ||
                application.company?.employerId;

            let companyName = application.employerName ||
                application.employer_name ||
                application.companyName ||
                application.company_name ||
                application.job?.employerName ||
                application.job?.companyName ||
                application.employer?.fullName ||
                'Nhà tuyển dụng';

            // Kiểm tra xem đã có employerId chưa
            if (!employerId) {
                console.log('Debugging missing employerId. Application structure:', JSON.stringify(application, null, 2));
                Alert.alert(
                    'Không thể chat',
                    `Thông tin nhà tuyển dụng đang được cập nhật. Vui lòng quay lại sau ít phút.\n(Job ID: ${application.jobPostId || 'N/A'})`
                );
                return;
            }

            console.log('Creating conversation with employer:', employerId);

            // Tạo hoặc lấy cuộc trò chuyện với nhà tuyển dụng
            // Lưu ý: API yêu cầu ID dạng số nguyên
            const recipientId = parseInt(employerId, 10);
            const jobPostId = application.jobPostId ? parseInt(application.jobPostId, 10) : null;

            const response = await chatAPI.createConversation(recipientId, jobPostId);

            console.log('Chat API response:', response);

            if (response && (response.id || response.conversationId || response.conversation)) {
                console.log('Navigating to ChatRoom...');
                const conversationId = response.id || response.conversationId || response.conversation?.id;

                // Điều hướng đến phòng chat
                navigation.navigate('Chat', {
                    screen: 'ChatRoom',
                    params: {
                        conversationId: conversationId,
                        participantName: companyName,
                        participantAvatar: null,
                        jobPostId: application.jobPostId,
                        jobTitle: application.jobTitle,
                    }
                });
            } else {
                console.error('Invalid response format:', response);
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
        // Điều hướng đến chi tiết công việc để ứng tuyển lại
        navigation.navigate('JobDetail', {
            jobId: application.jobPostId,
            reapply: true  // Cờ để hiển thị form ứng tuyển
        });
    };

    const renderApplicationCard = ({ item }) => {
        // Sử dụng statusId cho logic nếu có
        const statusId = item.statusId;

        let isWithdrawn, isPending;

        if (statusId) {
            // 8 = Withdrawn
            isWithdrawn = statusId === 8;
            // 1 = Pending, 2 = Reviewing
            isPending = statusId === 1 || statusId === 2;
        } else {
            // Fallback sang logic dựa trên tên (Cũ/An toàn)
            isWithdrawn = item.statusName === 'Withdrawn' || item.statusName === 'Đã rút';
            isPending = item.statusName === 'Pending' ||
                item.statusName === 'Reviewing' ||
                item.statusName === 'Đang chờ' ||
                item.statusName === 'Đang xem xét' ||
                item.statusName === 'Processing' ||
                item.statusName === 'Đang xử lý';
        }

        // Cờ tính năng - bật khi backend sẵn sàng
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
                keyExtractor={(item) => item._uniqueKey || `fallback_${item.id}_${Date.now()}`}
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
