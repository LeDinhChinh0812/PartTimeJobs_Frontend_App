/**
 * CVPreviewScreen
 * Displays user profile as a professional CV document
 */

import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Platform,
    Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';
import { formatDate } from '../utils/formatters';

const CVPreviewScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { profile } = route.params;

    if (!profile) {
        return (
            <View style={styles.centerContainer}>
                <Text>Không có dữ liệu CV</Text>
            </View>
        );
    }

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Xem CV của ${profile.fullName || 'tôi'} tại Job Finder!`,
            });
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    const renderContactItem = (icon, text) => {
        if (!text) return null;
        return (
            <View style={styles.contactItem}>
                <Ionicons name={icon} size={14} color={COLORS.textSecondary} />
                <Text style={styles.contactText}>{text}</Text>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header Toolbar */}
            <View style={styles.toolbar}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                >
                    <Ionicons name="close" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.toolbarTitle}>Xem trước CV</Text>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* CV Document (A4 Ratio) */}
                <View style={styles.document}>
                    {/* CV Header */}
                    <View style={styles.cvHeader}>
                        <View style={styles.nameSection}>
                            <Text style={styles.fullName}>{profile.fullName}</Text>
                            <Text style={styles.major}>{profile.major}</Text>
                        </View>
                        <View style={styles.contactSection}>
                            {renderContactItem('mail-outline', profile.email)}
                            {renderContactItem('call-outline', profile.phone)}
                            {renderContactItem('location-outline', profile.address ? `${profile.address}, ${profile.city}` : profile.city)}
                            {renderContactItem('logo-linkedin', profile.linkedInUrl)}
                            {renderContactItem('globe-outline', profile.resumeUrl)}
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Summary/Bio */}
                    {profile.bio && (
                        <View style={styles.cvSection}>
                            <Text style={styles.cvSectionTitle}>GIỚI THIỆU</Text>
                            <Text style={styles.cvText}>{profile.bio}</Text>
                        </View>
                    )}

                    {/* Education */}
                    <View style={styles.cvSection}>
                        <Text style={styles.cvSectionTitle}>HỌC VẤN</Text>
                        <View style={styles.educationItem}>
                            <View style={styles.schoolRow}>
                                <Text style={styles.schoolName}>{profile.university}</Text>
                                <Text style={styles.timeRange}>
                                    {profile.yearOfStudy ? `Năm ${profile.yearOfStudy}` : ''}
                                </Text>
                            </View>
                            <Text style={styles.degree}>{profile.major}</Text>
                            {profile.gpa && <Text style={styles.gpa}>GPA: {profile.gpa}</Text>}
                        </View>
                    </View>

                    {/* Skills */}
                    {profile.skills && profile.skills.length > 0 && (
                        <View style={styles.cvSection}>
                            <Text style={styles.cvSectionTitle}>KỸ NĂNG</Text>
                            <View style={styles.skillsGrid}>
                                {profile.skills.map((skill, index) => (
                                    <View key={index} style={styles.skillTag}>
                                        <Text style={styles.skillTagText}>{skill.skillName}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Footer / Watermark */}
                    <View style={styles.watermark}>
                        <Text style={styles.watermarkText}>Created with Job Finder App</Text>
                    </View>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#333', // Dark background to make document pop
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        backgroundColor: '#333',
    },
    toolbarTitle: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
    },
    scrollView: {
        flex: 1,
        backgroundColor: '#F0F2F5',
    },
    scrollContent: {
        padding: SPACING.md,
        alignItems: 'center',
    },
    document: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.sm,
        padding: SPACING.xl,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        minHeight: 500,
    },
    cvHeader: {
        marginBottom: SPACING.lg,
    },
    nameSection: {
        marginBottom: SPACING.md,
    },
    fullName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    major: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    contactSection: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: SPACING.md,
        marginBottom: 4,
    },
    contactText: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.gray200,
        marginBottom: SPACING.lg,
    },
    cvSection: {
        marginBottom: SPACING.xl,
    },
    cvSectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.accentOrange,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.accentOrange,
        paddingBottom: 4,
        marginBottom: SPACING.md,
        alignSelf: 'flex-start',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    cvText: {
        fontSize: 14,
        color: COLORS.textPrimary,
        lineHeight: 22,
    },
    educationItem: {
        marginBottom: SPACING.sm,
    },
    schoolRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    schoolName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    timeRange: {
        fontSize: 13,
        color: COLORS.textSecondary,
    },
    degree: {
        fontSize: 14,
        color: COLORS.textPrimary,
    },
    gpa: {
        fontSize: 13,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        marginTop: 2,
    },
    skillsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    skillTag: {
        backgroundColor: '#F5F7FA',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E4E7EB',
    },
    skillTagText: {
        fontSize: 13,
        color: COLORS.textPrimary,
    },
    watermark: {
        alignItems: 'center',
        marginTop: SPACING.xl,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        paddingTop: SPACING.sm,
    },
    watermarkText: {
        fontSize: 10,
        color: COLORS.gray400,
    },
});

export default CVPreviewScreen;
