/**
 * Component Chi tiết việc làm
 * Thông tin chi tiết công việc với chức năng ứng tuyển
 */

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, EmptyState } from '../components';
import { getJobById, getMyApplications, chatAPI, withdrawApplication } from '../services'; // Đã thêm chatAPI, withdrawApplication
import { formatSalary, formatDate, formatTimeRange, formatDaysOfWeek } from '../utils/formatters';
import { useAuth } from '../context'; // Đã thêm useAuth
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const JobDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { user } = useAuth(); // Lấy người dùng hiện tại
    const { jobId } = route.params;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [hasApplied, setHasApplied] = useState(false);
    const [checkingApplication, setCheckingApplication] = useState(true);
    const [chatLoading, setChatLoading] = useState(false); // State mới cho loading chat
    const [appliedApplication, setAppliedApplication] = useState(null); // Lưu đối tượng đơn ứng tuyển thực tế
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        fetchJobDetail();
        checkIfApplied();
    }, [jobId]);

    const fetchJobDetail = async () => {
        try {
            setLoading(true);
            const response = await getJobById(jobId);

            if (response.success && response.data) {
                setJob(response.data);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching job detail:', err);
            setError(err.message || 'Không thể tải thông tin công việc');
        } finally {
            setLoading(false);
        }
    };

    const checkIfApplied = async () => {
        try {
            setCheckingApplication(true);
            const response = await getMyApplications(1, 100); // Lấy tất cả đơn ứng tuyển

            if (response.success && response.data) {
                const application = response.data.items?.find(app => app.jobPostId === jobId);

                // Sửa lỗi nhất quán: Đơn đã rút không nên tính là "Đã ứng tuyển"
                const isWithdrawn = application?.statusName === 'Withdrawn' || application?.statusName === 'Đã rút';

                setAppliedApplication(application || null);
                setHasApplied(!!application && !isWithdrawn);
            }
        } catch (err) {
            console.error('Error checking applications:', err);
        } finally {
            setCheckingApplication(false);
        }
    };

    const handleApply = () => {
        if (hasApplied) {
            Alert.alert('Đã ứng tuyển', 'Bạn đã ứng tuyển vào vị trí này rồi!');
            return;
        }

        if (job.applicationDeadline) {
            const deadline = new Date(job.applicationDeadline);
            if (deadline < new Date()) {
                Alert.alert('Hết hạn', 'Công việc này đã hết hạn ứng tuyển');
                return;
            }
        }

        navigation.navigate('ApplyJob', {
            jobId: job.id,
            jobTitle: job.title
        });
    };

    // Xử lý Chat
    const handleChat = async () => {
        console.log('=== CHAT BUTTON CLICKED (JobDetail) ===');
        console.log('Job raw data:', JSON.stringify(job, null, 2));

        if (!user) {
            Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để chat với nhà tuyển dụng', [
                { text: 'Hủy', style: 'cancel' },
                { text: 'Đăng nhập', onPress: () => navigation.navigate('Login') }
            ]);
            return;
        }

        if (!job.employerId) {
            Alert.alert('Lỗi', 'Không tìm thấy thông tin nhà tuyển dụng');
            return;
        }

        try {
            setChatLoading(true);

            // Tạo hoặc lấy cuộc trò chuyện
            // API yêu cầu kiểu int cho ID
            const recipientId = parseInt(
                job.employerId ||
                job.recruiterId ||
                job.userId ||
                job.employer?.id ||
                job.company?.employerId,
                10
            );
            const jobPostId = parseInt(job.id || job.jobId || job.jobPostId, 10);

            const response = await chatAPI.createConversation(recipientId, jobPostId);

            if (response && (response.id || response.conversationId || response.conversation)) {
                const conversationId = response.id || response.conversationId || (response.conversation && (response.conversation.id || response.conversation.conversationId));

                navigation.navigate('Chat', {
                    screen: 'ChatRoom',
                    params: {
                        conversationId: conversationId,
                        participantName: job.employerName || job.employer_name || job.companyName || job.company_name || job.employer?.fullName || 'Nhà tuyển dụng',
                        participantAvatar: null,
                        jobPostId: jobPostId,
                        jobTitle: job.title || job.jobTitle,
                    }
                });
            } else {
                console.error('Invalid response format:', response);
                throw new Error('Invalid response from chat service');
            }
        } catch (err) {
            console.error('Error initiating chat:', err);
        } finally {
            setChatLoading(false);
        }
    };

    // Xử lý Rút đơn
    const handleWithdraw = async () => {
        if (!appliedApplication) return;

        Alert.alert(
            'Xác nhận rút đơn',
            'Bạn có chắc chắn muốn rút đơn ứng tuyển cho công việc này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rút đơn',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setWithdrawing(true);
                            const response = await withdrawApplication(appliedApplication.id);
                            if (response.success) {
                                Alert.alert('Thành công', 'Đã rút đơn ứng tuyển');
                                // Làm mới trạng thái ứng tuyển từ server để đảm bảo nhất quán tuyệt đối
                                await checkIfApplied();
                                // Làm mới chi tiết công việc để cập nhật số lượng nếu cần
                                fetchJobDetail();
                            } else {
                                Alert.alert('Lỗi', response.message || 'Không thể rút đơn');
                            }
                        } catch (err) {
                            console.error('Error withdrawing:', err);
                            Alert.alert('Lỗi', 'Có lỗi xảy ra khi rút đơn');
                        } finally {
                            setWithdrawing(false);
                        }
                    }
                }
            ]
        );
    };

    const renderInfoRow = (icon, label, value) => {
        if (!value) return null;
        return (
            <View style={styles.infoRow}>
                <Ionicons name={icon} size={20} color={COLORS.accentOrange} />
                <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{label}</Text>
                    <Text style={styles.infoValue}>{value}</Text>
                </View>
            </View>
        );
    };

    const renderSection = (title, content) => {
        if (!content) return null;
        return (
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionText}>{content}</Text>
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

    if (error || !job) {
        return (
            <SafeAreaView style={styles.container} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                </View>
                <EmptyState
                    icon="alert-circle-outline"
                    title="Không tìm thấy"
                    description={error || 'Công việc không tồn tại'}
                    actionText="Quay lại"
                    onAction={() => navigation.goBack()}
                />
            </SafeAreaView>
        );
    }

    // DEMO FORCE: Luôn cho phép ứng tuyển (bỏ qua kiểm tra hết hạn)
    // const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
    const isExpired = false;

    // Debug Logic Ngày tháng
    if (job.applicationDeadline) {
        console.log('Date Debug:', {
            serverString: job.applicationDeadline,
            parsedDate: new Date(job.applicationDeadline).toString(),
            currentDate: new Date().toString(),
            isExpired: isExpired  // Will be false now
        });
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Tiêu đề */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chi tiết công việc</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header công việc */}
                <View style={styles.jobHeader}>
                    <View style={styles.companyLogo}>
                        <Ionicons name="business" size={32} color={COLORS.accentOrange} />
                    </View>
                    <Text style={styles.jobTitle}>{job.title}</Text>
                    <Text style={styles.companyName}>{job.companyName}</Text>

                    {job.isFeatured && (
                        <View style={styles.badge}>
                            <Ionicons name="star" size={14} color={COLORS.white} />
                            <Text style={styles.badgeText}>Nổi bật</Text>
                        </View>
                    )}
                </View>

                {/* Thông tin nhanh */}
                <View style={styles.quickInfo}>
                    {renderInfoRow(
                        'cash-outline',
                        'Mức lương',
                        formatSalary(job.salaryMin, job.salaryMax, job.salaryPeriod)
                    )}
                    {renderInfoRow('location-outline', 'Địa điểm', job.location)}
                    {renderInfoRow('briefcase-outline', 'Loại hình', job.workType)}
                    {renderInfoRow('pricetag-outline', 'Ngành nghề', job.category)}
                    {job.applicationDeadline && renderInfoRow(
                        'calendar-outline',
                        'Hạn ứng tuyển',
                        formatDate(job.applicationDeadline)
                    )}
                    {job.numberOfPositions && renderInfoRow(
                        'people-outline',
                        'Số lượng',
                        `${job.numberOfPositions} vị trí`
                    )}
                </View>

                {/* Mô tả */}
                {renderSection('Mô tả công việc', job.description)}

                {/* Yêu cầu */}
                {renderSection('Yêu cầu', job.requirements)}

                {/* Quyền lợi */}
                {renderSection('Quyền lợi', job.benefits)}

                {/* Kỹ năng */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Kỹ năng yêu cầu</Text>
                        <View style={styles.skillsContainer}>
                            {job.requiredSkills.map((skill, index) => (
                                <View key={index} style={styles.skillBadge}>
                                    <Text style={styles.skillText}>{skill}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Ca làm việc */}
                {job.shifts && job.shifts.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Ca làm việc</Text>
                        {job.shifts.map((shift, index) => (
                            <View key={index} style={styles.shiftCard}>
                                <Text style={styles.shiftName}>{shift.shiftName}</Text>
                                <Text style={styles.shiftTime}>
                                    {formatTimeRange(shift.startTime, shift.endTime)}
                                </Text>
                                {shift.daysOfWeek && shift.daysOfWeek.length > 0 && (
                                    <Text style={styles.shiftDays}>
                                        {formatDaysOfWeek(shift.daysOfWeek)}
                                    </Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Thống kê */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Ionicons name="eye-outline" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.statText}>{job.viewCount} lượt xem</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="document-text-outline" size={20} color={COLORS.textSecondary} />
                        <Text style={styles.statText}>{job.applicationCount} ứng tuyển</Text>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Hành động phía dưới */}
            <View style={styles.bottomActions}>
                {/* Nút Chat */}
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={handleChat}
                    disabled={chatLoading}
                >
                    {chatLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.primary} />
                    )}
                </TouchableOpacity>

                {hasApplied && appliedApplication && (appliedApplication.statusName === 'Pending' || appliedApplication.statusName === 'Đang chờ') ? (
                    <Button
                        onPress={handleWithdraw}
                        disabled={withdrawing}
                        style={[styles.applyButton, styles.withdrawButton]}
                        variant="outline"
                    >
                        {withdrawing ? 'Đang xử lý...' : 'Hủy ứng tuyển'}
                    </Button>
                ) : (
                    <Button
                        onPress={handleApply}
                        disabled={hasApplied || isExpired || checkingApplication}
                        style={styles.applyButton}
                    >
                        {hasApplied
                            ? 'Đã ứng tuyển'
                            : isExpired
                                ? 'Hết hạn'
                                : checkingApplication
                                    ? 'Đang kiểm tra...'
                                    : 'Ứng tuyển ngay'}
                    </Button>
                )}
            </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
    },
    placeholder: {
        width: 32,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    jobHeader: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.lg,
        alignItems: 'center',
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    companyLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.accentOrangeLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    jobTitle: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginBottom: SPACING.xs,
    },
    companyName: {
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accentOrange,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 16,
        marginTop: SPACING.xs,
    },
    badgeText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        color: COLORS.white,
        marginLeft: 4,
    },
    quickInfo: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: SPACING.sm,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray100,
    },
    infoContent: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    infoLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        fontWeight: TYPOGRAPHY.weight.medium,
    },
    section: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    sectionText: {
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        lineHeight: 24,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    skillBadge: {
        backgroundColor: COLORS.accentOrangeLight,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 16,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    skillText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.accentOrange,
    },
    shiftCard: {
        backgroundColor: COLORS.gray50,
        padding: SPACING.sm,
        borderRadius: 8,
        marginBottom: SPACING.xs,
    },
    shiftName: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    shiftTime: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
    },
    shiftDays: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        justifyContent: 'space-around',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    bottomActions: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        flexDirection: 'row', // Align chat and apply buttons horizontally
        gap: SPACING.md,
    },
    chatButton: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButton: {
        flex: 1, // Take remaining space
    },
});

export default JobDetailScreen;
