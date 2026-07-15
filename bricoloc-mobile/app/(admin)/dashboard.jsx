import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Alert, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({ totalClients: 0, totalBricoleurs: 0, totalAdmins: 0, activeJobs: 0, completedJobs: 0, pendingVerifications: 0, openDisputes: 0 });
    const [clients, setClients] = useState([]);
    const [bricoleurs, setBricoleurs] = useState([]);

    const getToken = () => localStorage.getItem('auth_token');

    const api = async (url, options = {}) => {
        const token = getToken();
        const res = await fetch('http://127.0.0.1:8000/api/v1/admin' + url, {
            headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json', ...options.headers },
            ...options,
        });
        return res.json();
    };

    const loadAll = async () => {
        setLoading(true);
        const [s, c, b] = await Promise.all([api('/dashboard'), api('/clients'), api('/bricoleurs')]);
        if (s.success) setStats(s.data);
        if (c.success) setClients(c.data.data || c.data);
        if (b.success) setBricoleurs(b.data.data || b.data);
        setLoading(false);
    };

    useEffect(() => { loadAll(); }, []);

    const act = {
        verify: async (id) => { await api(`/bricoleurs/${id}/verify`, { method: 'PUT' }); Alert.alert('Verified'); loadAll(); },
        reject: async (id) => { await api(`/bricoleurs/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason: 'Invalid' }) }); Alert.alert('Rejected'); loadAll(); },
        suspend: async (id) => { await api(`/users/${id}/toggle-suspend`, { method: 'PUT' }); Alert.alert('Toggled'); loadAll(); },
        delete: (id) => Alert.alert('Delete User', 'This is permanent.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { await api(`/users/${id}`, { method: 'DELETE' }); loadAll(); } }]),
    };

    const status = (s) => {
        const map = {
            active: ['#F0FDF4', '#15803D', 'Active'],
            verified: ['#F0FDF4', '#15803D', 'Verified'],
            suspended: ['#FEF2F2', '#B91C1C', 'Suspended'],
            rejected: ['#FEF2F2', '#B91C1C', 'Rejected'],
            pending: ['#FFF7ED', '#C2410C', 'Pending'],
        };
        return map[s] || ['#F5F5F4', '#78716C', s?.toUpperCase()];
    };

    const filter = (list, fields) => list.filter(item => fields.some(f => (item[f] || '').toLowerCase().includes(searchQuery.toLowerCase())));

    if (loading) return (
        <View style={c.root}>
            <ActivityIndicator size="large" color="#D97706" style={{ marginTop: 120 }} />
            <Text style={{ textAlign: 'center', marginTop: 12, color: '#78716C', fontSize: 12 }}>Loading administration...</Text>
        </View>
    );

    return (
        <View style={c.root}>

            {/* ========== SIDEBAR ========== */}
            <View style={c.sidebar}>
                {/* Brand */}
                <View style={c.brand}>
                    <View style={c.brandIcon}><Text style={c.brandIconText}>BL</Text></View>
                    <Text style={c.brandName}>BricoLoc</Text>
                </View>
                <Text style={c.brandLabel}>ADMINISTRATION</Text>

                {/* Nav */}
                <View style={c.nav}>
                    <TouchableOpacity style={[c.navItem, activeTab === 'overview' && c.navActive]} onPress={() => setActiveTab('overview')}>
                        <Text style={[c.navIcon, activeTab === 'overview' && c.navIconActive]}>⊡</Text>
                        <Text style={[c.navLabel, activeTab === 'overview' && c.navLabelActive]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[c.navItem, activeTab === 'clients' && c.navActive]} onPress={() => setActiveTab('clients')}>
                        <Text style={[c.navIcon, activeTab === 'clients' && c.navIconActive]}>◎</Text>
                        <Text style={[c.navLabel, activeTab === 'clients' && c.navLabelActive]}>Clients</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[c.navItem, activeTab === 'bricoleurs' && c.navActive]} onPress={() => setActiveTab('bricoleurs')}>
                        <Text style={[c.navIcon, activeTab === 'bricoleurs' && c.navIconActive]}>◈</Text>
                        <Text style={[c.navLabel, activeTab === 'bricoleurs' && c.navLabelActive]}>Handymen</Text>
                    </TouchableOpacity>
                </View>

                <View style={c.navSep} />

                {/* Bottom */}
                <TouchableOpacity style={c.navItem} onPress={loadAll}>
                    <Text style={c.navIcon}>↻</Text><Text style={c.navLabel}>Refresh Data</Text>
                </TouchableOpacity>
                <TouchableOpacity style={c.navItem} onPress={() => { localStorage.clear(); router.replace('/login'); }}>
                    <Text style={c.navIcon}>⇤</Text><Text style={[c.navLabel, { color: '#B91C1C' }]}>Sign Out</Text>
                </TouchableOpacity>

                {/* User */}
                <View style={c.sideUser}>
                    <View style={c.sideAvatar}><Text style={c.sideAvatarText}>A</Text></View>
                    <View>
                        <Text style={c.sideUserName}>Admin</Text>
                        <Text style={c.sideUserRole}>Super Admin</Text>
                    </View>
                </View>
            </View>

            {/* ========== MAIN CONTENT ========== */}
            <View style={c.main}>
                {/* Top Bar */}
                <View style={c.topbar}>
                    <Text style={c.pageTitle}>Dashboard</Text>
                    <Text style={c.pageDesc}>Monitor and manage your platform</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={c.scroll}>

                    {/* ===== KPI CARDS ===== */}
                    <View style={c.kpiGrid}>
                        <View style={c.kpi}><Text style={c.kpiVal}>{stats.totalClients}</Text><Text style={c.kpiLbl}>Total Clients</Text></View>
                        <View style={c.kpi}><Text style={c.kpiVal}>{stats.totalBricoleurs}</Text><Text style={c.kpiLbl}>Total Handymen</Text></View>
                        <View style={c.kpi}><Text style={c.kpiVal}>{stats.activeJobs}</Text><Text style={c.kpiLbl}>Active Jobs</Text></View>
                        <View style={c.kpi}><Text style={c.kpiVal}>{stats.completedJobs}</Text><Text style={c.kpiLbl}>Completed</Text></View>
                    </View>

                    {/* ===== ALERT ROW ===== */}
                    <View style={c.alertRow}>
                        <View style={c.alert}><Text style={c.alertNum}>{stats.pendingVerifications}</Text><Text style={c.alertLbl}>Pending Verifications</Text></View>
                        <View style={c.alert}><Text style={c.alertNum}>{stats.openDisputes}</Text><Text style={c.alertLbl}>Open Disputes</Text></View>
                    </View>

                    {/* ===== SEARCH ===== */}
                    <TextInput style={c.search} placeholder="Filter by name, email, or location..." placeholderTextColor="#A8A29E" value={searchQuery} onChangeText={setSearchQuery} />

                    {/* ===== SECTION TITLE ===== */}
                    <Text style={c.sectionTitle}>
                        {activeTab === 'clients' ? 'Clients' : activeTab === 'bricoleurs' ? 'Handymen' : 'All Users'}
                    </Text>

                    {/* ===== CLIENTS ===== */}
                    {(activeTab === 'overview' || activeTab === 'clients') && filter(clients, ['name', 'email', 'city']).map(client => {
                        const [bg, color, label] = status(client.status);
                        return (
                            <View key={client.id} style={c.card}>
                                <View style={c.cardLeft}>
                                    <View style={c.cardAvatar}><Text style={c.cardAvatarText}>{(client.name || '?')[0]}</Text></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={c.cardName}>{client.name || 'Unknown'}</Text>
                                        <Text style={c.cardDetail}>{client.email || '—'}</Text>
                                        <Text style={c.cardMeta}>{client.phone_number || '—'}  ·  {client.city || '—'}</Text>
                                    </View>
                                </View>
                                <View style={c.cardRight}>
                                    <View style={[c.tag, { backgroundColor: bg }]}><Text style={[c.tagText, { color }]}>{label}</Text></View>
                                    <View style={c.cardActions}>
                                        <TouchableOpacity onPress={() => act.suspend(client.id)} style={c.cardBtn}>
                                            <Text style={c.cardBtnText}>{client.status === 'suspended' ? '↩' : '⏸'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => act.delete(client.id)} style={[c.cardBtn, c.cardBtnDanger]}>
                                            <Text style={[c.cardBtnText, { color: '#B91C1C' }]}>🗑</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    {/* ===== BRICOLEURS ===== */}
                    {(activeTab === 'overview' || activeTab === 'bricoleurs') && filter(bricoleurs, ['name', 'email', 'city']).map(b => {
                        const vStatus = b.bricoleur_profile?.verification_status || 'pending';
                        const [bg, color, label] = status(vStatus);
                        const skills = b.bricoleur_profile?.skills;
                        const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? JSON.parse(skills || '[]') : []);
                        return (
                            <View key={b.id} style={c.card}>
                                <View style={c.cardLeft}>
                                    <View style={[c.cardAvatar, { backgroundColor: '#D97706' }]}><Text style={c.cardAvatarText}>{(b.name || '?')[0]}</Text></View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={c.cardName}>{b.name || 'Unknown'}</Text>
                                        <Text style={c.cardDetail}>{b.email || '—'}</Text>
                                        <Text style={c.cardMeta}>{b.phone_number || '—'}  ·  {b.city || '—'}</Text>
                                        {skillsArray.length > 0 && (
                                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                                {skillsArray.map((sk, i) => <View key={i} style={c.skill}><Text style={c.skillText}>{sk}</Text></View>)}
                                            </View>
                                        )}
                                    </View>
                                </View>
                                <View style={c.cardRight}>
                                    <View style={[c.tag, { backgroundColor: bg }]}><Text style={[c.tagText, { color }]}>{label}</Text></View>
                                    {vStatus === 'pending' ? (
                                        <View style={c.cardActions}>
                                            <TouchableOpacity onPress={() => act.verify(b.id)} style={[c.cardBtn, c.cardBtnSuccess]}>
                                                <Text style={[c.cardBtnText, { color: '#15803D' }]}>✓</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => act.reject(b.id)} style={[c.cardBtn, c.cardBtnDanger]}>
                                                <Text style={[c.cardBtnText, { color: '#B91C1C' }]}>✕</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <View style={c.cardActions}>
                                            <TouchableOpacity onPress={() => act.delete(b.id)} style={[c.cardBtn, c.cardBtnDanger]}>
                                                <Text style={[c.cardBtnText, { color: '#B91C1C' }]}>🗑</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}

                    <View style={{ height: 60 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const c = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F4' },

    // ===== SIDEBAR =====
    sidebar: { width: 200, backgroundColor: '#292524', paddingVertical: 24, paddingHorizontal: 16, justifyContent: 'space-between' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    brandIcon: { width: 30, height: 30, backgroundColor: '#D97706', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    brandIconText: { color: 'white', fontWeight: '700', fontSize: 13 },
    brandName: { color: '#F5F5F4', fontWeight: '600', fontSize: 15 },
    brandLabel: { color: '#78716C', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 22, marginTop: 2 },

    nav: { flex: 1 },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 6, marginBottom: 1, gap: 10 },
    navActive: { backgroundColor: '#44403C' },
    navIcon: { fontSize: 14, color: '#78716C', width: 18, textAlign: 'center' },
    navIconActive: { color: '#D97706' },
    navLabel: { fontSize: 12, color: '#A8A29E', fontWeight: '400' },
    navLabelActive: { color: '#F5F5F4', fontWeight: '600' },
    navSep: { borderTopWidth: 1, borderTopColor: '#44403C', marginVertical: 12 },

    sideUser: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#44403C' },
    sideAvatar: { width: 30, height: 30, backgroundColor: '#D97706', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    sideAvatarText: { color: 'white', fontWeight: '700', fontSize: 12 },
    sideUserName: { color: '#F5F5F4', fontSize: 12, fontWeight: '500' },
    sideUserRole: { color: '#78716C', fontSize: 10 },

    // ===== MAIN =====
    main: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
    topbar: { marginBottom: 22 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#1C1917' },
    pageDesc: { fontSize: 12, color: '#78716C', marginTop: 2 },
    scroll: { flex: 1 },

    // ===== KPIs =====
    kpiGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
    kpi: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E7E5E4' },
    kpiVal: { fontSize: 26, fontWeight: '700', color: '#1C1917' },
    kpiLbl: { fontSize: 10, color: '#78716C', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

    // ===== ALERTS =====
    alertRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    alert: { flex: 1, backgroundColor: '#FFF7ED', borderRadius: 10, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA' },
    alertNum: { fontSize: 20, fontWeight: '700', color: '#C2410C' },
    alertLbl: { fontSize: 11, color: '#9A3412' },

    // ===== SEARCH =====
    search: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#1C1917', marginBottom: 18 },

    // ===== SECTION =====
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },

    // ===== CARDS =====
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#E7E5E4' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    cardAvatar: { width: 36, height: 36, backgroundColor: '#78716C', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    cardAvatarText: { color: 'white', fontWeight: '700', fontSize: 14 },
    cardName: { fontSize: 13, fontWeight: '600', color: '#1C1917' },
    cardDetail: { fontSize: 11, color: '#57534E' },
    cardMeta: { fontSize: 10, color: '#A8A29E', marginTop: 1 },
    skill: { backgroundColor: '#F5F5F4', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
    skillText: { fontSize: 9, color: '#78716C', fontWeight: '500' },

    cardRight: { alignItems: 'flex-end', gap: 8 },
    tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    tagText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
    cardActions: { flexDirection: 'row', gap: 4 },
    cardBtn: { width: 28, height: 28, borderRadius: 6, backgroundColor: '#F5F5F4', justifyContent: 'center', alignItems: 'center' },
    cardBtnSuccess: { backgroundColor: '#F0FDF4' },
    cardBtnDanger: { backgroundColor: '#FEF2F2' },
    cardBtnText: { fontSize: 12, color: '#57534E', fontWeight: '600' },
});