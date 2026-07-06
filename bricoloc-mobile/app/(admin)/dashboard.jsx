import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    StyleSheet,
    Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);

    // Sample data
    const [clients, setClients] = useState([
        { id: '1', name: 'Jean Dupont', email: 'jean@email.com', phone: '+237 699 887 766', city: 'Douala', status: 'active', registeredDate: '2026-01-15', jobsPosted: 5, jobsCompleted: 3, rating: 4.5 },
        { id: '2', name: 'Marie Foning', email: 'marie@email.com', phone: '+237 677 112 233', city: 'Yaounde', status: 'active', registeredDate: '2026-02-20', jobsPosted: 8, jobsCompleted: 6, rating: 4.8 },
        { id: '3', name: 'Paul Kamga', email: 'paul@email.com', phone: '+237 655 445 566', city: 'Bafoussam', status: 'suspended', registeredDate: '2026-03-10', jobsPosted: 2, jobsCompleted: 1, rating: 3.2 },
        { id: '4', name: 'Sophie Tchinda', email: 'sophie@email.com', phone: '+237 699 334 455', city: 'Douala', status: 'active', registeredDate: '2026-04-05', jobsPosted: 12, jobsCompleted: 10, rating: 4.9 },
        { id: '5', name: 'Luc Mbah', email: 'luc@email.com', phone: '+237 688 778 899', city: 'Limbe', status: 'pending', registeredDate: '2026-06-01', jobsPosted: 1, jobsCompleted: 0, rating: 0 },
    ]);

    const [bricoleurs, setBricoleurs] = useState([
        { id: 'b1', name: 'Thomas R.', email: 'thomas@email.com', phone: '+237 699 111 222', city: 'Douala', status: 'verified', registeredDate: '2025-11-10', jobsCompleted: 45, rating: 4.8, skills: ['Plomberie', 'Electricite'], verificationDoc: true },
        { id: 'b2', name: 'Marie D.', email: 'maried@email.com', phone: '+237 677 333 444', city: 'Yaounde', status: 'verified', registeredDate: '2025-12-05', jobsCompleted: 32, rating: 4.6, skills: ['Peinture', 'Menuiserie'], verificationDoc: true },
        { id: 'b3', name: 'Alain F.', email: 'alain@email.com', phone: '+237 655 555 666', city: 'Douala', status: 'pending', registeredDate: '2026-06-15', jobsCompleted: 0, rating: 0, skills: ['Climatisation'], verificationDoc: false },
        { id: 'b4', name: 'Eric V.', email: 'eric@email.com', phone: '+237 688 777 888', city: 'Bamenda', status: 'verified', registeredDate: '2025-10-20', jobsCompleted: 28, rating: 4.3, skills: ['Electricite'], verificationDoc: true },
        { id: 'b5', name: 'Chris B.', email: 'chris@email.com', phone: '+237 699 999 000', city: 'Garoua', status: 'rejected', registeredDate: '2026-05-20', jobsCompleted: 0, rating: 0, skills: ['Menage'], verificationDoc: false },
    ]);

    // Stats
    const stats = {
        totalClients: clients.length,
        totalBricoleurs: bricoleurs.length,
        activeJobs: 12,
        completedJobs: 48,
        pendingVerifications: bricoleurs.filter(b => b.status === 'pending').length,
        totalRevenue: '1,250,000 FCFA',
        disputesOpen: 3,
        newThisMonth: 8,
    };

    // Filter data based on search
    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredBricoleurs = bricoleurs.filter(b =>
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active':
            case 'verified':
                return { bg: '#D1FAE5', text: '#065F46', label: status === 'active' ? 'Actif' : 'Verifie' };
            case 'suspended':
            case 'rejected':
                return { bg: '#FEE2E2', text: '#991B1B', label: status === 'suspended' ? 'Suspendu' : 'Rejete' };
            case 'pending':
                return { bg: '#FEF3C7', text: '#92400E', label: 'En attente' };
            default:
                return { bg: '#F3F4F6', text: '#374151', label: status };
        }
    };

    const handleVerify = (bricoleurId) => {
        setBricoleurs(bricoleurs.map(b =>
            b.id === bricoleurId ? { ...b, status: 'verified' } : b
        ));
        Alert.alert('✅ Verifie', 'Le bricoleur a ete verifie avec succes.');
    };

    const handleReject = (bricoleurId) => {
        setBricoleurs(bricoleurs.map(b =>
            b.id === bricoleurId ? { ...b, status: 'rejected' } : b
        ));
        Alert.alert('❌ Rejete', 'Le bricoleur a ete rejete.');
    };

    const handleSuspend = (userId, type) => {
        if (type === 'client') {
            setClients(clients.map(c =>
                c.id === userId ? { ...c, status: c.status === 'suspended' ? 'active' : 'suspended' } : c
            ));
        }
        Alert.alert('Statut modifie', 'Le statut de l utilisateur a ete mis a jour.');
    };

    const handleDelete = (userId, type) => {
        Alert.alert(
            'Confirmer la suppression',
            'Etes-vous sur de vouloir supprimer cet utilisateur ? Cette action est irreversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: () => {
                        if (type === 'client') {
                            setClients(clients.filter(c => c.id !== userId));
                        } else {
                            setBricoleurs(bricoleurs.filter(b => b.id !== userId));
                        }
                        Alert.alert('✅ Supprime', 'Utilisateur supprime avec succes.');
                    },
                },
            ]
        );
    };

    const showUserDetails = (user, type) => {
        setSelectedUser({ ...user, type });
        setShowUserModal(true);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backBtn}>← Retour</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Administration</Text>
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                </View>
                <Text style={styles.headerSubtitle}>Gestion de la plateforme</Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* ============ STATS OVERVIEW ============ */}
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={[styles.statNum, { color: '#2563EB' }]}>{stats.totalClients}</Text>
                        <Text style={styles.statLabel}>Clients</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.statNum, { color: '#059669' }]}>{stats.totalBricoleurs}</Text>
                        <Text style={styles.statLabel}>Bricoleurs</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.statNum, { color: '#D97706' }]}>{stats.pendingVerifications}</Text>
                        <Text style={styles.statLabel}>En attente</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#FEF2F2' }]}>
                        <Text style={[styles.statNum, { color: '#DC2626' }]}>{stats.disputesOpen}</Text>
                        <Text style={styles.statLabel}>Litiges</Text>
                    </View>
                </View>

                {/* More Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxIcon}>📋</Text>
                        <Text style={styles.statBoxNum}>{stats.activeJobs}</Text>
                        <Text style={styles.statBoxLabel}>Travaux actifs</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxIcon}>✅</Text>
                        <Text style={styles.statBoxNum}>{stats.completedJobs}</Text>
                        <Text style={styles.statBoxLabel}>Termines</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxIcon}>💰</Text>
                        <Text style={styles.statBoxNumSmall}>{stats.totalRevenue}</Text>
                        <Text style={styles.statBoxLabel}>Volume total</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statBoxIcon}>🆕</Text>
                        <Text style={styles.statBoxNum}>{stats.newThisMonth}</Text>
                        <Text style={styles.statBoxLabel}>Ce mois</Text>
                    </View>
                </View>

                {/* Search */}
                <View style={styles.searchRow}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un utilisateur..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Tabs */}
                <View style={styles.tabs}>
                    {[
                        { key: 'overview', label: 'Vue ensemble' },
                        { key: 'clients', label: 'Clients' },
                        { key: 'bricoleurs', label: 'Bricoleurs' },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                            onPress={() => setActiveTab(tab.key)}
                        >
                            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ============ CLIENTS LIST ============ */}
                {(activeTab === 'overview' || activeTab === 'clients') && (
                    <>
                        <Text style={styles.sectionTitle}>
                            👤 Clients ({filteredClients.length})
                        </Text>
                        {filteredClients.map(client => {
                            const statusStyle = getStatusStyle(client.status);
                            return (
                                <View key={client.id} style={styles.userCard}>
                                    <View style={styles.userHeader}>
                                        <View style={styles.userInfo}>
                                            <View style={styles.userAvatar}>
                                                <Text style={styles.userAvatarText}>
                                                    {client.name.charAt(0)}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.userName}>{client.name}</Text>
                                                <Text style={styles.userEmail}>{client.email}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                {statusStyle.label}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.userMeta}>
                                        <Text style={styles.metaText}>📱 {client.phone}</Text>
                                        <Text style={styles.metaText}>📍 {client.city}</Text>
                                        <Text style={styles.metaText}>📅 {client.registeredDate}</Text>
                                    </View>

                                    <View style={styles.userStats}>
                                        <Text style={styles.userStat}>📋 {client.jobsPosted} annonces</Text>
                                        <Text style={styles.userStat}>✅ {client.jobsCompleted} termines</Text>
                                        <Text style={styles.userStat}>⭐ {client.rating}</Text>
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => showUserDetails(client, 'client')}
                                        >
                                            <Text style={styles.actionBtnText}>Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: client.status === 'suspended' ? '#059669' : '#FEF3C7' }]}
                                            onPress={() => handleSuspend(client.id, 'client')}
                                        >
                                            <Text style={[styles.actionBtnText, { color: client.status === 'suspended' ? 'white' : '#92400E' }]}>
                                                {client.status === 'suspended' ? 'Reactiver' : 'Suspendre'}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                                            onPress={() => handleDelete(client.id, 'client')}
                                        >
                                            <Text style={[styles.actionBtnText, { color: '#991B1B' }]}>Supprimer</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}

                {/* ============ BRICOLEURS LIST ============ */}
                {(activeTab === 'overview' || activeTab === 'bricoleurs') && (
                    <>
                        <Text style={styles.sectionTitle}>
                            🔧 Bricoleurs ({filteredBricoleurs.length})
                        </Text>
                        {filteredBricoleurs.map(bricoleur => {
                            const statusStyle = getStatusStyle(bricoleur.status);
                            return (
                                <View key={bricoleur.id} style={styles.userCard}>
                                    <View style={styles.userHeader}>
                                        <View style={styles.userInfo}>
                                            <View style={[styles.userAvatar, { backgroundColor: '#059669' }]}>
                                                <Text style={styles.userAvatarText}>
                                                    {bricoleur.name.charAt(0)}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text style={styles.userName}>{bricoleur.name}</Text>
                                                <Text style={styles.userEmail}>{bricoleur.email}</Text>
                                            </View>
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                                            <Text style={[styles.statusText, { color: statusStyle.text }]}>
                                                {statusStyle.label}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Skills */}
                                    <View style={styles.skillsRow}>
                                        {bricoleur.skills.map((skill, idx) => (
                                            <View key={idx} style={styles.skillChip}>
                                                <Text style={styles.skillText}>{skill}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    <View style={styles.userMeta}>
                                        <Text style={styles.metaText}>📱 {bricoleur.phone}</Text>
                                        <Text style={styles.metaText}>📍 {bricoleur.city}</Text>
                                    </View>

                                    <View style={styles.userStats}>
                                        <Text style={styles.userStat}>✅ {bricoleur.jobsCompleted} travaux</Text>
                                        <Text style={styles.userStat}>⭐ {bricoleur.rating}</Text>
                                        <Text style={styles.userStat}>
                                            {bricoleur.verificationDoc ? '📄 Doc OK' : '❌ Pas de doc'}
                                        </Text>
                                    </View>

                                    {/* Verification Actions */}
                                    {bricoleur.status === 'pending' && (
                                        <View style={styles.verifyRow}>
                                            <TouchableOpacity
                                                style={[styles.verifyBtn, { backgroundColor: '#059669' }]}
                                                onPress={() => handleVerify(bricoleur.id)}
                                            >
                                                <Text style={styles.verifyBtnText}>✅ Verifier</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.verifyBtn, { backgroundColor: '#DC2626' }]}
                                                onPress={() => handleReject(bricoleur.id)}
                                            >
                                                <Text style={styles.verifyBtnText}>❌ Rejeter</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity
                                            style={styles.actionBtn}
                                            onPress={() => showUserDetails(bricoleur, 'bricoleur')}
                                        >
                                            <Text style={styles.actionBtnText}>Details</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                                            onPress={() => handleDelete(bricoleur.id, 'bricoleur')}
                                        >
                                            <Text style={[styles.actionBtnText, { color: '#991B1B' }]}>Supprimer</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* ============ USER DETAIL MODAL ============ */}
            <Modal visible={showUserModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selectedUser && (
                            <ScrollView>
                                <Text style={styles.modalTitle}>
                                    {selectedUser.type === 'client' ? '👤 Client' : '🔧 Bricoleur'}
                                </Text>
                                <View style={styles.modalAvatar}>
                                    <Text style={styles.modalAvatarText}>
                                        {selectedUser.name?.charAt(0)}
                                    </Text>
                                </View>
                                <Text style={styles.modalName}>{selectedUser.name}</Text>
                                
                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Email</Text>
                                    <Text style={styles.modalValue}>{selectedUser.email}</Text>
                                    
                                    <Text style={styles.modalLabel}>Telephone</Text>
                                    <Text style={styles.modalValue}>{selectedUser.phone}</Text>
                                    
                                    <Text style={styles.modalLabel}>Ville</Text>
                                    <Text style={styles.modalValue}>{selectedUser.city}</Text>
                                    
                                    <Text style={styles.modalLabel}>Statut</Text>
                                    <Text style={styles.modalValue}>{selectedUser.status}</Text>
                                    
                                    <Text style={styles.modalLabel}>Date inscription</Text>
                                    <Text style={styles.modalValue}>{selectedUser.registeredDate}</Text>
                                    
                                    {selectedUser.type === 'bricoleur' && (
                                        <>
                                            <Text style={styles.modalLabel}>Competences</Text>
                                            <View style={styles.skillsRow}>
                                                {selectedUser.skills?.map((s, i) => (
                                                    <View key={i} style={styles.skillChip}>
                                                        <Text style={styles.skillText}>{s}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </>
                                    )}
                                </View>

                                <TouchableOpacity
                                    style={styles.modalCloseBtn}
                                    onPress={() => setShowUserModal(false)}
                                >
                                    <Text style={styles.modalCloseText}>Fermer</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },

    // Header
    header: { backgroundColor: '#1E293B', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    adminBadge: { backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    adminBadgeText: { color: 'white', fontSize: 11, fontWeight: 'bold' },
    headerSubtitle: { color: '#94A3B8', fontSize: 13 },

    content: { flex: 1, paddingHorizontal: 14 },

    // Stats
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
    statCard: { width: '47%', borderRadius: 12, padding: 14, alignItems: 'center' },
    statNum: { fontSize: 28, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2, textAlign: 'center' },

    statsRow: { flexDirection: 'row', gap: 6, marginTop: 10 },
    statBox: {
        flex: 1, backgroundColor: 'white', borderRadius: 12,
        padding: 12, alignItems: 'center', shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
    },
    statBoxIcon: { fontSize: 22, marginBottom: 4 },
    statBoxNum: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
    statBoxNumSmall: { fontSize: 11, fontWeight: 'bold', color: '#111827' },
    statBoxLabel: { fontSize: 9, color: '#6B7280', marginTop: 2, textAlign: 'center' },

    // Search
    searchRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginTop: 16,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    searchIcon: { fontSize: 16, marginRight: 10 },
    searchInput: { flex: 1, fontSize: 14, color: '#111827' },

    // Tabs
    tabs: { flexDirection: 'row', marginTop: 16, backgroundColor: '#E5E7EB', borderRadius: 10, padding: 3 },
    tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
    tabActive: { backgroundColor: 'white' },
    tabText: { color: '#6B7280', fontWeight: '500', fontSize: 13 },
    tabTextActive: { color: '#1E293B', fontWeight: '700' },

    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 18, marginBottom: 10 },

    // User Cards
    userCard: {
        backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
    },
    userHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    userInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    userAvatar: {
        width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 10,
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    userAvatarText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    userName: { fontSize: 15, fontWeight: '600', color: '#111827' },
    userEmail: { fontSize: 12, color: '#6B7280' },
    statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    statusText: { fontSize: 11, fontWeight: '600' },

    // Skills
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
    skillChip: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    skillText: { color: '#2563EB', fontSize: 11, fontWeight: '500' },

    // Meta
    userMeta: { flexDirection: 'row', gap: 12, marginBottom: 8 },
    metaText: { color: '#9CA3AF', fontSize: 11 },
    userStats: { flexDirection: 'row', gap: 14, marginBottom: 10 },
    userStat: { color: '#6B7280', fontSize: 12, fontWeight: '500' },

    // Actions
    actionRow: { flexDirection: 'row', gap: 6, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
    actionBtn: {
        flex: 1, backgroundColor: '#EFF6FF', paddingVertical: 8,
        borderRadius: 8, alignItems: 'center',
    },
    actionBtnText: { color: '#2563EB', fontWeight: '600', fontSize: 12 },

    // Verify
    verifyRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    verifyBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    verifyBtnText: { color: 'white', fontWeight: '600', fontSize: 13 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: {
        backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: 20, maxHeight: '80%',
    },
    modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
    modalAvatar: {
        width: 70, height: 70, backgroundColor: '#2563EB', borderRadius: 20,
        justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginBottom: 8,
    },
    modalAvatarText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
    modalName: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 16 },
    modalInfo: { marginBottom: 16 },
    modalLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 10 },
    modalValue: { fontSize: 15, color: '#111827', fontWeight: '500' },
    modalCloseBtn: { backgroundColor: '#1E293B', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
    modalCloseText: { color: 'white', fontWeight: '600', fontSize: 15 },
});