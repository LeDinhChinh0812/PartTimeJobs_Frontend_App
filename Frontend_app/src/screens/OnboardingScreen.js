/**
 * Onboarding Screen
 * Migrated from index.html
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY, SPACING, RADIUS } from '../constants';

const OnboardingScreen = ({ navigation }) => {
    return (
        <LinearGradient
            colors={[COLORS.gray50, COLORS.accentPurpleLight]}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* Illustration */}
                <View style={styles.illustrationWrapper}>
                    <Image
                        source={require('../../assets/onboarding.png')}
                        style={styles.illustration}
                        resizeMode="contain"
                    />
                </View>

                {/* Heading */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Find Your</Text>
                    <Text style={[styles.title, styles.titleAccent]}>Dream Job</Text>
                    <Text style={styles.title}>Here!</Text>
                </View>

                {/* Get Started Button */}
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.8}
                >
                    <Feather name="arrow-right" size={24} color={COLORS.white} />
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING[8],
    },
    illustrationWrapper: {
        marginBottom: SPACING[8],
    },
    illustration: {
        width: 280,
        height: 280,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: SPACING[8],
    },
    title: {
        fontSize: TYPOGRAPHY.size['4xl'],
        fontWeight: TYPOGRAPHY.weight.black,
        color: COLORS.primary,
        textAlign: 'center',
    },
    titleAccent: {
        color: COLORS.accentOrange,
    },
    iconButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
        elevation: 10,
    },
});

export default OnboardingScreen;
