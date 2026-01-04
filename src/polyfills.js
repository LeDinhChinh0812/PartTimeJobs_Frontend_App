/**
 * Polyfills Setup for React Native
 * Required for SignalR and other libraries
 */

// URL Polyfill
import 'react-native-url-polyfill/auto';

// Crypto polyfill
import 'react-native-get-random-values';

// Global polyfills for web APIs
if (typeof global.self === 'undefined') {
    global.self = global;
}

if (typeof global.process === 'undefined') {
    global.process = { env: {} };
}

// Export for verification
export const polyfillsLoaded = true;
