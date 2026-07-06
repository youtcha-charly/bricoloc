import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Splash() {
    const router = useRouter();
    useEffect(() => { setTimeout(() => router.replace('/login'), 2000); }, []);
    return (
        <View style={s.container}>
            <View style={s.box}><Text style={s.boxText}>BL</Text></View>
            <Text style={s.title}>BricoLoc</Text>
            <Text style={s.sub}>Trouve un bricoleur pres de chez toi</Text>
            <ActivityIndicator size="large" color="white" style={{ marginTop: 40 }} />
        </View>
    );
}
const s = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2563EB' },
    box: { width: 80, height: 80, backgroundColor: 'white', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    boxText: { fontSize: 36, fontWeight: 'bold', color: '#2563EB' },
    title: { fontSize: 36, fontWeight: 'bold', color: 'white' },
    sub: { color: 'rgba(255,255,255,0.8)', fontSize: 16, marginTop: 8 },
});
