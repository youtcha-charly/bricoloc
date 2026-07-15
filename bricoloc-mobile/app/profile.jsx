import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Alert, Image, StyleSheet, Modal, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('Male');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [city, setCity] = useState('Douala');

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Limbe', 'Kribi', 'Buea', 'Ebolowa'];
    const genders = ['Male', 'Female', 'Other'];

    const getToken = () => localStorage.getItem('auth_token');

    // Load user profile from API
    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:8000/api/v1/user', {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success || data.user) {
                const user = data.user || data;
                setFirstName(user.first_name || '');
                setLastName(user.last_name || '');
                setEmail(user.email || '');
                setPhone((user.phone_number || '').replace('+237', ''));
                setGender(user.gender || 'Male');
                setDateOfBirth(user.date_of_birth || '');
                setCity(user.city || 'Douala');
            }
        } catch (err) {
            console.log('Error loading profile:', err);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!firstName || !lastName || !email || !phone) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setSaving(true);
        try {
            const token = getToken();
            const response = await fetch('http://127.0.0.1:8000/api/v1/user/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email: email,
                    phone_number: '+237' + phone,
                    gender: gender,
                    date_of_birth: dateOfBirth,
                    city: city,
                }),
            });
            const data = await response.json();
            if (data.success) {
                // Update localStorage
                localStorage.setItem('user_data', JSON.stringify(data.user));
                setIsEditing(false);
                Alert.alert('✅ Profile Updated', 'Your information has been saved to the database.');
            } else {
                Alert.alert('Error', data.message || 'Could not update profile');
            }
        } catch (err) {
            Alert.alert('Error', 'Server connection error');
        }
        setSaving(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };

    if (loading) {
        return (
            <View style={[s.root, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#D9A441" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={s.root}>

            {/* ========== SIDEBAR ========== */}
            <View style={s.sidebar}>
                <View style={s.sidebarLogo}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.logoText}>BricoLoc</Text>
                </View>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/home')}>
                    <Text style={s.navIcon}>🏠</Text><Text style={s.navLabel}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/dashboard')}>
                    <Text style={s.navIcon}>📊</Text><Text style={s.navLabel}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/post-job')}>
                    <Text style={s.navIcon}>📝</Text><Text style={s.navLabel}>Post a Job</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem}>
                    <Text style={s.navIcon}>💬</Text><Text style={s.navLabel}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>👤</Text><Text style={[s.navLabel, s.navLabelActive]}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* ========== MAIN ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Text style={s.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Text style={s.editBtn}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={s.pageTitle}>My Profile</Text>
                    <Text style={s.pageSub}>Manage your personal information.</Text>

                    {/* Profile Picture Placeholder */}
                    <View style={s.imageSection}>
                        <View style={s.profilePlaceholder}>
                            <Text style={s.profileInitials}>{firstName?.charAt(0) || 'U'}{lastName?.charAt(0) || ''}</Text>
                        </View>
                        <Text style={s.imageLabel}>{firstName} {lastName}</Text>
                        <Text style={s.imageRole}>Client · {city}</Text>
                    </View>

                    {/* Personal Information */}
                    <View style={s.formCard}>
                        <Text style={s.sectionLabel}>PERSONAL INFORMATION</Text>

                        <View style={s.row}>
                            <View style={s.half}>
                                <Text style={s.label}>First Name *</Text>
                                <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={firstName} onChangeText={setFirstName} editable={isEditing} />
                            </View>
                            <View style={s.half}>
                                <Text style={s.label}>Last Name *</Text>
                                <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={lastName} onChangeText={setLastName} editable={isEditing} />
                            </View>
                        </View>

                        <Text style={s.label}>Email *</Text>
                        <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={email} onChangeText={setEmail} editable={isEditing} keyboardType="email-address" autoCapitalize="none" />

                        <Text style={s.label}>Phone *</Text>
                        <View style={s.inputRow}>
                            <Text style={s.prefix}>+237</Text>
                            <View style={s.vDivider} />
                            <TextInput style={[s.inputFull, !isEditing && s.inputDisabled]} value={phone} onChangeText={setPhone} editable={isEditing} keyboardType="phone-pad" maxLength={9} />
                        </View>

                        <Text style={s.label}>Gender</Text>
                        <TouchableOpacity style={s.selectBtn} onPress={() => isEditing && setShowGenderPicker(true)} disabled={!isEditing}>
                            <Text style={s.selectText}>{gender}</Text><Text style={s.selectArrow}>▼</Text>
                        </TouchableOpacity>

                        <Text style={s.label}>Date of Birth</Text>
                        <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={dateOfBirth} onChangeText={setDateOfBirth} editable={isEditing} placeholder="YYYY-MM-DD" />

                        <Text style={s.label}>City</Text>
                        <TouchableOpacity style={s.selectBtn} onPress={() => isEditing && setShowCityPicker(true)} disabled={!isEditing}>
                            <Text style={s.selectText}>📍 {city}</Text><Text style={s.selectArrow}>▼</Text>
                        </TouchableOpacity>

                        {isEditing && (
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.saveBtnText}>💾 Save Changes to Database</Text>}
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Account Info */}
                    <View style={s.formCard}>
                        <Text style={s.sectionLabel}>ACCOUNT INFORMATION</Text>
                        <View style={s.infoRow}><Text style={s.infoLabel}>Account Type</Text><Text style={s.infoValue}>Standard</Text></View>
                        <View style={s.divider} />
                        <View style={s.infoRow}><Text style={s.infoLabel}>Role</Text><Text style={s.infoValue}>👤 Client</Text></View>
                        <View style={s.divider} />
                        <View style={s.infoRow}><Text style={s.infoLabel}>Country</Text><Text style={s.infoValue}>🇨🇲 Cameroon</Text></View>
                    </View>

                    {/* Go to Dashboard */}
                    <TouchableOpacity style={s.dashboardBtn} onPress={() => router.push('/dashboard')}>
                        <Text style={s.dashboardBtnText}>📊 Go to Dashboard</Text>
                    </TouchableOpacity>

                    {/* Logout */}
                    <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                        <Text style={s.logoutText}>🚪 Sign Out</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>

            {/* Gender Modal */}
            <Modal visible={showGenderPicker} transparent animationType="slide">
                <View style={s.modalOverlay}><View style={s.modalContent}>
                    <Text style={s.modalTitle}>Select Gender</Text>
                    {genders.map(g => (
                        <TouchableOpacity key={g} style={[s.modalOption, gender === g && s.modalOptionActive]} onPress={() => { setGender(g); setShowGenderPicker(false); }}>
                            <Text style={[s.modalOptionText, gender === g && s.modalOptionTextActive]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={s.modalCancel} onPress={() => setShowGenderPicker(false)}><Text style={s.modalCancelText}>Cancel</Text></TouchableOpacity>
                </View></View>
            </Modal>

            {/* City Modal */}
            <Modal visible={showCityPicker} transparent animationType="slide">
                <View style={s.modalOverlay}><View style={s.modalContent}>
                    <Text style={s.modalTitle}>Select City</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {cities.map(c => (
                            <TouchableOpacity key={c} style={[s.modalOption, city === c && s.modalOptionActive]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                                <Text style={[s.modalOptionText, city === c && s.modalOptionTextActive]}>📍 {c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={s.modalCancel} onPress={() => setShowCityPicker(false)}><Text style={s.modalCancelText}>Cancel</Text></TouchableOpacity>
                </View></View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },

    // Sidebar
    sidebar: { width: 220, backgroundColor: '#072E2F', paddingVertical: 24, paddingHorizontal: 14 },
    sidebarLogo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28, paddingHorizontal: 4 },
    logoIcon: { width: 32, height: 32, backgroundColor: '#D9A441', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    logoIconText: { fontSize: 15, fontWeight: '700', color: '#0B3D3E' },
    logoText: { fontSize: 17, fontWeight: '700', color: 'white' },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 10, borderRadius: 8, marginBottom: 2, gap: 10 },
    navActive: { backgroundColor: 'rgba(217,164,65,0.15)' },
    navIcon: { fontSize: 15, width: 20, textAlign: 'center' },
    navLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, flex: 1 },
    navLabelActive: { color: '#D9A441', fontWeight: '500' },

    // Main
    main: { flex: 1, paddingHorizontal: 28, paddingTop: 20 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
    editBtn: { color: '#D9A441', fontSize: 14, fontWeight: '600' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
    pageSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 },

    // Profile Image
    imageSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'white', borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    profilePlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#0B3D3E', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    profileInitials: { color: 'white', fontSize: 28, fontWeight: 'bold' },
    imageLabel: { fontSize: 16, fontWeight: '600', color: '#1A1A1A' },
    imageRole: { fontSize: 12, color: '#6B7280', marginTop: 2 },

    // Form Card
    formCard: { backgroundColor: 'white', borderRadius: 14, padding: 20, marginBottom: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    sectionLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 12 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
    inputDisabled: { backgroundColor: '#F3F4F6', color: '#6B7280' },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    inputFull: { flex: 1, fontSize: 14, color: '#111827' },
    prefix: { fontSize: 13, fontWeight: '600', color: '#111827' },
    vDivider: { width: 1, height: 16, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
    selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11 },
    selectText: { fontSize: 14, color: '#111827' },
    selectArrow: { fontSize: 10, color: '#9CA3AF' },
    saveBtn: { backgroundColor: '#D9A441', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 18 },
    saveBtnText: { color: '#0B3D3E', fontWeight: '600', fontSize: 14 },

    // Account Info
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
    infoLabel: { color: '#6B7280', fontSize: 13 },
    infoValue: { color: '#111827', fontWeight: '500', fontSize: 13 },
    divider: { height: 1, backgroundColor: '#E5E7EB' },

    // Buttons
    dashboardBtn: { backgroundColor: '#0B3D3E', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 10 },
    dashboardBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
    logoutBtn: { backgroundColor: 'white', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },

    // Modals
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
    modalOption: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
    modalOptionActive: { backgroundColor: '#FDF3E0' },
    modalOptionText: { fontSize: 15, color: '#374151' },
    modalOptionTextActive: { color: '#B8860B', fontWeight: '600' },
    modalCancel: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
    modalCancelText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
});