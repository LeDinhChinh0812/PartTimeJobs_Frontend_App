/**
 * Reset Confirmation Screen
 * Migrated from reset-confirmation.html
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components';
import { COLORS, TYPOGRAPHY, SPACING } from '../constants';

const ResetConfirmationScreen = ({ navigation }) => {
    const handleOpenEmail = () => {
        // Open default email app
        Linking.openURL('mailto:');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <View style={styles.content}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <Feather name="mail" size={64} color={COLORS.accentOrange} />
                </View>

                {/* Title */}
                <Text style={styles.title}>Check Your Email</Text>

                {/* Description */}
                <Text style={styles.description}>
                    We've sent password reset instructions to your email address. Please check your inbox and follow the link.
                </Text>

                {/* Open Email Button */}
                <Button
                    variant="primary"
                    onPress={handleOpenEmail}
                    style={styles.button}
                >
                    OPEN YOUR EMAIL
                </Button>

                {/* Back to Login Button */}
                <Button
                    variant="secondary"
                    onPress={() => navigation.navigate('Login')}
                    style={styles.button}
                >
                    BACK TO LOGIN
                </Button>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING[6],
    },
    iconContainer: {
        marginBottom: SPACING[6],
    },
    title: {
        fontSize: TYPOGRAPHY.size['3xl'],
        fontWeight: TYPOGRAPHY.weight.extrabold,
        color: COLORS.primary,
        textAlign: 'center',
        marginBottom: SPACING[4],
    },
    description: {
        fontSize: TYPOGRAPHY.size.base,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SPACING[8],
        maxWidth: 400,
    },
    button: {
        width: '100%',
        maxWidth: 400,
        marginBottom: SPACING[4],
    },
});

export default ResetConfirmationScreen;
