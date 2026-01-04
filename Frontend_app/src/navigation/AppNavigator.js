/**
 * App Navigator
 * Main navigation configuration with Bottom Tabs for authenticated users
 */

import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context';
import { COLORS } from '../constants';
import {
    OnboardingScreen,
    LoginScreen,
    SignupScreen,
    ForgotPasswordScreen,
    ResetConfirmationScreen,
    HomeScreen,
    JobsListScreen,
    JobDetailScreen,
    MyApplicationsScreen,
    ApplyJobScreen,
    ProfileScreen,
    EditProfileScreen,
    CVPreviewScreen,
    TestAPIScreen,
    ChatListScreen,
    ChatRoomScreen,
    AIChatbotScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Home Stack Navigator
const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
    </Stack.Navigator>
);

// Jobs Stack Navigator
const JobsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="JobsList" component={JobsListScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
    </Stack.Navigator>
);

// Applications Stack Navigator
const ApplicationsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MyApplications" component={MyApplicationsScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
    </Stack.Navigator>
);

// Chat Stack Navigator
const ChatStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: true, headerTitle: '' }} />
        <Stack.Screen name="AIChatbot" component={AIChatbotScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="CVPreview" component={CVPreviewScreen} />
    </Stack.Navigator>
);

// Bottom Tab Navigator for authenticated users
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Jobs') {
                    iconName = focused ? 'search' : 'search-outline';
                } else if (route.name === 'Chat') {
                    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                } else if (route.name === 'Applications') {
                    iconName = focused ? 'document-text' : 'document-text-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.accentOrange,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
                backgroundColor: COLORS.white,
                borderTopWidth: 1,
                borderTopColor: COLORS.gray200,
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
            },
            tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '500',
            },
        })}
    >
        <Tab.Screen
            name="Home"
            component={HomeStack}
            options={{ tabBarLabel: 'Trang chủ' }}
        />
        <Tab.Screen
            name="Jobs"
            component={JobsStack}
            options={{ tabBarLabel: 'Tìm việc' }}
        />
        <Tab.Screen
            name="Chat"
            component={ChatStack}
            options={{ tabBarLabel: 'Tin nhắn' }}
        />
        <Tab.Screen
            name="Applications"
            component={ApplicationsStack}
            options={{ tabBarLabel: 'Đơn ứng tuyển' }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileStack}
            options={{ tabBarLabel: 'Hồ sơ' }}
        />
    </Tab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Loading state
    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={COLORS.accentOrange} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}
            >
                {!isAuthenticated ? (
                    // Auth Stack - For unauthenticated users
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="TestAPI" component={TestAPIScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="ResetConfirmation" component={ResetConfirmationScreen} />
                    </>
                ) : (
                    // Main App with Bottom Tabs - For authenticated users
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
