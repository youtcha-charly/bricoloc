import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);
    const [statusType, setStatusType] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const router = useRouter();
    const { t, language, changeLanguage } = useLanguage();
    const { user, login, loading: authLoading } = useAuth();

    useFocusEffect(
        useCallback(() => {
            setEmail('');
            setPassword('');
            setStatusMsg(null);
            setStatusType(null);
            setLoading(false);
            setFormKey(k => k + 1);
        }, [])
    );

    useEffect(() => {
        if (authLoading || !user) return;
        if (user.role === 'bricoleur') router.replace('/(bricoleur)/home');
        else if (user.role === 'admin') router.replace('/(admin)/dashboard');
        else router.replace('/home');
    }, [user, authLoading]);

    const handleLogin = async () => {
        if (!email || !password) {
            setStatusType('error');
            setStatusMsg('Please fill in all fields');
            return;
        }

        setStatusType('info');
        setStatusMsg('Checking credentials...');
        setLoading(true);

        try {
            const result = await login(email, password);
            setLoading(false);

            if (result.success) {
                setStatusType('success');
                setStatusMsg('Login successful! Redirecting to your dashboard...');
                setEmail('');
                setPassword('');
                setTimeout(() => {
                    const role = result.user?.role;
                    if (role === 'bricoleur') router.replace('/(bricoleur)/home');
                    else if (role === 'admin') router.replace('/(admin)/dashboard');
                    else router.replace('/home');
                }, 1200);
            } else {
                setStatusType('error');
                setStatusMsg(result.message || 'Invalid credentials');
            }
        } catch (error) {
            setLoading(false);
            setStatusType('error');
            setStatusMsg(error?.response?.data?.message || 'Server connection error. Make sure the server is running.');
        }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
                <View style={s.inner}>

                    {/* Logo */}
                    <View style={s.logoContainer}>
                        <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                        <Text style={s.appName}>BricoLoc</Text>
                        <Text style={s.tagline}>{t('splash.tagline')}</Text>
                    </View>

                    {/* Language Switcher */}
                    <View style={s.langSwitcher}>
                        <TouchableOpacity onPress={() => changeLanguage('en')} style={[s.langBtn, language === 'en' && s.langBtnActive]}>
                            <Text style={[s.langText, language === 'en' && s.langTextActive]}>EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => changeLanguage('fr')} style={[s.langBtn, language === 'fr' && s.langBtnActive]}>
                            <Text style={[s.langText, language === 'fr' && s.langTextActive]}>FR</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Welcome */}
                    <Text style={s.welcome}>{t('auth.welcomeBack')}</Text>
                    <Text style={s.subtitle}>{t('auth.signInToAccount')}</Text>

                    {/* Status Message */}
                    {statusMsg && (
                        <View style={[
                            s.statusBanner,
                            statusType === 'success' && s.statusSuccess,
                            statusType === 'error' && s.statusError,
                            statusType === 'info' && s.statusInfo,
                        ]}>
                            <Text style={[
                                s.statusText,
                                statusType === 'success' && s.statusTextSuccess,
                                statusType === 'error' && s.statusTextError,
                                statusType === 'info' && s.statusTextInfo,
                            ]}>
                                {statusType === 'success' ? '✓ ' : statusType === 'error' ? '✗ ' : '● '}
                                {statusMsg}
                            </Text>
                        </View>
                    )}

                    {/* Email */}
                    <Text style={s.label}>{t('auth.email')}</Text>
                    <TextInput key={`email-${formKey}`} style={s.input} placeholder="example@email.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" autoComplete="off" textContentType="none" value={email} onChangeText={setEmail} />

                    {/* Password */}
                    <Text style={s.label}>{t('auth.password')}</Text>
                    <View style={s.inputRow}>
                        <TextInput key={`password-${formKey}`} style={s.inputFull} placeholder="••••••••" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} autoComplete="off" textContentType="none" value={password} onChangeText={setPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                            <Text style={s.eye}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    <TouchableOpacity style={s.forgotBtn} onPress={() => router.push('/forgot-password')}>
                        <Text style={s.forgotText}>{t('auth.forgotPassword')}</Text>
                    </TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity style={[s.btn, (!email || !password || loading) && s.btnDisabled]} onPress={handleLogin} disabled={!email || !password || loading}>
                        {loading ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.btnText}>{t('auth.login')}</Text>}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={s.dividerRow}>
                        <View style={s.line} /><Text style={s.or}>{t('common.or')}</Text><View style={s.line} />
                    </View>

                    {/* Register Link */}
                    <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/register')}>
                        <Text style={s.registerText}>
                            {t('auth.noAccount')}{' '}
                            <Text style={s.registerLink}>{t('auth.register')}</Text>
                        </Text>
                    </TouchableOpacity>

                    <View style={{ height: 30 }} />

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F6' },
    scrollContent: { flexGrow: 1, justifyContent: 'center' },
    inner: { paddingHorizontal: 28, maxWidth: 440, alignSelf: 'center', width: '100%', paddingVertical: 40 },

    logoContainer: { alignItems: 'center', marginBottom: 14 },
    logoIcon: { width: 64, height: 64, backgroundColor: '#D9A441', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    logoIconText: { fontSize: 28, fontWeight: '700', color: '#0B3D3E' },
    appName: { fontSize: 26, fontWeight: '700', color: '#1A1A1A' },
    tagline: { color: '#6B7280', marginTop: 4, fontSize: 13 },

    langSwitcher: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 8 },
    langBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, borderWidth: 1.5, borderColor: '#E5E7EB' },
    langBtnActive: { backgroundColor: '#0B3D3E', borderColor: '#0B3D3E' },
    langText: { fontWeight: '600', fontSize: 12 },
    langTextActive: { color: 'white' },

    welcome: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 2 },
    subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 18 },

    // Status banner
    statusBanner: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, marginBottom: 14 },
    statusSuccess: { backgroundColor: '#D1FAE5' },
    statusError: { backgroundColor: '#FEE2E2' },
    statusInfo: { backgroundColor: '#DBEAFE' },
    statusText: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
    statusTextSuccess: { color: '#065F46' },
    statusTextError: { color: '#991B1B' },
    statusTextInfo: { color: '#1E40AF' },

    label: { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
    input: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14 },
    inputFull: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#111827' },
    eyeBtn: { paddingLeft: 8 },
    eye: { fontSize: 18 },

    forgotBtn: { alignSelf: 'flex-end', marginTop: 6, marginBottom: 18 },
    forgotText: { color: '#D9A441', fontWeight: '500', fontSize: 13 },

    btn: { backgroundColor: '#D9A441', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
    btnDisabled: { backgroundColor: '#F5D98E' },
    btnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 15 },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    or: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 12, textTransform: 'uppercase' },

    registerBtn: {
        backgroundColor: '#0B3D3E',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 4,
    },
    registerText: { color: 'white', fontSize: 14, fontWeight: '500' },
    registerLink: { color: '#D9A441', fontWeight: '700', fontSize: 14, textDecorationLine: 'underline' },
});
