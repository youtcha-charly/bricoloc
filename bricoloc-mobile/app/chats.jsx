import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { chatsAPI, notificationsAPI } from '../src/services/api';

export default function ClientChats() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [chats, setChats] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('chats');

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [chatsRes, notifsRes] = await Promise.all([
                chatsAPI.list(),
                notificationsAPI.list(),
            ]);
            if (chatsRes.data.success) {
                setChats(chatsRes.data.data || []);
            }
            if (notifsRes.data.success) {
                const notifList = notifsRes.data.data?.data || notifsRes.data.data || [];
                setNotifications(Array.isArray(notifList) ? notifList : []);
            }
        } catch (err) {
            console.log('Error loading chats:', err);
        }
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, []);

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
            default: return '🔔';
        }
    };

    const getNotifRoute = (notif) => {
        try {
            const data = JSON.parse(notif.data || '{}');
            if (data.chat_id) return { pathname: '/chat/[id]', params: { id: String(data.chat_id) } };
            if (data.job_id) return { pathname: '/job/[id]', params: { id: String(data.job_id) } };
        } catch {}
        return null;
    };

    return (
        <View style={s.container}>
            {/* Sidebar */}
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
                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>💬</Text><Text style={[s.navLabel, s.navLabelActive]}>Messages</Text>
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

            {/* Main */}
            <View style={s.main}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={s.header}>
                        <Text style={s.headerTitle}>Messages & Notifications</Text>
                    </View>

                    <View style={s.tabRow}>
                        <TouchableOpacity
                            style={[s.tab, activeTab === 'chats' && s.tabActive]}
                            onPress={() => setActiveTab('chats')}
                        >
                            <Text style={[s.tabText, activeTab === 'chats' && s.tabTextActive]}>
                                💬 Chats ({chats.length})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.tab, activeTab === 'notifications' && s.tabActive]}
                            onPress={() => setActiveTab('notifications')}
                        >
                            <Text style={[s.tabText, activeTab === 'notifications' && s.tabTextActive]}>
                                🔔 Notifications ({notifications.length})
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#D9A441" style={{ marginTop: 40 }} />
                    ) : activeTab === 'chats' ? (
                        chats.length === 0 ? (
                            <View style={s.emptyState}>
                                <Text style={s.emptyIcon}>💬</Text>
                                <Text style={s.emptyTitle}>No conversations yet</Text>
                                <Text style={s.emptyDesc}>When you accept a bricoleur's offer, a chat will appear here.</Text>
                                <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/dashboard')}>
                                    <Text style={s.emptyBtnText}>Go to Dashboard →</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            chats.map(chat => {
                                const other = chat.other_user || {};
                                const lastMsg = chat.last_message;
                                const unread = chat.unread_count || 0;
                                return (
                                    <TouchableOpacity
                                        key={chat.id}
                                        style={[s.chatCard, unread > 0 && s.chatCardUnread]}
                                        onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(chat.id) } })}
                                    >
                                        <View style={s.chatAvatar}>
                                            <Text style={s.chatAvatarText}>{(other.name || 'U').charAt(0)}</Text>
                                            {unread > 0 && <View style={s.unreadDot} />}
                                        </View>
                                        <View style={s.chatInfo}>
                                            <View style={s.chatTop}>
                                                <Text style={[s.chatName, unread > 0 && s.chatNameBold]} numberOfLines={1}>
                                                    {other.name || 'Unknown'}
                                                </Text>
                                                <Text style={s.chatTime}>
                                                    {lastMsg ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                </Text>
                                            </View>
                                            <Text style={s.chatJob} numberOfLines={1}>📂 {chat.job?.title || 'Job'}</Text>
                                            <Text style={[s.chatPreview, unread > 0 && s.chatPreviewBold]} numberOfLines={1}>
                                                {lastMsg ? lastMsg.message : 'No messages yet'}
                                            </Text>
                                        </View>
                                        {unread > 0 && (
                                            <View style={s.unreadBadge}>
                                                <Text style={s.unreadBadgeText}>{unread}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })
                        )
                    ) : (
                        notifications.length === 0 ? (
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
                                        style={[s.notifCard, !notif.read_at && s.notifCardUnread]}
                                        onPress={() => route && router.push(route)}
                                    >
                                        <Text style={s.notifIcon}>{getNotifIcon(notif.type)}</Text>
                                        <View style={s.notifInfo}>
                                            <Text style={s.notifTitle}>{notif.title}</Text>
                                            <Text style={s.notifBody} numberOfLines={2}>{notif.body}</Text>
                                            <Text style={s.notifTime}>{notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}</Text>
                                        </View>
                                        {!notif.read_at && <View style={s.unreadDot} />}
                                    </TouchableOpacity>
                                );
                            })
                        )
                    )}
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },

    // Sidebar
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

    // Main
    main: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
    header: { marginBottom: 16 },
    headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },

    // Tabs
    tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
    tab: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' },
    tabActive: { backgroundColor: '#D9A441', borderColor: '#D9A441' },
    tabText: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
    tabTextActive: { color: '#0B3D3E' },

    // Chat cards
    chatCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    chatCardUnread: { borderColor: '#D9A441', backgroundColor: '#FFFBEB' },
    chatAvatar: { width: 44, height: 44, backgroundColor: '#064E3B', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    chatAvatarText: { color: '#6EE7B7', fontSize: 18, fontWeight: 'bold' },
    chatInfo: { flex: 1 },
    chatTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
    chatName: { fontSize: 14, color: '#1A1A1A', flex: 1 },
    chatNameBold: { fontWeight: '700' },
    chatTime: { fontSize: 10, color: '#9CA3AF' },
    chatJob: { fontSize: 11, color: '#6B7280', marginBottom: 2 },
    chatPreview: { fontSize: 12, color: '#9CA3AF' },
    chatPreviewBold: { color: '#374151', fontWeight: '600' },
    unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D9A441' },
    unreadBadge: { backgroundColor: '#D9A441', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6, marginLeft: 8 },
    unreadBadgeText: { color: '#0B3D3E', fontSize: 11, fontWeight: '700' },

    // Notification cards
    notifCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    notifCardUnread: { borderColor: '#D9A441', backgroundColor: '#FFFBEB' },
    notifIcon: { fontSize: 24, marginRight: 12 },
    notifInfo: { flex: 1 },
    notifTitle: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', marginBottom: 2 },
    notifBody: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 2 },
    notifTime: { fontSize: 10, color: '#9CA3AF' },

    emptyState: { alignItems: 'center', paddingVertical: 50, backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    emptyDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 },
    emptyBtn: { marginTop: 16, backgroundColor: '#D9A441', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    emptyBtnText: { color: '#0B3D3E', fontWeight: '600', fontSize: 13 },
});
