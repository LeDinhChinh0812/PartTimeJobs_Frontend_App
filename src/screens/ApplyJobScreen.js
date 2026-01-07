/**
 * ApplyJobScreen
 * Màn hình ứng tuyển công việc
 */

import React, { useState, useEffect } from 'react';
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
    Modal,
    TouchableWithoutFeedback,
    Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';
import { Button } from '../components';
import { createApplication } from '../services';
import { getMyProfile } from '../services';
import { useAuth } from '../context';

const ApplyJobScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { jobId, jobTitle } = route.params;
    const { user } = useAuth();

    const [coverLetter, setCoverLetter] = useState('');
    const [selectedCVType, setSelectedCVType] = useState('library'); // 'library' hoặc 'upload'
    const [selectedCV, setSelectedCV] = useState(null); // CV được chọn từ thư viện
    const [uploadedCVUrl, setUploadedCVUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [modalVisible, setModalVisible] = useState(false);
    const [profile, setProfile] = useState(null);
    const [localCVUri, setLocalCVUri] = useState(null);

    // Sử dụng màu chủ đề ứng dụng  
    const PRIMARY_COLOR = COLORS.accentOrange || '#FF8A3C';

    useEffect(() => {
        fetchProfile();
        // Lấy đường dẫn CV cục bộ
        AsyncStorage.getItem('LOCAL_CV_URI').then(uri => {
            if (uri) setLocalCVUri(uri);
        });
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await getMyProfile();
            if (response.success && response.data) {
                setProfile(response.data);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!coverLetter.trim()) {
            newErrors.coverLetter = 'Vui lòng nhập thư giới thiệu';
        } else if (coverLetter.trim().length < 50) {
            newErrors.coverLetter = 'Thư giới thiệu phải có ít nhất 50 ký tự';
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

            // Xác định URL CV cần sử dụng
            let cvUrl = '';
            if (selectedCVType === 'upload' && uploadedCVUrl) {
                cvUrl = uploadedCVUrl;
            } else if (selectedCVType === 'library' && selectedCV) {
                // selectedCV có thể là 'created' hoặc URL đã tải lên
                if (selectedCV === 'created') {
                    cvUrl = ''; // Sử dụng hồ sơ
                } else {
                    cvUrl = selectedCV; // Sử dụng URL CV đã tải lên
                }
            }

            const response = await createApplication(
                jobId,
                coverLetter.trim(),
                cvUrl || null
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

    const hasCreatedCV = profile && (profile.major || profile.university);
    const hasUploadedCV = profile && profile.resumeUrl && profile.resumeUrl.length > 5;

    const handleViewCV = (url) => {
        if (!url) return;

        // Xử lý File URI cục bộ
        if (url.startsWith('file://') || url.startsWith('/')) {
            navigation.navigate('PDFViewer', {
                uri: url,
                title: url.split('/').pop()
            });
            return;
        }

        // Nếu là Mock URL, thử mở file cục bộ đã lưu
        if (url.includes('jobfinder.com') || url.includes('mock') || url.includes('example')) {
            if (localCVUri) {
                navigation.navigate('PDFViewer', {
                    uri: localCVUri,
                    title: 'CV_Upload.pdf'
                });
                return;
            }
            Alert.alert('Chưa có file', 'Vui lòng tải lên CV để xem.');
        } else {
            Linking.openURL(url);
        }
    };

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
                    <Text style={styles.headerTitle}>Ứng tuyển</Text>
                    <View style={styles.placeholder} />
                </View>

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Phần ứng tuyển CV */}
                    <View style={styles.section}>
                        <Text style={styles.label}>CV ứng tuyển</Text>

                        {/* Tùy chọn CV từ thư viện */}
                        <TouchableOpacity
                            style={[
                                styles.cvOptionCard,
                                selectedCVType === 'library' && styles.selectedCard
                            ]}
                            onPress={() => setSelectedCVType('library')}
                        >
                            <View style={styles.radioContainer}>
                                <View style={[
                                    styles.radioOuter,
                                    selectedCVType === 'library' && { borderColor: PRIMARY_COLOR }
                                ]}>
                                    {selectedCVType === 'library' && (
                                        <View style={[styles.radioInner, { backgroundColor: PRIMARY_COLOR }]} />
                                    )}
                                </View>
                            </View>
                            <View style={styles.cvOptionContent}>
                                <Text style={styles.cvOptionTitle}>CV từ thư viện của tôi</Text>

                                {selectedCVType === 'library' && (
                                    <View style={{ marginTop: 8, paddingLeft: 0 }}>
                                        {hasCreatedCV && (
                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                                                onPress={() => setSelectedCV('created')}
                                            >
                                                <Ionicons
                                                    name={selectedCV === 'created' ? "radio-button-on" : "radio-button-off"}
                                                    size={20}
                                                    color={PRIMARY_COLOR}
                                                />
                                                <Text style={{ marginLeft: 8, fontSize: 14, color: COLORS.textPrimary, flex: 1 }}>
                                                    CV Online: {profile?.fullName || 'User'}
                                                </Text>
                                                <TouchableOpacity onPress={() => navigation.navigate('CVPreview', { profile })}>
                                                    <Text style={{ color: PRIMARY_COLOR, fontWeight: 'bold', fontSize: 13, paddingHorizontal: 8 }}>Xem</Text>
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        )}
                                        {hasUploadedCV && (
                                            <TouchableOpacity
                                                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}
                                                onPress={() => setSelectedCV(profile.resumeUrl)}
                                            >
                                                <Ionicons
                                                    name={selectedCV !== 'created' ? "radio-button-on" : "radio-button-off"}
                                                    size={20}
                                                    color={PRIMARY_COLOR}
                                                />
                                                <Text style={{ marginLeft: 8, fontSize: 14, color: COLORS.textPrimary, flex: 1 }}>
                                                    CV Upload: {profile.resumeUrl.split('/').pop()}
                                                </Text>
                                                <TouchableOpacity onPress={() => handleViewCV(profile.resumeUrl)}>
                                                    <Text style={{ color: PRIMARY_COLOR, fontWeight: 'bold', fontSize: 13, paddingHorizontal: 8 }}>Xem</Text>
                                                </TouchableOpacity>
                                            </TouchableOpacity>
                                        )}
                                        {!hasCreatedCV && !hasUploadedCV && (
                                            <Text style={styles.cvOptionHint}>Chưa có CV nào trong thư viện</Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Tùy chọn tải lên CV */}
                        <TouchableOpacity
                            style={[
                                styles.cvOptionCard,
                                selectedCVType === 'upload' && styles.selectedCard
                            ]}
                            onPress={() => setSelectedCVType('upload')}
                        >
                            <View style={styles.radioContainer}>
                                <View style={[
                                    styles.radioOuter,
                                    selectedCVType === 'upload' && { borderColor: PRIMARY_COLOR }
                                ]}>
                                    {selectedCVType === 'upload' && (
                                        <View style={[styles.radioInner, { backgroundColor: PRIMARY_COLOR }]} />
                                    )}
                                </View>
                            </View>
                            <View style={styles.cvOptionContent}>
                                <Text style={styles.cvOptionTitle}>Tải CV lên từ điện thoại</Text>
                                {selectedCVType === 'upload' && !uploadedCVUrl && (
                                    <View style={styles.uploadArea}>
                                        <Ionicons name="cloud-upload-outline" size={32} color={PRIMARY_COLOR} />
                                        <Text style={styles.uploadText}>Nhấn để tải lên</Text>
                                        <Text style={styles.uploadHint}>Hỗ trợ định dạng .doc, .docx, pdf có kích thước dưới 5MB</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Phần Thư giới thiệu */}
                    <View style={styles.section}>
                        <Text style={styles.label}>
                            Thư giới thiệu <Text style={styles.required}>*</Text>
                        </Text>
                        <Text style={styles.uploadHint}>Viết giới thiệu ngắn gọn về bản thân (điểm mạnh, điểm yếu) và nêu rõ mong muốn, lý do làm việc tại công ty này</Text>
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
                    </View>
                </ScrollView>

                {/* Nút Gửi */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitButtonDirect, loading && styles.disabledButton]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#FFF" />
                        ) : (
                            <Text style={styles.submitButtonText}>Ứng tuyển</Text>
                        )}
                    </TouchableOpacity>
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
    section: {
        marginBottom: SPACING.xl,
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
    uploadHint: {
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily.primary,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
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
    cvOptionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: COLORS.gray200,
        marginBottom: SPACING.md,
    },
    selectedCard: {
        borderColor: COLORS.accentOrange,
        backgroundColor: '#FFF8F5',
    },
    radioContainer: {
        marginRight: SPACING.md,
    },
    radioOuter: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: COLORS.gray300,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    cvOptionContent: {
        flex: 1,
    },
    cvOptionTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    cvOptionSelected: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.accentOrange,
        fontWeight: '500',
    },
    cvOptionHint: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    uploadArea: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.lg,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: COLORS.accentOrange,
        borderRadius: 8,
        marginTop: SPACING.sm,
        backgroundColor: '#FFF8F5',
    },
    uploadText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textPrimary,
        marginTop: SPACING.sm,
        fontWeight: '500',
    },
    uploadHint: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
        marginTop: 4,
        textAlign: 'center',
        paddingHorizontal: SPACING.md,
    },

    // Styles cho Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: SPACING.lg,
        paddingBottom: 40,
        maxHeight: '70%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    modalTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textPrimary,
    },
    cvSection: {
        marginBottom: SPACING.lg,
    },
    cvSectionTitle: {
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.textSecondary,
        marginBottom: SPACING.sm,
        letterSpacing: 0.5,
    },
    cvItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.gray200,
        marginBottom: SPACING.sm,
    },
    selectedCVItem: {
        borderColor: COLORS.accentOrange,
        backgroundColor: '#FFF8F5',
    },
    cvItemContent: {
        flex: 1,
        marginLeft: SPACING.sm,
    },
    cvItemTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textPrimary,
        marginBottom: 2,
    },
    cvItemDate: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    viewLink: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weight.semibold,
        marginLeft: SPACING.sm,
    },
    emptyCVContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: SPACING.xl * 2,
    },
    emptyCVText: {
        fontSize: TYPOGRAPHY.size.md,
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        marginBottom: SPACING.lg,
    },
    createCVButton: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: 20,
    },
    createCVText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
    submitButtonDirect: {
        backgroundColor: COLORS.primary || '#1E0E62',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    submitButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.7,
    },
});

export default ApplyJobScreen;
