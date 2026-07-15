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

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Limbe', 'Kribi', 'Buea', 'Ebolowa'];

    const handleRegister = async () => {
        if (!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword) {
            window.alert('Please fill in all required fields');
            return;
        }
        if (password !== confirmPassword) {
            window.alert('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            window.alert('Password must be at least 6 characters');
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
                window.alert('✅ Account created successfully!\n\nWelcome ' + data.user.name + '!\n\nYou will be redirected to the login page.');
                setTimeout(() => { router.replace('/login'); }, 500);
            } else {
                const errorMsg = data.errors ? Object.values(data.errors).flat().join('\n') : (data.message || 'Unknown error');
                window.alert('Error: ' + errorMsg);
            }
        } catch (error) {
            setLoading(false);
            window.alert('Server connection error.\n\nMake sure Laravel is running: php artisan serve');
        }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scrollContent}>

                {/* Header */}
                <View style={s.header}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Text style={s.backBtnText}></Text>
                    </TouchableOpacity>
                    <View style={s.logoBox}>
                        <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    </View>
                    <Text style={s.appName}>BricoLoc</Text>
                    <Text style={s.tagline}>Create your account</Text>
                </View>

                {/* Form Card */}
                <View style={s.formCard}>

                    {/* Role Selector */}
                    <Text style={s.sectionLabel}>I AM A</Text>
                    <View style={s.roleRow}>
                        <TouchableOpacity
                            style={[s.roleCard, role === 'client' && s.roleCardActive]}
                            onPress={() => setRole('client')}
                        >
                            <Text style={s.roleIcon}>👤</Text>
                            <Text style={[s.roleName, role === 'client' && s.roleNameActive]}>Client</Text>
                            <Text style={s.roleDesc}>I'm looking for a handyman</Text>
                            {role === 'client' && <View style={s.roleCheck}><Text style={s.roleCheckText}>✓</Text></View>}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.roleCard, role === 'bricoleur' && s.roleCardActiveBricoleur]}
                            onPress={() => setRole('bricoleur')}
                        >
                            <Text style={s.roleIcon}>🔧</Text>
                            <Text style={[s.roleName, role === 'bricoleur' && s.roleNameActiveBricoleur]}>Handyman</Text>
                            <Text style={s.roleDesc}>I offer my services</Text>
                            {role === 'bricoleur' && <View style={[s.roleCheck, s.roleCheckBricoleur]}><Text style={s.roleCheckText}>✓</Text></View>}
                        </TouchableOpacity>
                    </View>

                    <View style={s.divider} />

                    {/* Personal Information */}
                    <Text style={s.sectionLabel}>PERSONAL INFORMATION</Text>

                    <View style={s.row}>
                        <View style={s.half}>
                            <Text style={s.label}>First Name *</Text>
                            <TextInput style={s.input} placeholder="Jean" placeholderTextColor="#9CA3AF" value={firstName} onChangeText={setFirstName} />
                        </View>
                        <View style={s.half}>
                            <Text style={s.label}>Last Name *</Text>
                            <TextInput style={s.input} placeholder="Dupont" placeholderTextColor="#9CA3AF" value={lastName} onChangeText={setLastName} />
                        </View>
                    </View>

                    <Text style={s.label}>Email *</Text>
                    <TextInput style={s.input} placeholder="example@email.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

                    <Text style={s.label}>Phone *</Text>
                    <View style={s.inputRow}>
                        <Text style={s.prefix}>+237</Text>
                        <View style={s.vDivider} />
                        <TextInput style={s.inputFull} placeholder="6XX XXX XXX" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phone} onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, ''))} maxLength={9} />
                    </View>

                    <Text style={s.label}>City *</Text>
                    <View style={s.cityGrid}>
                        {cities.slice(0, 5).map(c => (
                            <TouchableOpacity key={c} style={[s.cityChip, city === c && s.cityChipActive]} onPress={() => setCity(c)}>
                                <Text style={[s.cityText, city === c && s.cityTextActive]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={s.divider} />

                    {/* Security */}
                    <Text style={s.sectionLabel}>SECURITY</Text>

                    <Text style={s.label}>Password *</Text>
                    <View style={s.inputRow}>
                        <TextInput style={s.inputFull} placeholder="Min. 6 characters" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            <Text style={s.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={s.label}>Confirm Password *</Text>
                    <View style={s.inputRow}>
                        <TextInput style={s.inputFull} placeholder="Repeat password" placeholderTextColor="#9CA3AF" secureTextEntry={!showConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                            <Text style={s.eyeIcon}>{showConfirmPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {confirmPassword.length > 0 && (
                        <View style={[s.matchBox, password === confirmPassword ? s.matchOk : s.matchBad]}>
                            <Text style={password === confirmPassword ? s.matchTextOk : s.matchTextBad}>
                                {password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                            </Text>
                        </View>
                    )}

                    {/* Submit */}
                    <TouchableOpacity
                        style={[s.submitBtn, (!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword) && s.submitBtnDisabled]}
                        onPress={handleRegister}
                        disabled={!firstName || !lastName || !email || !phone || !city || !password || !confirmPassword || loading}
                    >
                        {loading ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.submitBtnText}>Create Account</Text>}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={s.loginRow}>
                        <Text style={s.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.replace('/login')}>
                            <Text style={s.loginLink}>Sign in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F6' },
    scrollContent: { flexGrow: 1, paddingBottom: 40 },

    // Header
    header: { alignItems: 'center', paddingTop: 50, paddingBottom: 24, backgroundColor: '#0B3D3E', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    backBtn: { position: 'absolute', left: 16, top: 50 },
    backBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 15 },
    logoBox: { marginBottom: 10 },
    logoIcon: { width: 56, height: 56, backgroundColor: '#D9A441', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    logoIconText: { fontSize: 22, fontWeight: '700', color: '#0B3D3E' },
    appName: { fontSize: 24, fontWeight: '700', color: 'white' },
    tagline: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

    // Form Card
    formCard: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 16, padding: 22, marginTop: -12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },

    // Section
    sectionLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10, marginTop: 4 },

    // Role
    roleRow: { flexDirection: 'row', gap: 10, marginBottom: 6 },
    roleCard: { flex: 1, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 14, padding: 16, alignItems: 'center', position: 'relative' },
    roleCardActive: { borderColor: '#D9A441', backgroundColor: '#FDF3E0' },
    roleCardActiveBricoleur: { borderColor: '#0B3D3E', backgroundColor: '#E6F4F2' },
    roleIcon: { fontSize: 28, marginBottom: 6 },
    roleName: { fontSize: 14, fontWeight: '600', color: '#374151' },
    roleNameActive: { color: '#B8860B' },
    roleNameActiveBricoleur: { color: '#0B3D3E' },
    roleDesc: { fontSize: 10, color: '#9CA3AF', marginTop: 2, textAlign: 'center' },
    roleCheck: { position: 'absolute', top: 8, right: 8, width: 22, height: 22, backgroundColor: '#D9A441', borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
    roleCheckBricoleur: { backgroundColor: '#0B3D3E' },
    roleCheckText: { color: 'white', fontSize: 12, fontWeight: '700' },

    // Divider
    divider: { borderTopWidth: 1, borderColor: '#E5E7EB', marginVertical: 14 },

    // Labels & Inputs
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 12 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    inputFull: { flex: 1, fontSize: 14, color: '#111827' },
    prefix: { fontSize: 14, fontWeight: '600', color: '#111827' },
    vDivider: { width: 1, height: 18, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
    eyeIcon: { fontSize: 16, paddingLeft: 4 },

    // City
    cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    cityChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: 'white' },
    cityChipActive: { backgroundColor: '#0B3D3E', borderColor: '#0B3D3E' },
    cityText: { color: '#374151', fontSize: 12 },
    cityTextActive: { color: 'white' },

    // Password Match
    matchBox: { padding: 10, borderRadius: 8, marginTop: 8 },
    matchOk: { backgroundColor: '#E6F4F2' },
    matchBad: { backgroundColor: '#FEF2F2' },
    matchTextOk: { color: '#0F766E', fontSize: 12, fontWeight: '500' },
    matchTextBad: { color: '#991B1B', fontSize: 12, fontWeight: '500' },

    // Submit
    submitBtn: { backgroundColor: '#D9A441', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
    submitBtnDisabled: { backgroundColor: '#F5D98E' },
    submitBtnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 15 },

    // Login Link
    loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
    loginText: { color: '#6B7280', fontSize: 13 },
    loginLink: { color: '#D9A441', fontWeight: '700', fontSize: 13 },
});