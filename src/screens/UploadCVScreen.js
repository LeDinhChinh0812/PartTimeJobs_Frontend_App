import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../constants';
import { createOrUpdateProfile, getMyProfile, uploadFile } from '../services';

const UploadCVScreen = () => {
    const navigation = useNavigation();
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(null);
    const [fileUri, setFileUri] = useState('');
    const [fileType, setFileType] = useState('');

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                setFileName(asset.name);
                setFileUri(asset.uri);
                setFileSize(asset.size); // bytes
                setFileType(asset.mimeType);
            }
        } catch (err) {
            console.warn('Error picking document', err);
        }
    };

    const handleRemoveFile = () => {
        setFileName('');
        setFileUri('');
        setFileSize(null);
        setFileType('');
    };

    const formatSize = (bytes) => {
        if (!bytes) return '';
        const mb = bytes / (1024 * 1024);
        if (mb >= 1) return `${mb.toFixed(1)}MB`;
        const kb = bytes / 1024;
        return `${kb.toFixed(0)}KB`;
    };

    const handleUpload = async () => {
        if (!fileUri) {
            Alert.alert('Chưa chọn file', 'Vui lòng chọn CV để tải lên.');
            return;
        }

        try {
            setUploading(true);

            // 1. Upload file to backend
            const fileData = {
                uri: fileUri,
                name: fileName,
                mimeType: fileType
            };

            console.log('Uploading file:', fileName);
            const uploadResponse = await uploadFile(fileData);
            console.log('Upload response:', uploadResponse);

            // Identify URL from response
            let uploadedUrl = null;

            console.log('Upload Raw Response:', JSON.stringify(uploadResponse));

            if (uploadResponse) {
                if (typeof uploadResponse === 'string') {
                    uploadedUrl = uploadResponse;
                } else if (typeof uploadResponse === 'object') {
                    // Check common fields at root
                    if (uploadResponse.filePath) uploadedUrl = uploadResponse.filePath;
                    else if (uploadResponse.url) uploadedUrl = uploadResponse.url;
                    else if (uploadResponse.link) uploadedUrl = uploadResponse.link;

                    // Check inside 'data' property (common API pattern)
                    else if (uploadResponse.data) {
                        if (typeof uploadResponse.data === 'string') {
                            uploadedUrl = uploadResponse.data;
                        } else if (typeof uploadResponse.data === 'object') {
                            if (uploadResponse.data.filePath) uploadedUrl = uploadResponse.data.filePath;
                            else if (uploadResponse.data.url) uploadedUrl = uploadResponse.data.url;
                            else if (uploadResponse.data.link) uploadedUrl = uploadResponse.data.link;
                        }
                    }
                }
            }

            if (!uploadedUrl) {
                console.warn('Could not extract URL from response:', uploadResponse);
                throw new Error('Không nhận được đường dẫn file từ server. (Response format unknown)');
            }

            // 2. Fetch existing profile to preserve other fields
            let existingParams = {};
            try {
                const profileRes = await getMyProfile();
                if (profileRes.success && profileRes.data) {
                    const p = profileRes.data;
                    existingParams = {
                        fullName: p.fullName,
                        email: p.email,
                        phoneNumber: p.phoneNumber,
                        address: p.address,
                        bio: p.bio,
                        dateOfBirth: p.dateOfBirth ? p.dateOfBirth.split('T')[0] : null,
                        university: p.university,
                        major: p.major,
                        gpa: p.gpa,
                        skills: p.skills,
                    };
                }
            } catch (fetchErr) {
                console.warn('Could not fetch existing profile', fetchErr);
            }

            // 3. Update profile with new resumeUrl
            const updatePayload = {
                ...existingParams,
                resumeUrl: uploadedUrl
            };

            const response = await createOrUpdateProfile(updatePayload);

            if (response.success || response.data) {
                Alert.alert('Thành công', 'CV đã được tải lên.', [
                    { text: 'OK', onPress: () => navigation.navigate('MyCV') }
                ]);
            } else {
                throw new Error(response.message || 'Update profile failed');
            }

        } catch (err) {
            console.error('Upload Process Error:', err);
            Alert.alert('Lỗi', `Không thể tải lên CV. ${(err.message || '')}`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tải CV lên</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.banner}>
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>Upload CV để các cơ hội việc làm tự tìm đến bạn</Text>
                    <Text style={styles.bannerSubtitle}>
                        Giảm đến 50% thời gian cần thiết để tìm được một công việc phù hợp
                    </Text>
                </View>
                <Ionicons name="document-text" size={80} color={COLORS.accentOrange} />
            </View>

            <View style={styles.content}>
                {fileUri ? (
                    <View style={styles.fileItem}>
                        <Ionicons name="document-text-outline" size={32} color={COLORS.accentOrange} />
                        <View style={styles.fileInfo}>
                            <Text style={styles.fileName} numberOfLines={1}>{fileName}</Text>
                            <Text style={styles.fileSize}>{formatSize(fileSize)}</Text>
                        </View>
                        <TouchableOpacity onPress={handleRemoveFile}>
                            <Ionicons name="close" size={20} color="#666" />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity style={styles.uploadBox} onPress={handlePickDocument}>
                        <View style={styles.cloudIconBg}>
                            <Ionicons name="cloud-upload" size={32} color="#FFF" />
                        </View>
                        <Text style={styles.uploadTitle}>Nhấn để tải lên</Text>
                        <Text style={styles.uploadHint}>
                            Hỗ trợ định dạng .doc, .docx, pdf có kích thước dưới 5MB
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.uploadButton, (!fileUri || uploading) && styles.disabledButton]}
                    onPress={handleUpload}
                    disabled={!fileUri || uploading}
                >
                    <Text style={styles.uploadButtonText}>
                        {uploading ? 'Đang tải...' : 'Tải CV lên'}
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 16, paddingVertical: 12,
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },

    banner: {
        backgroundColor: '#FFF3E0', padding: 20, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
    },
    bannerContent: { flex: 1, marginRight: 10 },
    bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
    bannerSubtitle: { fontSize: 13, color: COLORS.accentOrange },
    bannerIcon: {},

    content: { flex: 1, padding: 20 },

    uploadBox: {
        borderWidth: 1, borderColor: '#FFCC80', borderStyle: 'dashed', borderRadius: 8,
        height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF',
        padding: 20,
    },
    cloudIconBg: {
        backgroundColor: COLORS.accentOrange, borderRadius: 50, padding: 10, marginBottom: 12,
    },
    uploadTitle: { fontSize: 16, fontWeight: 'bold', color: '#E65100', marginBottom: 8 },
    uploadHint: { fontSize: 12, color: '#757575', textAlign: 'center' },

    fileItem: {
        backgroundColor: '#F5F5F5', borderRadius: 8, padding: 16,
        flexDirection: 'row', alignItems: 'center',
    },
    fileInfo: { flex: 1, marginHorizontal: 12 },
    fileName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    fileSize: { fontSize: 12, color: '#666', marginTop: 2 },

    footer: { padding: 20 },
    uploadButton: {
        backgroundColor: COLORS.accentOrange, paddingVertical: 14, borderRadius: 8, alignItems: 'center',
    },
    disabledButton: { backgroundColor: '#FFE0B2' },
    uploadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default UploadCVScreen;
