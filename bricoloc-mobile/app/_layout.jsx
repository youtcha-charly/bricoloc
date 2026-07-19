import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/i18n/LanguageContext';

export default function RootLayout() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="login" />
                    <Stack.Screen name="register" />
                    <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
                    <Stack.Screen name="reset-password" options={{ headerShown: false }} />
                    <Stack.Screen name="home" options={{ headerShown: false }} />
                    <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                    <Stack.Screen name="post-job" options={{ headerShown: false }} />
                    <Stack.Screen name="profile" options={{ headerShown: false }} />
                    <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
                    <Stack.Screen name="chats" options={{ headerShown: false }} />
                    <Stack.Screen name="notifications" options={{ headerShown: false }} />
                    <Stack.Screen name="submit-bid" options={{ headerShown: false }} />
                    <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                    <Stack.Screen name="(bricoleur)" options={{ headerShown: false }} />
                    <Stack.Screen name="job/[id]" options={{ headerShown: true, title: 'Job Details' }} />
                </Stack>
            </AuthProvider>
        </LanguageProvider>
    );
}