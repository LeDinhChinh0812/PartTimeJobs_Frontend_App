/**
 * Component SearchBar
 * Thanh tìm kiếm với icon và nút lọc tùy chọn
 */

import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const SearchBar = ({
    placeholder = 'Search jobs...',
    value,
    onChangeText,
    onFilter,
    showFilter = false
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <Feather name="search" size={20} color={COLORS.gray400} style={styles.searchIcon} />

                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.gray400}
                    value={value}
                    onChangeText={onChangeText}
                    returnKeyType="search"
                />
            </View>

            {showFilter && (
                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={onFilter}
                    activeOpacity={0.7}
                >
                    <Feather name="sliders" size={20} color={COLORS.primary} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.gray50,
        borderRadius: RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: 48,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    searchIcon: {
        marginRight: SPACING.sm,
    },
    input: {
        flex: 1,
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        padding: 0, // Remove default padding
    },
    filterButton: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.accentPurple,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: SPACING.sm,
    },
});

export default SearchBar;
