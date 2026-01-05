import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

/* Màn hình xem PDF
 * Sử dụng react-native-webview để hiển thị file PDF
 */
const PDFViewerScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { uri, title } = route.params;
    const [loading, setLoading] = useState(true);

    const handleShare = async () => {
        try {
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Lỗi', 'Thiết bị không hỗ trợ chia sẻ.');
            }
        } catch (error) {
            console.error('Share error:', error);
            Alert.alert('Lỗi', 'Không thể chia sẻ file này.');
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            {/* Header / Thanh tiêu đề */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title || 'Xem tài liệu'}</Text>
                <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                    <Ionicons name="share-outline" size={24} color={COLORS.textPrimary} />
                </TouchableOpacity>
            </View>

            {/* Vùng hiển thị nội dung */}
            <View style={styles.content}>
                <WebView
                    source={{ uri: uri }}
                    style={styles.webview}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={COLORS.accentOrange} />
                        </View>
                    )}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.warn('WebView error: ', nativeEvent);
                        // On Android, local file PDF might fail.
                    }}
                    originWhitelist={['*']}
                    allowFileAccess={true}
                    allowFileAccessFromFileURLs={true}
                    allowUniversalAccessFromFileURLs={true}
                />

                {/* Gợi ý cho Android (Nếu không hiển thị trực tiếp được) */}
                {Platform.OS === 'android' && (
                    <View style={styles.androidHint}>
                        <TouchableOpacity onPress={handleShare} style={styles.fallbackButton}>
                            <Text style={styles.fallbackText}>Mở bằng ứng dụng khác</Text>
                            <Ionicons name="open-outline" size={16} color="white" style={{ marginLeft: 4 }} />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
        backgroundColor: COLORS.white,
    },
    iconButton: {
        padding: 8,
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textPrimary,
        textAlign: 'center',
        marginHorizontal: 8,
    },
    content: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    webview: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    androidHint: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    fallbackButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accentOrange,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    fallbackText: {
        color: 'white',
        fontWeight: 'bold',
    }
});

export default PDFViewerScreen;
