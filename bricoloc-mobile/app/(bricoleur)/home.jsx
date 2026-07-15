import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function BricoleurHome() {
    const router = useRouter();
    const [activeFilter, setActiveFilter] = useState('All');
    const [isAvailable, setIsAvailable] = useState(true);
    const [loading, setLoading] = useState(true);
    const [jobs, setJobs] = useState([]);
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ rating: 0, completed: 0, bids: 0 });

    const categories = ['All', 'Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Repair', 'Cleaning', 'Moving'];

    const getToken = () => localStorage.getItem('auth_token');

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) setUser(JSON.parse(userData));
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const token = getToken();
            
            // Fetch available jobs
            const res = await fetch('http://127.0.0.1:8000/api/v1/jobs', {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await res.json();
            
            if (data.success) {
                const jobList = data.data?.data || data.data || [];
                const jobsArray = Array.isArray(jobList) ? jobList : [];
                // Only show open jobs
                const openJobs = jobsArray.filter(j => j.status === 'open');
                setJobs(openJobs);
            } else {
                setJobs([]);
            }

            // Fetch my bids for stats
            try {
                const bidsRes = await fetch('http://127.0.0.1:8000/api/v1/my-bids', {
                    headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
                });
                const bidsData = await bidsRes.json();
                if (bidsData.success) {
                    const bidsList = bidsData.data || [];
                    const accepted = bidsList.filter(b => b.status === 'accepted').length;
                    const pending = bidsList.filter(b => b.status === 'pending').length;
                    setStats({
                        rating: 0,
                        completed: accepted,
                        bids: pending,
                    });
                }
            } catch (err) {
                console.log('Error fetching bids:', err);
            }
        } catch (err) { 
            console.log('Error loading jobs:', err); 
            setJobs([]);
        }
        setLoading(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };

    const filteredJobs = activeFilter === 'All' 
        ? jobs 
        : jobs.filter(j => j.category?.name === activeFilter);

    return (
        <View style={s.root}>
            {/* ========== SIDEBAR ========== */}
            <View style={s.sidebar}>
                <View style={s.brand}>
                    <View style={s.brandIcon}><Text style={s.brandIconText}>BL</Text></View>
                    <Text style={s.brandName}>BricoLoc</Text>
                </View>
                <Text style={s.brandLabel}>HANDYMAN</Text>

                <View style={s.nav}>
                    <TouchableOpacity style={[s.navItem, s.navActive]}>
                        <Text style={[s.navIcon, s.navIconActive]}>⊡</Text>
                        <Text style={[s.navLabel, s.navLabelActive]}>Browse Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/my-bids')}>
                        <Text style={s.navIcon}>◎</Text><Text style={s.navLabel}>My Offers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/active-jobs')}>
                        <Text style={s.navIcon}>◈</Text><Text style={s.navLabel}>Active Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/chats')}>
                        <Text style={s.navIcon}>◉</Text><Text style={s.navLabel}>Messages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/profile')}>
                        <Text style={s.navIcon}>▣</Text><Text style={s.navLabel}>Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={s.navSep} />
                <TouchableOpacity style={s.navItem} onPress={loadData}>
                    <Text style={s.navIcon}>↻</Text><Text style={s.navLabel}>Refresh</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={handleLogout}>
                    <Text style={s.navIcon}>⇤</Text><Text style={[s.navLabel, { color: '#DC2626' }]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={s.sideUser}>
                    <View style={s.sideAvatar}>
                        <Text style={s.sideAvatarText}>{user?.name?.charAt(0) || 'H'}</Text>
                    </View>
                    <View>
                        <Text style={s.sideUserName}>{user?.name || 'Handyman'}</Text>
                        <Text style={s.sideUserRole}>{isAvailable ? 'Available' : 'Unavailable'}</Text>
                    </View>
                </View>
            </View>

            {/* ========== MAIN ========== */}
            <View style={s.main}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={s.header}>
                        <View style={s.headerLeft}>
                            <Text style={s.greeting}>Good morning</Text>
                            <Text style={s.headerTitle}>Find your next job</Text>
                        </View>
                        <TouchableOpacity
                            style={[s.availBtn, isAvailable ? s.availOn : s.availOff]}
                            onPress={() => setIsAvailable(!isAvailable)}
                        >
                            <View style={[s.availDot, isAvailable ? s.availDotOn : s.availDotOff]} />
                            <Text style={[s.availText, isAvailable ? s.availTextOn : s.availTextOff]}>
                                {isAvailable ? 'Available' : 'Unavailable'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Stats */}
                    <View style={s.statsRow}>
                        <View style={s.statCard}>
                            <Text style={s.statValue}>⭐ {stats.rating}</Text>
                            <Text style={s.statLabel}>Rating</Text>
                        </View>
                        <View style={s.statCard}>
                            <Text style={s.statValue}>{stats.completed}</Text>
                            <Text style={s.statLabel}>Accepted</Text>
                        </View>
                        <View style={s.statCard}>
                            <Text style={s.statValue}>{stats.bids}</Text>
                            <Text style={s.statLabel}>Pending</Text>
                        </View>
                    </View>

                    {/* Filters */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow} contentContainerStyle={{ gap: 6 }}>
                        {categories.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                style={[s.filterChip, activeFilter === cat && s.filterChipActive]}
                                onPress={() => setActiveFilter(cat)}
                            >
                                <Text style={[s.filterText, activeFilter === cat && s.filterTextActive]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Section */}
                    <Text style={s.sectionTitle}>Available Jobs · {filteredJobs.length}</Text>

                    {loading ? (
                        <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
                    ) : filteredJobs.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={s.emptyIcon}>📋</Text>
                            <Text style={s.emptyTitle}>No jobs found</Text>
                            <Text style={s.emptyDesc}>Check back later or adjust your filters.</Text>
                        </View>
                    ) : (
                        filteredJobs.map((job, index) => (
                            <TouchableOpacity
                                key={job.id || index}
                                style={s.jobCard}
                                onPress={() => router.push({
                                    pathname: '/submit-bid',
                                    params: { jobId: job.id, jobTitle: job.title, jobBudget: job.budget_max || 'N/A' }
                                })}
                            >
                                <View style={s.jobHeader}>
                                    <View style={s.jobTitleRow}>
                                        <View style={[s.jobCatDot, { backgroundColor: '#059669' }]} />
                                        <Text style={s.jobTitle}>{job.title || 'Untitled'}</Text>
                                    </View>
                                    <Text style={s.jobBudget}>{job.budget_max ? job.budget_max.toLocaleString() : '0'} FCFA</Text>
                                </View>
                                <View style={s.jobMeta}>
                                    <Text style={s.jobMetaText}>📂 {job.category?.name || 'General'}</Text>
                                    <Text style={s.jobMetaText}>📍 {job.city || 'N/A'}</Text>
                                    <Text style={s.jobMetaText}>💬 {job.bids_count || 0} bids</Text>
                                </View>
                                <View style={s.jobFooter}>
                                    <Text style={s.jobDesc} numberOfLines={2}>{job.description || 'No description'}</Text>
                                    <TouchableOpacity
                                        style={s.bidBtn}
                                        onPress={() => router.push({
                                            pathname: '/submit-bid',
                                            params: { jobId: job.id, jobTitle: job.title, jobBudget: job.budget_max || 'N/A' }
                                        })}
                                    >
                                        <Text style={s.bidBtnText}>Submit Offer →</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F0FDF4' },
    sidebar: { width: 200, backgroundColor: '#064E3B', paddingVertical: 24, paddingHorizontal: 16, justifyContent: 'space-between' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    brandIcon: { width: 30, height: 30, backgroundColor: '#F59E0B', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    brandIconText: { color: '#064E3B', fontWeight: '700', fontSize: 13 },
    brandName: { color: '#ECFDF5', fontWeight: '600', fontSize: 15 },
    brandLabel: { color: '#6EE7B7', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 22, marginTop: 2 },
    nav: { flex: 1 },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 6, marginBottom: 1, gap: 10 },
    navActive: { backgroundColor: '#065F46' },
    navIcon: { fontSize: 14, color: '#6EE7B7', width: 18, textAlign: 'center' },
    navIconActive: { color: '#F59E0B' },
    navLabel: { fontSize: 12, color: '#A7F3D0' },
    navLabelActive: { color: '#ECFDF5', fontWeight: '600' },
    navSep: { borderTopWidth: 1, borderTopColor: '#065F46', marginVertical: 12 },
    sideUser: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#065F46' },
    sideAvatar: { width: 30, height: 30, backgroundColor: '#F59E0B', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    sideAvatarText: { color: '#064E3B', fontWeight: '700', fontSize: 12 },
    sideUserName: { color: '#ECFDF5', fontSize: 12, fontWeight: '500' },
    sideUserRole: { color: '#6EE7B7', fontSize: 10 },
    main: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
    headerLeft: {},
    greeting: { fontSize: 12, color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#064E3B' },
    availBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    availOn: { backgroundColor: '#ECFDF5', borderColor: '#059669' },
    availOff: { backgroundColor: '#FEF2F2', borderColor: '#F87171' },
    availDot: { width: 7, height: 7, borderRadius: 4 },
    availDotOn: { backgroundColor: '#059669' },
    availDotOff: { backgroundColor: '#F87171' },
    availText: { fontSize: 11, fontWeight: '600' },
    availTextOn: { color: '#059669' },
    availTextOff: { color: '#F87171' },
    statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    statCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1FAE5' },
    statValue: { fontSize: 15, fontWeight: '700', color: '#064E3B' },
    statLabel: { fontSize: 9, color: '#6B7280', marginTop: 2, textTransform: 'uppercase' },
    filterRow: { marginBottom: 18, maxHeight: 38 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1FAE5' },
    filterChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
    filterText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    filterTextActive: { color: 'white' },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: '#064E3B', marginBottom: 12 },
    emptyState: { alignItems: 'center', paddingVertical: 50, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#D1FAE5' },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: '#064E3B' },
    emptyDesc: { fontSize: 12, color: '#6B7280', marginTop: 4 },
    jobCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#D1FAE5' },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    jobTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    jobCatDot: { width: 8, height: 8, borderRadius: 4 },
    jobTitle: { fontSize: 14, fontWeight: '600', color: '#064E3B', flex: 1 },
    jobBudget: { fontSize: 14, fontWeight: '700', color: '#059669' },
    jobMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    jobMetaText: { fontSize: 11, color: '#6B7280' },
    jobFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ECFDF5', paddingTop: 10 },
    jobDesc: { fontSize: 12, color: '#6B7280', flex: 1, marginRight: 12 },
    bidBtn: { backgroundColor: '#059669', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
    bidBtnText: { color: 'white', fontWeight: '600', fontSize: 12 },
});