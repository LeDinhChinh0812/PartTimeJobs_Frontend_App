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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { Button, EmptyState } from '../components';
import { useAuth } from '../context';
import { getMyProfile, getMyApplications } from '../services';
import { formatDate } from '../utils/formatters';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({ applications: 0 });

    const fetchProfile = async (isRefreshing = false) => {
        try {
            isRefreshing ? setRefreshing(true) : setLoading(true);

            const response = await getMyProfile();

            if (response.success && response.data) {
                setProfile(response.data);
                setError(null);
            } else {
                setError('Chưa có thông tin hồ sơ');
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            // If it's a 404, it means profile doesn't exist yet
            if (err.message?.includes('404') || err.message?.includes('not found')) {
                setError('Chưa có thông tin hồ sơ');
            } else {
                setError(err.message || 'Không thể tải thông tin hồ sơ');
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchStats = async () => {
        try {
            const appsResponse = await getMyApplications(1, 100);
            if (appsResponse.success && appsResponse.data) {
                setStats({ applications: appsResponse.data.totalCount || 0 });
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
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
        Alert.alert(
            'Đăng xuất',
            'Bạn có chắc chắn muốn đăng xuất?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Đăng xuất',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    }
                }
            ]
        );
    };

    const handleEditProfile = () => {
        navigation.navigate('EditProfile', { profile });
    };

    const handlePreviewCV = () => {
        if (!profile) return;
        navigation.navigate('CVPreview', { profile });
    };

    const handleOpenCV = async () => {
        if (!profile?.resumeUrl) {
            Alert.alert('Thông báo', 'Bạn chưa có link CV');
            return;
        }

        try {
            const supported = await Linking.canOpenURL(profile.resumeUrl);
            if (supported) {
                await Linking.openURL(profile.resumeUrl);
            } else {
                Alert.alert('Lỗi', 'Không thể mở link CV');
            }
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể mở link CV');
        }
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

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.accentOrange} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Hồ sơ</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[COLORS.accentOrange]}
                        tintColor={COLORS.accentOrange}
                    />
                }
            >
                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color={COLORS.white} />
                    </View>
                    <Text style={styles.userName}>{user?.fullName}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                {/* Statistics Card */}
                <View style={styles.statsCard}>
                    <View style={styles.statItem}>
                        <Ionicons name="document-text-outline" size={24} color={COLORS.accentOrange} />
                        <Text style={styles.statNumber}>{stats.applications}</Text>
                        <Text style={styles.statLabel}>Đơn ứng tuyển</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Ionicons name="briefcase-outline" size={24} color={COLORS.accentPurple} />
                        <Text style={styles.statNumber}>{profile ? '1' : '0'}</Text>
                        <Text style={styles.statLabel}>Hồ sơ</Text>
                    </View>
                </View>

                {/* Quick Actions */}
                {profile?.resumeUrl && (
                    <TouchableOpacity style={styles.cvButton} onPress={handleOpenCV}>
                        <Ionicons name="document-text" size={20} color={COLORS.white} />
                        <Text style={styles.cvButtonText}>Xem CV của tôi</Text>
                        <Ionicons name="open-outline" size={16} color={COLORS.white} />
                    </TouchableOpacity>
                )}

                {/* Menu Options */}
                <View style={styles.menuCard}>
                    <TouchableOpacity style={styles.menuItem} onPress={handlePreviewCV}>
                        <View style={styles.menuLeft}>
                            <Ionicons name="document-text-outline" size={22} color={COLORS.primary} />
                            <Text style={styles.menuText}>Xem CV của tôi</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}>
                        <View style={styles.menuLeft}>
                            <Ionicons name="settings-outline" size={22} color={COLORS.textPrimary} />
                            <Text style={styles.menuText}>Cài đặt</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}>
                        <View style={styles.menuLeft}>
                            <Ionicons name="help-circle-outline" size={22} color={COLORS.textPrimary} />
                            <Text style={styles.menuText}>Trợ giúp</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Về ứng dụng', 'Job Finder v1.0.0\nỨng dụng tìm việc làm part-time cho sinh viên')}>
                        <View style={styles.menuLeft}>
                            <Ionicons name="information-circle-outline" size={22} color={COLORS.textPrimary} />
                            <Text style={styles.menuText}>Về ứng dụng</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <View style={styles.menuLeft}>
                            <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
                            <Text style={[styles.menuText, { color: COLORS.error }]}>Đăng xuất</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                    </TouchableOpacity>
                </View>

                {error && !profile ? (
                    <View style={styles.emptyContainer}>
                        <EmptyState
                            icon="person-outline"
                            title="Chưa có hồ sơ"
                            description="Bạn chưa hoàn thiện hồ sơ cá nhân. Hãy tạo hồ sơ để nhà tuyển dụng có thể tìm thấy bạn!"
                            actionText="Tạo hồ sơ"
                            onAction={handleEditProfile}
                        />
                    </View>
                ) : profile ? (
                    <>
                        {/* Personal Info */}
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                                <TouchableOpacity onPress={handleEditProfile}>
                                    <Text style={styles.editButton}>Chỉnh sửa</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.card}>
                                {renderInfoRow('person-outline', 'Họ tên', profile.fullName)}
                                {renderInfoRow('calendar-outline', 'Ngày sinh', profile.dateOfBirth ? formatDate(profile.dateOfBirth) : null)}
                                {renderInfoRow('location-outline', 'Địa chỉ', profile.address)}
                                {renderInfoRow('location-outline', 'Thành phố', profile.city)}
                                {profile.bio && (
                                    <View style={styles.bioSection}>
                                        <Text style={styles.bioLabel}>Giới thiệu</Text>
                                        <Text style={styles.bioText}>{profile.bio}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Student Info */}
                        {(profile.university || profile.studentId) && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Thông tin sinh viên</Text>
                                <View style={styles.card}>
                                    {renderInfoRow('school-outline', 'Trường', profile.university)}
                                    {renderInfoRow('id-card-outline', 'Mã SV', profile.studentId)}
                                    {renderInfoRow('book-outline', 'Chuyên ngành', profile.major)}
                                    {renderInfoRow('trending-up-outline', 'GPA', profile.gpa?.toString())}
                                    {renderInfoRow('time-outline', 'Năm học', profile.yearOfStudy ? `Năm ${profile.yearOfStudy}` : null)}
                                </View>
                            </View>
                        )}

                        {/* Skills */}
                        {profile.skills && profile.skills.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Kỹ năng</Text>
                                <View style={styles.card}>
                                    <View style={styles.skillsContainer}>
                                        {profile.skills.map((skill, index) => (
                                            <View key={index} style={styles.skillBadge}>
                                                <Text style={styles.skillText}>{skill.skillName}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Links */}
                        {(profile.resumeUrl || profile.linkedInUrl || profile.gitHubUrl) && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Liên kết</Text>
                                <View style={styles.card}>
                                    {renderInfoRow('document-text-outline', 'CV', profile.resumeUrl)}
                                    {renderInfoRow('logo-linkedin', 'LinkedIn', profile.linkedInUrl)}
                                    {renderInfoRow('logo-github', 'GitHub', profile.gitHubUrl)}
                                </View>
                            </View>
                        )}
                    </>
                ) : null}

                {/* Logout Button */}
                <View style={styles.buttonContainer}>
                    <Button
                        title="Đăng xuất"
                        onPress={handleLogout}
                        variant="secondary"
                    />
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
    headerTitle: {
        fontSize: TYPOGRAPHY.size['2xl'],
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
    },
    logoutIcon: {
        padding: 4,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: SPACING.lg,
    },
    userCard: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING.xl,
        alignItems: 'center',
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.accentOrange,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.md,
    },
    userName: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        minHeight: 400,
    },
    section: {
        marginBottom: SPACING.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.sm,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
    },
    editButton: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.accentOrange,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.md,
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
    },
    bioSection: {
        paddingVertical: SPACING.sm,
    },
    bioLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    bioText: {
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        lineHeight: 22,
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
    statsCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: SPACING.lg,
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: COLORS.gray200,
        marginHorizontal: SPACING.md,
    },
    statNumber: {
        fontSize: TYPOGRAPHY.size['2xl'],
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
        marginTop: SPACING.xs,
    },
    statLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    cvButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.accentOrange,
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.lg,
        gap: SPACING.xs,
    },
    cvButtonText: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.white,
        flex: 1,
        textAlign: 'center',
    },
    menuCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        marginBottom: SPACING.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.md,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
    },
    menuText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textPrimary,
    },
    menuDivider: {
        height: 1,
        backgroundColor: COLORS.gray100,
        marginHorizontal: SPACING.md,
    },
    buttonContainer: {
        marginTop: SPACING.md,
        marginBottom: SPACING.xl,
    },
});

export default ProfileScreen;
