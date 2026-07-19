import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Alert, StyleSheet, ActivityIndicator, Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { adminAPI } from '../../src/services/api';

export default function AdminDashboard() {
    const router = useRouter();
    const { logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState({
        totalClients: 0, totalBricoleurs: 0, activeJobs: 0,
        completedJobs: 0, pendingVerifications: 0, openDisputes: 0,
        totalJobs: 0, totalBids: 0,
    });
    const [clients, setClients] = useState([]);
    const [bricoleurs, setBricoleurs] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [disputes, setDisputes] = useState([]);
    const [jobFilter, setJobFilter] = useState('all');

    const [resolveModal, setResolveModal] = useState(false);
    const [resolveDisputeId, setResolveDisputeId] = useState(null);
    const [resolveNote, setResolveNote] = useState('');

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        setLoading(true);
        try {
            const [s, c, b, j, d] = await Promise.all([
                adminAPI.dashboard(),
                adminAPI.clients(),
                adminAPI.bricoleurs(),
                adminAPI.jobs(),
                adminAPI.disputes(),
            ]);
            if (s.data.success) setStats(s.data.data);
            if (c.data.success) setClients(c.data.data || []);
            if (b.data.success) setBricoleurs(b.data.data || []);
            if (j.data.success) setJobs(j.data.data || []);
            if (d.data.success) setDisputes(d.data.data || []);
        } catch (err) {
            console.log('Admin load error:', err);
        }
        setLoading(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const act = {
        verify: async (id) => {
            try { await adminAPI.verifyBricoleur(id); Alert.alert('Verified'); loadAll(); } catch { Alert.alert('Error'); }
        },
        reject: async (id) => {
            try { await adminAPI.rejectBricoleur(id); Alert.alert('Rejected'); loadAll(); } catch { Alert.alert('Error'); }
        },
        suspend: async (id) => {
            try { await adminAPI.toggleSuspend(id); Alert.alert('Toggled'); loadAll(); } catch { Alert.alert('Error'); }
        },
        delete: (id) => Alert.alert('Delete User', 'This is permanent and cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: async () => {
                try { await adminAPI.deleteUser(id); loadAll(); } catch { Alert.alert('Error'); }
            }},
        ]),
        resolve: (id) => { setResolveDisputeId(id); setResolveNote(''); setResolveModal(true); },
        submitResolve: async () => {
            if (!resolveNote.trim()) { Alert.alert('Error', 'Please enter a resolution note.'); return; }
            try {
                await adminAPI.resolveDispute(resolveDisputeId, { resolution: resolveNote });
                setResolveModal(false);
                Alert.alert('Resolved');
                loadAll();
            } catch { Alert.alert('Error'); }
        },
    };

    const userStatus = (s) => {
        const map = {
            active: ['#F0FDF4', '#15803D', 'Active'],
            verified: ['#F0FDF4', '#15803D', 'Verified'],
            suspended: ['#FEF2F2', '#B91C1C', 'Suspended'],
            rejected: ['#FEF2F2', '#B91C1C', 'Rejected'],
            pending: ['#FFF7ED', '#C2410C', 'Pending'],
        };
        return map[s] || ['#F5F5F4', '#78716C', s?.toUpperCase()];
    };

    const jobStatus = (s) => {
        const map = {
            open: ['#FDF3E0', '#B8860B', 'Open'],
            assigned: ['#DBEAFE', '#1E40AF', 'Assigned'],
            in_progress: ['#DBEAFE', '#1E40AF', 'In Progress'],
            completed: ['#E6F4F2', '#0F766E', 'Completed'],
            cancelled: ['#FEF2F2', '#991B1B', 'Cancelled'],
        };
        return map[s] || ['#F5F5F4', '#78716C', s?.toUpperCase()];
    };

    const disputeStatus = (s) => {
        const map = {
            open: ['#FEF2F2', '#991B1B', 'Open'],
            resolved: ['#F0FDF4', '#15803D', 'Resolved'],
        };
        return map[s] || ['#F5F5F4', '#78716C', s?.toUpperCase()];
    };

    const filter = (list, fields) => {
        if (!searchQuery) return list;
        return list.filter(item => fields.some(f => (item[f] || '').toLowerCase().includes(searchQuery.toLowerCase())));
    };

    const filteredJobs = jobFilter === 'all' ? jobs : jobs.filter(j => j.status === jobFilter);

    if (loading) return (
        <View style={s.root}>
            <ActivityIndicator size="large" color="#D97706" style={{ marginTop: 120 }} />
            <Text style={{ textAlign: 'center', marginTop: 12, color: '#78716C', fontSize: 12 }}>Loading administration...</Text>
        </View>
    );

    return (
        <View style={s.root}>

            {/* ========== SIDEBAR ========== */}
            <View style={s.sidebar}>
                <View style={s.brand}>
                    <View style={s.brandIcon}><Text style={s.brandIconText}>BL</Text></View>
                    <Text style={s.brandName}>BricoLoc</Text>
                </View>
                <Text style={s.brandLabel}>ADMINISTRATION</Text>

                <View style={s.nav}>
                    <TouchableOpacity style={[s.navItem, activeTab === 'overview' && s.navActive]} onPress={() => setActiveTab('overview')}>
                        <Text style={[s.navIcon, activeTab === 'overview' && s.navIconActive]}>📊</Text>
                        <Text style={[s.navLabel, activeTab === 'overview' && s.navLabelActive]}>Overview</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.navItem, activeTab === 'clients' && s.navActive]} onPress={() => setActiveTab('clients')}>
                        <Text style={[s.navIcon, activeTab === 'clients' && s.navIconActive]}>👤</Text>
                        <Text style={[s.navLabel, activeTab === 'clients' && s.navLabelActive]}>Clients</Text>
                        {stats.totalClients > 0 && <View style={s.navBadge}><Text style={s.navBadgeText}>{stats.totalClients}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.navItem, activeTab === 'bricoleurs' && s.navActive]} onPress={() => setActiveTab('bricoleurs')}>
                        <Text style={[s.navIcon, activeTab === 'bricoleurs' && s.navIconActive]}>🔧</Text>
                        <Text style={[s.navLabel, activeTab === 'bricoleurs' && s.navLabelActive]}>Handymen</Text>
                        {stats.pendingVerifications > 0 && <View style={[s.navBadge, { backgroundColor: '#FCD34D' }]}><Text style={s.navBadgeText}>{stats.pendingVerifications}</Text></View>}
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.navItem, activeTab === 'jobs' && s.navActive]} onPress={() => setActiveTab('jobs')}>
                        <Text style={[s.navIcon, activeTab === 'jobs' && s.navIconActive]}>📋</Text>
                        <Text style={[s.navLabel, activeTab === 'jobs' && s.navLabelActive]}>Jobs</Text>
                        <View style={s.navBadge}><Text style={s.navBadgeText}>{stats.totalJobs}</Text></View>
                    </TouchableOpacity>
                    <TouchableOpacity style={[s.navItem, activeTab === 'disputes' && s.navActive]} onPress={() => setActiveTab('disputes')}>
                        <Text style={[s.navIcon, activeTab === 'disputes' && s.navIconActive]}>⚠️</Text>
                        <Text style={[s.navLabel, activeTab === 'disputes' && s.navLabelActive]}>Disputes</Text>
                        {stats.openDisputes > 0 && <View style={[s.navBadge, { backgroundColor: '#FCA5A5' }]}><Text style={s.navBadgeText}>{stats.openDisputes}</Text></View>}
                    </TouchableOpacity>
                </View>

                <View style={s.navSep} />
                <TouchableOpacity style={s.navItem} onPress={loadAll}>
                    <Text style={s.navIcon}>🔄</Text><Text style={s.navLabel}>Refresh Data</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={handleLogout}>
                    <Text style={s.navIcon}>🚪</Text><Text style={[s.navLabel, { color: '#B91C1C' }]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={s.sideUser}>
                    <View style={s.sideAvatar}><Text style={s.sideAvatarText}>A</Text></View>
                    <View>
                        <Text style={s.sideUserName}>Admin</Text>
                        <Text style={s.sideUserRole}>Super Admin</Text>
                    </View>
                </View>
            </View>

            {/* ========== MAIN CONTENT ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <View>
                        <Text style={s.pageTitle}>
                            {activeTab === 'overview' ? 'Overview' : activeTab === 'clients' ? 'Clients' : activeTab === 'bricoleurs' ? 'Handymen' : activeTab === 'jobs' ? 'All Jobs' : 'Disputes'}
                        </Text>
                        <Text style={s.pageDesc}>Monitor and manage your platform</Text>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} style={s.scroll}>

                    {/* ===== SEARCH ===== */}
                    {(activeTab === 'clients' || activeTab === 'bricoleurs') && (
                        <TextInput style={s.search} placeholder="Search by name, email, or city..." placeholderTextColor="#A8A29E" value={searchQuery} onChangeText={setSearchQuery} />
                    )}

                    {/* ===== OVERVIEW TAB ===== */}
                    {activeTab === 'overview' && (
                        <>
                            <View style={s.kpiGrid}>
                                <View style={s.kpi}><Text style={s.kpiVal}>{stats.totalClients}</Text><Text style={s.kpiLbl}>Total Clients</Text></View>
                                <View style={s.kpi}><Text style={s.kpiVal}>{stats.totalBricoleurs}</Text><Text style={s.kpiLbl}>Handymen</Text></View>
                                <View style={s.kpi}><Text style={s.kpiVal}>{stats.activeJobs}</Text><Text style={s.kpiLbl}>Active Jobs</Text></View>
                                <View style={s.kpi}><Text style={s.kpiVal}>{stats.completedJobs}</Text><Text style={s.kpiLbl}>Completed</Text></View>
                            </View>
                            <View style={s.kpiGrid}>
                                <View style={s.kpi}><Text style={s.kpiVal}>{stats.totalJobs}</Text><Text style={s.kpiLbl}>Total Jobs</Text></View>
                                <View style={s.kpi}><Text style={s.kpiVal}>{stats.totalBids}</Text><Text style={s.kpiLbl}>Total Bids</Text></View>
                                <View style={[s.kpi, { borderColor: '#FCD34D' }]}><Text style={[s.kpiVal, { color: '#92400E' }]}>{stats.pendingVerifications}</Text><Text style={s.kpiLbl}>Pending Verifications</Text></View>
                                <View style={[s.kpi, { borderColor: '#FCA5A5' }]}><Text style={[s.kpiVal, { color: '#991B1B' }]}>{stats.openDisputes}</Text><Text style={s.kpiLbl}>Open Disputes</Text></View>
                            </View>

                            {/* Pending Verifications */}
                            {bricoleurs.filter(b => (b.bricoleur_profile?.verification_status || 'pending') === 'pending').length > 0 && (
                                <>
                                    <Text style={s.sectionTitle}>⏳ Pending Verifications</Text>
                                    {bricoleurs.filter(b => (b.bricoleur_profile?.verification_status || 'pending') === 'pending').map(b => (
                                        <View key={b.id} style={s.card}>
                                            <View style={s.cardLeft}>
                                                <View style={[s.cardAvatar, { backgroundColor: '#D97706' }]}><Text style={s.cardAvatarText}>{(b.name || '?')[0]}</Text></View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={s.cardName}>{b.name || 'Unknown'}</Text>
                                                    <Text style={s.cardDetail}>{b.email || '—'} · {b.city || '—'}</Text>
                                                </View>
                                            </View>
                                            <View style={s.cardActions}>
                                                <TouchableOpacity onPress={() => act.verify(b.id)} style={[s.cardBtn, s.cardBtnSuccess]}>
                                                    <Text style={[s.cardBtnText, { color: '#15803D' }]}>✓ Verify</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => act.reject(b.id)} style={[s.cardBtn, s.cardBtnDanger]}>
                                                    <Text style={[s.cardBtnText, { color: '#B91C1C' }]}>✕ Reject</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Open Disputes */}
                            {disputes.filter(d => d.status === 'open').length > 0 && (
                                <>
                                    <Text style={[s.sectionTitle, { marginTop: 16 }]}>⚠️ Open Disputes</Text>
                                    {disputes.filter(d => d.status === 'open').map(d => (
                                        <View key={d.id} style={s.card}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.cardName}>{d.reason || 'No reason provided'}</Text>
                                                <Text style={s.cardDetail}>Job ID: {d.job_id} · Raised by: User #{d.raised_by}</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => act.resolve(d.id)} style={[s.cardBtn, { backgroundColor: '#F0FDF4', paddingHorizontal: 12 }]}>
                                                <Text style={[s.cardBtnText, { color: '#15803D' }]}>Resolve</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </>
                            )}
                        </>
                    )}

                    {/* ===== CLIENTS TAB ===== */}
                    {activeTab === 'clients' && (
                        <>
                            <Text style={s.sectionTitle}>Clients · {filter(clients, ['name', 'email', 'city']).length}</Text>
                            {filter(clients, ['name', 'email', 'city']).map(client => {
                                const [bg, color, label] = userStatus(client.status);
                                return (
                                    <View key={client.id} style={s.card}>
                                        <View style={s.cardLeft}>
                                            <View style={s.cardAvatar}><Text style={s.cardAvatarText}>{(client.name || '?')[0]}</Text></View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.cardName}>{client.name || 'Unknown'}</Text>
                                                <Text style={s.cardDetail}>{client.email || '—'}</Text>
                                                <Text style={s.cardMeta}>{client.phone_number || '—'} · {client.city || '—'}</Text>
                                            </View>
                                        </View>
                                        <View style={s.cardRight}>
                                            <View style={[s.tag, { backgroundColor: bg }]}><Text style={[s.tagText, { color }]}>{label}</Text></View>
                                            <View style={s.cardActions}>
                                                <TouchableOpacity onPress={() => act.suspend(client.id)} style={s.cardBtn}>
                                                    <Text style={s.cardBtnText}>{client.status === 'suspended' ? '▶' : '⏸'}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => act.delete(client.id)} style={[s.cardBtn, s.cardBtnDanger]}>
                                                    <Text style={[s.cardBtnText, { color: '#B91C1C' }]}>🗑</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {/* ===== BRICOLEURS TAB ===== */}
                    {activeTab === 'bricoleurs' && (
                        <>
                            <Text style={s.sectionTitle}>Handymen · {filter(bricoleurs, ['name', 'email', 'city']).length}</Text>
                            {filter(bricoleurs, ['name', 'email', 'city']).map(b => {
                                const vStatus = b.bricoleur_profile?.verification_status || 'pending';
                                const [bg, color, label] = userStatus(vStatus);
                                const skills = b.bricoleur_profile?.skills;
                                const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? JSON.parse(skills || '[]') : []);
                                const rating = b.bricoleur_profile?.average_rating || 0;
                                return (
                                    <View key={b.id} style={s.card}>
                                        <View style={s.cardLeft}>
                                            <View style={[s.cardAvatar, { backgroundColor: '#D97706' }]}><Text style={s.cardAvatarText}>{(b.name || '?')[0]}</Text></View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.cardName}>{b.name || 'Unknown'}</Text>
                                                <Text style={s.cardDetail}>{b.email || '—'}</Text>
                                                <Text style={s.cardMeta}>{b.phone_number || '—'} · {b.city || '—'}{rating > 0 ? ` · ⭐ ${rating}` : ''}</Text>
                                                {skillsArray.length > 0 && (
                                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                                                        {skillsArray.slice(0, 3).map((sk, i) => <View key={i} style={s.skill}><Text style={s.skillText}>{sk}</Text></View>)}
                                                        {skillsArray.length > 3 && <Text style={{ fontSize: 10, color: '#A8A29E' }}>+{skillsArray.length - 3}</Text>}
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                        <View style={s.cardRight}>
                                            <View style={[s.tag, { backgroundColor: bg }]}><Text style={[s.tagText, { color }]}>{label}</Text></View>
                                            <View style={s.cardActions}>
                                                {vStatus === 'pending' && (
                                                    <>
                                                        <TouchableOpacity onPress={() => act.verify(b.id)} style={[s.cardBtn, s.cardBtnSuccess]}>
                                                            <Text style={[s.cardBtnText, { color: '#15803D' }]}>✓</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => act.reject(b.id)} style={[s.cardBtn, s.cardBtnDanger]}>
                                                            <Text style={[s.cardBtnText, { color: '#B91C1C' }]}>✕</Text>
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                                <TouchableOpacity onPress={() => act.suspend(b.id)} style={s.cardBtn}>
                                                    <Text style={s.cardBtnText}>{b.status === 'suspended' ? '▶' : '⏸'}</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => act.delete(b.id)} style={[s.cardBtn, s.cardBtnDanger]}>
                                                    <Text style={[s.cardBtnText, { color: '#B91C1C' }]}>🗑</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {/* ===== JOBS TAB ===== */}
                    {activeTab === 'jobs' && (
                        <>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
                                {[
                                    { key: 'all', label: 'All' },
                                    { key: 'open', label: 'Open' },
                                    { key: 'assigned', label: 'Assigned' },
                                    { key: 'completed', label: 'Completed' },
                                    { key: 'cancelled', label: 'Cancelled' },
                                ].map(f => (
                                    <TouchableOpacity key={f.key} style={[s.filterChip, jobFilter === f.key && s.filterChipActive]} onPress={() => setJobFilter(f.key)}>
                                        <Text style={[s.filterText, jobFilter === f.key && s.filterTextActive]}>{f.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={s.sectionTitle}>Jobs · {filteredJobs.length}</Text>
                            {filteredJobs.map(job => {
                                const [bg, color, label] = jobStatus(job.status);
                                return (
                                    <View key={job.id} style={s.card}>
                                        <View style={s.cardLeft}>
                                            <View style={s.cardAvatar}><Text style={s.cardAvatarText}>{(job.title || '?')[0]}</Text></View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={s.cardName} numberOfLines={1}>{job.title || 'Untitled'}</Text>
                                                <Text style={s.cardDetail}>{job.category?.name || 'General'} · {job.city || '—'}</Text>
                                                <Text style={s.cardMeta}>
                                                    Client: {job.client?.name || 'Unknown'} · {job.bids_count || 0} bids
                                                    {job.budget_max ? ` · ${job.budget_max.toLocaleString()} FCFA` : ''}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={s.cardRight}>
                                            <View style={[s.tag, { backgroundColor: bg }]}><Text style={[s.tagText, { color }]}>{label}</Text></View>
                                            <Text style={{ fontSize: 9, color: '#A8A29E', marginTop: 2 }}>
                                                {job.created_at ? new Date(job.created_at).toLocaleDateString() : ''}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </>
                    )}

                    {/* ===== DISPUTES TAB ===== */}
                    {activeTab === 'disputes' && (
                        <>
                            <Text style={s.sectionTitle}>Disputes · {disputes.length}</Text>
                            {disputes.length === 0 ? (
                                <View style={s.emptyState}>
                                    <Text style={s.emptyIcon}>✅</Text>
                                    <Text style={s.emptyTitle}>No disputes</Text>
                                    <Text style={s.emptyDesc}>All clear — no disputes to review.</Text>
                                </View>
                            ) : disputes.map(d => {
                                const [bg, color, label] = disputeStatus(d.status);
                                return (
                                    <View key={d.id} style={s.card}>
                                        <View style={{ flex: 1 }}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <View style={[s.tag, { backgroundColor: bg }]}><Text style={[s.tagText, { color }]}>{label}</Text></View>
                                                <Text style={s.cardName}>Dispute #{d.id}</Text>
                                            </View>
                                            <Text style={s.cardDetail}>{d.reason || 'No reason provided'}</Text>
                                            <Text style={s.cardMeta}>Job #{d.job_id} · Raised by User #{d.raised_by} · {d.created_at ? new Date(d.created_at).toLocaleDateString() : ''}</Text>
                                            {d.resolution && (
                                                <Text style={[s.cardMeta, { color: '#15803D', marginTop: 4 }]}>Resolution: {d.resolution}</Text>
                                            )}
                                        </View>
                                        {d.status === 'open' && (
                                            <TouchableOpacity onPress={() => act.resolve(d.id)} style={[s.cardBtn, { backgroundColor: '#F0FDF4', paddingHorizontal: 12, marginLeft: 10 }]}>
                                                <Text style={[s.cardBtnText, { color: '#15803D' }]}>Resolve</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            })}
                        </>
                    )}

                    <View style={{ height: 60 }} />
                </ScrollView>
            </View>

            {/* ===== RESOLVE MODAL ===== */}
            <Modal visible={resolveModal} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>Resolve Dispute</Text>
                        <Text style={s.modalSub}>Enter a resolution note for this dispute.</Text>
                        <TextInput
                            style={s.modalInput}
                            value={resolveNote}
                            onChangeText={setResolveNote}
                            placeholder="Describe how the dispute was resolved..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                        <View style={s.modalButtons}>
                            <TouchableOpacity style={s.modalCancelBtn} onPress={() => setResolveModal(false)}>
                                <Text style={s.modalCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.modalSubmitBtn} onPress={act.submitResolve}>
                                <Text style={s.modalSubmitBtnText}>Resolve</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F5F5F4' },

    // Sidebar
    sidebar: { width: 210, backgroundColor: '#292524', paddingVertical: 24, paddingHorizontal: 14, justifyContent: 'space-between' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    brandIcon: { width: 30, height: 30, backgroundColor: '#D97706', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    brandIconText: { color: 'white', fontWeight: '700', fontSize: 13 },
    brandName: { color: '#F5F5F4', fontWeight: '600', fontSize: 15 },
    brandLabel: { color: '#78716C', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 22, marginTop: 2 },
    nav: { flex: 1 },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 6, marginBottom: 1, gap: 10 },
    navActive: { backgroundColor: '#44403C' },
    navIcon: { fontSize: 14, width: 20, textAlign: 'center' },
    navIconActive: { color: '#D97706' },
    navLabel: { fontSize: 12, color: '#A8A29E', flex: 1 },
    navLabelActive: { color: '#F5F5F4', fontWeight: '600' },
    navBadge: { backgroundColor: '#78716C', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
    navBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
    navSep: { borderTopWidth: 1, borderTopColor: '#44403C', marginVertical: 12 },
    sideUser: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#44403C' },
    sideAvatar: { width: 30, height: 30, backgroundColor: '#D97706', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    sideAvatarText: { color: 'white', fontWeight: '700', fontSize: 12 },
    sideUserName: { color: '#F5F5F4', fontSize: 12, fontWeight: '500' },
    sideUserRole: { color: '#78716C', fontSize: 10 },

    // Main
    main: { flex: 1, paddingHorizontal: 28, paddingTop: 24 },
    topbar: { marginBottom: 18 },
    pageTitle: { fontSize: 22, fontWeight: '700', color: '#1C1917' },
    pageDesc: { fontSize: 12, color: '#78716C', marginTop: 2 },
    scroll: { flex: 1 },

    // KPIs
    kpiGrid: { flexDirection: 'row', gap: 10, marginBottom: 12 },
    kpi: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#E7E5E4' },
    kpiVal: { fontSize: 26, fontWeight: '700', color: '#1C1917' },
    kpiLbl: { fontSize: 10, color: '#78716C', marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Search
    search: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, color: '#1C1917', marginBottom: 14 },

    // Filters
    filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E7E5E4' },
    filterChipActive: { backgroundColor: '#292524', borderColor: '#292524' },
    filterText: { fontSize: 12, color: '#78716C', fontWeight: '500' },
    filterTextActive: { color: 'white' },

    // Section
    sectionTitle: { fontSize: 13, fontWeight: '600', color: '#1C1917', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.6 },

    // Cards
    card: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 6, borderWidth: 1, borderColor: '#E7E5E4' },
    cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    cardAvatar: { width: 36, height: 36, backgroundColor: '#78716C', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    cardAvatarText: { color: 'white', fontWeight: '700', fontSize: 14 },
    cardName: { fontSize: 13, fontWeight: '600', color: '#1C1917' },
    cardDetail: { fontSize: 11, color: '#57534E' },
    cardMeta: { fontSize: 10, color: '#A8A29E', marginTop: 1 },
    skill: { backgroundColor: '#F5F5F4', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
    skillText: { fontSize: 9, color: '#78716C', fontWeight: '500' },
    cardRight: { alignItems: 'flex-end', gap: 6 },
    tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    tagText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
    cardActions: { flexDirection: 'row', gap: 4 },
    cardBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, backgroundColor: '#F5F5F4', alignItems: 'center' },
    cardBtnSuccess: { backgroundColor: '#F0FDF4' },
    cardBtnDanger: { backgroundColor: '#FEF2F2' },
    cardBtnText: { fontSize: 11, color: '#57534E', fontWeight: '600' },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#E7E5E4' },
    emptyIcon: { fontSize: 36, marginBottom: 8 },
    emptyTitle: { fontSize: 15, fontWeight: '600', color: '#1C1917' },
    emptyDesc: { fontSize: 12, color: '#78716C', marginTop: 4 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%', maxWidth: 420 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1C1917', textAlign: 'center' },
    modalSub: { fontSize: 12, color: '#78716C', textAlign: 'center', marginTop: 4, marginBottom: 16 },
    modalInput: { backgroundColor: '#F5F5F4', borderWidth: 1, borderColor: '#E7E5E4', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, color: '#1C1917', minHeight: 90, marginBottom: 16 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    modalCancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F5F5F4', alignItems: 'center' },
    modalCancelBtnText: { color: '#78716C', fontWeight: '600', fontSize: 13 },
    modalSubmitBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: '#D97706', alignItems: 'center' },
    modalSubmitBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },
});
