import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { authAPI } from '../src/services/api';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSendResetLink = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authAPI.forgotPassword(email);
            const data = res.data;
            setLoading(false);

            if (data.success) {
                setSent(true);
            } else {
                setError(data.message || 'Error sending reset link');
            }
        } catch (error) {
            setLoading(false);
            setError('Server connection error');
        }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.inner}>

                {/* Logo */}
                <View style={s.logoContainer}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.appName}>BricoLoc</Text>
                </View>

                {!sent ? (
                    <>
                        <Text style={s.title}>Forgot Password?</Text>
                        <Text style={s.subtitle}>Enter your email and we'll send you a reset link.</Text>

                        {error ? (
                            <View style={s.errorBanner}>
                                <Text style={s.errorText}>❌ {error}</Text>
                            </View>
                        ) : null}

                        <Text style={s.label}>Email</Text>
                        <TextInput
                            style={s.input}
                            placeholder="example@email.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                        />

                        <TouchableOpacity style={[s.btn, !email && s.btnDisabled]} onPress={handleSendResetLink} disabled={!email || loading}>
                            {loading ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.btnText}>Send Reset Link</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={s.successIcon}>✅</Text>
                        <Text style={s.title}>Email Sent!</Text>
                        <Text style={s.subtitle}>If an account exists for {email}, you will receive a password reset link shortly.</Text>
                        <Text style={s.hint}>Check your spam folder if you don't see it.</Text>
                    </>
                )}

                <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/login')}>
                    <Text style={s.backText}>← Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F6' },
    inner: { flex: 1, paddingHorizontal: 28, justifyContent: 'center', maxWidth: 440, alignSelf: 'center', width: '100%' },
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    logoIcon: { width: 64, height: 64, backgroundColor: '#D9A441', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    logoIconText: { fontSize: 28, fontWeight: '700', color: '#0B3D3E' },
    appName: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
    title: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 6, textAlign: 'center' },
    subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 24, textAlign: 'center', lineHeight: 20 },
    successIcon: { fontSize: 48, textAlign: 'center', marginBottom: 16 },
    hint: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
    errorBanner: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, padding: 12, marginBottom: 16 },
    errorText: { color: '#991B1B', fontSize: 13, textAlign: 'center' },
    label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827', marginBottom: 20 },
    btn: { backgroundColor: '#D9A441', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#F5D98E' },
    btnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 15 },
    backBtn: { alignItems: 'center', marginTop: 24 },
    backText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
});
