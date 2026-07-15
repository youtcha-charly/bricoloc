import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function MyBids() {
    const router = useRouter();
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('auth_token');

    const fetchBids = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:8000/api/v1/my-bids', {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setBids(data.data || []);
            }
        } catch (err) {
            console.log('Error fetching bids:', err);
        }
        setLoading(false);
    };

    useEffect(() => { fetchBids(); }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#FFFBEB', text: '#92400E', label: 'Pending' };
            case 'accepted': return { bg: '#ECFDF5', text: '#065F46', label: 'Accepted' };
            case 'rejected': return { bg: '#FEF2F2', text: '#991B1B', label: 'Rejected' };
            default: return { bg: '#F3F4F6', text: '#6B7280', label: status?.toUpperCase() || 'N/A' };
        }
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
                    <TouchableOpacity style={[s.navItem, s.navActive]}>
                        <Text style={[s.navIcon, s.navIconActive]}>◎</Text><Text style={[s.navLabel, s.navLabelActive]}>My Offers</Text>
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
            </View>

            {/* ========== MAIN ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Text style={s.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={fetchBids} style={s.refreshBtn}>
                        <Text style={s.refreshBtnText}>🔄 Refresh</Text>
                    </TouchableOpacity>
                </View>

                <Text style={s.pageTitle}>My Offers</Text>
                <Text style={s.pageSub}>Track the bids you have submitted.</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#059669" style={{ marginTop: 40 }} />
                ) : bids.length === 0 ? (
                    <View style={s.emptyState}>
                        <View style={s.emptyIconBox}><Text style={s.emptyIcon}>◎</Text></View>
                        <Text style={s.emptyTitle}>No Offers Submitted</Text>
                        <Text style={s.emptyDesc}>Browse available jobs and submit your offers to start winning work.</Text>
                        <TouchableOpacity style={s.browseBtn} onPress={() => router.push('/(bricoleur)/home')}>
                            <Text style={s.browseBtnText}>Browse Jobs →</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {bids.map((bid, index) => {
                            const st = getStatusStyle(bid.status);
                            return (
                                <View key={bid.id || index} style={s.bidCard}>
                                    <View style={s.bidHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.bidTitle}>{bid.job?.title || 'Job #' + bid.job_id}</Text>
                                        </View>
                                        <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                                            <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                                        </View>
                                    </View>
                                    <View style={s.bidMeta}>
                                        <Text style={s.bidAmount}>{bid.amount ? bid.amount.toLocaleString() : '0'} FCFA</Text>
                                        <Text style={s.bidDays}>⏱ {bid.estimated_days || 1} day(s)</Text>
                                    </View>
                                    {bid.message && <Text style={s.bidMessage}>"{bid.message}"</Text>}
                                    <Text style={s.bidDate}>📅 {bid.created_at ? new Date(bid.created_at).toLocaleString() : 'N/A'}</Text>
                                </View>
                            );
                        })}
                        <View style={{ height: 20 }} />
                    </ScrollView>
                )}
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F0FDF4' },

    // Sidebar
    sidebar: { width: 200, backgroundColor: '#064E3B', paddingVertical: 24, paddingHorizontal: 16, justifyContent: 'flex-start' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    brandIcon: { width: 30, height: 30, backgroundColor: '#F59E0B', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    brandIconText: { color: '#064E3B', fontWeight: '700', fontSize: 13 },
    brandName: { color: '#ECFDF5', fontWeight: '600', fontSize: 15 },
    brandLabel: { color: '#6EE7B7', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 22, marginTop: 2 },
    nav: {},
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 6, marginBottom: 1, gap: 10 },
    navActive: { backgroundColor: '#065F46' },
    navIcon: { fontSize: 14, color: '#6EE7B7', width: 18, textAlign: 'center' },
    navIconActive: { color: '#F59E0B' },
    navLabel: { fontSize: 12, color: '#A7F3D0' },
    navLabelActive: { color: '#ECFDF5', fontWeight: '600' },

    // Main
    main: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#D1FAE5' },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
    refreshBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: '#059669' },
    refreshBtnText: { color: 'white', fontSize: 12, fontWeight: '600' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#064E3B', marginTop: 8 },
    pageSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 },

    // Empty State
    emptyState: { alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 40, borderWidth: 1, borderColor: '#D1FAE5' },
    emptyIconBox: { width: 64, height: 64, backgroundColor: '#ECFDF5', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyIcon: { fontSize: 24, color: '#059669' },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#064E3B', marginBottom: 6 },
    emptyDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
    browseBtn: { backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    browseBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },

    // Bid Cards
    bidCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#D1FAE5' },
    bidHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    bidTitle: { fontSize: 15, fontWeight: '600', color: '#064E3B', flex: 1, marginRight: 8 },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
    bidMeta: { flexDirection: 'row', gap: 16, marginBottom: 6 },
    bidAmount: { fontSize: 16, fontWeight: '700', color: '#059669' },
    bidDays: { fontSize: 12, color: '#6B7280' },
    bidMessage: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', marginBottom: 4 },
    bidDate: { fontSize: 10, color: '#9CA3AF' },
});