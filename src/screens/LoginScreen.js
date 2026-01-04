/**
 * Login Screen
 * Migrated from login.html
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
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const LoginScreen = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // Clear previous errors
        setErrors({});

        // Validate form
        const validation = validateForm({ email, password }, 'login');
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        setLoading(true);

        try {
            const response = await login(email, password);

            if (response.success) {
                // Navigation handled by AppNavigator based on auth state
            } else {
                Alert.alert('Error', response.message || 'Login failed');
            }
        } catch (error) {
            Alert.alert('Error', error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = () => {
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
                        {/* Header */}
                        <Text style={styles.title}>Welcome Back</Text>

                        {/* Email Input */}
                        <Input
                            label="Email"
                            placeholder="vidu@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoComplete="email"
                            error={errors.email}
                        />

                        {/* Password Input */}
                        <Input
                            label="Password"
                            placeholder="••••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoComplete="password"
                            error={errors.password}
                        />

                        {/* Remember Me & Forgot Password */}
                        <View style={styles.rowContainer}>
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => setRememberMe(!rememberMe)}
                            >
                                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                                    {rememberMe && <Feather name="check" size={14} color={COLORS.white} />}
                                </View>
                                <Text style={styles.checkboxLabel}>Remember me</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotLink}>Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Button */}
                        <Button
                            variant="primary"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.button}
                        >
                            LOGIN
                        </Button>

                        {/* Google Sign In Button */}
                        <Button
                            variant="google"
                            onPress={handleGoogleSignIn}
                            icon={
                                <Feather name="mail" size={20} color={COLORS.textPrimary} />
                            }
                            style={styles.button}
                        >
                            SIGN IN WITH GOOGLE
                        </Button>

                        {/* Sign Up Link */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>
                                You don't have an account yet?{' '}
                            </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                                <Text style={styles.linkText}>Sign up</Text>
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
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING[6],
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: COLORS.accentPurple,
        marginRight: SPACING[2],
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: COLORS.accentPurple,
    },
    checkboxLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
    },
    forgotLink: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.textSecondary,
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

export default LoginScreen;
