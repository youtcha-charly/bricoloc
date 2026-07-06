import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    ActivityIndicator, StyleSheet, ScrollView,
    KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Register() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [role, setRole] = useState('client');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Limbe', 'Kribi', 'Buéa', 'Ebolowa'];

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword) {
            window.alert('Veuillez remplir tous les champs obligatoires');
            return;
        }
        if (password !== confirmPassword) {
            window.alert('Les mots de passe ne correspondent pas');
            return;
        }
        if (password.length < 6) {
            window.alert('Le mot de passe doit contenir au moins 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone_number: '+237' + phone,
                    password: password,
                    password_confirmation: confirmPassword,
                    role: role,
                    city: city,
                }),
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));

                window.alert('✅ Compte cree avec succes !\n\nBienvenue ' + data.user.name + ' !\n\nVous allez etre redirige vers la page de connexion.');
                
                setTimeout(() => {
                    router.replace('/login');
                }, 500);
            } else {
                const errorMsg = data.errors
                    ? Object.values(data.errors).flat().join('\n')
                    : (data.message || 'Erreur inconnue');
                window.alert('Erreur : ' + errorMsg);
            }
        } catch (error) {
            setLoading(false);
            window.alert('Erreur de connexion au serveur.\n\nVerifiez que Laravel est lance avec : php artisan serve');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.header, role === 'bricoleur' && styles.headerBricoleur]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Text style={styles.backBtnText}>← Retour</Text>
                    </TouchableOpacity>
                    <View style={styles.logo}><Text style={styles.logoText}>BL</Text></View>
                    <Text style={styles.appName}>BricoLoc</Text>
                    <Text style={styles.tagline}>Creez votre compte</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.sectionTitle}>Vous etes ?</Text>
                    <View style={styles.roleRow}>
                        <TouchableOpacity style={[styles.roleCard, role === 'client' && styles.roleCardActive]} onPress={() => setRole('client')}>
                            <Text style={styles.roleIcon}>👤</Text>
                            <Text style={[styles.roleName, role === 'client' && styles.roleNameActive]}>Client</Text>
                            <Text style={styles.roleDesc}>Je cherche un bricoleur</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.roleCard, role === 'bricoleur' && styles.roleCardActiveBricoleur]} onPress={() => setRole('bricoleur')}>
                            <Text style={styles.roleIcon}>🔧</Text>
                            <Text style={[styles.roleName, role === 'bricoleur' && styles.roleNameActiveBricoleur]}>Bricoleur</Text>
                            <Text style={styles.roleDesc}>Je propose mes services</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.sectionTitle}>Informations personnelles</Text>
                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Text style={styles.label}>Prenom *</Text>
                            <TextInput style={styles.input} placeholder="Jean" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} />
                        </View>
                        <View style={styles.half}>
                            <Text style={styles.label}>Nom *</Text>
                            <TextInput style={styles.input} placeholder="Dupont" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} />
                        </View>
                    </View>

                    <Text style={styles.label}>Email *</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputIcon}>📧</Text>
                        <TextInput style={styles.inputFull} placeholder="exemple@email.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                    </View>

                    <Text style={styles.label}>Telephone *</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.prefix}>+237</Text>
                        <View style={styles.vDivider} />
                        <TextInput style={styles.inputFull} placeholder="6XX XXX XXX" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))} maxLength={9} />
                    </View>

                    <Text style={styles.label}>Ville *</Text>
                    <View style={styles.cityGrid}>
                        {cities.map(c => (
                            <TouchableOpacity key={c} style={[styles.cityChip, city === c && styles.cityChipActive]} onPress={() => setCity(c)}>
                                <Text style={[styles.cityText, city === c && styles.cityTextActive]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Securite</Text>
                    <Text style={styles.label}>Mot de passe *</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput style={styles.inputFull} placeholder="Min. 6 caracteres" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Confirmer *</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputIcon}>🔒</Text>
                        <TextInput style={styles.inputFull} placeholder="Repetez le mot de passe" placeholderTextColor="#9CA3AF" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {confirmPassword.length > 0 && (
                        <View style={[styles.matchBox, password === confirmPassword ? styles.matchOk : styles.matchBad]}>
                            <Text style={password === confirmPassword ? styles.matchTextOk : styles.matchTextBad}>
                                {password === confirmPassword ? '✅ Les mots de passe correspondent' : '❌ Les mots de passe ne correspondent pas'}
                            </Text>
                        </View>
                    )}

                    <TouchableOpacity
                        style={[styles.submitBtn, (!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword) && styles.submitBtnDisabled]}
                        onPress={handleRegister}
                        disabled={!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword || loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitBtnText}>Creer mon compte</Text>}
                    </TouchableOpacity>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginText}>Deja un compte ? </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={styles.loginLink}>Se connecter</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },
    header: { alignItems: 'center', paddingTop: 50, paddingBottom: 20, backgroundColor: '#2563EB', borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    headerBricoleur: { backgroundColor: '#059669' },
    backBtn: { position: 'absolute', left: 16, top: 50 },
    backBtnText: { color: 'white', fontSize: 16 },
    logo: { width: 60, height: 60, backgroundColor: 'white', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    logoText: { fontSize: 26, fontWeight: 'bold', color: '#2563EB' },
    appName: { fontSize: 24, fontWeight: 'bold', color: 'white' },
    tagline: { color: 'rgba(255,255,255,0.8)', fontSize: 13, marginTop: 2 },
    form: { paddingHorizontal: 20, paddingTop: 18 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 14, marginBottom: 10 },
    roleRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    roleCard: { flex: 1, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 14, padding: 14, alignItems: 'center' },
    roleCardActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
    roleCardActiveBricoleur: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
    roleIcon: { fontSize: 30, marginBottom: 6 },
    roleName: { fontSize: 15, fontWeight: '600', color: '#374151' },
    roleNameActive: { color: '#2563EB' },
    roleNameActiveBricoleur: { color: '#059669' },
    roleDesc: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    label: { color: '#374151', fontWeight: '600', marginBottom: 5, marginTop: 10, fontSize: 13 },
    input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, backgroundColor: '#F9FAFB', color: '#111827' },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#F9FAFB' },
    inputIcon: { fontSize: 14, marginRight: 8 },
    inputFull: { flex: 1, fontSize: 13, color: '#111827' },
    prefix: { fontSize: 13, fontWeight: '600', color: '#111827' },
    vDivider: { width: 1, height: 16, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
    eyeIcon: { fontSize: 16, paddingLeft: 4 },
    cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    cityChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1, borderColor: '#D1D5DB' },
    cityChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    cityText: { color: '#374151', fontSize: 11 },
    cityTextActive: { color: 'white' },
    matchBox: { padding: 10, borderRadius: 8, marginTop: 8 },
    matchOk: { backgroundColor: '#F0FDF4' },
    matchBad: { backgroundColor: '#FEF2F2' },
    matchTextOk: { color: '#166534', fontSize: 12, fontWeight: '500' },
    matchTextBad: { color: '#991B1B', fontSize: 12, fontWeight: '500' },
    submitBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    submitBtnDisabled: { backgroundColor: '#93C5FD' },
    submitBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
    loginText: { color: '#6B7280', fontSize: 13 },
    loginLink: { color: '#2563EB', fontWeight: '700', fontSize: 13 },
});