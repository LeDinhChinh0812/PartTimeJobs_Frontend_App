/**
 * ProfileScreen
 * Display and manage user profile
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Linking,
    Switch,
    Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { useAuth } from '../context';
import { getMyProfile, getMyApplications } from '../services';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ applications: 0, saved: 0 });

    // Toggles state
    const [isJobSeeking, setIsJobSeeking] = useState(true);
    const [allowContact, setAllowContact] = useState(false);

    const fetchProfile = async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true);
            const response = await getMyProfile();
            if (response.success && response.data) {
                setProfile(response.data);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            if (err.message === 'No refresh token available' || err.message === 'Refresh failed') {
                logout();
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchStats = async () => {
        try {
            const appsResponse = await getMyApplications(1, 1);
            if (appsResponse.success && appsResponse.data) {
                setStats(prev => ({ ...prev, applications: appsResponse.data.totalCount || 0 }));
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            if (err.message === 'No refresh token available' || err.message === 'Refresh failed') {
                logout();
            }
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            fetchProfile();
            fetchStats();
        }, [])
    );

    const handleRefresh = () => {
        fetchProfile(true);
        fetchStats();
    };

    const handleLogout = () => {
        Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: logout }
        ]);
    };

    const renderGridItem = (icon, title, count, color = COLORS.primary) => (
        <TouchableOpacity style={styles.gridItem}>
            <View style={[styles.gridIcon, { backgroundColor: `${color}15` }]}>
                <Ionicons name={icon} size={24} color={color} />
            </View>
            <Text style={styles.gridTitle}>{title}</Text>
            {count !== undefined && (
                <Text style={[styles.gridCount, { color: count > 0 ? color : COLORS.textSecondary }]}>
                    {count}
                </Text>
            )}
        </TouchableOpacity>
    );

    const renderMenuItem = (icon, title, onPress) => (
        <TouchableOpacity style={styles.menuItem} onPress={onPress}>
            <View style={styles.menuLeft}>
                <Ionicons name={icon} size={24} color={COLORS.textSecondary} />
                <Text style={styles.menuText}>{title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    // Default icon color - Reverted to App Theme (Orange)
    const ICON_COLOR = COLORS.accentOrange;
    const ICON_BG_COLOR = COLORS.accentOrangeLight; // Using the constant for light orange

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[ICON_COLOR]} />
                }
            >
                {/* Header Profile Section */}
                <View style={styles.headerCard}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarContainer}>
                            <Ionicons name="person" size={40} color="#CBD5E1" />
                            <TouchableOpacity style={[styles.cameraIcon, { backgroundColor: COLORS.textSecondary }]}>
                                <Ionicons name="camera" size={12} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.fullName || 'Người dùng'}</Text>
                            <Text style={styles.profileId}>Mã ứng viên: #{user?.id?.toString().padStart(6, '0')}</Text>
                            <TouchableOpacity style={[styles.upgradeBadge, { backgroundColor: COLORS.gray400 }]}>
                                <Ionicons name="arrow-up-circle" size={14} color={COLORS.white} />
                                <Text style={styles.upgradeText}>Nâng cấp tài khoản</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* CV Section */}
                <View style={[styles.sectionHeader, { marginTop: SPACING.lg }]}>
                    <Text style={styles.sectionTitle}>CV của tôi</Text>
                </View>
                <View style={styles.sectionContainer}>
                    {renderMenuItem('document-text-outline', 'CV đã tạo trên App', () => navigation.navigate('MyCV'))}
                    <View style={styles.divider} />
                    {renderMenuItem('cloud-upload-outline', 'CV đã tải lên', () => navigation.navigate('MyCV'))}
                </View>

                {/* Job Management Grid */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quản lý tìm việc</Text>
                </View>
                <View style={styles.gridContainer}>
                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('Applications')}
                    >
                        <View style={[styles.gridIcon, { backgroundColor: `${ICON_COLOR}15` }]}>
                            <Ionicons name="briefcase" size={24} color={ICON_COLOR} />
                        </View>
                        <Text style={styles.gridTitle}>Việc làm đã ứng tuyển</Text>
                        <Text style={[styles.gridCount, { color: stats.applications > 0 ? ICON_COLOR : COLORS.textSecondary }]}>
                            {stats.applications}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridItem}
                        onPress={() => navigation.navigate('Jobs')} // Navigate to Jobs list as placeholder for "Suitable Jobs"
                    >
                        <View style={[styles.gridIcon, { backgroundColor: `${ICON_COLOR}15` }]}>
                            <Ionicons name="checkmark-circle" size={24} color={ICON_COLOR} />
                        </View>
                        <Text style={styles.gridTitle}>Việc làm phù hợp</Text>
                        <Text style={[styles.gridCount, { color: ICON_COLOR }]}>
                            12
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.gridItem}
                    // No navigation for now
                    >
                        <View style={[styles.gridIcon, { backgroundColor: `${ICON_COLOR}15` }]}>
                            <Ionicons name="eye" size={24} color={ICON_COLOR} />
                        </View>
                        <Text style={styles.gridTitle}>NTD đã xem hồ sơ</Text>
                        <Text style={[styles.gridCount, { color: COLORS.textSecondary }]}>
                            0
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Utilities / Settings */}
                <View style={[styles.sectionContainer, { marginTop: SPACING.lg }]}>
                    {renderMenuItem('information-circle-outline', 'Về ứng dụng', () => { })}
                    <View style={styles.divider} />
                    {renderMenuItem('shield-checkmark-outline', 'Điều khoản dịch vụ', () => { })}
                    <View style={styles.divider} />
                    {renderMenuItem('lock-closed-outline', 'Chính sách bảo mật', () => { })}
                    <View style={styles.divider} />
                    {renderMenuItem('help-circle-outline', 'Trợ giúp', () => { })}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutText}>Đăng xuất</Text>
                    <Ionicons name="log-out-outline" size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F5F9', // Light gray background
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    headerCard: {
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        marginBottom: SPACING.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.md,
        position: 'relative',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#475569',
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    profileId: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginBottom: 6,
    },
    upgradeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#94A3B8',
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 4,
    },
    upgradeText: {
        fontSize: 11,
        color: COLORS.white,
        fontWeight: '600',
    },
    sectionContainer: {
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.sm, // Slightly offset from edges
        marginBottom: SPACING.md,
        borderRadius: 12,
        overflow: 'hidden',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    toggleLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toggleText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textPrimary,
        fontWeight: '500',
    },
    sectionHeader: {
        paddingHorizontal: SPACING.lg,
        marginBottom: SPACING.xs,
        marginTop: SPACING.sm,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    menuText: {
        fontSize: 15,
        color: COLORS.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginLeft: 56, // Indent past icon
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: SPACING.sm,
        gap: SPACING.sm,
    },
    gridItem: {
        width: '48%', // Approx 2 columns
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.xs,
        minHeight: 100,
        justifyContent: 'space-between',
    },
    gridIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    gridTitle: {
        fontSize: 13,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    gridCount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        marginHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        padding: SPACING.md,
        borderRadius: 12,
        gap: 8,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '500',
        color: COLORS.textPrimary,
    },
});

export default ProfileScreen;
