/**
 * Màn hình Chỉnh sửa Hồ sơ
 * Màn hình để tạo/cập nhật hồ sơ người dùng
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { Button } from '../components';
import { createOrUpdateProfile } from '../services';

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const existingProfile = route.params?.profile || null;

    const [formData, setFormData] = useState({
        firstName: existingProfile?.firstName || '',
        lastName: existingProfile?.lastName || '',
        dateOfBirth: existingProfile?.dateOfBirth || '',
        address: existingProfile?.address || '',
        city: existingProfile?.city || '',
        district: existingProfile?.district || '',
        studentId: existingProfile?.studentId || '',
        university: existingProfile?.university || '',
        major: existingProfile?.major || '',
        gpa: existingProfile?.gpa?.toString() || '',
        yearOfStudy: existingProfile?.yearOfStudy?.toString() || '',
        bio: existingProfile?.bio || '',
        skills: existingProfile?.skills ? existingProfile.skills.map(s => s.skillName).join(', ') : '',
        resumeUrl: existingProfile?.resumeUrl || '',
        linkedInUrl: existingProfile?.linkedInUrl || '',
        gitHubUrl: existingProfile?.gitHubUrl || '',
    });

    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        // Xác thực cơ bản
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
            return;
        }

        try {
            setLoading(true);

            // Xử lý kỹ năng
            let skillsList = [];
            if (formData.skills.trim()) {
                skillsList = formData.skills.split(',')
                    .map(s => s.trim())
                    .filter(s => s.length > 0)
                    .map(s => ({ skillName: s }));
            }

            // Chuẩn bị dữ liệu
            const profileData = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                address: formData.address.trim() || null,
                city: formData.city.trim() || null,
                district: formData.district.trim() || null,
                studentId: formData.studentId.trim() || null,
                university: formData.university.trim() || null,
                major: formData.major.trim() || null,
                gpa: formData.gpa ? parseFloat(formData.gpa) : null,
                yearOfStudy: formData.yearOfStudy ? parseInt(formData.yearOfStudy) : null,
                bio: formData.bio.trim() || null,
                skills: skillsList,
                resumeUrl: formData.resumeUrl.trim() || null,
                linkedInUrl: formData.linkedInUrl.trim() || null,
                gitHubUrl: formData.gitHubUrl.trim() || null,
            };

            const response = await createOrUpdateProfile(profileData);

            if (response.success) {
                Alert.alert(
                    'Thành công',
                    'Hồ sơ đã được lưu thành công',
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể lưu hồ sơ');
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            Alert.alert('Lỗi', err.message || 'Đã xảy ra lỗi khi lưu hồ sơ');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label, field, placeholder, options = {}) => (
        <View style={styles.inputGroup}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    options.multiline && styles.textArea
                ]}
                placeholder={placeholder}
                value={formData[field]}
                onChangeText={(value) => updateField(field, value)}
                editable={!loading}
                {...options}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Tiêu đề */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {existingProfile ? 'Chỉnh sửa hồ sơ' : 'Tạo hồ sơ'}
                    </Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Thông tin cá nhân */}
                    <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>
                    {renderInput('Họ đệm', 'firstName', 'VD: Nguyễn Văn')}
                    {renderInput('Tên', 'lastName', 'VD: A')}
                    {renderInput('Địa chỉ', 'address', 'VD: 123 Đường ABC')}
                    {renderInput('Thành phố', 'city', 'VD: Hà Nội')}
                    {renderInput('Quận/Huyện', 'district', 'VD: Cầu Giấy')}
                    {renderInput('Giới thiệu', 'bio', 'Viết vài dòng về bản thân...', {
                        multiline: true,
                        numberOfLines: 4,
                    })}

                    {/* Các trường khác đã được chuyển sang Màn hình Tạo CV */}
                    <View style={{ marginBottom: SPACING.md }}>
                        <Text style={{ fontStyle: 'italic', color: COLORS.textSecondary }}>
                            Để chỉnh sửa Học vấn, Kỹ năng và Link CV, vui lòng sử dụng tính năng "Tạo / Sửa CV" trong màn hình Hồ sơ.
                        </Text>
                    </View>

                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color={COLORS.accentOrange} />
                        <Text style={styles.infoText}>
                            Thông tin hồ sơ giúp nhà tuyển dụng hiểu rõ hơn về bạn. Hãy điền đầy đủ để tăng cơ hội được tuyển!
                        </Text>
                    </View>
                </ScrollView>

                {/* Nút Lưu */}
                <View style={styles.footer}>
                    <Button
                        title={loading ? 'Đang lưu...' : 'Lưu hồ sơ'}
                        onPress={handleSave}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.screenBackground,
    },
    keyboardView: {
        flex: 1,
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
        fontSize: TYPOGRAPHY.size.xl,
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
    content: {
        padding: SPACING.lg,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.textPrimary,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    inputGroup: {
        marginBottom: SPACING.md,
    },
    label: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.medium,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
    },
    textArea: {
        minHeight: 100,
        textAlignVertical: 'top',
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: SPACING.md,
        borderRadius: 8,
        marginTop: SPACING.lg,
        marginBottom: SPACING.md,
    },
    infoText: {
        flex: 1,
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        marginLeft: SPACING.sm,
        lineHeight: 20,
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.gray200,
    },
});

export default EditProfileScreen;
