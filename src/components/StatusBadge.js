/**
 * Component StatusBadge
 * Hiển thị trạng thái đơn ứng tuyển với màu sắc phù hợp
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/constants';

const StatusBadge = ({ status }) => {
    const backgroundColor = STATUS_COLORS[status] || '#9E9E9E';
    const label = STATUS_LABELS[status] || status;

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={styles.text}>{label}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    text: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default StatusBadge;
