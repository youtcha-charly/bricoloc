






















































































































































































































































































































import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function BricoleurHome() {
    const router = useRouter();
    const { authUser, logout } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);
    const [activeFilter, setActiveFilter] = useState('Tous');
    const [isAvailable, setIsAvailable] = useState(true);
    const categories = ['Tous', 'Plomberie', 'Electricite', 'Peinture', 'Climatisation', 'Menuiserie', 'Menage'];
    const menuItems = [
        { icon: '🏠', label: 'Accueil', route: '/(bricoleur)/home' },
        { icon: '📋', label: 'Mes offres', route: '/(bricoleur)/my-bids' },
        { icon: '⚙️', label: 'Jobs en cours', route: '/(bricoleur)/active-jobs' },
        { icon: '💬', label: 'Messages', route: '/(bricoleur)/chats' },
        { icon: '👤', label: 'Mon profil', route: '/(bricoleur)/profile' },
    ];

    const handleLogout = () => { setMenuVisible(false); setTimeout(() => { logout(); router.replace('/login'); }, 300); };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)}><Text style={styles.menuIcon}>☰</Text></TouchableOpacity>
                    <View style={styles.headerCenter}><Text style={styles.headerLogo}>BL</Text><Text style={styles.headerTitle}>BricoLoc Pro</Text></View>
                    <View style={{ width: 30 }} />
                </View>
                <View style={styles.welcomeSection}>
                    <Text style={styles.greeting}>Bonjour, Bricoleur 🔧</Text>
                    <TouchableOpacity style={[styles.availBadge, isAvailable && styles.availBadgeOn]} onPress={() => setIsAvailable(!isAvailable)}>
                        <View style={[styles.availDot, isAvailable ? styles.availDotGreen : styles.availDotRed]} />
                        <Text style={styles.availText}>{isAvailable ? 'Disponible' : 'Indisponible'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.statsRow}>
                    <View style={styles.statItem}><Text style={styles.statNum}>⭐ 0</Text><Text style={styles.statLabel}>Note</Text></View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}><Text style={styles.statNum}>✅ 0</Text><Text style={styles.statLabel}>Termines</Text></View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}><Text style={styles.statNum}>💰 0 FCFA</Text><Text style={styles.statLabel}>Gains</Text></View>
                </View>
            </View>

            <Modal visible={menuVisible} animationType="slide" transparent onRequestClose={() => setMenuVisible(false)}>
                <View style={styles.modalOverlay}>
                    <TouchableOpacity style={styles.modalBackdrop} onPress={() => setMenuVisible(false)} />
                    <View style={styles.sideMenu}>
                        <SafeAreaView>
                            <View style={styles.menuHeader}>
                                <View style={styles.menuUserInfo}>
                                    <View style={styles.menuAvatar}><Text style={styles.menuAvatarText}>B</Text></View>
                                    <View><Text style={styles.menuUserName}>Bricoleur</Text><Text style={styles.menuUserRole}>Bricoleur</Text></View>
                                </View>
                                <TouchableOpacity onPress={() => setMenuVisible(false)}><Text style={styles.closeBtn}>✕</Text></TouchableOpacity>
                            </View>
                            <ScrollView style={styles.menuItems}>
                                {menuItems.map((item, i) => (
                                    <TouchableOpacity key={i} style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push(item.route); }}>
                                        <Text style={styles.menuItemIcon}>{item.icon}</Text><Text style={styles.menuItemLabel}>{item.label}</Text><Text style={styles.menuArrow}>→</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}><Text style={styles.logoutText}>🚪 Deconnexion</Text></TouchableOpacity>
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {categories.map(cat => (
                        <TouchableOpacity key={cat} style={[styles.filterChip, activeFilter === cat && styles.filterChipActive]} onPress={() => setActiveFilter(cat)}>
                            <Text style={[styles.filterText, activeFilter === cat && styles.filterTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <Text style={styles.sectionTitle}>🔍 Jobs a proximite</Text>
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📭</Text>
                    <Text style={styles.emptyTitle}>Aucun job disponible</Text>
                    <Text style={styles.emptyDesc}>Il n'y a pas encore de travaux dans votre zone. Revenez bientot !</Text>
                </View>
                <Text style={styles.sectionTitle}>📊 Mes statistiques</Text>
                <View style={styles.perfGrid}>
                    <View style={styles.perfCard}><Text style={styles.perfNum}>0</Text><Text style={styles.perfLabel}>Travaux</Text></View>
                    <View style={styles.perfCard}><Text style={styles.perfNum}>0</Text><Text style={styles.perfLabel}>Offres</Text></View>
                    <View style={styles.perfCard}><Text style={styles.perfNum}>0</Text><Text style={styles.perfLabel}>En cours</Text></View>
                    <View style={styles.perfCard}><Text style={styles.perfNum}>0</Text><Text style={styles.perfLabel}>Avis</Text></View>
                </View>
                <View style={{ height: 40 }} />
            </ScrollView>

            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}><Text style={styles.navIcon}>🏠</Text><Text style={[styles.navLabel, styles.navLabelActive]}>Accueil</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(bricoleur)/my-bids')}><Text style={styles.navIcon}>📋</Text><Text style={styles.navLabel}>Offres</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/post-job')}><View style={styles.navCenter}><Text style={styles.navCenterIcon}>🔍</Text></View></TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(bricoleur)/chats')}><Text style={styles.navIcon}>💬</Text><Text style={styles.navLabel}>Chats</Text></TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => setMenuVisible(true)}><Text style={styles.navIcon}>☰</Text><Text style={styles.navLabel}>Menu</Text></TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { backgroundColor: '#059669', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    menuIcon: { color: 'white', fontSize: 26 },
    headerCenter: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    headerLogo: { color: 'white', fontWeight: 'bold', fontSize: 18, backgroundColor: 'rgba(255,255,255,0.2)', width: 30, height: 30, borderRadius: 8, textAlign: 'center', lineHeight: 30, marginRight: 8 },
    headerTitle: { color: 'white', fontWeight: '700', fontSize: 18 },
    welcomeSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    greeting: { fontSize: 20, fontWeight: 'bold', color: 'white' },
    availBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    availBadgeOn: { backgroundColor: 'rgba(255,255,255,0.25)' },
    availDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    availDotGreen: { backgroundColor: '#4ADE80' },
    availDotRed: { backgroundColor: '#F87171' },
    availText: { color: 'white', fontSize: 12 },
    statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: 12 },
    statItem: { flex: 1, alignItems: 'center' },
    statNum: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 2 },
    statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.2)' },
    modalOverlay: { flex: 1, flexDirection: 'row' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sideMenu: { width: '80%', maxWidth: 340, backgroundColor: 'white', borderTopLeftRadius: 20, borderBottomLeftRadius: 20 },
    menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    menuUserInfo: { flexDirection: 'row', alignItems: 'center' },
    menuAvatar: { width: 48, height: 48, backgroundColor: '#059669', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuAvatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    menuUserName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    menuUserRole: { color: '#059669', fontSize: 12 },
    closeBtn: { fontSize: 22, color: '#9CA3AF' },
    menuItems: { paddingVertical: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 20 },
    menuItemIcon: { fontSize: 18, marginRight: 14 },
    menuItemLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#374151' },
    menuArrow: { color: '#D1D5DB' },
    logoutBtn: { padding: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
    content: { flex: 1 },
    filterRow: { paddingLeft: 14, marginTop: 14, maxHeight: 42 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'white', marginRight: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    filterChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
    filterText: { color: '#374151', fontSize: 13 },
    filterTextActive: { color: 'white' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', paddingHorizontal: 14, marginTop: 20, marginBottom: 10 },
    emptyState: { alignItems: 'center', paddingVertical: 40, marginHorizontal: 14, backgroundColor: 'white', borderRadius: 14 },
    emptyIcon: { fontSize: 60, marginBottom: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '600', color: '#111827' },
    emptyDesc: { color: '#6B7280', textAlign: 'center', marginTop: 8, paddingHorizontal: 20 },
    perfGrid: { flexDirection: 'row', paddingHorizontal: 14, gap: 8 },
    perfCard: { flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 16, alignItems: 'center' },
    perfNum: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
    perfLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
    bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'white', paddingVertical: 8, marginHorizontal: 14, marginBottom: 10, borderRadius: 20 },
    navItem: { alignItems: 'center', flex: 1 },
    navIcon: { fontSize: 20 },
    navLabel: { fontSize: 9, color: '#9CA3AF' },
    navLabelActive: { color: '#059669', fontWeight: '600' },
    navCenter: { width: 44, height: 44, backgroundColor: '#059669', borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginTop: -18 },
    navCenterIcon: { color: 'white', fontSize: 20 },
});