import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLanguage } from '../src/i18n/LanguageContext';
import { useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('client');
    const router = useRouter();
    const { t, language, changeLanguage } = useLanguage();

    const handleLogin = async () => {
        if (!email || !password) {
            window.alert('Please fill in all fields');
            return;
        }
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            setLoading(false);
            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_data', JSON.stringify(data.user));
                window.alert('Welcome ' + data.user.name + ' !');
                if (data.user.role === 'bricoleur') router.replace('/(bricoleur)/home');
                else if (data.user.role === 'admin') router.replace('/(admin)/dashboard');
                else router.replace('/home');
            } else {
                window.alert(data.message || 'Error');
            }
        } catch (error) {
            setLoading(false);
            window.alert('Server connection error');
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
                            <Text style={[s.langText, language === 'en' && s.langTextActive]}>🇬🇧 EN</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => changeLanguage('fr')} style={[s.langBtn, language === 'fr' && s.langBtnActive]}>
                            <Text style={[s.langText, language === 'fr' && s.langTextActive]}>🇫🇷 FR</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Welcome */}
                    <Text style={s.welcome}>{t('auth.welcomeBack')}</Text>
                    <Text style={s.subtitle}>{t('auth.signInToAccount')}</Text>

                    {/* Role Tabs */}
                    <View style={s.roleTabs}>
                        <TouchableOpacity style={[s.roleTab, selectedRole === 'client' && s.roleTabActive]} onPress={() => setSelectedRole('client')}>
                            <Text style={[s.roleTabText, selectedRole === 'client' && s.roleTabTextActive]}>👤 {t('auth.client')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[s.roleTab, selectedRole === 'bricoleur' && s.roleTabActiveBricoleur]} onPress={() => setSelectedRole('bricoleur')}>
                            <Text style={[s.roleTabText, selectedRole === 'bricoleur' && s.roleTabTextActive]}>🔧 {t('auth.handyman')}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Email */}
                    <Text style={s.label}>{t('auth.email')}</Text>
                    <TextInput style={s.input} placeholder="example@email.com" placeholderTextColor="#9CA3AF" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />

                    {/* Password */}
                    <Text style={s.label}>{t('auth.password')}</Text>
                    <View style={s.inputRow}>
                        <TextInput style={s.inputFull} placeholder="••••••••" placeholderTextColor="#9CA3AF" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={s.eyeBtn}>
                            <Text style={s.eye}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password */}
                    {/* Forgot Password */}
<TouchableOpacity style={s.forgotBtn}>
    <Text style={s.forgotText}>{t('auth.forgotPassword')}</Text>
</TouchableOpacity>

                    {/* Login Button */}
                    <TouchableOpacity style={[s.btn, (!email || !password) && s.btnDisabled]} onPress={handleLogin} disabled={!email || !password || loading}>
                        {loading ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.btnText}>{t('auth.login')}</Text>}
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={s.dividerRow}>
                        <View style={s.line} /><Text style={s.or}>{t('common.or')}</Text><View style={s.line} />
                    </View>

                    {/* Register Link — NOW VERY VISIBLE */}
                    <TouchableOpacity style={s.registerBtn} onPress={() => router.push('/register')}>
                        <Text style={s.registerText}>
                            {t('auth.noAccount')}{' '}
                            <Text style={s.registerLink}>{t('auth.register')}</Text>
                        </Text>
                    </TouchableOpacity>
                    

                    {/* Extra spacing so it's not hidden */}
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

    roleTabs: { flexDirection: 'row', backgroundColor: '#E5E7EB', borderRadius: 10, padding: 3, marginBottom: 18 },
    roleTab: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    roleTabActive: { backgroundColor: '#D9A441' },
    roleTabActiveBricoleur: { backgroundColor: '#0B3D3E' },
    roleTabText: { color: '#6B7280', fontWeight: '600', fontSize: 13 },
    roleTabTextActive: { color: '#0B3D3E' },

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

    // Register — BIG AND VISIBLE
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