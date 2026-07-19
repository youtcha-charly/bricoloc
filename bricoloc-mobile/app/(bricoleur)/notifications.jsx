import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { notificationsAPI } from '../../src/services/api';

export default function BricoleurNotifications() {
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

    useFocusEffect(useCallback(() => { loadData(); }, []));

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
            if (data.chat_id) return { pathname: '/(bricoleur)/chats' };
            if (notif.type === 'new_review') return { pathname: '/(bricoleur)/active-jobs' };
            if (data.job_id) return { pathname: '/(bricoleur)/active-jobs' };
        } catch {}
        return null;
    };

    return (
        <View style={s.root}>
            <View style={s.sidebar}>
                <View style={s.brand}>
                    <View style={s.brandIcon}><Text style={s.brandIconText}>BL</Text></View>
                    <Text style={s.brandName}>BricoLoc</Text>
                </View>
                <Text style={s.brandLabel}>HANDYMAN</Text>

                <View style={s.nav}>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/home')}>
                        <Text style={s.navIcon}>⊡</Text><Text style={s.navLabel}>Browse Jobs</Text>
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
                    <TouchableOpacity style={[s.navItem, s.navActive]}>
                        <Text style={[s.navIcon, s.navIconActive]}>🔔</Text>
                        <Text style={[s.navLabel, s.navLabelActive]}>Notifications</Text>
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
                        <Text style={s.sideUserRole}>Bricoleur</Text>
                    </View>
                </View>
            </View>

            <View style={s.main}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={s.header}>
                        <Text style={s.headerTitle}>Notifications</Text>
                        <Text style={s.headerSub}>Stay updated on your bids and jobs</Text>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
                    ) : notifications.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={s.emptyIcon}>🔔</Text>
                            <Text style={s.emptyTitle}>No notifications</Text>
                            <Text style={s.emptyDesc}>You'll be notified when clients interact with your bids.</Text>
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
    header: { marginBottom: 20 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#064E3B' },
    headerSub: { fontSize: 13, color: '#6B7280', marginTop: 3 },
    notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#D1FAE5' },
    notifCardUnread: { borderColor: '#F59E0B', backgroundColor: '#FFFBEB' },
    notifIcon: { fontSize: 24, marginRight: 12 },
    notifInfo: { flex: 1 },
    notifTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
    notifBody: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 2 },
    notifTime: { fontSize: 10, color: '#9CA3AF' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B', marginLeft: 8 },
    emptyState: { alignItems: 'center', paddingVertical: 50, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#D1FAE5' },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: '#064E3B' },
    emptyDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },
});
