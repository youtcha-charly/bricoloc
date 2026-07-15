import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, Alert,
    StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function JobDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [job, setJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(true);

    const getToken = () => localStorage.getItem('auth_token');

    useEffect(() => {
        fetchJobDetail();
    }, []);

    const fetchJobDetail = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs/${id}`, {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setJob(data.data);
                setBids(data.data.bids || []);
            }
        } catch (err) {
            console.log('Error fetching job:', err);
        }
        setLoading(false);
    };

    const handleAcceptBid = (bidId) => {
        Alert.alert(
            'Accept Offer',
            'Are you sure? All other offers will be automatically rejected.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Accept',
                    onPress: async () => {
                        try {
                            const token = getToken();
                            const response = await fetch(`http://127.0.0.1:8000/api/v1/bids/${bidId}/accept`, {
                                method: 'PUT',
                                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
                            });
                            const data = await response.json();
                            if (data.success) {
                                Alert.alert('✅ Offer Accepted', 'The bricoleur has been notified. You can now chat.');
                                fetchJobDetail();
                            } else {
                                Alert.alert('Error', data.message || 'Could not accept bid');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Server connection error');
                        }
                    }
                },
            ]
        );
    };

    const handleRejectBid = (bidId) => {
        Alert.alert(
            'Reject Offer',
            'Are you sure you want to reject this offer?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const token = getToken();
                            const response = await fetch(`http://127.0.0.1:8000/api/v1/bids/${bidId}/reject`, {
                                method: 'PUT',
                                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
                            });
                            const data = await response.json();
                            if (data.success) {
                                Alert.alert('❌ Offer Rejected');
                                fetchJobDetail();
                            } else {
                                Alert.alert('Error', data.message || 'Could not reject bid');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Server connection error');
                        }
                    }
                },
            ]
        );
    };

    const handleCompleteJob = async () => {
        Alert.alert(
            'Mark as Complete',
            'Has the work been finished?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Complete',
                    onPress: async () => {
                        try {
                            const token = getToken();
                            const response = await fetch(`http://127.0.0.1:8000/api/v1/jobs/${id}/complete`, {
                                method: 'PUT',
                                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
                            });
                            const data = await response.json();
                            if (data.success) {
                                Alert.alert('✅ Job Completed', 'The job has been marked as complete.');
                                fetchJobDetail();
                            } else {
                                Alert.alert('Error', data.message || 'Could not complete job');
                            }
                        } catch (err) {
                            Alert.alert('Error', 'Server connection error');
                        }
                    }
                },
            ]
        );
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'accepted': return { bg: '#D1FAE5', text: '#065F46', label: 'Accepted' };
            case 'rejected': return { bg: '#FEE2E2', text: '#991B1B', label: 'Rejected' };
            case 'pending': return { bg: '#FFFBEB', text: '#92400E', label: 'Pending' };
            default: return { bg: '#F3F4F6', text: '#6B7280', label: status?.toUpperCase() || 'N/A' };
        }
    };

    const getJobStatusStyle = (status) => {
        switch (status) {
            case 'open': return { bg: '#FDF3E0', text: '#B8860B', label: 'OPEN' };
            case 'assigned': return { bg: '#DBEAFE', text: '#1E40AF', label: 'ASSIGNED' };
            case 'in_progress': return { bg: '#DBEAFE', text: '#1E40AF', label: 'IN PROGRESS' };
            case 'completed': return { bg: '#E6F4F2', text: '#0F766E', label: 'COMPLETED' };
            default: return { bg: '#F3F4F6', text: '#6B7280', label: status?.toUpperCase() || 'N/A' };
        }
    };

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#D9A441" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading job details...</Text>
            </View>
        );
    }

    if (!job) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 18, color: '#6B7280' }}>Job not found</Text>
                <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
                    <Text style={{ color: '#D9A441', fontWeight: '600' }}>← Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const jobSt = getJobStatusStyle(job.status);

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Job Details</Text>
                <TouchableOpacity onPress={fetchJobDetail}>
                    <Text style={s.refreshBtn}>🔄</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                {/* Job Info Card */}
                <View style={s.jobCard}>
                    <View style={s.jobHeader}>
                        <Text style={s.jobTitle}>{job.title}</Text>
                        <View style={[s.jobStatusBadge, { backgroundColor: jobSt.bg }]}>
                            <Text style={[s.jobStatusText, { color: jobSt.text }]}>{jobSt.label}</Text>
                        </View>
                    </View>
                    <Text style={s.jobCategory}>📂 {job.category?.name || 'General'}</Text>
                    <Text style={s.jobBudget}>💰 {job.budget_max ? job.budget_max.toLocaleString() : '0'} FCFA</Text>
                    <Text style={s.jobLocation}>📍 {job.city}{job.neighborhood ? ', ' + job.neighborhood : ''}</Text>
                    <Text style={s.jobDesc}>{job.description}</Text>
                    <View style={s.jobFooter}>
                        <Text style={s.jobDate}>📅 {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</Text>
                        {job.client && <Text style={s.jobClient}>👤 {job.client.name}</Text>}
                    </View>

                    {/* Chat Button */}
                    {job.status === 'assigned' && (
                        <TouchableOpacity 
                            style={[s.chatBtn]} 
                            onPress={() => router.push(`/chat/${job.id}`)}
                        >
                            <Text style={s.chatBtnText}>💬 Chat with Bricoleur</Text>
                        </TouchableOpacity>
                    )}

                    {/* Complete Button */}
                    {(job.status === 'assigned' || job.status === 'in_progress') && (
                        <TouchableOpacity style={s.completeBtn} onPress={handleCompleteJob}>
                            <Text style={s.completeBtnText}>✅ Mark as Complete</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Bids Section */}
                <Text style={s.sectionTitle}>📋 Offers Received ({bids.length})</Text>

                {bids.length === 0 ? (
                    <View style={s.emptyState}>
                        <Text style={s.emptyIcon}>📭</Text>
                        <Text style={s.emptyText}>No offers yet</Text>
                    </View>
                ) : (
                    bids.map(bid => {
                        const statusStyle = getStatusStyle(bid.status);
                        const bricoleur = bid.bricoleur || {};
                        return (
                            <View key={bid.id} style={[s.bidCard, bid.status === 'accepted' && s.bidAccepted]}>
                                <View style={s.bidHeader}>
                                    <View style={s.bricoleurInfo}>
                                        <View style={s.avatar}>
                                            <Text style={s.avatarText}>{(bricoleur.name || '?').charAt(0)}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <View style={s.nameRow}>
                                                <Text style={s.bricoleurName}>{bricoleur.name || 'Unknown'}</Text>
                                            </View>
                                            <Text style={s.bricoleurCity}>📍 {bricoleur.city || 'N/A'}</Text>
                                        </View>
                                    </View>
                                    <View style={[s.bidStatus, { backgroundColor: statusStyle.bg }]}>
                                        <Text style={[s.bidStatusText, { color: statusStyle.text }]}>{statusStyle.label}</Text>
                                    </View>
                                </View>

                                <View style={s.bidDetails}>
                                    <View style={s.bidAmountRow}>
                                        <Text style={s.bidAmountLabel}>Proposed Amount</Text>
                                        <Text style={s.bidAmount}>{bid.amount ? bid.amount.toLocaleString() : '0'} FCFA</Text>
                                    </View>
                                    <View style={s.bidInfoRow}>
                                        <Text style={s.bidInfoLabel}>Estimated Time</Text>
                                        <Text style={s.bidInfoValue}>{bid.estimated_days || 1} day(s)</Text>
                                    </View>
                                    {bid.message && <Text style={s.bidMessage}>"{bid.message}"</Text>}
                                    <Text style={s.bidDate}>📅 {bid.created_at ? new Date(bid.created_at).toLocaleString() : 'N/A'}</Text>
                                </View>

                                {/* Accept/Reject Buttons */}
                                {bid.status === 'pending' && job.status === 'open' && (
                                    <View style={s.actionRow}>
                                        <TouchableOpacity style={s.acceptBtn} onPress={() => handleAcceptBid(bid.id)}>
                                            <Text style={s.acceptBtnText}>✅ Accept</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={s.rejectBtn} onPress={() => handleRejectBid(bid.id)}>
                                            <Text style={s.rejectBtnText}>❌ Reject</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F6' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#0B3D3E', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    refreshBtn: { color: 'white', fontSize: 20 },
    content: { flex: 1, paddingHorizontal: 14 },

    // Job Card
    jobCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginTop: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    jobTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', flex: 1, marginRight: 8 },
    jobStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    jobStatusText: { fontSize: 11, fontWeight: '700' },
    jobCategory: { color: '#6B7280', fontSize: 13, marginBottom: 4 },
    jobBudget: { color: '#059669', fontWeight: '600', fontSize: 16, marginBottom: 4 },
    jobLocation: { color: '#6B7280', fontSize: 13, marginBottom: 8 },
    jobDesc: { color: '#374151', fontSize: 14, lineHeight: 20, marginBottom: 10 },
    jobFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 10 },
    jobDate: { color: '#9CA3AF', fontSize: 12 },
    jobClient: { color: '#6B7280', fontSize: 12 },
    chatBtn: { backgroundColor: '#2563EB', paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginTop: 10 },
    chatBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    completeBtn: { backgroundColor: '#059669', paddingVertical: 10, alignItems: 'center', borderRadius: 8, marginTop: 6 },
    completeBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },

    // Section
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1A1A1A', marginTop: 20, marginBottom: 10 },

    // Bid Cards
    bidCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
    bidAccepted: { borderColor: '#059669', borderWidth: 2, backgroundColor: '#F0FDF4' },
    bidHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    bricoleurInfo: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    avatar: { width: 40, height: 40, backgroundColor: '#D9A441', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    avatarText: { color: '#0B3D3E', fontSize: 16, fontWeight: 'bold' },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    bricoleurName: { fontSize: 14, fontWeight: '600', color: '#1A1A1A' },
    bricoleurCity: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
    bidStatus: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
    bidStatusText: { fontSize: 11, fontWeight: '600' },
    bidDetails: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, marginBottom: 10 },
    bidAmountRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    bidAmountLabel: { color: '#6B7280', fontSize: 13 },
    bidAmount: { color: '#059669', fontWeight: '700', fontSize: 16 },
    bidInfoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    bidInfoLabel: { color: '#6B7280', fontSize: 13 },
    bidInfoValue: { color: '#1A1A1A', fontWeight: '500', fontSize: 13 },
    bidMessage: { color: '#374151', fontSize: 13, fontStyle: 'italic', marginBottom: 6 },
    bidDate: { color: '#9CA3AF', fontSize: 11 },
    actionRow: { flexDirection: 'row', gap: 8 },
    acceptBtn: { flex: 1, backgroundColor: '#059669', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    acceptBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
    rejectBtn: { flex: 1, backgroundColor: '#FEE2E2', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    rejectBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 14 },
    emptyState: { alignItems: 'center', paddingVertical: 40 },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { color: '#9CA3AF', fontSize: 15 },
});