import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ActiveJobs() {
    const router = useRouter();

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
                        <Text style={[s.navIcon, s.navIconActive]}>◈</Text><Text style={[s.navLabel, s.navLabelActive]}>Active Jobs</Text>
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
                </View>

                <View style={s.content}>
                    <Text style={s.pageTitle}>Active Jobs</Text>
                    <Text style={s.pageSub}>Jobs you are currently working on.</Text>

                    <View style={s.emptyState}>
                        <View style={s.emptyIconBox}>
                            <Text style={s.emptyIcon}>◈</Text>
                        </View>
                        <Text style={s.emptyTitle}>No Active Jobs</Text>
                        <Text style={s.emptyDesc}>Browse available jobs and submit offers to start working.</Text>
                        <TouchableOpacity style={s.browseBtn} onPress={() => router.push('/(bricoleur)/home')}>
                            <Text style={s.browseBtnText}>Browse Jobs →</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    topbar: { marginBottom: 8 },
    backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#D1FAE5' },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
    content: { flex: 1, justifyContent: 'center' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#064E3B', marginBottom: 4 },
    pageSub: { fontSize: 13, color: '#6B7280', marginBottom: 30 },

    // Empty State
    emptyState: { alignItems: 'center', backgroundColor: 'white', borderRadius: 16, padding: 40, borderWidth: 1, borderColor: '#D1FAE5' },
    emptyIconBox: { width: 64, height: 64, backgroundColor: '#ECFDF5', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    emptyIcon: { fontSize: 24, color: '#059669' },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#064E3B', marginBottom: 6 },
    emptyDesc: { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 20, paddingHorizontal: 20 },
    browseBtn: { backgroundColor: '#059669', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
    browseBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
});