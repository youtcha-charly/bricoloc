import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="register" />
                <Stack.Screen name="home" options={{ headerShown: false }} />
                <Stack.Screen name="dashboard" options={{ headerShown: false }} />
                <Stack.Screen name="post-job" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="(admin)" options={{ headerShown: false }} />
                <Stack.Screen name="(bricoleur)" options={{ headerShown: false }} />
                <Stack.Screen name="submit-bid" options={{ headerShown: false }} />
            </Stack>
        </AuthProvider>
    );
}