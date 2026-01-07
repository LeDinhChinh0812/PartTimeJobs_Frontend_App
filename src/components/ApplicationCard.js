/**
 * Component ApplicationCard
 * Hiển thị thông tin đơn ứng tuyển trong thẻ
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { formatDate } from '../utils/formatters';
import { STATUS_MAPPING } from '../utils/constants';
import StatusBadge from './StatusBadge';

const ApplicationCard = ({
    application,
    onPress,
    onWithdraw,
    onChat,
    onDelete,
    onReapply,
    showWithdraw = false,
    showChat = false,
    showDelete = false,
    showReapply = false
}) => {
    // Xác định trạng thái từ ID nếu có, nếu không thì dùng tên
    const statusKey = application.statusId && STATUS_MAPPING[application.statusId]
        ? STATUS_MAPPING[application.statusId]
        : application.statusName;

    const handleWithdraw = () => {
        Alert.alert(
            'Xác nhận rút đơn',
            'Bạn có chắc chắn muốn rút đơn ứng tuyển này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Rút đơn',
                    style: 'destructive',
                    onPress: () => onWithdraw(application.id)
                }
            ]
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa đơn ứng tuyển này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: () => onDelete(application.id)
                }
            ]
        );
    };

    const handleReapply = () => {
        Alert.alert(
            'Xác nhận ứng tuyển lại',
            `Bạn muốn ứng tuyển lại vào vị trí "${application.jobTitle}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Ứng tuyển lại',
                    onPress: () => onReapply(application)
                }
            ]
        );
    };

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.jobTitle} numberOfLines={1}>
                        {application.jobTitle}
                    </Text>
                    <Text style={styles.applicantName} numberOfLines={1}>
                        {application.applicantName || 'Ứng viên'}
                    </Text>
                </View>
                <StatusBadge status={statusKey} />
            </View>

            <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>
                    Ứng tuyển: {formatDate(application.appliedAt)}
                </Text>
            </View>

            {application.reviewedAt && (
                <View style={styles.infoRow}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.textSecondary} />
                    <Text style={styles.infoText}>
                        Xem xét: {formatDate(application.reviewedAt)}
                    </Text>
                </View>
            )}

            {showWithdraw && (
                application.statusName === 'Pending' ||
                application.statusName === 'Đang chờ' ||
                application.statusName === 'Processing' ||
                application.statusName === 'Đang xử lý'
            ) && (
                    <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={handleWithdraw}
                    >
                        <Ionicons name="close-circle" size={18} color={COLORS.error} />
                        <Text style={styles.withdrawText}>Rút đơn</Text>
                    </TouchableOpacity>
                )}

            {showChat && (
                <TouchableOpacity
                    style={styles.chatButton}
                    onPress={() => onChat(application)}
                >
                    <Ionicons name="chatbubble-ellipses" size={18} color={COLORS.primary} />
                    <Text style={styles.chatText}>Chat với nhà tuyển dụng</Text>
                </TouchableOpacity>
            )}

            {showDelete && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash" size={18} color={COLORS.error} />
                    <Text style={styles.deleteText}>Xóa đơn</Text>
                </TouchableOpacity>
            )}

            {showReapply && (
                <TouchableOpacity
                    style={styles.reapplyButton}
                    onPress={handleReapply}
                >
                    <Ionicons name="refresh" size={18} color={COLORS.success} />
                    <Text style={styles.reapplyText}>Ứng tuyển lại</Text>
                </TouchableOpacity>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.sm,
    },
    headerLeft: {
        flex: 1,
        marginRight: SPACING.sm,
    },
    jobTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    applicantName: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.xs,
    },
    infoText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginLeft: SPACING.xs,
    },
    withdrawButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    withdrawText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.error,
        marginLeft: SPACING.xs,
    },
    chatButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    chatText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.primary,
        marginLeft: SPACING.xs,
    },
    deleteButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    deleteText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.error,
        marginLeft: SPACING.xs,
    },
    reapplyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: SPACING.md,
        paddingTop: SPACING.sm,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
    reapplyText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.success,
        marginLeft: SPACING.xs,
    },
});

export default ApplicationCard;
