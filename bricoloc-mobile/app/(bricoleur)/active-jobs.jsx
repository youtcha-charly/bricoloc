import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { bidsAPI } from '../../src/services/api';

export default function ActiveJobs() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState([]);
    const [activeTab, setActiveTab] = useState('active');

    useFocusEffect(
        useCallback(() => {
            loadBids();
        }, [])
    );

    const loadBids = async () => {
        setLoading(true);
        try {
            const res = await bidsAPI.myBids();
            if (res.data.success) {
                setBids(res.data.data || []);
            }
        } catch (err) {
            console.log('Error loading bids:', err);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const pendingBids = bids.filter(b => b.status === 'pending');
    const activeBids = bids.filter(b => b.status === 'accepted');
    const completedBids = bids.filter(b => b.status === 'accepted' && b.job?.status === 'completed');
    const rejectedBids = bids.filter(b => b.status === 'rejected');

    const tabs = [
        { key: 'active', label: 'Active', count: activeBids.length },
        { key: 'pending', label: 'Pending', count: pendingBids.length },
        { key: 'completed', label: 'Completed', count: completedBids.length },
        { key: 'rejected', label: 'Cancelled', count: rejectedBids.length },
    ];

    const getDisplayedBids = () => {
        switch (activeTab) {
            case 'pending': return pendingBids;
            case 'active': return activeBids;
            case 'completed': return completedBids;
            case 'rejected': return rejectedBids;
            default: return activeBids;
        }
    };

    const displayedBids = getDisplayedBids();

    const getStatusColor = (bid) => {
        if (bid.status === 'pending') return '#F59E0B';
        if (bid.status === 'rejected') return '#EF4444';
        if (bid.job?.status === 'completed') return '#059669';
        return '#2563EB';
    };

    const getStatusLabel = (bid) => {
        if (bid.status === 'pending') return 'Pending Review';
        if (bid.status === 'rejected') return 'Rejected';
        if (bid.job?.status === 'completed') return 'Completed';
        return 'In Progress';
    };

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
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/home')}>
                        <Text style={s.navIcon}>⊡</Text><Text style={s.navLabel}>Browse Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/my-bids')}>
                        <Text style={s.navIcon}>◎</Text><Text style={s.navLabel}>My Offers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.navItem, s.navActive]}>
                        <Text style={[s.navIcon, s.navIconActive]}>◈</Text>
                        <Text style={[s.navLabel, s.navLabelActive]}>Active Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/chats')}>
                        <Text style={s.navIcon}>◉</Text><Text style={s.navLabel}>Messages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/notifications')}>
                        <Text style={s.navIcon}>🔔</Text><Text style={s.navLabel}>Notifications</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/profile')}>
                        <Text style={s.navIcon}>▣</Text><Text style={s.navLabel}>Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={s.navSep} />
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

            {/* ========== MAIN ========== */}
            <View style={s.main}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={s.pageTitle}>My Jobs</Text>
                    <Text style={s.pageSub}>Track all your jobs by status.</Text>

                    {/* Tabs */}
                    <View style={s.tabRow}>
                        {tabs.map(tab => (
                            <TouchableOpacity
                                key={tab.key}
                                style={[s.tab, activeTab === tab.key && s.tabActive]}
                                onPress={() => setActiveTab(tab.key)}
                            >
                                <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
                                    {tab.label} ({tab.count})
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {loading ? (
                        <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
                    ) : displayedBids.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={s.emptyIcon}>
                                {activeTab === 'active' ? '◈' : activeTab === 'pending' ? '⏳' : activeTab === 'completed' ? '✅' : '❌'}
                            </Text>
                            <Text style={s.emptyTitle}>
                                {activeTab === 'active' ? 'No Active Jobs' :
                                 activeTab === 'pending' ? 'No Pending Jobs' :
                                 activeTab === 'completed' ? 'No Completed Jobs' : 'No Cancelled Jobs'}
                            </Text>
                            <Text style={s.emptyDesc}>
                                {activeTab === 'active' ? 'Jobs where your bid has been accepted will appear here.' :
                                 activeTab === 'pending' ? 'Jobs where you are waiting for a response will appear here.' :
                                 activeTab === 'completed' ? 'Your completed jobs will appear here.' : 'Rejected bids will appear here.'}
                            </Text>
                            {(activeTab === 'active' || activeTab === 'pending') && (
                                <TouchableOpacity style={s.browseBtn} onPress={() => router.push('/(bricoleur)/home')}>
                                    <Text style={s.browseBtnText}>Browse Jobs →</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        displayedBids.map(bid => {
                            const job = bid.job || {};
                            const statusColor = getStatusColor(bid);
                            const statusLabel = getStatusLabel(bid);
                            return (
                                <View key={bid.id} style={s.jobCard}>
                                    <View style={s.cardHeader}>
                                        <View style={s.cardTitleRow}>
                                            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                                            <Text style={s.cardTitle}>{job.title || 'Untitled Job'}</Text>
                                        </View>
                                        <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
                                            <Text style={[s.statusText, { color: statusColor }]}>{statusLabel}</Text>
                                        </View>
                                    </View>

                                    <View style={s.cardMeta}>
                                        <Text style={s.metaText}>📂 {job.category?.name || 'General'}</Text>
                                        <Text style={s.metaText}>📍 {job.city || 'N/A'}</Text>
                                        <Text style={s.metaText}>💰 {bid.amount ? bid.amount.toLocaleString() : '0'} FCFA</Text>
                                    </View>

                                    {job.description ? (
                                        <Text style={s.cardDesc} numberOfLines={2}>{job.description}</Text>
                                    ) : null}

                                    <View style={s.cardFooter}>
                                        <Text style={s.footerText}>
                                            {bid.status === 'pending' ? 'Waiting for client response...' :
                                             bid.status === 'rejected' ? 'Your bid was not selected' :
                                             bid.job?.status === 'completed' ? 'Job completed successfully' :
                                             'Working on this job'}
                                        </Text>
                                        <Text style={s.footerDate}>
                                            {bid.created_at ? new Date(bid.created_at).toLocaleDateString() : ''}
                                        </Text>
                                    </View>
                                </View>
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
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#064E3B' },
    pageSub: { fontSize: 13, color: '#6B7280', marginTop: 3, marginBottom: 16 },

    // Tabs
    tabRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
    tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1FAE5' },
    tabActive: { backgroundColor: '#059669', borderColor: '#059669' },
    tabText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    tabTextActive: { color: 'white' },

    // Job Cards
    jobCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D1FAE5' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: '#064E3B', flex: 1 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusText: { fontSize: 11, fontWeight: '600' },
    cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    metaText: { fontSize: 11, color: '#6B7280' },
    cardDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18, marginBottom: 10 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#ECFDF5', paddingTop: 10 },
    footerText: { fontSize: 11, color: '#9CA3AF', flex: 1 },
    footerDate: { fontSize: 10, color: '#9CA3AF' },

    // Empty
    emptyState: { alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 40, borderWidth: 1, borderColor: '#D1FAE5' },
    emptyIcon: { fontSize: 40, marginBottom: 8 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#064E3B', marginBottom: 6 },
    emptyDesc: { fontSize: 12, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 16, paddingHorizontal: 20 },
    browseBtn: { backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    browseBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
});
