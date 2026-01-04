/**
 * ApplyJobScreen
 * Screen for applying to a job
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { Button } from '../components';
import { createApplication } from '../services';

const ApplyJobScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId, jobTitle } = route.params;

    const [coverLetter, setCoverLetter] = useState('');
    const [resumeUrl, setResumeUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!coverLetter.trim()) {
            newErrors.coverLetter = 'Vui lòng nhập thư xin việc';
        } else if (coverLetter.trim().length < 50) {
            newErrors.coverLetter = 'Thư xin việc phải có ít nhất 50 ký tự';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        try {
            setLoading(true);
            const response = await createApplication(
                jobId,
                coverLetter.trim(),
                resumeUrl.trim() || null
            );

            if (response.success) {
                Alert.alert(
                    'Thành công!',
                    'Đơn ứng tuyển của bạn đã được gửi thành công.',
                    [
                        {
                            text: 'Xem đơn ứng tuyển',
                            onPress: () => {
                                navigation.reset({
                                    index: 0,
                                    routes: [
                                        { name: 'Home' },
                                        { name: 'Applications' }
                                    ],
                                });
                            }
                        },
                        {
                            text: 'OK',
                            onPress: () => navigation.goBack()
                        }
                    ]
                );
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể gửi đơn ứng tuyển');
            }
        } catch (err) {
            console.error('Error submitting application:', err);
            Alert.alert(
                'Lỗi',
                err.message || 'Đã xảy ra lỗi khi gửi đơn ứng tuyển. Vui lòng thử lại.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ứng tuyển</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Job Title */}
                    <View style={styles.jobInfo}>
                        <Text style={styles.label}>Vị trí ứng tuyển</Text>
                        <Text style={styles.jobTitle}>{jobTitle}</Text>
                    </View>

                    {/* CV Section */}
                    <View style={styles.section}>
                        <Text style={styles.label}>CV / Hồ sơ</Text>
                        <Text style={styles.uploadHint}>Chọn CV để ứng tuyển</Text>

                        {/* Options */}
                        <View style={styles.cvOptions}>
                            {/* Create/Edit CV Button */}
                            <TouchableOpacity
                                style={styles.cvOptionButton}
                                onPress={() => navigation.navigate('CreateCV')}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.accentPurpleLight }]}>
                                    <Ionicons name="create-outline" size={24} color={COLORS.accentPurple} />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>Điền Form CV mẫu</Text>
                                    <Text style={styles.optionDesc}>Cập nhật thông tin profile để dùng làm CV</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
                            </TouchableOpacity>

                            {/* Upload Link Button */}
                            <TouchableOpacity
                                style={styles.cvOptionButton}
                                onPress={() => {
                                    Alert.prompt(
                                        'Link CV',
                                        'Dán link CV vào đây (Google Drive, Dropbox...)',
                                        (text) => setResumeUrl(text),
                                        'plain-text',
                                        resumeUrl
                                    );
                                }}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: COLORS.accentOrangeLight }]}>
                                    <Ionicons name="link-outline" size={24} color={COLORS.accentOrange} />
                                </View>
                                <View style={styles.optionTextContainer}>
                                    <Text style={styles.optionTitle}>Upload Link CV</Text>
                                    <Text style={styles.optionDesc}>Sử dụng CV có sẵn (PDF link)</Text>
                                </View>
                                {resumeUrl ? (
                                    <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
                                ) : (
                                    <Ionicons name="add-circle-outline" size={24} color={COLORS.gray400} />
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Selected CV Display */}
                        {resumeUrl && (
                            <View style={styles.selectedCV}>
                                <Text style={styles.selectedLabel}>CV đang chọn:</Text>
                                <Text style={styles.selectedValue} numberOfLines={1}>{resumeUrl}</Text>
                                <TouchableOpacity onPress={() => setResumeUrl('')}>
                                    <Text style={styles.removeText}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {!resumeUrl && (
                            <Text style={styles.hint}>Nếu không nhập link CV, hệ thống sẽ sử dụng thông tin trong Profile của bạn.</Text>
                        )}
                    </View>

                    {/* Information Section */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Information <Text style={styles.required}>*</Text>
                        </Text>
                        <Text style={styles.uploadHint}>Explain why you are the right person for this job</Text>
                        <TextInput
                            style={[
                                styles.textArea,
                                errors.coverLetter && styles.inputError
                            ]}
                            placeholder="Viết về bản thân, kinh nghiệm và lý do bạn phù hợp với vị trí này..."
                            multiline
                            numberOfLines={8}
                            textAlignVertical="top"
                            value={coverLetter}
                            onChangeText={(text) => {
                                setCoverLetter(text);
                                if (errors.coverLetter) {
                                    setErrors({ ...errors, coverLetter: null });
                                }
                            }}
                            editable={!loading}
                        />
                        {errors.coverLetter ? (
                            <Text style={styles.errorText}>{errors.coverLetter}</Text>
                        ) : null}
                        <Text style={styles.hint}>
                            Tối thiểu 50 ký tự ({coverLetter.length}/50)
                        </Text>
                    </View>

                    {/* Info Note */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle" size={20} color={COLORS.accentOrange} />
                        <Text style={styles.infoText}>
                            Nhà tuyển dụng sẽ xem xét đơn ứng tuyển của bạn và liên hệ qua email hoặc số điện thoại trong hồ sơ.
                        </Text>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View style={styles.footer}>
                    <Button
                        title={loading ? 'Đang gửi...' : 'Gửi đơn ứng tuyển'}
                        onPress={handleSubmit}
                        disabled={loading}
                        style={styles.submitButton}
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
    jobInfo: {
        backgroundColor: COLORS.white,
        padding: SPACING.md,
        borderRadius: 12,
        marginBottom: SPACING.lg,
    },
    jobTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        fontFamily: TYPOGRAPHY.fontFamily.heading,
        color: COLORS.accentOrange,
        marginTop: 4,
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
    required: {
        color: COLORS.error,
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
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: TYPOGRAPHY.size.md,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textPrimary,
        minHeight: 150,
    },
    inputError: {
        borderColor: COLORS.error,
    },
    errorText: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.error,
        marginTop: 4,
    },
    hint: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    uploadHint: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.white,
        borderWidth: 2,
        borderColor: COLORS.accentOrange,
        borderStyle: 'dashed',
        borderRadius: 12,
        padding: SPACING.lg,
        gap: SPACING.sm,
    },
    uploadText: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.medium,
        color: COLORS.accentOrange,
    },
    uploadedFile: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        padding: SPACING.md,
        gap: SPACING.sm,
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textPrimary,
    },
    fileSize: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginTop: 2,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#FFF3E0',
        padding: SPACING.md,
        borderRadius: 8,
        marginTop: SPACING.md,
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
    submitButton: {
        width: '100%',
    },
    cvOptions: {
        gap: SPACING.md,
        marginBottom: SPACING.md,
    },
    cvOptionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray200,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    optionDesc: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    selectedCV: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: SPACING.md,
        borderRadius: 8,
        marginTop: SPACING.sm,
    },
    selectedLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginRight: SPACING.sm,
    },
    selectedValue: {
        flex: 1,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '500',
        color: COLORS.textPrimary,
        marginRight: SPACING.sm,
    },
    removeText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.error,
        fontWeight: '500',
    },
});

export default ApplyJobScreen;
