import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { notificationsAPI } from '../src/services/api';

export default function Notifications() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await notificationsAPI.list();
            if (res.data.success) {
                const notifList = res.data.data?.data || res.data.data || [];
                setNotifications(Array.isArray(notifList) ? notifList : []);
            }
        } catch (err) {
            console.log('Error loading notifications:', err);
        }
        setLoading(false);
    }, []);

    React.useEffect(() => { loadData(); }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const getNotifIcon = (type) => {
        switch (type) {
            case 'new_message': return '💬';
            case 'bid_accepted': return '✅';
            case 'bid_rejected': return '❌';
            case 'new_bid': return '📋';
            case 'job_completed': return '🎉';
            case 'new_review': return '⭐';
            default: return '🔔';
        }
    };

    const getNotifRoute = (notif) => {
        try {
            let data = notif.data;
            if (typeof data === 'string') data = JSON.parse(data || '{}');
            if (data.chat_id) return { pathname: '/chat/[id]', params: { id: String(data.chat_id) } };
            if (data.job_id) return { pathname: '/job/[id]', params: { id: String(data.job_id) } };
        } catch {}
        return null;
    };

    return (
        <View style={s.container}>
            <View style={s.sidebar}>
                <View style={s.sidebarLogo}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.logoText}>BricoLoc</Text>
                </View>

                <TouchableOpacity style={s.navItem} onPress={() => router.push('/home')}>
                    <Text style={s.navIcon}>🏠</Text><Text style={s.navLabel}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/dashboard')}>
                    <Text style={s.navIcon}>📊</Text><Text style={s.navLabel}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/post-job')}>
                    <Text style={s.navIcon}>📝</Text><Text style={s.navLabel}>Post a Job</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/chats')}>
                    <Text style={s.navIcon}>💬</Text><Text style={s.navLabel}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>🔔</Text><Text style={[s.navLabel, s.navLabelActive]}>Notifications</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/profile')}>
                    <Text style={s.navIcon}>👤</Text><Text style={s.navLabel}>Profile</Text>
                </TouchableOpacity>

                <View style={s.sidebarFooter}>
                    <View style={s.sidebarUser}>
                        <View style={s.userAvatar}><Text style={s.userAvatarText}>{user?.name?.charAt(0) || 'U'}</Text></View>
                        <View>
                            <Text style={s.userName}>{user?.name || 'User'}</Text>
                            <Text style={s.userRole}>Client</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
                        <Text style={s.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={s.main}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={s.header}>
                        <Text style={s.headerTitle}>Notifications</Text>
                        <Text style={s.headerSub}>Stay updated on your jobs and offers</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#D9A441" style={{ marginTop: 40 }} />
                    ) : notifications.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={s.emptyIcon}>🔔</Text>
                            <Text style={s.emptyTitle}>No notifications</Text>
                            <Text style={s.emptyDesc}>You'll be notified when bricoleurs interact with your jobs.</Text>
                        </View>
                    ) : (
                        notifications.map(notif => {
                            const route = getNotifRoute(notif);
                            return (
                                <TouchableOpacity
                                    key={notif.id}
                                    style={[s.notifCard, !notif.is_read && s.notifCardUnread]}
                                    onPress={() => route && router.push(route)}
                                >
                                    <Text style={s.notifIcon}>{getNotifIcon(notif.type)}</Text>
                                    <View style={s.notifInfo}>
                                        <Text style={s.notifTitle}>{notif.title}</Text>
                                        <Text style={s.notifBody} numberOfLines={2}>{notif.body}</Text>
                                        <Text style={s.notifTime}>{notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}</Text>
                                    </View>
                                    {!notif.is_read && <View style={s.unreadDot} />}
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },
    sidebar: { width: 220, backgroundColor: '#072E2F', paddingVertical: 24, paddingHorizontal: 14, justifyContent: 'space-between' },
    sidebarLogo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28, paddingHorizontal: 4 },
    logoIcon: { width: 32, height: 32, backgroundColor: '#D9A441', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    logoIconText: { fontSize: 15, fontWeight: '700', color: '#0B3D3E' },
    logoText: { fontSize: 17, fontWeight: '700', color: 'white' },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2, gap: 10 },
    navActive: { backgroundColor: 'rgba(217,164,65,0.15)' },
    navIcon: { fontSize: 15, width: 20, textAlign: 'center' },
    navLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, flex: 1 },
    navLabelActive: { color: '#D9A441', fontWeight: '500' },
    sidebarFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sidebarUser: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    userAvatar: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    userAvatarText: { color: 'white', fontWeight: '600', fontSize: 13 },
    userName: { color: 'white', fontSize: 12, fontWeight: '500' },
    userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
    logoutBtn: { padding: 6 },
    logoutIcon: { fontSize: 16 },
    main: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
    headerSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
    notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    notifCardUnread: { borderColor: '#D9A441', backgroundColor: '#FFFBEB' },
    notifIcon: { fontSize: 24, marginRight: 12 },
    notifInfo: { flex: 1 },
    notifTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
    notifBody: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 2 },
    notifTime: { fontSize: 10, color: '#9CA3AF' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9A441', marginLeft: 8 },
    emptyState: { alignItems: 'center', paddingVertical: 50, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    emptyDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },
});
