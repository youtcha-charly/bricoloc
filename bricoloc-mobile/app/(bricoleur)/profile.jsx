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

    const [profileImage, setProfileImage] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('Male');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [city, setCity] = useState('Douala');
    const [neighborhood, setNeighborhood] = useState('');
    const [skills, setSkills] = useState([]);
    const [description, setDescription] = useState('');
    const [yearsOfExperience, setYearsOfExperience] = useState('');

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Maroua', 'Limbe', 'Kribi', 'Buea', 'Ebolowa'];
    const genders = ['Male', 'Female', 'Other'];
    const skillsList = ['Plumbing', 'Electrical', 'Painting', 'Carpentry', 'AC Repair', 'Cleaning', 'Gardening', 'Moving', 'Tailoring', 'Phone Repair'];

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
            setGender(u.gender || 'Male');
            setDateOfBirth(u.date_of_birth || '');
        }
    }, []);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8,
        });
        if (!result.canceled) setProfileImage(result.assets[0].uri);
    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled) setProfileImage(result.assets[0].uri);
    };

    const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

    const handleSave = () => {
        setIsEditing(false);
        const updatedUser = {
            ...user, first_name: firstName, last_name: lastName,
            name: firstName + ' ' + lastName, email, phone_number: '+237' + phone, city, gender, date_of_birth: dateOfBirth,
        };
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
        setUser(updatedUser);
        Alert.alert('✅ Profile Updated', 'Your information has been saved.');
    };

    const handleLogout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        router.replace('/login');
    };

    return (
        <View style={p.root}>

            {/* ========== SIDEBAR ========== */}
            <View style={p.sidebar}>
                <View style={p.brand}>
                    <View style={p.brandIcon}><Text style={p.brandIconText}>BL</Text></View>
                    <Text style={p.brandName}>BricoLoc</Text>
                </View>
                <Text style={p.brandLabel}>HANDYMAN</Text>

                <View style={p.nav}>
                    <TouchableOpacity style={p.navItem} onPress={() => router.push('/(bricoleur)/home')}>
                        <Text style={p.navIcon}>⊡</Text><Text style={p.navLabel}>Browse Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={p.navItem} onPress={() => router.push('/(bricoleur)/my-bids')}>
                        <Text style={p.navIcon}>◎</Text><Text style={p.navLabel}>My Offers</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={p.navItem} onPress={() => router.push('/(bricoleur)/active-jobs')}>
                        <Text style={p.navIcon}>◈</Text><Text style={p.navLabel}>Active Jobs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={p.navItem} onPress={() => router.push('/(bricoleur)/chats')}>
                        <Text style={p.navIcon}>◉</Text><Text style={p.navLabel}>Messages</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[p.navItem, p.navActive]}>
                        <Text style={[p.navIcon, p.navIconActive]}>▣</Text><Text style={[p.navLabel, p.navLabelActive]}>Profile</Text>
                    </TouchableOpacity>
                </View>

                <View style={p.navSep} />
                <TouchableOpacity style={p.navItem} onPress={handleLogout}>
                    <Text style={p.navIcon}>⇤</Text><Text style={[p.navLabel, { color: '#DC2626' }]}>Sign Out</Text>
                </TouchableOpacity>

                <View style={p.sideUser}>
                    <View style={p.sideAvatar}><Text style={p.sideAvatarText}>H</Text></View>
                    <View>
                        <Text style={p.sideUserName}>Handyman</Text>
                        <Text style={p.sideUserRole}>Available</Text>
                    </View>
                </View>
            </View>

            {/* ========== MAIN ========== */}
            <View style={p.main}>
                <View style={p.topbar}>
                    <TouchableOpacity onPress={() => router.back()} style={p.backBtn}>
                        <Text style={p.backBtnText}>← Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                        <Text style={p.editBtn}>{isEditing ? 'Cancel' : 'Edit'}</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={p.pageTitle}>My Profile</Text>
                    <Text style={p.pageSub}>Manage your personal and professional information.</Text>

                    {/* Profile Picture */}
                    <View style={p.imageSection}>
                        <TouchableOpacity onPress={pickImage}>
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={p.profileImage} />
                            ) : (
                                <View style={p.placeholder}><Text style={p.placeholderText}>{firstName?.charAt(0) || 'H'}</Text></View>
                            )}
                            <View style={p.cameraBadge}><Text style={p.cameraIcon}>📷</Text></View>
                        </TouchableOpacity>
                        <View style={p.photoBtns}>
                            <TouchableOpacity style={p.photoBtn} onPress={pickImage}>
                                <Text style={p.photoBtnText}>🖼️ Gallery</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={p.photoBtn} onPress={takePhoto}>
                                <Text style={p.photoBtnText}>📸 Camera</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Personal Info */}
                    <View style={p.card}>
                        <Text style={p.sectionLabel}>PERSONAL INFORMATION</Text>
                        <View style={p.row}>
                            <View style={p.half}>
                                <Text style={p.label}>First Name</Text>
                                <TextInput style={[p.input, !isEditing && p.inputDisabled]} value={firstName} onChangeText={setFirstName} editable={isEditing} placeholderTextColor="#9CA3AF" />
                            </View>
                            <View style={p.half}>
                                <Text style={p.label}>Last Name</Text>
                                <TextInput style={[p.input, !isEditing && p.inputDisabled]} value={lastName} onChangeText={setLastName} editable={isEditing} placeholderTextColor="#9CA3AF" />
                            </View>
                        </View>
                        <Text style={p.label}>Email</Text>
                        <TextInput style={[p.input, !isEditing && p.inputDisabled]} value={email} onChangeText={setEmail} editable={isEditing} keyboardType="email-address" placeholderTextColor="#9CA3AF" />
                        <Text style={p.label}>Phone</Text>
                        <View style={p.inputRow}><Text style={p.prefix}>+237</Text><View style={p.vDivider} /><TextInput style={[p.inputFull, !isEditing && p.inputDisabled]} value={phone} onChangeText={setPhone} editable={isEditing} keyboardType="phone-pad" maxLength={9} /></View>
                        <Text style={p.label}>Gender</Text>
                        <TouchableOpacity style={p.selectBtn} onPress={() => isEditing && setShowGenderPicker(true)} disabled={!isEditing}>
                            <Text style={p.selectText}>{gender}</Text><Text style={p.arrow}>▼</Text>
                        </TouchableOpacity>
                        <Text style={p.label}>Date of Birth</Text>
                        <TextInput style={[p.input, !isEditing && p.inputDisabled]} value={dateOfBirth} onChangeText={setDateOfBirth} editable={isEditing} placeholder="YYYY-MM-DD" placeholderTextColor="#9CA3AF" />
                        <Text style={p.label}>City</Text>
                        <TouchableOpacity style={p.selectBtn} onPress={() => isEditing && setShowCityPicker(true)} disabled={!isEditing}>
                            <Text style={p.selectText}>📍 {city}</Text><Text style={p.arrow}>▼</Text>
                        </TouchableOpacity>
                        <Text style={p.label}>Neighborhood</Text>
                        <TextInput style={[p.input, !isEditing && p.inputDisabled]} value={neighborhood} onChangeText={setNeighborhood} editable={isEditing} placeholderTextColor="#9CA3AF" />
                    </View>

                    {/* Professional Info */}
                    <View style={p.card}>
                        <Text style={p.sectionLabel}>PROFESSIONAL INFORMATION</Text>
                        <Text style={p.label}>Description</Text>
                        <TextInput style={[p.input, p.textArea, !isEditing && p.inputDisabled]} value={description} onChangeText={setDescription} editable={isEditing} multiline numberOfLines={4} textAlignVertical="top" placeholder="Describe your experience..." placeholderTextColor="#9CA3AF" />
                        <Text style={p.label}>Years of Experience</Text>
                        <TextInput style={[p.input, !isEditing && p.inputDisabled]} value={yearsOfExperience} onChangeText={setYearsOfExperience} editable={isEditing} keyboardType="numeric" placeholderTextColor="#9CA3AF" />
                        <Text style={p.label}>Skills</Text>
                        <View style={p.skillsRow}>
                            {skills.map(skill => (
                                <View key={skill} style={p.skillChip}>
                                    <Text style={p.skillText}>{skill}</Text>
                                    {isEditing && <TouchableOpacity onPress={() => removeSkill(skill)}><Text style={p.skillRemove}>✕</Text></TouchableOpacity>}
                                </View>
                            ))}
                        </View>
                        {isEditing && (
                            <View style={p.skillSelect}>
                                {skillsList.filter(s => !skills.includes(s)).map(skill => (
                                    <TouchableOpacity key={skill} style={p.skillOption} onPress={() => setSkills([...skills, skill])}>
                                        <Text style={p.skillOptionText}>+ {skill}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Account Info */}
                    <View style={p.card}>
                        <Text style={p.sectionLabel}>ACCOUNT INFORMATION</Text>
                        <View style={p.infoRow}><Text style={p.infoLabel}>Account Type</Text><Text style={p.infoValue}>Standard</Text></View>
                        <View style={p.divider} />
                        <View style={p.infoRow}><Text style={p.infoLabel}>Role</Text><Text style={[p.infoValue, { color: '#059669' }]}>🔧 Handyman</Text></View>
                        <View style={p.divider} />
                        <View style={p.infoRow}><Text style={p.infoLabel}>Country</Text><Text style={p.infoValue}>🇨🇲 Cameroon</Text></View>
                        <View style={p.divider} />
                        <View style={p.infoRow}><Text style={p.infoLabel}>Verification Status</Text><View style={p.pendingBadge}><Text style={p.pendingText}>Pending</Text></View></View>
                    </View>

                    {/* Save */}
                    {isEditing && (
                        <TouchableOpacity style={p.saveBtn} onPress={handleSave}>
                            <Text style={p.saveBtnText}>💾 Save Changes</Text>
                        </TouchableOpacity>
                    )}

                    {/* Logout */}
                    <TouchableOpacity style={p.logoutBtn} onPress={handleLogout}>
                        <Text style={p.logoutText}>🚪 Sign Out</Text>
                    </TouchableOpacity>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>

            {/* Gender Modal */}
            <Modal visible={showGenderPicker} transparent animationType="slide">
                <View style={p.modalOverlay}><View style={p.modalContent}>
                    <Text style={p.modalTitle}>Select Gender</Text>
                    {genders.map(g => (
                        <TouchableOpacity key={g} style={[p.modalOption, gender === g && p.modalOptionActive]} onPress={() => { setGender(g); setShowGenderPicker(false); }}>
                            <Text style={[p.modalOptionText, gender === g && p.modalOptionTextActive]}>{g}</Text>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={p.modalCancel} onPress={() => setShowGenderPicker(false)}><Text style={p.modalCancelText}>Cancel</Text></TouchableOpacity>
                </View></View>
            </Modal>

            {/* City Modal */}
            <Modal visible={showCityPicker} transparent animationType="slide">
                <View style={p.modalOverlay}><View style={p.modalContent}>
                    <Text style={p.modalTitle}>Select City</Text>
                    <ScrollView style={{ maxHeight: 300 }}>
                        {cities.map(c => (
                            <TouchableOpacity key={c} style={[p.modalOption, city === c && p.modalOptionActive]} onPress={() => { setCity(c); setShowCityPicker(false); }}>
                                <Text style={[p.modalOptionText, city === c && p.modalOptionTextActive]}>📍 {c}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity style={p.modalCancel} onPress={() => setShowCityPicker(false)}><Text style={p.modalCancelText}>Cancel</Text></TouchableOpacity>
                </View></View>
            </Modal>
        </View>
    );
}

const p = StyleSheet.create({
    root: { flex: 1, flexDirection: 'row', backgroundColor: '#F0FDF4' },

    // Sidebar
    sidebar: { width: 200, backgroundColor: '#064E3B', paddingVertical: 24, paddingHorizontal: 16, justifyContent: 'space-between' },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    brandIcon: { width: 30, height: 30, backgroundColor: '#F59E0B', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    brandIconText: { color: '#064E3B', fontWeight: '700', fontSize: 13 },
    brandName: { color: '#ECFDF5', fontWeight: '600', fontSize: 15 },
    brandLabel: { color: '#6EE7B7', fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 22, marginTop: 2 },
    nav: { flex: 1 },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, paddingHorizontal: 8, borderRadius: 6, marginBottom: 1, gap: 10 },
    navActive: { backgroundColor: '#065F46' },
    navIcon: { fontSize: 14, color: '#6EE7B7', width: 18, textAlign: 'center' },
    navIconActive: { color: '#F59E0B' },
    navLabel: { fontSize: 12, color: '#A7F3D0' },
    navLabelActive: { color: '#ECFDF5', fontWeight: '600' },
    navSep: { borderTopWidth: 1, borderTopColor: '#065F46', marginVertical: 12 },
    sideUser: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#065F46' },
    sideAvatar: { width: 30, height: 30, backgroundColor: '#F59E0B', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    sideAvatarText: { color: '#064E3B', fontWeight: '700', fontSize: 12 },
    sideUserName: { color: '#ECFDF5', fontSize: 12, fontWeight: '500' },
    sideUserRole: { color: '#6EE7B7', fontSize: 10 },

    // Main
    main: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    backBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#D1FAE5' },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
    editBtn: { color: '#F59E0B', fontSize: 14, fontWeight: '600' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#064E3B', marginTop: 8 },
    pageSub: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 },

    // Profile Image
    imageSection: { alignItems: 'center', paddingVertical: 20, backgroundColor: 'white', borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: '#D1FAE5' },
    profileImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#F59E0B' },
    placeholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#064E3B', justifyContent: 'center', alignItems: 'center' },
    placeholderText: { color: 'white', fontSize: 30, fontWeight: 'bold' },
    cameraBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#F59E0B', width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'white' },
    cameraIcon: { fontSize: 13 },
    photoBtns: { flexDirection: 'row', gap: 8, marginTop: 12 },
    photoBtn: { backgroundColor: '#FFFBEB', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6, borderWidth: 1, borderColor: '#FDE68A' },
    photoBtnText: { color: '#B45309', fontWeight: '500', fontSize: 12 },

    // Card
    card: { backgroundColor: 'white', borderRadius: 14, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: '#D1FAE5' },
    sectionLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },

    // Inputs
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 5, marginTop: 12 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
    inputDisabled: { backgroundColor: '#F3F4F6', color: '#6B7280' },
    textArea: { minHeight: 80, textAlignVertical: 'top' },
    inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 },
    inputFull: { flex: 1, fontSize: 14, color: '#111827' },
    prefix: { fontSize: 13, fontWeight: '600', color: '#111827' },
    vDivider: { width: 1, height: 16, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
    selectBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 11 },
    selectText: { fontSize: 14, color: '#111827' },
    arrow: { fontSize: 10, color: '#9CA3AF' },

    // Skills
    skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    skillChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
    skillText: { color: '#059669', fontSize: 12, fontWeight: '500' },
    skillRemove: { color: '#EF4444', fontSize: 14, fontWeight: 'bold' },
    skillSelect: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 8 },
    skillOption: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#D1D5DB', borderStyle: 'dashed' },
    skillOptionText: { color: '#6B7280', fontSize: 11 },

    // Account Info
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9 },
    infoLabel: { color: '#6B7280', fontSize: 13 },
    infoValue: { color: '#111827', fontWeight: '500', fontSize: 13 },
    divider: { height: 1, backgroundColor: '#E5E7EB' },
    pendingBadge: { backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
    pendingText: { color: '#B45309', fontSize: 11, fontWeight: '600' },

    // Buttons
    saveBtn: { backgroundColor: '#059669', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
    saveBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
    logoutBtn: { backgroundColor: 'white', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#FECACA' },
    logoutText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },

    // Modals
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
    modalTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 14 },
    modalOption: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
    modalOptionActive: { backgroundColor: '#ECFDF5' },
    modalOptionText: { fontSize: 15, color: '#374151' },
    modalOptionTextActive: { color: '#059669', fontWeight: '600' },
    modalCancel: { paddingVertical: 12, alignItems: 'center', marginTop: 6 },
    modalCancelText: { color: '#EF4444', fontWeight: '600', fontSize: 14 },
});