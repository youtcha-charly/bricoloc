import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SubmitBid() {
    const { jobId, jobTitle, jobBudget } = useLocalSearchParams();
    const router = useRouter();
    const [amount, setAmount] = useState('');
    const [message, setMessage] = useState('');
    const [estimatedDays, setEstimatedDays] = useState('1');
    const [loading, setLoading] = useState(false);

    const handleSubmit = () => {
        if (!amount || parseInt(amount) < 1000) {
            Alert.alert('Erreur', 'Veuillez entrer un montant valide (minimum 1,000 FCFA)');
            return;
        }
        if (!message || message.length < 10) {
            Alert.alert('Erreur', 'Veuillez ecrire un message d au moins 10 caracteres');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                '✅ Offre soumise !',
                `Votre offre de ${parseInt(amount).toLocaleString()} FCFA a ete envoyee au client.`,
                [{ text: 'OK', onPress: () => router.back() }]
            );
        }, 1500);
    };

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Soumettre une offre</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                {/* Job Info */}
                <View style={s.jobInfoCard}>
                    <Text style={s.jobLabel}>Travail</Text>
                    <Text style={s.jobTitle}>{jobTitle || 'Reparation fuite eau'}</Text>
                    <Text style={s.jobBudget}>Budget client: {jobBudget || '15,000 FCFA'}</Text>
                </View>

                {/* Amount */}
                <Text style={s.label}>Votre prix (FCFA) *</Text>
                <View style={s.inputRow}>
                    <Text style={s.currencyIcon}>💰</Text>
                    <TextInput
                        style={s.input}
                        placeholder="Ex: 12000"
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                    />
                    <Text style={s.currencyLabel}>FCFA</Text>
                </View>
                <Text style={s.hint}>
                    Budget client: {jobBudget || '15,000 FCFA'}
                </Text>

                {/* Estimated Days */}
                <Text style={s.label}>Delai estime</Text>
                <View style={s.daysRow}>
                    {['1', '2', '3', '5', '7'].map(d => (
                        <TouchableOpacity
                            key={d}
                            style={[s.dayChip, estimatedDays === d && s.dayChipActive]}
                            onPress={() => setEstimatedDays(d)}
                        >
                            <Text style={[s.dayText, estimatedDays === d && s.dayTextActive]}>
                                {d} jour{parseInt(d) > 1 ? 's' : ''}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Message */}
                <Text style={s.label}>Message au client *</Text>
                <TextInput
                    style={[s.input, s.textArea]}
                    placeholder="Decrivez votre approche, experience, disponibilite..."
                    value={message}
                    onChangeText={setMessage}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                />
                <Text style={s.charCount}>{message.length}/500</Text>

                {/* Tips */}
                <View style={s.tipsCard}>
                    <Text style={s.tipsTitle}>💡 Conseils pour une bonne offre</Text>
                    <Text style={s.tipsText}>
                        • Proposez un prix competitif mais juste{'\n'}
                        • Mentionnez votre experience avec ce type de travail{'\n'}
                        • Indiquez votre disponibilite precise{'\n'}
                        • Soyez poli et professionnel
                    </Text>
                </View>

                {/* Submit */}
                <TouchableOpacity
                    style={[s.submitBtn, (!amount || !message) && s.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={!amount || !message || loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={s.submitBtnText}>
                            📤 Soumettre l offre ({amount ? parseInt(amount).toLocaleString() + ' FCFA' : '...'})
                        </Text>
                    )}
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#059669', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    content: { flex: 1, paddingHorizontal: 14 },

    // Job Info
    jobInfoCard: { backgroundColor: 'white', borderRadius: 14, padding: 16, marginTop: 14, marginBottom: 4 },
    jobLabel: { color: '#9CA3AF', fontSize: 12, marginBottom: 4 },
    jobTitle: { fontSize: 16, fontWeight: '600', color: '#111827' },
    jobBudget: { color: '#059669', fontWeight: '500', marginTop: 4 },

    // Inputs
    label: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 18, marginBottom: 8 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: 'white',
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14,
    },
    currencyIcon: { fontSize: 16, marginRight: 8 },
    input: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#111827' },
    currencyLabel: { color: '#6B7280', fontWeight: '500' },
    hint: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    charCount: { textAlign: 'right', color: '#9CA3AF', fontSize: 11, marginTop: 4 },

    // Days
    daysRow: { flexDirection: 'row', gap: 8 },
    dayChip: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
        backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB',
    },
    dayChipActive: { backgroundColor: '#059669', borderColor: '#059669' },
    dayText: { color: '#374151', fontWeight: '500' },
    dayTextActive: { color: 'white' },

    // Tips
    tipsCard: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14, marginTop: 20, borderWidth: 1, borderColor: '#BBF7D0' },
    tipsTitle: { fontWeight: '600', color: '#166534', marginBottom: 8 },
    tipsText: { color: '#166534', fontSize: 13, lineHeight: 20 },

    // Submit
    submitBtn: { backgroundColor: '#059669', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
    submitBtnDisabled: { backgroundColor: '#A7F3D0' },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
});