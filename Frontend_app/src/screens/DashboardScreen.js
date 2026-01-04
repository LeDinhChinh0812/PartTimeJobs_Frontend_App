/**
 * Dashboard Screen
 * Migrated from dashboard.html
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components';
import { useAuth } from '../context';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const DashboardScreen = () => {
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.content}>
                    {/* Welcome Section */}
                    <Text style={styles.title}>Dashboard</Text>
                    <Text style={styles.subtitle}>Welcome, {user?.fullName}!</Text>

                    {/* User Info Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>User Information</Text>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{user?.fullName}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Email:</Text>
                            <Text style={styles.value}>{user?.email}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>User ID:</Text>
                            <Text style={styles.value}>{user?.userId}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.label}>Role:</Text>
                            <Text style={styles.value}>
                                {user?.roles?.join(', ') || 'N/A'}
                            </Text>
                        </View>
                    </View>

                    {/* Placeholder Section */}
                    <View style={styles.placeholderCard}>
                        <Text style={styles.placeholderText}>
                            Job listings and other features will be implemented here
                        </Text>
                    </View>

                    {/* Logout Button */}
                    <Button
                        variant="primary"
                        onPress={handleLogout}
                        style={styles.logoutButton}
                    >
                        LOGOUT
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgSecondary,
    },
    scrollContent: {
        flexGrow: 1,
    },
    content: {
        padding: SPACING[6],
    },
    title: {
        fontSize: TYPOGRAPHY.size['4xl'],
        fontWeight: TYPOGRAPHY.weight.black,
        color: COLORS.primary,
        marginBottom: SPACING[2],
    },
    subtitle: {
        fontSize: TYPOGRAPHY.size.lg,
        color: COLORS.textSecondary,
        marginBottom: SPACING[6],
    },
    card: {
        backgroundColor: COLORS.white,
        borderRadius: 16,
        padding: SPACING[6],
        marginBottom: SPACING[6],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTitle: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weight.bold,
        color: COLORS.primary,
        marginBottom: SPACING[4],
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING[3],
        borderBottomWidth: 1,
        borderBottomColor: COLORS.gray200,
    },
    label: {
        fontSize: TYPOGRAPHY.size.base,
        fontWeight: TYPOGRAPHY.weight.semibold,
        color: COLORS.textSecondary,
    },
    value: {
        fontSize: TYPOGRAPHY.size.base,
        color: COLORS.textPrimary,
    },
    placeholderCard: {
        backgroundColor: COLORS.accentPurpleLight,
        borderRadius: 16,
        padding: SPACING[8],
        marginBottom: SPACING[6],
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: TYPOGRAPHY.size.base,
        color: COLORS.primary,
        textAlign: 'center',
    },
    logoutButton: {
        marginTop: SPACING[4],
    },
});

export default DashboardScreen;
