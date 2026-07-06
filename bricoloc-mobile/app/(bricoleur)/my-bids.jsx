import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function MyBids() {
    const router = useRouter();
    return (
        <View style={s.c}>
            <View style={s.h}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.back}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.t}>Mes Offres</Text>
                <View style={{ width: 60 }} />
            </View>
            <View style={s.body}>
                <Text style={s.icon}>📋</Text>
                <Text style={s.title}>Aucune offre soumise</Text>
                <Text style={s.sub}>Parcourez les jobs disponibles et soumettez vos offres</Text>
                <TouchableOpacity style={s.btn} onPress={() => router.back()}>
                    <Text style={s.btnText}>Voir les jobs</Text>
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
    icon: { fontSize: 60, marginBottom: 16 },
    title: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    sub: { color: '#6B7280', textAlign: 'center', marginTop: 8, marginBottom: 20 },
    btn: { backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
    btnText: { color: 'white', fontWeight: '600' },
});