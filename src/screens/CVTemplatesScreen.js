import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

// Professional CV Template - Single Template
const CV_TEMPLATES = [
    {
        id: '1',
        name: 'Mẫu CV Chuyên Nghiệp',
        usageCount: '>25.000 CV đã tạo',
        color: '#5D4037', // Brownish
        tags: ['Chuyên nghiệp'],
        mockImage: 'https://marketplace.canva.com/EAFRuCp3DcY/1/0/1131w/canva-black-white-minimalist-cv-resume-f5JNR-K5jjw.jpg'
    }
];

const CVTemplatesScreen = () => {
    const navigation = useNavigation();

    const handleUseTemplate = (templateId) => {
        // Navigate to the Editor (CreateCVScreen)
        navigation.navigate('CreateCV', { templateId });
    };

    const renderTemplateItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardImageContainer}>
                {/* Placeholder for template preview - Using a colored view if image fails, but ideally real images */}
                <View style={[styles.cardImagePlaceholder, { backgroundColor: '#F5F5F5' }]}>
                    <Image
                        source={{ uri: item.mockImage }}
                        style={styles.cardImage}
                        resizeMode="cover"
                    />
                </View>
                {/* Overlay Badge */}
                <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>{item.tags[0]}</Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.templateName}>{item.name}</Text>
                <Text style={styles.usageCount}>{item.usageCount}</Text>

                <View style={styles.colorRow}>
                    <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                    {/* Dummy color dots */}
                    <View style={[styles.colorDot, { backgroundColor: '#757575' }]} />
                    <View style={[styles.colorDot, { backgroundColor: '#455A64' }]} />
                </View>

                <TouchableOpacity
                    style={styles.useButton}
                    onPress={() => handleUseTemplate(item.id)}
                >
                    <Text style={styles.useButtonText}>Dùng mẫu này</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tạo CV</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.marketingBanner}>
                <Text style={styles.marketingText}>
                    Tạo CV ngay để nhân đôi cơ hội trúng tuyển:
                </Text>
                <Text style={styles.bulletPoint}>• Mẫu CV chuẩn ATS, dễ dàng vượt qua vòng lọc hồ sơ.</Text>
                <Text style={styles.bulletPoint}>• Chỉ 15 phút cho 1 chiếc CV chuyên nghiệp</Text>
                <TouchableOpacity>
                    <Text style={styles.linkText}>Tải lên CV nếu đã có sẵn</Text>
                </TouchableOpacity>
            </View>

            {/* Removed filter section - only one template */}

            <FlatList
                data={CV_TEMPLATES}
                renderItem={renderTemplateItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContainer}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
    },
    marketingBanner: {
        backgroundColor: '#E8F5E9',
        padding: SPACING.md,
    },
    marketingText: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 4,
    },
    bulletPoint: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    linkText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: '#2E7D32',
        textDecorationLine: 'underline',
        marginTop: 4,
    },
    filterContainer: {
        backgroundColor: COLORS.white,
        paddingVertical: SPACING.sm,
    },
    filterScroll: {
        paddingHorizontal: SPACING.lg,
        gap: SPACING.sm,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: COLORS.gray100,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    filterChipActive: {
        backgroundColor: COLORS.white,
        borderColor: '#2E7D32', // Using Green for Active filter to match design feeling slightly
    },
    filterText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    filterTextActive: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    listContainer: {
        padding: SPACING.lg,
        gap: SPACING.lg,
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    cardImageContainer: {
        height: 300,
        backgroundColor: '#F5F5F5',
        position: 'relative',
    },
    cardImagePlaceholder: {
        width: '100%',
        height: '100%',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    badgeContainer: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    cardContent: {
        padding: SPACING.md,
    },
    templateName: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    usageCount: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginBottom: SPACING.md,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.md,
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    useButton: {
        backgroundColor: '#00C853', // Explicit Green for "Use this template" as per Image 2/3
        paddingVertical: 12,
        borderRadius: RADIUS.sm,
        alignItems: 'center',
    },
    useButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: TYPOGRAPHY.size.md,
    },
});

export default CVTemplatesScreen;
