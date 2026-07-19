import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { authAPI } from '../src/services/api';

export default function ResetPassword() {
    const { token, email } = useLocalSearchParams();
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await authAPI.resetPassword({
                token,
                email,
                password,
                password_confirmation: confirmPassword,
            });
            const data = res.data;
            setLoading(false);

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || 'Error resetting password');
            }
        } catch (error) {
            setLoading(false);
            setError(error?.response?.data?.message || 'Server connection error');
        }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.inner}>

                <View style={s.logoContainer}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.appName}>BricoLoc</Text>
                </View>

                {!success ? (
                    <>
                        <Text style={s.title}>Reset Password</Text>
                        <Text style={s.subtitle}>Enter your new password below.</Text>

                        {error ? (
                            <View style={s.errorBanner}>
                                <Text style={s.errorText}>❌ {error}</Text>
                            </View>
                        ) : null}

                        <Text style={s.label}>New Password</Text>
                        <View style={s.inputRow}>
                            <TextInput style={s.inputFull} placeholder="••••••••" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                                <Text style={s.eye}>{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={s.label}>Confirm Password</Text>
                        <View style={s.inputRow}>
                            <TextInput style={s.inputFull} placeholder="••••••••" placeholderTextColor="#9CA3AF" secureTextEntry={!showConfirm} value={confirmPassword} onChangeText={setConfirmPassword} />
                            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={s.eyeBtn}>
                                <Text style={s.eye}>{showConfirm ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>

                        {confirmPassword.length > 0 && (
                            <View style={[s.matchBox, password === confirmPassword ? s.matchOk : s.matchBad]}>
                                <Text style={password === confirmPassword ? s.matchTextOk : s.matchTextBad}>
                                    {password === confirmPassword ? '✅ Passwords match' : '❌ Passwords do not match'}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity style={[s.btn, (!password || !confirmPassword) && s.btnDisabled]} onPress={handleReset} disabled={!password || !confirmPassword || loading}>
                            {loading ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.btnText}>Reset Password</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={s.successIcon}>✅</Text>
                        <Text style={s.title}>Password Reset Successful!</Text>
                        <Text style={s.subtitle}>Your password has been changed. You can now sign in with your new password.</Text>
                        <TouchableOpacity style={s.btn} onPress={() => router.replace('/login')}>
                            <Text style={s.btnText}>Sign In</Text>
                        </TouchableOpacity>
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
    errorBanner: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 8, padding: 12, marginBottom: 16 },
    errorText: { color: '#991B1B', fontSize: 13, textAlign: 'center' },
    label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14, textTransform: 'uppercase', letterSpacing: 0.5 },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14 },
    inputFull: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
    eyeBtn: { paddingLeft: 8 },
    eye: { fontSize: 18 },
    matchBox: { padding: 10, borderRadius: 8, marginTop: 10 },
    matchOk: { backgroundColor: '#ECFDF5' },
    matchBad: { backgroundColor: '#FEF2F2' },
    matchTextOk: { color: '#059669', fontSize: 13, fontWeight: '500' },
    matchTextBad: { color: '#DC2626', fontSize: 13, fontWeight: '500' },
    btn: { backgroundColor: '#D9A441', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
    btnDisabled: { backgroundColor: '#F5D98E' },
    btnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 15 },
    backBtn: { alignItems: 'center', marginTop: 24 },
    backText: { color: '#6B7280', fontSize: 14, fontWeight: '500' },
});
