/**
 * Điều hướng ứng dụng
 * Cấu hình điều hướng chính với Bottom Tabs cho người dùng đã đăng nhập
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
    ChatListScreen,
    ChatRoomScreen,
    AIChatbotScreen,
    CreateCVScreen,
    MyCVScreen,
    CVTemplatesScreen,
    UploadCVScreen,
    PDFViewerScreen,
} from '../screens';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Navigator Stack Trang chủ
const HomeStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="Jobs" component={JobsListScreen} />
            <Stack.Screen name="MyCV" component={MyCVScreen} />
            <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
            <Stack.Screen name="CVPreview" component={CVPreviewScreen} />
        </Stack.Navigator>
    );
};

// Navigator Stack Việc làm
const JobsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="JobsList" component={JobsListScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
            <Stack.Screen name="CreateCV" component={CreateCVScreen} />
            <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
        </Stack.Navigator>
    );
};

// Navigator Stack Ứng tuyển
const ApplicationsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ApplicationsList" component={MyApplicationsScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
    </Stack.Navigator>
);

// Navigator Stack Việc làm đã lưu
const SaveJobsStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Placeholder for SavedJobs - reusing JobsListScreen for now to prevent crash */}
        <Stack.Screen name="SavedJobsList" component={JobsListScreen} />
        <Stack.Screen name="JobDetail" component={JobDetailScreen} />
        <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
    </Stack.Navigator>
);

// Navigator Stack Nhắn tin
const ChatStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ChatList" component={ChatListScreen} />
        <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{ headerShown: true, headerTitle: '' }} />
        <Stack.Screen name="AIChatbot" component={AIChatbotScreen} options={{ headerShown: true }} />
    </Stack.Navigator>
);

// Navigator Stack Hồ sơ
const ProfileStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="Applications" component={MyApplicationsScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="ApplyJob" component={ApplyJobScreen} />
            {/* Placeholder for SavedJobs - reusing JobsListScreen for now to prevent crash */}
            <Stack.Screen name="SavedJobs" component={JobsListScreen} />
            <Stack.Screen name="Jobs" component={JobsListScreen} />
            <Stack.Screen name="CVPreview" component={CVPreviewScreen} />
            <Stack.Screen name="CreateCV" component={CreateCVScreen} />
            <Stack.Screen name="UploadCV" component={UploadCVScreen} />
            <Stack.Screen name="MyCV" component={MyCVScreen} />
            <Stack.Screen name="CVTemplates" component={CVTemplatesScreen} />
            <Stack.Screen name="PDFViewer" component={PDFViewerScreen} />
        </Stack.Navigator>
    );
};

// Bottom Tab Navigator cho người dùng đã xác thực
const MainTabs = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Jobs') {
                    iconName = focused ? 'briefcase' : 'briefcase-outline';
                } else if (route.name === 'Chat') {
                    iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }

                return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: COLORS.accentOrange,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarStyle: {
                height: 60,
                paddingBottom: 8,
                paddingTop: 8,
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
            options={{ tabBarLabel: 'Việc làm' }}
        />
        <Tab.Screen
            name="Chat"
            component={ChatStack}
            options={{ tabBarLabel: 'Tin nhắn' }}
        />
        <Tab.Screen
            name="Profile"
            component={ProfileStack}
            options={{ tabBarLabel: 'Hồ sơ' }}
        />
    </Tab.Navigator >
);
// Navigator Chính của Ứng dụng
const AppNavigator = () => {
    const { isAuthenticated, isLoading } = useAuth();

    // Trạng thái đang tải
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
                    // Auth Stack - Cho người dùng chưa đăng nhập
                    <>
                        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Signup" component={SignupScreen} />
                        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                        <Stack.Screen name="ResetConfirmation" component={ResetConfirmationScreen} />
                    </>
                ) : (
                    // Ứng dụng chính với Bottom Tabs - Cho người dùng đã xác thực
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
