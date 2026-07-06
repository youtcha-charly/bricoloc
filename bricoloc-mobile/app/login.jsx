import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedRole, setSelectedRole] = useState('client');
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            window.alert('Veuillez remplir tous les champs');
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

                window.alert('✅ Connexion reussie !\n\nBienvenue ' + data.user.name + ' !');

                // Redirect based on role
                if (data.user.role === 'bricoleur') {
                    router.replace('/(bricoleur)/home');
                } else if (data.user.role === 'admin') {
                    router.replace('/(admin)/dashboard');
                } else {
                    router.replace('/home');
                }
            } else {
                window.alert('Erreur : ' + (data.message || 'Email ou mot de passe incorrect'));
            }
        } catch (error) {
            setLoading(false);
            window.alert('Erreur de connexion au serveur.\nVerifiez que Laravel est lance.');
        }
    };

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={styles.inner}>
                <View style={styles.logoContainer}>
                    <View style={styles.logo}><Text style={styles.logoText}>BL</Text></View>
                    <Text style={styles.appName}>BricoLoc</Text>
                    <Text style={styles.tagline}>Trouve un bricoleur pres de chez toi</Text>
                </View>

                <Text style={styles.welcome}>Content de vous revoir !</Text>

                <View style={styles.roleTabs}>
                    <TouchableOpacity style={[styles.roleTab, selectedRole === 'client' && styles.roleTabActive]} onPress={() => setSelectedRole('client')}>
                        <Text style={[styles.roleTabText, selectedRole === 'client' && styles.roleTabTextActive]}>👤 Client</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.roleTab, selectedRole === 'bricoleur' && styles.roleTabActiveBricoleur]} onPress={() => setSelectedRole('bricoleur')}>
                        <Text style={[styles.roleTabText, selectedRole === 'bricoleur' && styles.roleTabTextActive]}>🔧 Bricoleur</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>Email</Text>
                <View style={styles.inputRow}>
                    <Text style={styles.icon}>📧</Text>
                    <TextInput style={styles.input} placeholder="exemple@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
                </View>

                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.inputRow}>
                    <Text style={styles.icon}>🔒</Text>
                    <TextInput style={styles.input} placeholder="Votre mot de passe" secureTextEntry={!showPassword} value={password} onChangeText={setPassword} />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Text style={styles.eye}>{showPassword ? '🙈' : '👁️'}</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.btn, (!email || !password) && styles.btnDisabled]} onPress={handleLogin} disabled={!email || !password || loading}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Se connecter</Text>}
                </TouchableOpacity>

                <View style={styles.dividerRow}><View style={styles.line} /><Text style={styles.or}>ou</Text><View style={styles.line} /></View>

                <TouchableOpacity style={styles.registerBtn} onPress={() => router.push('/register')}>
                    <Text style={styles.registerText}>Pas encore de compte ? <Text style={styles.registerLink}>S'inscrire</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: 'white' },
    inner: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
    logoContainer: { alignItems: 'center', marginBottom: 30 },
    logo: { width: 70, height: 70, backgroundColor: '#2563EB', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    logoText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    appName: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
    tagline: { color: '#6B7280', marginTop: 6, fontSize: 13 },
    welcome: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 20 },
    roleTabs: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 20 },
    roleTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
    roleTabActive: { backgroundColor: '#2563EB' },
    roleTabActiveBricoleur: { backgroundColor: '#059669' },
    roleTabText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
    roleTabTextActive: { color: 'white' },
    label: { color: '#374151', fontWeight: '600', marginBottom: 6, marginTop: 12, fontSize: 13 },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB' },
    icon: { fontSize: 15, marginRight: 8 },
    input: { flex: 1, fontSize: 14, color: '#111827' },
    eye: { fontSize: 18, paddingLeft: 6 },
    btn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    btnDisabled: { backgroundColor: '#93C5FD' },
    btnText: { color: 'white', fontWeight: '600', fontSize: 16 },
    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
    line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
    or: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 12 },
    registerBtn: { alignItems: 'center' },
    registerText: { color: '#6B7280', fontSize: 13 },
    registerLink: { color: '#2563EB', fontWeight: '700', fontSize: 13, textDecorationLine: 'underline' },
});