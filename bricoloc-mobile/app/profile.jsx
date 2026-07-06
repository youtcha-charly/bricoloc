import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
    StyleSheet,
    Modal,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
    const router = useRouter();
    const { user, logout } = useAuth();

    // Profile state
    const [profileImage, setProfileImage] = useState(null);
    const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || 'Jean');
    const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || 'Dupont');
    const [email, setEmail] = useState(user?.email || 'jean.dupont@email.com');
    const [phone, setPhone] = useState(user?.phone || '699887766');
    const [gender, setGender] = useState('Homme');
    const [dateOfBirth, setDateOfBirth] = useState('1990-05-15');
    const [city, setCity] = useState(user?.city || 'Douala');
    const [isEditing, setIsEditing] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Account info (read-only)
    const accountInfo = {
        type: 'Standard',
        role: 'Client',
        country: 'Cameroun',
        memberSince: 'Janvier 2026',
        jobsPosted: 6,
        jobsCompleted: 3,
        rating: 4.8,
    };

    const cities = [
        'Douala', 'Yaounde', 'Bafoussam', 'Bamenda',
        'Garoua', 'Maroua', 'Limbe', 'Kribi', 'Buéa', 'Ebolowa',
    ];

    const genders = ['Homme', 'Femme', 'Autre'];

    // Pick profile image
    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Take photo
    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    // Save profile
    const handleSave = () => {
        if (!firstName || !lastName || !email || !phone) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
            return;
        }
        setIsEditing(false);
        Alert.alert('✅ Profil mis a jour', 'Vos informations ont ete enregistrees avec succes.');
    };

    // Logout
    const handleLogout = () => {
        Alert.alert(
            'Deconnexion',
            'Etes-vous sur de vouloir vous deconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Deconnexion', style: 'destructive', onPress: async () => { await logout(); router.replace('/login'); } },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={styles.backBtn}>← Retour</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <Text style={styles.editBtn}>{isEditing ? 'Annuler' : 'Modifier'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* ============ PROFILE PICTURE SECTION ============ */}
                <View style={styles.profileImageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profilePlaceholder}>
                                <Text style={styles.profileInitials}>
                                    {firstName?.charAt(0) || 'U'}{lastName?.charAt(0) || ''}
                                </Text>
                            </View>
                        )}
                        <View style={styles.cameraBadge}>
                            <Text style={styles.cameraIcon}>📷</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <View style={styles.photoButtons}>
                        <TouchableOpacity style={styles.photoBtn} onPress={pickImage}>
                            <Text style={styles.photoBtnText}>🖼️ Galerie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.photoBtn} onPress={takePhoto}>
                            <Text style={styles.photoBtnText}>📸 Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ============ PERSONAL INFORMATION ============ */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>👤</Text>
                        <Text style={styles.sectionTitle}>Informations personnelles</Text>
                    </View>

                    {/* First Name & Last Name */}
                    <View style={styles.row}>
                        <View style={styles.half}>
                            <Text style={styles.label}>Prenom *</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={firstName}
                                onChangeText={setFirstName}
                                editable={isEditing}
                                placeholder="Votre prenom"
                            />
                        </View>
                        <View style={styles.half}>
                            <Text style={styles.label}>Nom *</Text>
                            <TextInput
                                style={[styles.input, !isEditing && styles.inputDisabled]}
                                value={lastName}
                                onChangeText={setLastName}
                                editable={isEditing}
                                placeholder="Votre nom"
                            />
                        </View>
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email *</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputIcon}>📧</Text>
                        <TextInput
                            style={[styles.inputFull, !isEditing && styles.inputDisabled]}
                            value={email}
                            onChangeText={setEmail}
                            editable={isEditing}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    {/* Phone */}
                    <Text style={styles.label}>Telephone *</Text>
                    <View style={styles.inputRow}>
                        <Text style={styles.prefix}>+237</Text>
                        <View style={styles.vDivider} />
                        <TextInput
                            style={[styles.inputFull, !isEditing && styles.inputDisabled]}
                            value={phone}
                            onChangeText={setPhone}
                            editable={isEditing}
                            keyboardType="phone-pad"
                            maxLength={9}
                        />
                    </View>

                    {/* Gender */}
                    <Text style={styles.label}>Genre</Text>
                    <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() => isEditing && setShowGenderPicker(true)}
                        disabled={!isEditing}
                    >
                        <Text style={styles.selectText}>{gender}</Text>
                        <Text style={styles.selectArrow}>▼</Text>
                    </TouchableOpacity>

                    {/* Date of Birth */}
                    <Text style={styles.label}>Date de naissance</Text>
                    <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() => isEditing && setShowDatePicker(true)}
                        disabled={!isEditing}
                    >
                        <Text style={styles.selectText}>📅 {dateOfBirth}</Text>
                        {isEditing && <Text style={styles.selectArrow}>▼</Text>}
                    </TouchableOpacity>

                    {/* City */}
                    <Text style={styles.label}>Ville</Text>
                    <TouchableOpacity
                        style={styles.selectBtn}
                        onPress={() => isEditing && setShowCityPicker(true)}
                        disabled={!isEditing}
                    >
                        <Text style={styles.selectText}>📍 {city}</Text>
                        {isEditing && <Text style={styles.selectArrow}>▼</Text>}
                    </TouchableOpacity>

                    {/* Save Button */}
                    {isEditing && (
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                            <Text style={styles.saveBtnText}>💾 Enregistrer les modifications</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* ============ ACCOUNT INFORMATION ============ */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionIcon}>🔐</Text>
                        <Text style={styles.sectionTitle}>Informations du compte</Text>
                    </View>

                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Type de compte</Text>
                            <View style={styles.infoValueBadge}>
                                <Text style={styles.infoValueText}>{accountInfo.type}</Text>
                            </View>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Role actif</Text>
                            <View style={[styles.infoValueBadge, styles.roleBadge]}>
                                <Text style={[styles.infoValueText, styles.roleText]}>
                                    👤 {accountInfo.role}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Pays</Text>
                            <Text style={styles.infoValue}>🇨🇲 {accountInfo.country}</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Membre depuis</Text>
                            <Text style={styles.infoValue}>{accountInfo.memberSince}</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Annonces publiees</Text>
                            <Text style={styles.infoValue}>{accountInfo.jobsPosted}</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Travaux termines</Text>
                            <Text style={styles.infoValue}>{accountInfo.jobsCompleted}</Text>
                        </View>
                        <View style={styles.divider} />

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Note moyenne</Text>
                            <Text style={styles.infoValue}>
                                {'⭐'.repeat(Math.floor(accountInfo.rating))} {accountInfo.rating}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>🚪 Se deconnecter</Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* ============ GENDER PICKER MODAL ============ */}
            <Modal visible={showGenderPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selectionner le genre</Text>
                        {genders.map(g => (
                            <TouchableOpacity
                                key={g}
                                style={[styles.modalOption, gender === g && styles.modalOptionActive]}
                                onPress={() => { setGender(g); setShowGenderPicker(false); }}
                            >
                                <Text style={[styles.modalOptionText, gender === g && styles.modalOptionTextActive]}>
                                    {g}
                                </Text>
                                {gender === g && <Text style={styles.checkmark}>✓</Text>}
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowGenderPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ============ CITY PICKER MODAL ============ */}
            <Modal visible={showCityPicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selectionner la ville</Text>
                        <ScrollView style={styles.modalScroll}>
                            {cities.map(c => (
                                <TouchableOpacity
                                    key={c}
                                    style={[styles.modalOption, city === c && styles.modalOptionActive]}
                                    onPress={() => { setCity(c); setShowCityPicker(false); }}
                                >
                                    <Text style={[styles.modalOptionText, city === c && styles.modalOptionTextActive]}>
                                        📍 {c}
                                    </Text>
                                    {city === c && <Text style={styles.checkmark}>✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.modalCancel}
                            onPress={() => setShowCityPicker(false)}
                        >
                            <Text style={styles.modalCancelText}>Annuler</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ============ DATE PICKER MODAL (Simplified) ============ */}
            <Modal visible={showDatePicker} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Date de naissance</Text>
                        <TextInput
                            style={styles.dateInput}
                            value={dateOfBirth}
                            onChangeText={setDateOfBirth}
                            placeholder="AAAA-MM-JJ"
                            keyboardType="numbers-and-punctuation"
                        />
                        <Text style={styles.dateHint}>Format: AAAA-MM-JJ (ex: 1990-05-15)</Text>
                        <TouchableOpacity
                            style={styles.modalConfirm}
                            onPress={() => setShowDatePicker(false)}
                        >
                            <Text style={styles.modalConfirmText}>Confirmer</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },

    // Header
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#2563EB', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16,
    },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    editBtn: { color: 'white', fontSize: 15, fontWeight: '600' },

    content: { flex: 1 },

    // Profile Image
    profileImageSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: 'white', marginBottom: 10 },
    imageContainer: { position: 'relative', marginBottom: 14 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#2563EB' },
    profilePlaceholder: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: '#2563EB',
        justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#2563EB',
    },
    profileInitials: { color: 'white', fontSize: 36, fontWeight: 'bold' },
    cameraBadge: {
        position: 'absolute', bottom: 0, right: 0,
        backgroundColor: '#059669', width: 32, height: 32,
        borderRadius: 16, justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: 'white',
    },
    cameraIcon: { fontSize: 14 },
    photoButtons: { flexDirection: 'row', gap: 10 },
    photoBtn: {
        backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 8, borderWidth: 1, borderColor: '#BFDBFE',
    },
    photoBtnText: { color: '#2563EB', fontWeight: '500', fontSize: 13 },

    // Sections
    section: { backgroundColor: 'white', marginBottom: 10, paddingHorizontal: 16, paddingVertical: 18 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    sectionIcon: { fontSize: 20, marginRight: 10 },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },

    // Labels & Inputs
    label: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 14, marginBottom: 6 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    input: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
        backgroundColor: '#F9FAFB', color: '#111827',
    },
    inputDisabled: { backgroundColor: '#F3F4F6', color: '#6B7280' },
    inputRow: {
        flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#F9FAFB',
    },
    inputIcon: { fontSize: 15, marginRight: 8 },
    inputFull: { flex: 1, fontSize: 15, color: '#111827' },
    prefix: { fontSize: 14, fontWeight: '600', color: '#111827' },
    vDivider: { width: 1, height: 18, backgroundColor: '#D1D5DB', marginHorizontal: 8 },

    // Select buttons
    selectBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 12, backgroundColor: '#F9FAFB',
    },
    selectText: { fontSize: 15, color: '#111827' },
    selectArrow: { fontSize: 12, color: '#9CA3AF' },

    // Save
    saveBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: 'white', fontWeight: '600', fontSize: 16 },

    // Account Info
    infoCard: { backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    infoLabel: { color: '#6B7280', fontSize: 14 },
    infoValue: { color: '#111827', fontWeight: '500', fontSize: 14 },
    infoValueBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
    infoValueText: { color: '#2563EB', fontWeight: '600', fontSize: 13 },
    roleBadge: { backgroundColor: '#F0FDF4' },
    roleText: { color: '#059669' },
    divider: { height: 1, backgroundColor: '#E5E7EB' },

    // Logout
    logoutBtn: {
        backgroundColor: 'white', marginHorizontal: 16, marginTop: 16,
        borderRadius: 14, paddingVertical: 16, alignItems: 'center',
        borderWidth: 1, borderColor: '#FECACA',
    },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 16 },

    // Modals
    modalOverlay: {
        flex: 1, justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '60%',
    },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 16 },
    modalOption: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: 14, paddingHorizontal: 16, borderRadius: 10, marginBottom: 4,
    },
    modalOptionActive: { backgroundColor: '#EFF6FF' },
    modalOptionText: { fontSize: 16, color: '#374151' },
    modalOptionTextActive: { color: '#2563EB', fontWeight: '600' },
    checkmark: { color: '#2563EB', fontSize: 18, fontWeight: 'bold' },
    modalCancel: { paddingVertical: 14, alignItems: 'center', marginTop: 8 },
    modalCancelText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
    modalScroll: { maxHeight: 300 },
    dateInput: {
        borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10,
        paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, textAlign: 'center',
    },
    dateHint: { textAlign: 'center', color: '#9CA3AF', fontSize: 12, marginTop: 8, marginBottom: 12 },
    modalConfirm: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
    modalConfirmText: { color: 'white', fontWeight: '600', fontSize: 15 },
});