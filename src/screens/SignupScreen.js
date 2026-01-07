/**
 * Màn hình Đăng ký
 * Chuyển đổi từ signup.html
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button, Input } from '../components';
import { useAuth } from '../context';
import { validateForm } from '../utils';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const SignupScreen = ({ navigation }) => {
    const { register } = useAuth();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        // Xóa lỗi trước đó
        setErrors({});

        // Kiểm tra form
        const validation = validateForm(
            { fullName, email, password, confirmPassword: password },
            'signup'
        );
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setLoading(true);

        try {
            const response = await register(fullName, email, password, password);

            if (response.success) {
                Alert.alert(
                    'Success',
                    'Registration successful! You can now login.',
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Login'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response.message || 'Registration failed');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An error occurred during registration');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignUp = () => {
        Alert.alert(
            'Not Available',
            'Google OAuth is not yet implemented in the backend. This feature will be available soon!'
        );
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.formContainer}>
                        {/* Tiêu đề */}
                        <Text style={styles.title}>Create Account</Text>

                        {/* Nhập Họ tên */}
                        <Input
                            label="Full Name"
                            placeholder="Nguyễn Văn A"
                            value={fullName}
                            onChangeText={setFullName}
                            autoComplete="name"
                            error={errors.fullName}
                        />

                        {/* Nhập Email */}
                        <Input
                            label="Email"
                            placeholder="vidu@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoComplete="email"
                            error={errors.email}
                        />

                        {/* Nhập Mật khẩu */}
                        <Input
                            label="Password"
                            placeholder="••••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            error={errors.password}
                        />

                        {/* Nút Đăng ký */}
                        <Button
                            variant="primary"
                            onPress={handleSignup}
                            loading={loading}
                            style={styles.button}
                        >
                            SIGN UP
                        </Button>

                        {/* Nút Đăng ký Google */}
                        <Button
                            variant="google"
                            onPress={handleGoogleSignUp}
                            icon={
                                <Feather name="mail" size={20} color={COLORS.textPrimary} />
                            }
                            style={styles.button}
                        >
                            SIGN UP WITH GOOGLE
                        </Button>

                        {/* Liên kết Đăng nhập */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                Already have an account?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.linkText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING[6],
    },
    formContainer: {
        width: '100%',
        maxWidth: 400,
        alignSelf: 'center',
    },
    title: {
        fontSize: TYPOGRAPHY.size['3xl'],
        fontWeight: TYPOGRAPHY.weight.extrabold,
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING[6],
    },
    button: {
        marginBottom: SPACING[4],
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: SPACING[4],
    },
    footerText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    linkText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.accentOrange,
        fontWeight: TYPOGRAPHY.weight.semibold,
    },
});

export default SignupScreen;
