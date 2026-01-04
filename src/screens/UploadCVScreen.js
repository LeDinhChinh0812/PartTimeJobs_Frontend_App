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
import { COLORS } from '../constants'; // Ensure existing constants
import { createOrUpdateProfile } from '../services';

const UploadCVScreen = () => {
    const navigation = useNavigation();
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileSize, setFileSize] = useState(null);
    const [fileUri, setFileUri] = useState('');

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
            }
        } catch (err) {
            console.warn('Error picking document', err);
        }
    };

    const handleRemoveFile = () => {
        setFileName('');
        setFileUri('');
        setFileSize(null);
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

            // SIMULATION: Mock URL for now as requested by user context implies specific backend flow
            const mockUrl = `https://jobfinder.com/cv/${fileName}`;

            const updatePayload = {
                resumeUrl: mockUrl
            };

            const response = await createOrUpdateProfile(updatePayload);

            if (response.success || response.data) {
                Alert.alert('Thành công', 'CV đã được tải lên.', [
                    { text: 'OK', onPress: () => navigation.navigate('MyCV') }
                ]);
            } else {
                throw new Error(response.message || 'Upload failed');
            }

        } catch (err) {
            console.error('Upload Error:', err);
            Alert.alert('Lỗi', 'Không thể tải lên CV lúc này.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tải CV lên</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Banner */}
            <View style={styles.banner}>
                <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>Upload CV để các cơ hội việc làm tự tìm đến bạn</Text>
                    <Text style={styles.bannerSubtitle}>
                        Giảm đến 50% thời gian cần thiết để tìm được một công việc phù hợp
                    </Text>
                </View>
                <Ionicons name="document-text" size={80} color="#4CAF50" style={styles.bannerIcon} />
            </View>

            {/* Content */}
            <View style={styles.content}>
                {fileUri ? (
                    <View style={styles.fileItem}>
                        <Ionicons name="document-text-outline" size={32} color="#4CAF50" />
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

            {/* Footer */}
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
        paddingHorizontal: 16, paddingVertical: 12, // borderBottomWidth: 1, borderBottomColor: '#EEE',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold' },

    banner: {
        backgroundColor: '#E8F5E9', padding: 20, flexDirection: 'row',
        alignItems: 'center', justifyContent: 'space-between',
    },
    bannerContent: { flex: 1, marginRight: 10 },
    bannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20', marginBottom: 8 },
    bannerSubtitle: { fontSize: 13, color: '#4CAF50' },
    bannerIcon: {},

    content: { flex: 1, padding: 20 },

    uploadBox: {
        borderWidth: 1, borderColor: '#A5D6A7', borderStyle: 'dashed', borderRadius: 8,
        height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF',
        padding: 20,
    },
    cloudIconBg: {
        backgroundColor: '#81C784', borderRadius: 50, padding: 10, marginBottom: 12,
    },
    uploadTitle: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
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
        backgroundColor: '#00C853', paddingVertical: 14, borderRadius: 8, alignItems: 'center',
    },
    disabledButton: { backgroundColor: '#A5D6A7' },
    uploadButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default UploadCVScreen;
