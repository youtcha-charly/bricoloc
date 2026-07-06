import React from 'react';
import { Stack } from 'expo-router';

export default function BricoleurLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="home" />
            <Stack.Screen name="my-bids" />
            <Stack.Screen name="active-jobs" />
            <Stack.Screen name="chats" />
            <Stack.Screen name="profile" />
        </Stack>
    );
}