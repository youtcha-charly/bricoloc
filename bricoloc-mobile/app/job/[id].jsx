import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    StyleSheet,
    Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function JobDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [selectedBid, setSelectedBid] = useState(null);
    const [showBidModal, setShowBidModal] = useState(false);

    // Sample job data
    const job = {
        id: id,
        title: 'Reparation fuite eau sous evier',
        category: 'Plomberie',
        description: 'Grosse fuite sous l evier de la cuisine. Besoin d une intervention rapide.',
        budget: '15,000 FCFA',
        city: 'Douala',
        neighborhood: 'Bonapriso',
        status: 'open',
        postedDate: '2026-07-01',
        client: { name: 'Jean Dupont', rating: 4.5 },
    };

    // Sample bids
    const [bids, setBids] = useState([
        {
            id: '1',
            bricoleur: { name: 'Jean K.', rating: 4.8, verified: true, city: 'Douala', jobsCompleted: 47 },
            amount: '12,000 FCFA',
            message: 'Je peux intervenir ce soir vers 18h. J ai tout le materiel necessaire pour reparer la fuite.',
            estimatedDays: 1,
            date: '2026-07-01 14:30',
            status: 'pending',
        },
        {
            id: '2',
            bricoleur: { name: 'Paul M.', rating: 4.5, verified: true, city: 'Yaounde', jobsCompleted: 32 },
            amount: '15,000 FCFA',
            message: 'Disponible demain matin 8h. Je peux aussi verifier les autres tuyaux.',
            estimatedDays: 1,
            date: '2026-07-01 15:00',
            status: 'pending',
        },
        {
            id: '3',
            bricoleur: { name: 'Pierre T.', rating: 4.2, verified: true, city: 'Douala', jobsCompleted: 18 },
            amount: '10,000 FCFA',
            message: 'Je suis a Bonapriso, je peux passer dans l heure.',
            estimatedDays: 1,
            date: '2026-07-01 15:45',
            status: 'pending',
        },
    ]);

    const handleAcceptBid = (bidId) => {
        Alert.alert(
            'Accepter l offre',
            'Etes-vous sur de vouloir accepter cette offre ? Les autres offres seront automatiquement rejetees.',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Accepter',
                    onPress: () => {
                        setBids(bids.map(bid => ({
                            ...bid,
                            status: bid.id === bidId ? 'accepted' : 'rejected'
                        })));
                        Alert.alert('✅ Offre acceptee', 'Le bricoleur va etre notifie.');
                    }
                },
            ]
        );
    };

    const handleRejectBid = (bidId) => {
        Alert.alert(
            'Rejeter l offre',
            'Etes-vous sur de vouloir rejeter cette offre ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Rejeter',
                    style: 'destructive',
                    onPress: () => {
                        setBids(bids.map(bid =>
                            bid.id === bidId ? { ...bid, status: 'rejected' } : bid
                        ));
                    }
                },
            ]
        );
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepted': return { bg: '#D1FAE5', text: '#065F46', label: 'Accepte' };
            case 'rejected': return { bg: '#FEE2E2', text: '#991B1B', label: 'Rejete' };
            default: return { bg: '#FEF3C7', text: '#92400E', label: 'En attente' };
        }
    };

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Details du job</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                {/* Job Info */}
                <View style={s.jobCard}>
                    <View style={s.jobHeader}>
                        <Text style={s.jobTitle}>{job.title}</Text>
                        <View style={s.statusBadge}>
                            <Text style={s.statusText}>Ouvert</Text>
                        </View>
                    </View>
                    <Text style={s.jobCategory}>🔧 {job.category}</Text>
                    <Text style={s.jobBudget}>💰 {job.budget}</Text>
                    <Text style={s.jobLocation}>📍 {job.city}, {job.neighborhood}</Text>
                    <Text style={s.jobDesc}>{job.description}</Text>
                    <View style={s.jobFooter}>
                        <Text style={s.jobDate}>📅 {job.postedDate}</Text>
                        <Text style={s.jobClient}>👤 {job.client.name}</Text>
                    </View>
                </View>

                {/* Bids Section */}
                <Text style={s.sectionTitle}>📋 Offres recues ({bids.length})</Text>

                {bids.map(bid => {
                    const statusStyle = getStatusStyle(bid.status);
                    return (
                        <View key={bid.id} style={[s.bidCard, bid.status === 'accepted' && s.bidAccepted]}>
                            {/* Bricoleur Info */}
                            <View style={s.bidHeader}>
                                <View style={s.bricoleurInfo}>
                                    <View style={s.avatar}>
                                        <Text style={s.avatarText}>{bid.bricoleur.name.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <View style={s.nameRow}>
                                            <Text style={s.bricoleurName}>{bid.bricoleur.name}</Text>
                                            {bid.bricoleur.verified && (
                                                <Text style={s.verifiedBadge}>✅ Verifie</Text>
                                            )}
                                        </View>
                                        <View style={s.ratingRow}>
                                            <Text style={s.rating}>
                                                {'⭐'.repeat(Math.floor(bid.bricoleur.rating))} {bid.bricoleur.rating}
                                            </Text>
                                            <Text style={s.jobsDone}>• {bid.bricoleur.jobsCompleted} travaux</Text>
                                            <Text style={s.city}>• {bid.bricoleur.city}</Text>
                                        </View>
                                    </View>
                                </View>
                                <View style={[s.bidStatus, { backgroundColor: statusStyle.bg }]}>
                                    <Text style={[s.bidStatusText, { color: statusStyle.text }]}>
                                        {statusStyle.label}
                                    </Text>
                                </View>
                            </View>

                            {/* Bid Details */}
                            <View style={s.bidDetails}>
                                <View style={s.bidAmountRow}>
                                    <Text style={s.bidAmountLabel}>Montant propose</Text>
                                    <Text style={s.bidAmount}>{bid.amount}</Text>
                                </View>
                                <View style={s.bidInfoRow}>
                                    <Text style={s.bidInfoLabel}>Delai estime</Text>
                                    <Text style={s.bidInfoValue}>{bid.estimatedDays} jour(s)</Text>
                                </View>
                                <Text style={s.bidMessage}>"{bid.message}"</Text>
                                <Text style={s.bidDate}>📅 {bid.date}</Text>
                            </View>

                            {/* Actions */}
                            {bid.status === 'pending' && (
                                <View style={s.actionRow}>
                                    <TouchableOpacity
                                        style={s.acceptBtn}
                                        onPress={() => handleAcceptBid(bid.id)}
                                    >
                                        <Text style={s.acceptBtnText}>✅ Accepter</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={s.rejectBtn}
                                        onPress={() => handleRejectBid(bid.id)}
                                    >
                                        <Text style={s.rejectBtnText}>❌ Rejeter</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                })}

                {bids.length === 0 && (
                    <View style={s.emptyState}>
                        <Text style={s.emptyIcon}>📭</Text>
                        <Text style={s.emptyText}>Aucune offre pour le moment</Text>
                    </View>
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#2563EB', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, paddingHorizontal: 14 },

    // Job Card
    jobCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginTop: 14 },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    jobTitle: { fontSize: 18, fontWeight: '700', color: '#111827', flex: 1 },
    statusBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
    statusText: { color: '#1E40AF', fontSize: 12, fontWeight: '600' },
    jobCategory: { color: '#6B7280', fontSize: 14, marginBottom: 4 },
    jobBudget: { color: '#059669', fontWeight: '600', fontSize: 16, marginBottom: 4 },
    jobLocation: { color: '#6B7280', fontSize: 14, marginBottom: 8 },
    jobDesc: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 10 },
    jobFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
    jobDate: { color: '#9CA3AF', fontSize: 12 },
    jobClient: { color: '#6B7280', fontSize: 12 },

    // Section
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 10 },

    // Bid Cards
    bidCard: {
        backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    bidAccepted: { borderColor: '#059669', borderWidth: 2, backgroundColor: '#F0FDF4' },
    bidHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    bricoleurInfo: { flexDirection: 'row', flex: 1 },
    avatar: {
        width: 44, height: 44, backgroundColor: '#2563EB', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginRight: 10,
    },
    avatarText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    bricoleurName: { fontSize: 15, fontWeight: '600', color: '#111827' },
    verifiedBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, fontSize: 10, color: '#065F46' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    rating: { fontSize: 12, color: '#F59E0B' },
    jobsDone: { fontSize: 11, color: '#9CA3AF', marginLeft: 4 },
    city: { fontSize: 11, color: '#9CA3AF', marginLeft: 4 },
    bidStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, height: 28 },
    bidStatusText: { fontSize: 11, fontWeight: '600' },

    // Bid Details
    bidDetails: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
    bidAmountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    bidAmountLabel: { color: '#6B7280', fontSize: 13 },
    bidAmount: { color: '#059669', fontWeight: '700', fontSize: 16 },
    bidInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    bidInfoLabel: { color: '#6B7280', fontSize: 13 },
    bidInfoValue: { color: '#111827', fontWeight: '500', fontSize: 13 },
    bidMessage: { color: '#374151', fontSize: 13, fontStyle: 'italic', marginBottom: 6 },
    bidDate: { color: '#9CA3AF', fontSize: 11 },

    // Actions
    actionRow: { flexDirection: 'row', gap: 8 },
    acceptBtn: {
        flex: 1, backgroundColor: '#059669', paddingVertical: 12,
        borderRadius: 10, alignItems: 'center',
    },
    acceptBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
    rejectBtn: {
        flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 12,
        borderRadius: 10, alignItems: 'center',
    },
    rejectBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },

    // Empty
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { fontSize: 50, marginBottom: 10 },
    emptyText: { color: '#9CA3AF', fontSize: 15 },
});