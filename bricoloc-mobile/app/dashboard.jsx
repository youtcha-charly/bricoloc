import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) setUser(JSON.parse(userData));
        
        const myJobs = localStorage.getItem('my_jobs');
        if (myJobs) setJobs(JSON.parse(myJobs));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <View style={s.headerTop}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={s.backBtn}>← Retour</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Tableau de bord</Text>
                    <TouchableOpacity onPress={handleLogout}>
                        <Text style={s.logoutBtn}>🚪</Text>
                    </TouchableOpacity>
                </View>
                <Text style={s.welcome}>Bienvenue, {user?.name || 'Client'} 👋</Text>
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                {/* Stats */}
                <View style={s.statsGrid}>
                    <View style={[s.statCard, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={[s.statNum, { color: '#2563EB' }]}>{jobs.length}</Text>
                        <Text style={s.statLabel}>Annonces</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[s.statNum, { color: '#059669' }]}>{jobs.filter(j => j.status === 'open').length}</Text>
                        <Text style={s.statLabel}>Actifs</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[s.statNum, { color: '#D97706' }]}>0</Text>
                        <Text style={s.statLabel}>Offres</Text>
                    </View>
                    <View style={[s.statCard, { backgroundColor: '#F3F4F6' }]}>
                        <Text style={[s.statNum, { color: '#374151' }]}>0</Text>
                        <Text style={s.statLabel}>Termines</Text>
                    </View>
                </View>

                {/* Jobs List */}
                <Text style={s.sectionTitle}>📋 Mes annonces ({jobs.length})</Text>

                {jobs.length === 0 ? (
                    <View style={s.emptyState}>
                        <Text style={s.emptyIcon}>📭</Text>
                        <Text style={s.emptyTitle}>Aucune annonce</Text>
                        <Text style={s.emptyDesc}>Publiez votre premier travail !</Text>
                        <TouchableOpacity style={s.postBtn} onPress={() => router.push('/post-job')}>
                            <Text style={s.postBtnText}>📝 Publier un travail</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    jobs.map((job, index) => (
                        <View key={index} style={s.jobCard}>
                            <View style={s.jobHeader}>
                                <Text style={s.jobTitle}>{job.title}</Text>
                                <View style={[s.statusBadge, { backgroundColor: job.status === 'open' ? '#DBEAFE' : '#D1FAE5' }]}>
                                    <Text style={[s.statusText, { color: job.status === 'open' ? '#1E40AF' : '#065F46' }]}>
                                        {job.status === 'open' ? 'Ouvert' : 'Termine'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={s.jobDesc} numberOfLines={2}>{job.description}</Text>
                            <View style={s.jobMeta}>
                                <Text style={s.jobMetaText}>📍 {job.city}</Text>
                                {job.budget_max && <Text style={s.jobBudget}>{job.budget_max} FCFA</Text>}
                            </View>
                        </View>
                    ))
                )}

                <TouchableOpacity style={s.newJobBtn} onPress={() => router.push('/post-job')}>
                    <Text style={s.newJobBtnText}>+ Nouveau travail</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { backgroundColor: '#2563EB', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 20 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    logoutBtn: { fontSize: 22 },
    welcome: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
    content: { flex: 1, paddingHorizontal: 14 },
    statsGrid: { flexDirection: 'row', gap: 8, marginTop: 16 },
    statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    statNum: { fontSize: 28, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 10 },
    emptyState: { alignItems: 'center', paddingVertical: 30, backgroundColor: 'white', borderRadius: 16, padding: 24 },
    emptyIcon: { fontSize: 60, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '600' },
    emptyDesc: { color: '#6B7280', marginTop: 8 },
    postBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, marginTop: 20 },
    postBtnText: { color: 'white', fontWeight: '600' },
    jobCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 10 },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    jobTitle: { fontSize: 16, fontWeight: '600', color: '#111827', flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '600' },
    jobDesc: { color: '#6B7280', fontSize: 13, marginBottom: 8 },
    jobMeta: { flexDirection: 'row', justifyContent: 'space-between' },
    jobMetaText: { color: '#9CA3AF', fontSize: 12 },
    jobBudget: { color: '#059669', fontWeight: '600', fontSize: 13 },
    newJobBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
    newJobBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
});