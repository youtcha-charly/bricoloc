import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const quickActions = [
        { icon: '🔍', title: 'Find a Handyman', desc: 'Browse verified tradespeople', route: '/post-job' },
        { icon: '📝', title: 'Post a Job', desc: 'Get offers quickly', route: '/post-job' },
        { icon: '📊', title: 'View Dashboard', desc: 'Track your jobs & stats', route: '/dashboard' },
    ];

    const categories = [
        { icon: '🔧', name: 'Plumbing' },
        { icon: '⚡', name: 'Electrical' },
        { icon: '🎨', name: 'Painting' },
        { icon: '🪚', name: 'Carpentry' },
        { icon: '❄️', name: 'AC Repair' },
        { icon: '🧹', name: 'Cleaning' },
        { icon: '📦', name: 'Moving' },
        { icon: '📱', name: 'Repair' },
    ];

    const activities = [
        { title: 'New offer received', desc: 'Plumber - Douala', time: '5 min ago', icon: '💬' },
        { title: 'Job completed', desc: 'Painting - Yaounde', time: '2h ago', icon: '✅' },
        { title: 'Handyman verified', desc: 'Jean K. joined the platform', time: '3h ago', icon: '👷' },
    ];

    return (
        <View style={s.container}>

            {/* ========== SIDEBAR ========== */}
            <View style={s.sidebar}>
                <View style={s.sidebarLogo}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.logoText}>BricoLoc</Text>
                </View>

                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>🏠</Text><Text style={[s.navLabel, s.navLabelActive]}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/dashboard')}>
                    <Text style={s.navIcon}>📊</Text><Text style={s.navLabel}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/post-job')}>
                    <Text style={s.navIcon}>📝</Text><Text style={s.navLabel}>Post a Job</Text>
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

                <View style={s.sidebarFooter}>
                    <View style={s.sidebarUser}>
                        <View style={s.userAvatar}><Text style={s.userAvatarText}>{user?.name?.charAt(0) || 'U'}</Text></View>
                        <View>
                            <Text style={s.userName}>{user?.name || 'User'}</Text>
                            <Text style={s.userRole}>Client · {user?.city || 'Douala'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={s.logoutSidebarBtn}>
                        <Text style={s.logoutSidebarIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ========== MAIN CONTENT ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <View>
                        <Text style={s.pageTitle}>Welcome back, {user?.name?.split(' ')[0] || 'User'} </Text>
                        <Text style={s.pageSubtitle}>What would you like to do today?</Text>
                    </View>
                    
                </View>

                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

                    {/* Quick Actions */}
                    <View style={s.quickActions}>
                        {quickActions.map((action, index) => (
                            <TouchableOpacity key={index} style={s.quickActionCard} onPress={() => router.push(action.route)}>
                                <Text style={s.quickActionIcon}>{action.icon}</Text>
                                <View style={s.quickActionInfo}>
                                    <Text style={s.quickActionTitle}>{action.title}</Text>
                                    <Text style={s.quickActionDesc}>{action.desc}</Text>
                                </View>
                                <Text style={s.quickActionArrow}>→</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Categories */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Popular Services</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
                        {categories.map((cat, index) => (
                            <TouchableOpacity key={index} style={s.catCard}>
                                <Text style={s.catIcon}>{cat.icon}</Text>
                                <Text style={s.catName}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Recent Activity */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Recent Activity</Text>
                    </View>
                    {activities.map((activity, index) => (
                        <View key={index} style={s.activityCard}>
                            <View style={s.activityIconBox}>
                                <Text style={s.activityEmoji}>{activity.icon}</Text>
                            </View>
                            <View style={s.activityInfo}>
                                <Text style={s.activityTitle}>{activity.title}</Text>
                                <Text style={s.activityDesc}>{activity.desc}</Text>
                            </View>
                            <Text style={s.activityTime}>{activity.time}</Text>
                        </View>
                    ))}

                    {/* Stats */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>Your Summary</Text>
                    </View>
                    <View style={s.statsGrid}>
                        <View style={[s.statCard, { backgroundColor: '#EFF6FF' }]}>
                            <Text style={[s.statNum, { color: '#2563EB' }]}>6</Text>
                            <Text style={s.statLabel}>Jobs</Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: '#FDF3E0' }]}>
                            <Text style={[s.statNum, { color: '#B8860B' }]}>15</Text>
                            <Text style={s.statLabel}>Offers</Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: '#E6F4F2' }]}>
                            <Text style={[s.statNum, { color: '#0F766E' }]}>3</Text>
                            <Text style={s.statLabel}>Active</Text>
                        </View>
                        <View style={[s.statCard, { backgroundColor: '#F3F4F6' }]}>
                            <Text style={[s.statNum, { color: '#374151' }]}>4.8</Text>
                            <Text style={s.statLabel}>Rating</Text>
                        </View>
                    </View>

                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },

    // ===== SIDEBAR =====
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
    logoutSidebarBtn: { padding: 6 },
    logoutSidebarIcon: { fontSize: 16 },

    // ===== MAIN =====
    main: { flex: 1, paddingHorizontal: 28, paddingVertical: 24 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A' },
    pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 3 },
    primaryBtn: { backgroundColor: '#D9A441', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6 },
    primaryBtnText: { color: '#0B3D3E', fontWeight: '600', fontSize: 13 },

    scroll: { flex: 1 },

    // ===== QUICK ACTIONS =====
    quickActions: { marginBottom: 20 },
    quickActionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    quickActionIcon: { fontSize: 26, marginRight: 14 },
    quickActionInfo: { flex: 1 },
    quickActionTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
    quickActionDesc: { color: '#9CA3AF', fontSize: 11, marginTop: 2 },
    quickActionArrow: { fontSize: 18, color: '#D1D5DB' },

    // ===== SECTION =====
    sectionHeader: { marginBottom: 10, marginTop: 6 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },

    // ===== CATEGORIES =====
    catScroll: { marginBottom: 18 },
    catCard: { alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 14, marginRight: 10, width: 85, borderWidth: 1, borderColor: '#E5E7EB' },
    catIcon: { fontSize: 24, marginBottom: 6 },
    catName: { fontSize: 10, color: '#374151', fontWeight: '500', textAlign: 'center' },

    // ===== ACTIVITY =====
    activityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    activityIconBox: { width: 38, height: 38, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 12, backgroundColor: '#FDF3E0' },
    activityEmoji: { fontSize: 16 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 13, fontWeight: '600', color: '#111827' },
    activityDesc: { color: '#6B7280', fontSize: 11, marginTop: 2 },
    activityTime: { color: '#9CA3AF', fontSize: 10 },

    // ===== STATS =====
    statsGrid: { flexDirection: 'row', gap: 8 },
    statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
    statNum: { fontSize: 20, fontWeight: '700' },
    statLabel: { fontSize: 10, color: '#6B7280', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
});