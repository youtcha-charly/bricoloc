



























import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function BricoleurProfile() {
    const router = useRouter();
    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };
    return (
        <View style={s.c}>
            <View style={s.h}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.back}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.t}>Mon Profil</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={s.body}>
                <View style={s.avatar}><Text style={s.avatarText}>B</Text></View>
                <Text style={s.name}>Bricoleur</Text>
                <Text style={s.role}>Bricoleur Verifie</Text>
                <Text style={s.rating}>⭐ 0 • 0 travaux</Text>
                <TouchableOpacity style={s.btn} onPress={handleLogout}>
                    <Text style={s.btnText}>🚪 Deconnexion</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
const s = StyleSheet.create({
    c: { flex: 1, backgroundColor: '#F9FAFB' },
    h: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    back: { color: 'white', fontSize: 16 },
    t: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    body: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
    avatar: { width: 80, height: 80, backgroundColor: '#059669', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    avatarText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
    name: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
    role: { color: '#059669', fontWeight: '500', marginTop: 4 },
    rating: { color: '#6B7280', marginTop: 8, marginBottom: 30 },
    btn: { backgroundColor: '#EF4444', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
    btnText: { color: 'white', fontWeight: '600', fontSize: 15 },
});