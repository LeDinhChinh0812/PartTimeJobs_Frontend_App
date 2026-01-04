/**
 * Typography System
 */

export const TYPOGRAPHY = {
    fontFamily: {
        primary: 'System',
        heading: 'System',
    },
    size: {
        xs: 12,
        sm: 14,
        md: 16,
        base: 16, // Alias for md
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },
    weight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        extrabold: '800',
        black: '900',
    },
};

// Backwards compatibility - export old names too
export const FONT_SIZES = TYPOGRAPHY.size;
export const FONT_WEIGHTS = TYPOGRAPHY.weight;
export const FONTS = TYPOGRAPHY.fontFamily;
