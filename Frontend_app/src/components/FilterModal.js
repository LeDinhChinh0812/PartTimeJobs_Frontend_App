/**
 * FilterModal Component
 * Modal for filtering job search results
 */

import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { WORK_TYPES, JOB_CATEGORIES } from '../utils/constants';

const FilterModal = ({
    visible,
    onClose,
    onApply,
    initialFilters = {}
}) => {
    const [filters, setFilters] = useState({
        keyword: initialFilters.keyword || '',
        location: initialFilters.location || '',
        salaryMin: initialFilters.salaryMin || '',
        salaryMax: initialFilters.salaryMax || '',
        workType: initialFilters.workType || '',
        category: initialFilters.category || '',
    });

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClear = () => {
        const clearedFilters = {
            keyword: '',
            location: '',
            salaryMin: '',
            salaryMax: '',
            workType: '',
            category: '',
        };
        setFilters(clearedFilters);
        onApply(clearedFilters);
        onClose();
    };

    const renderOption = (label, value, selectedValue, onSelect) => (
        <TouchableOpacity
            key={value}
            style={[
                styles.option,
                selectedValue === value && styles.optionSelected
            ]}
            onPress={() => onSelect(value)}
        >
            <Text style={[
                styles.optionText,
                selectedValue === value && styles.optionTextSelected
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>Bộ lọc tìm kiếm</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color={COLORS.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Keyword */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Từ khóa</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập từ khóa tìm kiếm..."
                                value={filters.keyword}
                                onChangeText={(text) => setFilters({ ...filters, keyword: text })}
                            />
                        </View>

                        {/* Location */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Địa điểm</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="VD: Hà Nội, TP.HCM..."
                                value={filters.location}
                                onChangeText={(text) => setFilters({ ...filters, location: text })}
                            />
                        </View>

                        {/* Salary Range */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Mức lương (VNĐ)</Text>
                            <View style={styles.row}>
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Từ"
                                    keyboardType="numeric"
                                    value={filters.salaryMin}
                                    onChangeText={(text) => setFilters({ ...filters, salaryMin: text })}
                                />
                                <Text style={styles.separator}>-</Text>
                                <TextInput
                                    style={[styles.input, styles.halfInput]}
                                    placeholder="Đến"
                                    keyboardType="numeric"
                                    value={filters.salaryMax}
                                    onChangeText={(text) => setFilters({ ...filters, salaryMax: text })}
                                />
                            </View>
                        </View>

                        {/* Work Type */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Loại công việc</Text>
                            <View style={styles.optionsContainer}>
                                {WORK_TYPES.map(({ label, value }) =>
                                    renderOption(
                                        label,
                                        value,
                                        filters.workType,
                                        (val) => setFilters({ ...filters, workType: val })
                                    )
                                )}
                            </View>
                        </View>

                        {/* Category */}
                        <View style={styles.section}>
                            <Text style={styles.label}>Ngành nghề</Text>
                            <View style={styles.optionsContainer}>
                                {JOB_CATEGORIES.map(({ label, value }) =>
                                    renderOption(
                                        label,
                                        value,
                                        filters.category,
                                        (val) => setFilters({ ...filters, category: val })
                                    )
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.button, styles.clearButton]}
                            onPress={handleClear}
                        >
                            <Text style={styles.clearButtonText}>Xóa bộ lọc</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.button, styles.applyButton]}
                            onPress={handleApply}
                        >
                            <Text style={styles.applyButtonText}>Áp dụng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    title: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
    },
    content: {
        padding: SPACING.lg,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        marginBottom: SPACING.sm,
    },
    input: {
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    halfInput: {
        flex: 1,
    },
    separator: {
        marginHorizontal: SPACING.sm,
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textSecondary,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: SPACING.xs,
    },
    option: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        marginRight: SPACING.xs,
        marginBottom: SPACING.xs,
    },
    optionSelected: {
        backgroundColor: COLORS.accentOrange,
        borderColor: COLORS.accentOrange,
    },
    optionText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
    },
    optionTextSelected: {
        color: COLORS.white,
        fontWeight: TYPOGRAPHY.weight.medium,
    },
    footer: {
        flexDirection: 'row',
        padding: SPACING.lg,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
        gap: SPACING.md,
    },
    button: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearButton: {
        backgroundColor: COLORS.gray100,
    },
    clearButtonText: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
    },
    applyButton: {
        backgroundColor: COLORS.accentOrange,
    },
    applyButtonText: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.white,
    },
});

export default FilterModal;
