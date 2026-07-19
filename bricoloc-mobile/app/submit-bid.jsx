import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { bidsAPI } from '../src/services/api';

export default function SubmitBid() {
    const { jobId, jobTitle, jobBudget } = useLocalSearchParams();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [estimatedDays, setEstimatedDays] = useState('1');
    const [loading, setLoading] = useState(false);
    const [statusType, setStatusType] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    const handleSubmit = async () => {
        if (!amount || parseInt(amount) < 1000) {
            setStatusType('error');
            setStatusMsg('Please enter a valid amount (minimum 1,000 FCFA)');
            return;
        }
        if (!message || message.length < 10) {
            setStatusType('error');
            setStatusMsg('Please write a message of at least 10 characters');
            return;
        }

        setStatusType('info');
        setStatusMsg('Submitting your offer...');
        setLoading(true);
        try {
            const res = await bidsAPI.submit(jobId, {
                amount: parseInt(amount),
                message: message,
                estimated_days: parseInt(estimatedDays),
            });
            setLoading(false);
            const data = res.data;

            if (data.success) {
                setStatusType('success');
                setStatusMsg('Offer has been sent to client.');
                setAmount('');
                setMessage('');
                setEstimatedDays('1');
                setTimeout(() => router.back(), 3000);
            } else {
                setStatusType('error');
                setStatusMsg(data.message || 'Could not submit offer');
            }
        } catch (error) {
            setLoading(false);
            setStatusType('error');
            const msg = error?.response?.data?.message || error?.response?.data?.errors?.amount?.[0] || 'Server connection error';
            setStatusMsg(msg);
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
                    <TouchableOpacity style={s.navItem} onPress={() => router.push('/(bricoleur)/my-bids')}>
                        <Text style={s.navIcon}>◎</Text><Text style={s.navLabel}>My Offers</Text>
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

            {/* ========== MAIN CONTENT ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Text style={s.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={s.pageTitle}>Submit an Offer</Text>
                    <Text style={s.pageSub}>Propose your price and convince the client.</Text>

                    {/* Job Info */}
                    <View style={s.infoCard}>
                        <Text style={s.jobLabel}>JOB</Text>
                        <Text style={s.jobTitle}>{jobTitle || 'Pipe leak repair'}</Text>
                        <Text style={s.jobBudget}>Client budget: {jobBudget || '15,000 FCFA'}</Text>
                    </View>

                    {/* Form Card */}
                    <View style={s.formCard}>
                        <Text style={s.sectionLabel}>YOUR OFFER</Text>

                        <Text style={s.label}>Your Price (FCFA) *</Text>
                        <View style={s.inputRow}>
                            <TextInput style={s.inputFull} placeholder="Ex: 12000" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={amount} onChangeText={setAmount} />
                            <Text style={s.currencyLabel}>FCFA</Text>
                        </View>
                        <Text style={s.hint}>Client budget: {jobBudget || '15,000 FCFA'}</Text>

                        <Text style={s.label}>Estimated Time</Text>
                        <View style={s.daysRow}>
                            {['1', '2', '3', '5', '7'].map(d => (
                                <TouchableOpacity key={d} style={[s.dayChip, estimatedDays === d && s.dayChipActive]} onPress={() => setEstimatedDays(d)}>
                                    <Text style={[s.dayText, estimatedDays === d && s.dayTextActive]}>{d} day{parseInt(d) > 1 ? 's' : ''}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={s.label}>Message to Client *</Text>
                        <TextInput style={[s.inputFull, s.textArea, s.inputBox]} placeholder="Describe your approach, experience, availability..." placeholderTextColor="#9CA3AF" value={message} onChangeText={setMessage} multiline numberOfLines={5} textAlignVertical="top" />
                        <Text style={s.charCount}>{message.length}/500</Text>

                        <View style={s.divider} />

                        <View style={s.tipsCard}>
                            <Text style={s.tipsTitle}>💡 Tips for a Good Offer</Text>
                            <Text style={s.tipsText}>• Propose a competitive but fair price</Text>
                            <Text style={s.tipsText}>• Mention your experience with this type of work</Text>
                            <Text style={s.tipsText}>• Indicate your precise availability</Text>
                            <Text style={s.tipsText}>• Be polite and professional</Text>
                        </View>

                        {statusType && (
                            <View style={[s.statusBanner, statusType === 'error' && s.statusBannerError, statusType === 'info' && s.statusBannerInfo, statusType === 'success' && s.statusBannerSuccess]}>
                                <Text style={[s.statusText, statusType === 'error' && s.statusTextError, statusType === 'info' && s.statusTextInfo, statusType === 'success' && s.statusTextSuccess]}>
                                    {statusType === 'info' ? 'ℹ️ ' : statusType === 'success' ? '✅ ' : '❌ '}{statusMsg}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={[s.submitBtn, (!amount || !message) && s.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={!amount || !message || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={s.submitBtnText}>
                                    Submit Offer ({amount ? parseInt(amount).toLocaleString() + ' FCFA' : '...'})
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F0FDF4' },

    // Sidebar
    sidebar: { width: 200, backgroundColor: '#064E3B', paddingVertical: 24, paddingHorizontal: 16 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    brandIcon: { width: 30, height: 30, backgroundColor: '#F59E0B', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    brandIconText: { color: '#064E3B', fontWeight: '700', fontSize: 13 },
    brandName: { color: '#ECFDF5', fontWeight: '600', fontSize: 15 },
    brandLabel: { color: '#6EE7B7', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 22, marginTop: 2 },
    nav: {},
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 6, marginBottom: 1, gap: 10 },
    navIcon: { fontSize: 14, color: '#6EE7B7', width: 18, textAlign: 'center' },
    navLabel: { fontSize: 12, color: '#A7F3D0' },

    // Main
    main: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    topbar: { marginBottom: 8 },
    backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#D1FAE5' },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#064E3B', marginTop: 8 },
    pageSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 18 },

    // Job Info
    infoCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#D1FAE5' },
    jobLabel: { fontSize: 9, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
    jobTitle: { fontSize: 16, fontWeight: '600', color: '#064E3B' },
    jobBudget: { color: '#059669', fontWeight: '500', marginTop: 4, fontSize: 13 },

    // Form
    formCard: { backgroundColor: 'white', borderRadius: 14, padding: 22, borderWidth: 1, borderColor: '#D1FAE5' },
    sectionLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14 },
    inputFull: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
    inputBox: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12 },
    currencyLabel: { color: '#6B7280', fontWeight: '500', fontSize: 13 },
    hint: { color: '#9CA3AF', fontSize: 11, marginTop: 4 },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    charCount: { textAlign: 'right', color: '#9CA3AF', fontSize: 10, marginTop: 4 },

    // Days
    daysRow: { flexDirection: 'row', gap: 8 },
    dayChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#D1FAE5' },
    dayChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
    dayText: { color: '#374151', fontWeight: '500', fontSize: 13 },
    dayTextActive: { color: 'white' },

    // Divider
    divider: { borderTopWidth: 1, borderColor: '#E5E7EB', marginVertical: 14 },

    // Tips
    tipsCard: { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#FDE68A' },
    tipsTitle: { fontWeight: '600', color: '#B45309', marginBottom: 8, fontSize: 13 },
    tipsText: { color: '#92400E', fontSize: 12, lineHeight: 22 },

    // Status banners
    statusBanner: { borderRadius: 8, padding: 12, marginBottom: 14, borderWidth: 1 },
    statusBannerInfo: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
    statusBannerSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
    statusBannerError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    statusText: { fontSize: 13, lineHeight: 20 },
    statusTextInfo: { color: '#1E40AF' },
    statusTextSuccess: { color: '#166534' },
    statusTextError: { color: '#991B1B' },

    // Submit
    submitBtn: { backgroundColor: '#059669', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    submitBtnDisabled: { backgroundColor: '#A7F3D0' },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
});