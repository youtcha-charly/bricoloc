import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Home() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [menuVisible, setMenuVisible] = useState(false);

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const menuItems = [
        { icon: '🏠', label: 'Accueil', route: '/home', color: '#2563EB' },
        { icon: '📊', label: 'Tableau de bord', route: '/dashboard', color: '#059669' },
        { icon: '📝', label: 'Publier un travail', route: '/post-job', color: '#D97706' },
        { icon: '📋', label: 'Mes annonces', route: '/dashboard', color: '#7C3AED' },
        { icon: '💬', label: 'Messages', route: '/home', color: '#DC2626' },
        { icon: '⭐', label: 'Mes avis', route: '/home', color: '#F59E0B' },
        { icon: '👤', label: 'Mon profil', route: '/profile', color: '#0891B2' },
        { icon: '⚙️', label: 'Parametres', route: '/home', color: '#6B7280' },
    ];

    const quickActions = [
        { icon: '🔍', title: 'Trouver un bricoleur', desc: 'Rechercher par metier', route: '/post-job' },
        { icon: '📝', title: 'Publier une annonce', desc: 'Poster un travail', route: '/post-job' },
        { icon: '📊', title: 'Voir mes stats', desc: 'Tableau de bord', route: '/dashboard' },
    ];

    return (
        <View style={styles.container}>
            {/* ============ HEADER ============ */}
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuBtn}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <View style={styles.headerCenter}>
                        <Text style={styles.headerLogo}>BL</Text>
                        <Text style={styles.headerTitle}>BricoLoc</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.notifBtn}>
                        <Text style={styles.notifIcon}>🔔</Text>
                        <View style={styles.notifBadge}>
                            <Text style={styles.notifBadgeText}>3</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Welcome */}
                <View style={styles.welcomeSection}>
                    <Text style={styles.greeting}>Bonjour, {user?.name || 'Client'} 👋</Text>
                    <Text style={styles.subtitle}>Que souhaitez-vous faire aujourd'hui ?</Text>
                </View>

                {/* Search Bar */}
                <TouchableOpacity 
                    style={styles.searchBar}
                    onPress={() => router.push('/post-job')}
                >
                    <Text style={styles.searchIcon}>🔍</Text>
                    <Text style={styles.searchText}>Rechercher un bricoleur par metier...</Text>
                </TouchableOpacity>
            </View>

            {/* ============ SIDE MENU MODAL ============ */}
            <Modal
                visible={menuVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.modalBackdrop}
                        onPress={() => setMenuVisible(false)}
                    />
                    <View style={styles.sideMenu}>
                        <SafeAreaView>
                            {/* Menu Header */}
                            <View style={styles.menuHeader}>
                                <View style={styles.menuUserInfo}>
                                    <View style={styles.menuAvatar}>
                                        <Text style={styles.menuAvatarText}>
                                            {user?.name?.charAt(0) || 'U'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.menuUserName}>{user?.name || 'Utilisateur'}</Text>
                                        <Text style={styles.menuUserRole}>Client</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setMenuVisible(false)}>
                                    <Text style={styles.closeMenuBtn}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Menu Items */}
                            <ScrollView style={styles.menuItems}>
                                {menuItems.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.menuItem}
                                        onPress={() => {
                                            setMenuVisible(false);
                                            router.push(item.route);
                                        }}
                                    >
                                        <View style={[styles.menuItemIcon, { backgroundColor: item.color + '20' }]}>
                                            <Text style={styles.menuItemEmoji}>{item.icon}</Text>
                                        </View>
                                        <Text style={styles.menuItemLabel}>{item.label}</Text>
                                        <Text style={styles.menuArrow}>→</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {/* Logout */}
                            <TouchableOpacity 
                                style={styles.logoutBtn}
                                onPress={() => {
                                    setMenuVisible(false);
                                    handleLogout();
                                }}
                            >
                                <Text style={styles.logoutIcon}>🚪</Text>
                                <Text style={styles.logoutText}>Deconnexion</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    </View>
                </View>
            </Modal>

            {/* ============ MAIN CONTENT ============ */}
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Quick Actions */}
                <View style={styles.quickActions}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.quickActionCard}
                            onPress={() => router.push(action.route)}
                        >
                            <Text style={styles.quickActionIcon}>{action.icon}</Text>
                            <View style={styles.quickActionInfo}>
                                <Text style={styles.quickActionTitle}>{action.title}</Text>
                                <Text style={styles.quickActionDesc}>{action.desc}</Text>
                            </View>
                            <Text style={styles.quickActionArrow}>→</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Categories */}
                <Text style={styles.sectionTitle}>Services populaires</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                    {[
                        { icon: '🔧', name: 'Plomberie' },
                        { icon: '⚡', name: 'Electricite' },
                        { icon: '🎨', name: 'Peinture' },
                        { icon: '🪚', name: 'Menuiserie' },
                        { icon: '❄️', name: 'Climatisation' },
                        { icon: '🧹', name: 'Menage' },
                        { icon: '📦', name: 'Demenagement' },
                        { icon: '📱', name: 'Reparation' },
                    ].map((cat, index) => (
                        <TouchableOpacity key={index} style={styles.catCard}>
                            <Text style={styles.catIcon}>{cat.icon}</Text>
                            <Text style={styles.catName}>{cat.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Recent Activity */}
                <Text style={styles.sectionTitle}>Activite recente</Text>
                {[
                    { title: 'Nouvelle offre recue', desc: 'Plombier urgence - Douala', time: 'Il y a 5 min', icon: '💬', color: '#2563EB' },
                    { title: 'Travail termine', desc: 'Peinture salon - Yaounde', time: 'Il y a 2h', icon: '✅', color: '#059669' },
                    { title: 'Bricoleur verifie', desc: 'Jean K. a rejoint la plateforme', time: 'Il y a 3h', icon: '👷', color: '#D97706' },
                ].map((activity, index) => (
                    <View key={index} style={styles.activityCard}>
                        <View style={[styles.activityIcon, { backgroundColor: activity.color + '20' }]}>
                            <Text style={styles.activityEmoji}>{activity.icon}</Text>
                        </View>
                        <View style={styles.activityInfo}>
                            <Text style={styles.activityTitle}>{activity.title}</Text>
                            <Text style={styles.activityDesc}>{activity.desc}</Text>
                        </View>
                        <Text style={styles.activityTime}>{activity.time}</Text>
                    </View>
                ))}

                {/* Stats Summary */}
                <Text style={styles.sectionTitle}>Resume</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
                        <Text style={[styles.statNum, { color: '#2563EB' }]}>6</Text>
                        <Text style={styles.statLabel}>Annonces</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
                        <Text style={[styles.statNum, { color: '#059669' }]}>15</Text>
                        <Text style={styles.statLabel}>Offres</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                        <Text style={[styles.statNum, { color: '#D97706' }]}>3</Text>
                        <Text style={styles.statLabel}>En cours</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: '#F3F4F6' }]}>
                        <Text style={[styles.statNum, { color: '#374151' }]}>4.8</Text>
                        <Text style={styles.statLabel}>Note</Text>
                    </View>
                </View>

                {/* Bottom Navigation */}
                <View style={styles.bottomNav}>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.push('/home')}>
                        <Text style={[styles.navIcon, styles.navActive]}>🏠</Text>
                        <Text style={[styles.navLabel, styles.navLabelActive]}>Accueil</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
                        <Text style={styles.navIcon}>📊</Text>
                        <Text style={styles.navLabel}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => router.push('/post-job')}>
                        <View style={styles.navCenterBtn}>
                            <Text style={styles.navCenterIcon}>＋</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem}>
                        <Text style={styles.navIcon}>💬</Text>
                        <Text style={styles.navLabel}>Messages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => setMenuVisible(true)}>
                        <Text style={styles.navIcon}>☰</Text>
                        <Text style={styles.navLabel}>Menu</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },

    // ===== HEADER =====
    header: {
        backgroundColor: '#2563EB',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    menuBtn: { padding: 4 },
    menuIcon: { color: 'white', fontSize: 26 },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },
    headerLogo: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 30,
        height: 30,
        borderRadius: 8,
        textAlign: 'center',
        lineHeight: 30,
        marginRight: 8,
    },
    headerTitle: { color: 'white', fontWeight: '700', fontSize: 18 },
    notifBtn: { position: 'relative', padding: 4 },
    notifIcon: { fontSize: 24 },
    notifBadge: {
        position: 'absolute',
        top: -2,
        right: -4,
        backgroundColor: '#EF4444',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notifBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },

    // Welcome
    welcomeSection: { marginBottom: 14 },
    greeting: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    subtitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },

    // Search
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    searchIcon: { fontSize: 16, marginRight: 10 },
    searchText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

    // ===== SIDE MENU =====
    modalOverlay: { flex: 1, flexDirection: 'row' },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
    sideMenu: {
        width: '80%',
        maxWidth: 340,
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    menuHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    menuUserInfo: { flexDirection: 'row', alignItems: 'center' },
    menuAvatar: {
        width: 48,
        height: 48,
        backgroundColor: '#2563EB',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuAvatarText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    menuUserName: { fontSize: 16, fontWeight: '700', color: '#111827' },
    menuUserRole: { color: '#6B7280', fontSize: 12 },
    closeMenuBtn: { fontSize: 22, color: '#9CA3AF', padding: 8 },
    menuItems: { paddingVertical: 8 },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    menuItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    menuItemEmoji: { fontSize: 18 },
    menuItemLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: '#374151' },
    menuArrow: { color: '#D1D5DB', fontSize: 18 },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    logoutIcon: { fontSize: 20, marginRight: 12 },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },

    // ===== CONTENT =====
    content: { flex: 1 },

    // Quick Actions
    quickActions: { paddingHorizontal: 14, marginTop: 18 },
    quickActionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 16,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
        elevation: 1,
    },
    quickActionIcon: { fontSize: 28, marginRight: 14 },
    quickActionInfo: { flex: 1 },
    quickActionTitle: { fontSize: 15, fontWeight: '600', color: '#111827' },
    quickActionDesc: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
    quickActionArrow: { fontSize: 20, color: '#D1D5DB' },

    // Section
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
        paddingHorizontal: 14,
        marginTop: 22,
        marginBottom: 12,
    },

    // Categories
    catScroll: { paddingLeft: 14, marginBottom: 4 },
    catCard: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 14,
        padding: 14,
        marginRight: 10,
        width: 90,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    catIcon: { fontSize: 28, marginBottom: 6 },
    catName: { fontSize: 11, color: '#374151', fontWeight: '500', textAlign: 'center' },

    // Activity
    activityCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginHorizontal: 14,
        borderRadius: 14,
        padding: 14,
        marginBottom: 8,
    },
    activityIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityEmoji: { fontSize: 18 },
    activityInfo: { flex: 1 },
    activityTitle: { fontSize: 14, fontWeight: '600', color: '#111827' },
    activityDesc: { color: '#6B7280', fontSize: 12, marginTop: 2 },
    activityTime: { color: '#9CA3AF', fontSize: 11 },

    // Stats
    statsGrid: { flexDirection: 'row', paddingHorizontal: 14, gap: 8 },
    statCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
    statNum: { fontSize: 22, fontWeight: 'bold' },
    statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

    // ===== BOTTOM NAVIGATION =====
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 8,
        marginHorizontal: 14,
        marginTop: 20,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 8,
    },
    navItem: { alignItems: 'center', flex: 1 },
    navIcon: { fontSize: 22, marginBottom: 2 },
    navActive: {},
    navLabel: { fontSize: 10, color: '#9CA3AF' },
    navLabelActive: { color: '#2563EB', fontWeight: '600' },
    navCenterBtn: {
        width: 48,
        height: 48,
        backgroundColor: '#2563EB',
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -20,
    },
    navCenterIcon: { color: 'white', fontSize: 24, fontWeight: 'bold' },
});