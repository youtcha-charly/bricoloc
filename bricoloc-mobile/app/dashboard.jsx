import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Dashboard() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notifCount, setNotifCount] = useState(0);
    const [stats, setStats] = useState({ total: 0, active: 0, offers: 0, completed: 0 });
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('auth_token');

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) setUser(JSON.parse(userData));
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([fetchJobs(), fetchNotifications()]);
        setLoading(false);
    };

    const fetchJobs = async () => {
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:8000/api/v1/jobs', {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success && data.data) {
                const jobList = data.data.data || data.data || [];
                const jobsArray = Array.isArray(jobList) ? jobList : [];
                setJobs(jobsArray);
                const open = jobsArray.filter(j => j.status === 'open').length;
                const done = jobsArray.filter(j => j.status === 'completed').length;
                setStats({
                    total: jobsArray.length,
                    active: open,
                    offers: jobsArray.reduce((sum, j) => sum + (j.bids_count || j.bids?.length || 0), 0),
                    completed: done,
                });
            }
        } catch (err) {
            console.log('Error loading jobs:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:8000/api/v1/notifications', {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                const notifList = data.data?.data || data.data || [];
                const notifsArray = Array.isArray(notifList) ? notifList : [];
                setNotifications(notifsArray);
                setNotifCount(notifsArray.filter(n => !n.is_read).length);
            }
        } catch (err) {
            console.log('Error fetching notifications:', err);
        }
    };

    const handleCompleteJob = async (jobId) => {
        const token = getToken();
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/complete`, {
                method: 'PUT',
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                window.alert('✅ Job marked as completed!');
                loadAllData();
            } else {
                window.alert(data.message || 'Error completing job');
            }
        } catch (err) {
            window.alert('Server connection error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };

    const getStatusStyle = (status) => {
        if (status === 'open') return { bg: '#FDF3E0', text: '#B8860B', dot: '#D9A441', label: 'OPEN' };
        if (status === 'assigned' || status === 'in_progress') return { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'ACTIVE' };
        if (status === 'completed') return { bg: '#E6F4F2', text: '#0F766E', dot: '#14B8A6', label: 'DONE' };
        return { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: status?.toUpperCase() || 'N/A' };
    };

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#D9A441" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            {/* ========== SIDEBAR ========== */}
            <View style={s.sidebar}>
                <View style={s.sidebarLogo}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.logoText}>BricoLoc</Text>
                </View>

                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>📊</Text><Text style={[s.navLabel, s.navLabelActive]}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/post-job')}>
                    <Text style={s.navIcon}>📝</Text><Text style={s.navLabel}>Post a Job</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem}>
                    <Text style={s.navIcon}>📋</Text><Text style={s.navLabel}>My Jobs</Text>
                    <View style={s.badge}><Text style={s.badgeText}>{jobs.length}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem}>
                    <Text style={s.navIcon}>💬</Text><Text style={s.navLabel}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem}>
                    <Text style={s.navIcon}>⭐</Text><Text style={s.navLabel}>Reviews</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/profile')}>
                    <Text style={s.navIcon}>👤</Text><Text style={s.navLabel}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem}>
                    <Text style={s.navIcon}>🔔</Text>
                    <Text style={s.navLabel}>Notifications</Text>
                    {notifCount > 0 && (
                        <View style={s.notifRedBadge}>
                            <Text style={s.notifRedBadgeText}>{notifCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={s.sidebarFooter}>
                    <View style={s.sidebarUser}>
                        <View style={s.userAvatar}><Text style={s.userAvatarText}>{user?.name?.charAt(0) || 'U'}</Text></View>
                        <View>
                            <Text style={s.userName}>{user?.name || 'User'}</Text>
                            <Text style={s.userRole}>Client · {user?.city || 'Douala'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
                        <Text style={s.logoutBtnText}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ========== MAIN CONTENT ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <View>
                        <Text style={s.pageTitle}>Dashboard</Text>
                        <Text style={s.pageSubtitle}>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
                    </View>
                    <TouchableOpacity style={s.refreshBtn} onPress={loadAllData}>
                        <Text style={s.refreshBtnText}>🔄</Text>
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={s.statsRow}>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>TOTAL JOBS</Text>
                        <Text style={s.statValue}>{stats.total}</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>ACTIVE</Text>
                        <Text style={s.statValue}>{stats.active}</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>OFFERS</Text>
                        <Text style={s.statValue}>{stats.offers}</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>COMPLETED</Text>
                        <Text style={s.statValue}>{stats.completed}</Text>
                    </View>
                </View>

                <ScrollView style={s.scrollArea} showsVerticalScrollIndicator={false}>

                    {/* ===== NOTIFICATIONS ===== */}
                    {notifications.length > 0 && (
                        <>
                            <View style={s.sectionHeader}>
                                <Text style={s.sectionTitle}>🔔 Notifications</Text>
                                <View style={s.notifAmberBadge}>
                                    <Text style={s.notifAmberBadgeText}>{notifications.length}</Text>
                                </View>
                            </View>
                            {notifications.slice(0, 5).map((notif, index) => (
                                <View key={notif.id || index} style={s.notifCard}>
                                    <View style={[s.notifDot, { backgroundColor: notif.type === 'new_bid' ? '#D9A441' : '#059669' }]} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={s.notifTitle}>{notif.title}</Text>
                                        <Text style={s.notifBody}>{notif.body}</Text>
                                        <Text style={s.notifTime}>
                                            {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                            <View style={s.divider} />
                        </>
                    )}

                    {/* ===== JOBS SECTION ===== */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>📋 My Jobs</Text>
                        <Text style={s.sectionCount}>{jobs.length}</Text>
                    </View>

                    {jobs.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={s.emptyIcon}>📭</Text>
                            <Text style={s.emptyTitle}>No jobs yet</Text>
                            <Text style={s.emptyDesc}>Post your first job and receive offers from verified handymen.</Text>
                            <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/post-job')}>
                                <Text style={s.primaryBtnText}>Post a Job</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        jobs.map((job, index) => {
                            const st = getStatusStyle(job.status);
                            return (
                                <View key={job.id || index} style={s.jobTicket}>
                                    <TouchableOpacity onPress={() => router.push(`/job/${job.id}`)}>
                                        <View style={s.ticketBody}>
                                            <View style={s.ticketHeader}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={s.ticketTitle}>{job.title}</Text>
                                                    <Text style={s.ticketCategory}>{job.category?.name || 'General'}</Text>
                                                </View>
                                                <View style={[s.statusStamp, { backgroundColor: st.bg }]}>
                                                    <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                                                    <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                                                </View>
                                            </View>
                                            <Text style={s.ticketDesc} numberOfLines={2}>{job.description}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={s.ticketDivider} />
                                    <View style={s.ticketFooter}>
                                        <View style={s.ticketMeta}>
                                            <Text style={s.metaText}>📍 {job.city || 'N/A'}</Text>
                                            <Text style={s.metaText}>📅 {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            {(job.bids_count > 0 || job.bids?.length > 0) && (
                                                <Text style={s.bidCount}>💬 {job.bids_count || job.bids?.length || 0} bid</Text>
                                            )}
                                            <Text style={s.ticketPrice}>{job.budget_max ? job.budget_max.toLocaleString() : '0'} FCFA</Text>
                                        </View>
                                    </View>

                                    {/* ===== CHAT BUTTON (for assigned jobs) ===== */}
                                    {job.status === 'assigned' && (
                                        <TouchableOpacity 
                                            style={[s.actionBtn, { backgroundColor: '#2563EB' }]}
                                            onPress={() => router.push(`/chat/${job.id}`)}
                                        >
                                            <Text style={s.actionBtnText}>💬 Chat with Bricoleur</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* ===== MARK COMPLETE BUTTON ===== */}
                                    {(job.status === 'assigned' || job.status === 'in_progress') && (
                                        <TouchableOpacity 
                                            style={s.completeBtn}
                                            onPress={() => handleCompleteJob(job.id)}
                                        >
                                            <Text style={s.completeBtnText}>✅ Mark as Complete</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            );
                        })
                    )}
                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },
    sidebar: { width: 240, backgroundColor: '#072E2F', paddingVertical: 24, paddingHorizontal: 16 },
    sidebarLogo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28, paddingHorizontal: 4 },
    logoIcon: { width: 34, height: 34, backgroundColor: '#D9A441', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    logoIconText: { fontSize: 16, fontWeight: '700', color: '#0B3D3E' },
    logoText: { fontSize: 18, fontWeight: '700', color: 'white' },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2, gap: 10 },
    navActive: { backgroundColor: 'rgba(217,164,65,0.15)' },
    navIcon: { fontSize: 16, width: 22, textAlign: 'center' },
    navLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, flex: 1 },
    navLabelActive: { color: '#D9A441', fontWeight: '500' },
    badge: { backgroundColor: '#D9A441', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    badgeText: { color: '#0B3D3E', fontSize: 10, fontWeight: '600' },
    notifRedBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, minWidth: 20, alignItems: 'center' },
    notifRedBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
    sidebarFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sidebarUser: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    userAvatar: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    userAvatarText: { color: 'white', fontWeight: '600', fontSize: 13 },
    userName: { color: 'white', fontSize: 12, fontWeight: '500' },
    userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
    logoutBtn: { padding: 6 },
    logoutBtnText: { fontSize: 16 },
    main: { flex: 1, paddingHorizontal: 28, paddingVertical: 24 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
    pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    refreshBtn: { padding: 8, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    refreshBtnText: { fontSize: 18 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
    statLabel: { fontSize: 10, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: '600', color: '#1A1A1A' },
    scrollArea: { flex: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    notifAmberBadge: { backgroundColor: '#D9A441', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    notifAmberBadgeText: { color: '#0B3D3E', fontSize: 11, fontWeight: '600' },
    notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
    notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    notifTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
    notifBody: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 18 },
    notifTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
    divider: { borderTopWidth: 1, borderColor: '#E5E7EB', marginVertical: 14 },
    sectionCount: { fontSize: 12, color: '#9CA3AF', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    primaryBtn: { backgroundColor: '#D9A441', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6 },
    primaryBtnText: { color: '#0B3D3E', fontWeight: '600', fontSize: 13 },
    jobTicket: { backgroundColor: 'white', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    ticketBody: { padding: 16 },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    ticketTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    ticketCategory: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
    statusStamp: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    ticketDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
    ticketDivider: { borderTopWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FAFBFC', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    ticketMeta: { flexDirection: 'row', gap: 12 },
    metaText: { fontSize: 11, color: '#9CA3AF' },
    bidCount: { fontSize: 11, color: '#D9A441', fontWeight: '600' },
    ticketPrice: { fontSize: 14, fontWeight: '600', color: '#D9A441' },
    actionBtn: { paddingVertical: 10, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    actionBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    completeBtn: { backgroundColor: '#059669', paddingVertical: 12, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    completeBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'white', borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
    emptyDesc: { fontSize: 13, color: '#6B7280', marginBottom: 16, textAlign: 'center', paddingHorizontal: 20 },
});