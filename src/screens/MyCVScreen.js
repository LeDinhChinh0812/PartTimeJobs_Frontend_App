
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Linking,
    Modal,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';
import { useAuth } from '../context';
import { getMyProfile, createOrUpdateProfile, deleteProfile } from '../services';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MyCVScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedCVType, setSelectedCVType] = useState(null); // 'created' hoặc 'uploaded'
    const [localCVUri, setLocalCVUri] = useState(null);

    // Sử dụng màu chủ đạo của ứng dụng (Cam)
    const PRIMARY_COLOR = COLORS.accentOrange || '#FF5722';

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await getMyProfile();
            if (response.success && response.data) {
                setProfile(response.data);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProfile();
            // Lấy đường dẫn CV cục bộ
            AsyncStorage.getItem('LOCAL_CV_URI').then(uri => {
                if (uri) setLocalCVUri(uri);
            });
        }, [])
    );

    const handleDeleteCV = async () => {
        Alert.alert(
            'Xóa CV',
            'Bạn có chắc chắn muốn xóa CV này không?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setModalVisible(false);
                            setLoading(true);
                            // Determine what to delete based on selectedCVType
                            // If 'created' -> clear profile fields.
                            // If 'uploaded' -> clear resumeUrl.

                            // Xây dựng payload để update, giữ nguyên các dữ liệu khác
                            const p = profile;
                            const updatePayload = {
                                fullName: p.fullName,
                                email: p.email,
                                phoneNumber: p.phoneNumber,
                                address: p.address,
                                bio: p.bio,
                                dateOfBirth: p.dateOfBirth,
                                university: p.university,
                                major: p.major,
                                gpa: p.gpa,
                                skills: p.skills,
                                resumeUrl: p.resumeUrl
                            };

                            if (selectedCVType === 'created') {
                                // Xóa các trường của CV Hệ thống
                                updatePayload.major = '';
                                updatePayload.university = '';
                                updatePayload.skills = [];
                                updatePayload.bio = '';
                                // Lưu ý: Giữ lại thông tin cá nhân (tên, email)
                            } else if (selectedCVType === 'uploaded') {
                                updatePayload.resumeUrl = '';
                            }

                            const response = await createOrUpdateProfile(updatePayload);
                            if (response.success) {
                                Alert.alert('Thành công', 'Đã xóa CV');
                                fetchProfile();
                            } else {
                                Alert.alert('Lỗi', 'Không thể xóa CV');
                            }
                        } catch (error) {
                            console.error('Delete error', error);
                            Alert.alert('Lỗi', 'Đã xảy ra lỗi khi xóa CV');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleMenuPress = (type) => {
        setSelectedCVType(type);
        setModalVisible(true);
    };

    const handleViewCV = (url) => {
        if (!url) return;

        // Xử lý File URI cục bộ - Mở trình xem trong App
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

    // --- Renderers ---

    const renderFileCard = (type, title, date, onPressView, onPressEdit, onPressMenu) => (
        <View style={styles.fileCard}>
            <View style={styles.fileIconContainer}>
                <Ionicons name="document-text" size={36} color={PRIMARY_COLOR} />
            </View>
            <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{title}</Text>
                <Text style={styles.fileDate}>{date}</Text>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <TouchableOpacity onPress={onPressView}>
                        <Text style={[styles.fileLink, { color: PRIMARY_COLOR }]}>Xem</Text>
                    </TouchableOpacity>
                    {onPressEdit && (
                        <TouchableOpacity onPress={onPressEdit}>
                            <Text style={[styles.fileLink, { color: PRIMARY_COLOR }]}>Sửa</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => onPressMenu && onPressMenu(type)}>
                <Ionicons name="ellipsis-vertical" size={20} color={COLORS.gray500} />
            </TouchableOpacity>
        </View>
    );

    const renderEmptySection = (title, icon, description, buttonText, onPress) => (
        <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={styles.emptyCard}>
                <View style={[styles.iconContainer, { opacity: 0.3 }]}>
                    <Ionicons name={icon || "folder-open-outline"} size={64} color={COLORS.gray400} />
                </View>
                <Text style={styles.emptyText}>{description}</Text>
                <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: PRIMARY_COLOR }]}
                    onPress={onPress}
                >
                    <Ionicons name="add" size={20} color={COLORS.white} />
                    <Text style={styles.buttonText}>{buttonText}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading && !profile) {
        return (
            <View style={[styles.container, styles.center]}>
                <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            </View>
        );
    }

    // Logic cho "CV Đã tạo": Kiểm tra xem trường ngành học hoặc trường đại học có dữ liệu không
    const hasCreatedCV = profile && (profile.major || profile.university);
    // Logic cho "CV Đã tải lên": Kiểm tra resumeUrl
    const hasUploadedCV = profile && profile.resumeUrl && profile.resumeUrl.length > 5;

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>CV của tôi</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Created CV Section */}
                {hasCreatedCV ? (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>CV đã tạo trên Job Finder</Text>
                        {renderFileCard(
                            'created',
                            `CV_${profile.fullName || user?.fullName || 'User'}`,
                            'Cập nhật: Mới nhất',
                            () => navigation.navigate('CreateCV'), // View -> Edit Screen (Visual)
                            () => navigation.navigate('CreateCV'),   // Edit -> Edit Screen
                            handleMenuPress
                        )}
                    </View>
                ) : (
                    renderEmptySection('CV đã tạo trên Job Finder', 'folder-open-outline', 'Chưa có CV nào được tạo', 'Tạo CV', () => navigation.navigate('CVTemplates'))
                )}

                {/* Uploaded CV Section */}
                {hasUploadedCV ? (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>CV đã tải lên Job Finder</Text>
                        {renderFileCard(
                            'uploaded',
                            'CV_Upload.pdf', // Or parse filename from URL if possible
                            'Đã tải lên',
                            () => handleViewCV(profile.resumeUrl),
                            null, // Edit not really applicable for upload unless re-upload
                            handleMenuPress
                        )}
                    </View>
                ) : (
                    renderEmptySection('CV đã tải lên Job Finder', 'cloud-upload-outline', 'Chưa có CV nào được tải lên', 'Tải CV lên', () => navigation.navigate('UploadCV'))
                )}


            </ScrollView>

            {/* Bottom Sheet Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Tuỳ chọn</Text>
                                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                                        <Ionicons name="close" size={24} color={COLORS.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity style={styles.modalItem} onPress={() => { setModalVisible(false); if (selectedCVType === 'created') navigation.navigate('CreateCV'); else if (selectedCVType === 'uploaded') handleViewCV(profile.resumeUrl); }}>
                                    <Ionicons name="eye-outline" size={22} color={COLORS.textPrimary} />
                                    <Text style={styles.modalItemText}>Xem</Text>
                                </TouchableOpacity>

                                {selectedCVType === 'created' && (
                                    <TouchableOpacity style={styles.modalItem} onPress={() => { setModalVisible(false); navigation.navigate('CreateCV'); }}>
                                        <Ionicons name="create-outline" size={22} color={COLORS.textPrimary} />
                                        <Text style={styles.modalItemText}>Cập nhật</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity style={styles.modalItem} onPress={() => { setModalVisible(false); Alert.alert('Tính năng đang phát triển', 'Chức năng đặt làm CV chính sẽ sớm ra mắt!'); }}>
                                    <Ionicons name="star-outline" size={22} color={COLORS.textPrimary} />
                                    <Text style={styles.modalItemText}>Đặt làm CV chính</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalItem} onPress={() => { setModalVisible(false); Alert.alert('Tính năng đang phát triển', 'Chức năng tải xuống sẽ sớm ra mắt!'); }}>
                                    <Ionicons name="download-outline" size={22} color={COLORS.textPrimary} />
                                    <Text style={styles.modalItemText}>Tải xuống</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.modalItem} onPress={() => { setModalVisible(false); Alert.alert('Tính năng đang phát triển', 'Chức năng chia sẻ sẽ sớm ra mắt!'); }}>
                                    <Ionicons name="share-social-outline" size={22} color={COLORS.textPrimary} />
                                    <Text style={styles.modalItemText}>Chia sẻ</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[styles.modalItem, { borderBottomWidth: 0 }]} onPress={handleDeleteCV}>
                                    <Ionicons name="trash-outline" size={22} color={COLORS.error || 'red'} />
                                    <Text style={[styles.modalItemText, { color: COLORS.error || 'red' }]}>Xóa</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.screenBackground || '#F5F5F5',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: 12,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    contentContainer: {
        padding: SPACING.lg,
        gap: SPACING.xl,
        paddingBottom: 40,
    },
    sectionContainer: {
        gap: SPACING.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 8,
    },
    emptyCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: COLORS.gray300,
        height: 200,
    },
    fileCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.md,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.gray200,
        // Shadow if needed
    },
    fileIconContainer: {
        marginRight: 16,
    },
    fileInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    fileName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    fileDate: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    fileLink: {
        fontSize: 14,
        fontWeight: '600',
        marginRight: 10,
    },
    editButton: {
        padding: 8,
    },
    iconContainer: {
        marginBottom: 16,
        opacity: 0.5,
    },
    emptyText: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 16,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        gap: 6,
    },
    buttonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        gap: 15,
    },
    modalItemText: {
        fontSize: 16,
        color: COLORS.textPrimary,
    },
    // End of file styles
});

export default MyCVScreen;
