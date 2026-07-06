import React, { useState, useEffect } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    Alert, StyleSheet, Modal, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

export default function BricoleurProfile() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showGenderPicker, setShowGenderPicker] = useState(false);
    const [showCityPicker, setShowCityPicker] = useState(false);

    // Profile fields
    const [profileImage, setProfileImage] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('Homme');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [city, setCity] = useState('Douala');
    const [neighborhood, setNeighborhood] = useState('');
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState('');
    const [description, setDescription] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Limbe', 'Kribi', 'Buéa', 'Ebolowa'];
    const genders = ['Homme', 'Femme', 'Autre'];
    const skillsList = ['Plomberie', 'Electricite', 'Peinture', 'Menuiserie', 'Climatisation', 'Menage', 'Jardinage', 'Demenagement', 'Couture', 'Reparation'];

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            const u = JSON.parse(userData);
            setUser(u);
            setFirstName(u.first_name || '');
            setLastName(u.last_name || '');
            setEmail(u.email || '');
            setPhone(u.phone_number?.replace('+237', '') || '');
            setCity(u.city || 'Douala');
            setGender(u.gender || 'Homme');
            setDateOfBirth(u.date_of_birth || '');
        }
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        if (!result.canceled) setProfileImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        if (!result.canceled) setProfileImage(result.assets[0].uri);
    };

    const addSkill = () => {
        if (newSkill && !skills.includes(newSkill)) {
            setSkills([...skills, newSkill]);
            setNewSkill('');
        }
    };

    const removeSkill = (skill) => {
        setSkills(skills.filter(s => s !== skill));
    };

    const handleSave = () => {
        setIsEditing(false);
        const updatedUser = {
            ...user,
            first_name: firstName,
            last_name: lastName,
            name: firstName + ' ' + lastName,
            email, phone_number: '+237' + phone, city, gender,
            date_of_birth: dateOfBirth,
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        Alert.alert('✅ Profil mis a jour', 'Vos informations ont ete enregistrees.');
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };

    return (
        <View style={s.container}>
            {/* Header */}
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Mon Profil</Text>
                <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                    <Text style={s.editBtn}>{isEditing ? 'Annuler' : 'Modifier'}</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                {/* Profile Picture */}
                <View style={s.imageSection}>
                    <TouchableOpacity onPress={pickImage}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={s.profileImage} />
                        ) : (
                            <View style={s.placeholder}>
                                <Text style={s.placeholderText}>{firstName?.charAt(0) || 'B'}</Text>
                            </View>
                        )}
                        <View style={s.cameraBadge}><Text style={s.cameraIcon}>📷</Text></View>
                    </TouchableOpacity>
                    <View style={s.photoBtns}>
                        <TouchableOpacity style={s.photoBtn} onPress={pickImage}>
                            <Text style={s.photoBtnText}>🖼️ Galerie</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.photoBtn} onPress={takePhoto}>
                            <Text style={s.photoBtnText}>📸 Photo</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Personal Info */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>👤 Informations personnelles</Text>
                    <View style={s.row}>
                        <View style={s.half}>
                            <Text style={s.label}>Prenom</Text>
                            <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={firstName} onChangeText={setFirstName} editable={isEditing} />
                        </View>
                        <View style={s.half}>
                            <Text style={s.label}>Nom</Text>
                            <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={lastName} onChangeText={setLastName} editable={isEditing} />
                        </View>
                    </View>

                    <Text style={s.label}>Email</Text>
                    <View style={s.inputRow}><Text style={s.inputIcon}>📧</Text>
                        <TextInput style={[s.inputFull, !isEditing && s.inputDisabled]} value={email} onChangeText={setEmail} editable={isEditing} keyboardType="email-address" />
                    </View>

                    <Text style={s.label}>Telephone</Text>
                    <View style={s.inputRow}><Text style={s.prefix}>+237</Text><View style={s.vDivider} />
                        <TextInput style={[s.inputFull, !isEditing && s.inputDisabled]} value={phone} onChangeText={setPhone} editable={isEditing} keyboardType="phone-pad" maxLength={9} />
                    </View>

                    <Text style={s.label}>Genre</Text>
                    <TouchableOpacity style={s.selectBtn} onPress={() => isEditing && setShowGenderPicker(true)} disabled={!isEditing}>
                        <Text style={s.selectText}>{gender}</Text><Text style={s.arrow}>▼</Text>
                    </TouchableOpacity>

                    <Text style={s.label}>Date de naissance</Text>
                    <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={dateOfBirth} onChangeText={setDateOfBirth} editable={isEditing} placeholder="AAAA-MM-JJ" />

                    <Text style={s.label}>Ville</Text>
                    <TouchableOpacity style={s.selectBtn} onPress={() => isEditing && setShowCityPicker(true)} disabled={!isEditing}>
                        <Text style={s.selectText}>📍 {city}</Text><Text style={s.arrow}>▼</Text>
                    </TouchableOpacity>

                    <Text style={s.label}>Quartier</Text>
                    <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={neighborhood} onChangeText={setNeighborhood} editable={isEditing} />
                </View>

                {/* Professional Info */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>🔧 Informations professionnelles</Text>
                    <Text style={s.label}>Description</Text>
                    <TextInput style={[s.input, s.textArea, !isEditing && s.inputDisabled]} value={description} onChangeText={setDescription} editable={isEditing} multiline numberOfLines={4} textAlignVertical="top" placeholder="Decrivez votre experience..." />

                    <Text style={s.label}>Annees d'experience</Text>
                    <TextInput style={[s.input, !isEditing && s.inputDisabled]} value={yearsOfExperience} onChangeText={setYearsOfExperience} editable={isEditing} keyboardType="numeric" />

                    <Text style={s.label}>Competences</Text>
                    <View style={s.skillsRow}>
                        {skills.map(skill => (
                            <View key={skill} style={s.skillChip}>
                                <Text style={s.skillText}>{skill}</Text>
                                {isEditing && (
                                    <TouchableOpacity onPress={() => removeSkill(skill)}>
                                        <Text style={s.skillRemove}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                    {isEditing && (
                        <View style={s.addSkillRow}>
                            <View style={s.skillSelect}>
                                {skillsList.filter(s => !skills.includes(s)).map(skill => (
                                    <TouchableOpacity key={skill} style={s.skillOption} onPress={() => { setSkills([...skills, skill]); }}>
                                        <Text style={s.skillOptionText}>+ {skill}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}
                </View>

                {/* Account Info */}
                <View style={s.section}>
                    <Text style={s.sectionTitle}>🔐 Compte</Text>
                    <View style={s.infoCard}>
                        <View style={s.infoRow}><Text style={s.infoLabel}>Type de compte</Text><Text style={s.infoValue}>Standard</Text></View>
                        <View style={s.divider} />
                        <View style={s.infoRow}><Text style={s.infoLabel}>Role</Text><Text style={[s.infoValue, { color: '#059669' }]}>🔧 Bricoleur</Text></View>
                        <View style={s.divider} />
                        <View style={s.infoRow}><Text style={s.infoLabel}>Pays</Text><Text style={s.infoValue}>🇨🇲 Cameroun</Text></View>
                        <View style={s.divider} />
                        <View style={s.infoRow}><Text style={s.infoLabel}>Statut verification</Text><View style={s.pendingBadge}><Text style={s.pendingText}>En attente</Text></View></View>
                    </View>
                </View>

                {/* Save */}
                {isEditing && (
                    <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                        <Text style={s.saveBtnText}>💾 Enregistrer les modifications</Text>
                    </TouchableOpacity>
                )}

                {/* Logout */}
                <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
                    <Text style={s.logoutText}>🚪 Se deconnecter</Text>
                </TouchableOpacity>

                <View style={{ height: 60 }} />
            </ScrollView>

            {/* Gender Modal */}
            <Modal visible={showGenderPicker} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>Genre</Text>
                        {genders.map(g => (
                            <TouchableOpacity key={g} style={[s.modalOption, gender === g && s.modalOptionActive]} onPress={() => { setGender(g); setShowGenderPicker(false); }}>
                                <Text style={[s.modalOptionText, gender === g && s.modalOptionTextActive]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={s.modalCancel} onPress={() => setShowGenderPicker(false)}><Text style={s.modalCancelText}>Annuler</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* City Modal */}
            <Modal visible={showCityPicker} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>Ville</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {cities.map(c => (
                                <TouchableOpacity key={c} style={[s.modalOption, city === c && s.modalOptionActive]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                                    <Text style={[s.modalOptionText, city === c && s.modalOptionTextActive]}>📍 {c}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={s.modalCancel} onPress={() => setShowCityPicker(false)}><Text style={s.modalCancelText}>Annuler</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    editBtn: { color: 'white', fontSize: 15, fontWeight: '600' },
    content: { flex: 1 },
    imageSection: { alignItems: 'center', paddingVertical: 24, backgroundColor: 'white', marginBottom: 10 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#059669' },
    placeholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#059669' },
    placeholderText: { color: 'white', fontSize: 36, fontWeight: 'bold' },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#2563EB', width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
    cameraIcon: { fontSize: 14 },
    photoBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
    photoBtn: { backgroundColor: '#F0FDF4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BBF7D0' },
    photoBtnText: { color: '#059669', fontWeight: '500', fontSize: 13 },
    section: { backgroundColor: 'white', marginBottom: 10, paddingHorizontal: 16, paddingVertical: 18 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 14 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    label: { color: '#374151', fontWeight: '600', marginBottom: 5, marginTop: 10, fontSize: 13 },
    input: { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, fontSize: 13, backgroundColor: '#F9FAFB', color: '#111827' },
    inputDisabled: { backgroundColor: '#F3F4F6', color: '#6B7280' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#F9FAFB' },
    inputIcon: { fontSize: 14, marginRight: 8 },
    inputFull: { flex: 1, fontSize: 13, color: '#111827' },
    prefix: { fontSize: 13, fontWeight: '600', color: '#111827' },
    vDivider: { width: 1, height: 16, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
    selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 10, backgroundColor: '#F9FAFB' },
    selectText: { fontSize: 13, color: '#111827' },
    arrow: { fontSize: 10, color: '#9CA3AF' },
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
    skillText: { color: '#2563EB', fontSize: 12, fontWeight: '500' },
    skillRemove: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
    addSkillRow: { marginTop: 8 },
    skillSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
    skillOption: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', borderStyle: 'dashed' },
    skillOptionText: { color: '#6B7280', fontSize: 11 },
    infoCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E5E7EB' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    infoLabel: { color: '#6B7280', fontSize: 13 },
    infoValue: { color: '#111827', fontWeight: '500', fontSize: 13 },
    divider: { height: 1, backgroundColor: '#E5E7EB' },
    pendingBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    pendingText: { color: '#92400E', fontSize: 11, fontWeight: '600' },
    saveBtn: { backgroundColor: '#059669', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginHorizontal: 16, marginTop: 10 },
    saveBtnText: { color: 'white', fontWeight: '600', fontSize: 15 },
    logoutBtn: { backgroundColor: 'white', marginHorizontal: 16, marginTop: 16, borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#FECACA' },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 15 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { fontSize: 17, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
    modalOption: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginBottom: 2 },
    modalOptionActive: { backgroundColor: '#F0FDF4' },
    modalOptionText: { fontSize: 15, color: '#374151' },
    modalOptionTextActive: { color: '#059669', fontWeight: '600' },
    modalCancel: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
    modalCancelText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
});