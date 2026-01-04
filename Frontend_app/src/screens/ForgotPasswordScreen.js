/**
 * Forgot Password Screen
 * Migrated from forgot-password.html
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input } from '../components';
import { isValidEmail } from '../utils';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleResetPassword = async () => {
        // Clear previous error
        setError('');

        // Validate email
        if (!email) {
            setError('Email is required');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Invalid email format');
            return;
        }

        setLoading(true);

        // Simulate API call (backend not implemented yet)
        setTimeout(() => {
            setLoading(false);
            navigation.navigate('ResetConfirmation');
        }, 1000);
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
                        <Text style={styles.title}>Forgot Password?</Text>
                        <Text style={styles.subtitle}>
                            Enter your email address and we'll send you instructions to reset your password.
                        </Text>

                        {/* Email Input */}
                        <Input
                            label="Email"
                            placeholder="minhtauhai@gmail.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoComplete="email"
                            error={error}
                        />

                        {/* Reset Button */}
                        <Button
                            variant="primary"
                            onPress={handleResetPassword}
                            loading={loading}
                            style={styles.button}
                        >
                            RESET PASSWORD
                        </Button>
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
        marginBottom: SPACING[4],
    },
    subtitle: {
        fontSize: TYPOGRAPHY.size.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING[6],
    },
    button: {
        marginTop: SPACING[2],
    },
});

export default ForgotPasswordScreen;
