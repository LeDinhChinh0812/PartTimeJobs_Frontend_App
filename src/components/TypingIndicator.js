import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

/**
 * Typing Indicator Component
 * Animated typing indicator for chat interfaces
 */
const TypingIndicator = ({
    userName = 'AI',
    showIcon = false,
    iconName = 'sparkles',
    style,
}) => {
    const dot1Opacity = useRef(new Animated.Value(0.3)).current;
    const dot2Opacity = useRef(new Animated.Value(0.3)).current;
    const dot3Opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animateDot = (dotOpacity, delay) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dotOpacity, {
                        toValue: 1,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dotOpacity, {
                        toValue: 0.3,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animations = [
            animateDot(dot1Opacity, 0),
            animateDot(dot2Opacity, 200),
            animateDot(dot3Opacity, 400),
        ];

        animations.forEach((anim) => anim.start());

        return () => {
            animations.forEach((anim) => anim.stop());
        };
    }, [dot1Opacity, dot2Opacity, dot3Opacity]);

    return (
        <View style={[styles.container, style]}>
            {showIcon && (
                <View style={styles.iconContainer}>
                    <Ionicons name={iconName} size={16} color={COLORS.white} />
                </View>
            )}

            <View style={styles.bubble}>
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            { opacity: dot1Opacity },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { opacity: dot2Opacity },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { opacity: dot3Opacity },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
    },
    iconContainer: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SPACING.xs,
    },
    bubble: {
        backgroundColor: COLORS.white,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: 16,
        borderBottomLeftRadius: 4,
    },
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.gray,
    },
});

export default TypingIndicator;
