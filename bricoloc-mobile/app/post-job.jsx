import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, Alert,
    ActivityIndicator, StyleSheet, ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function PostJob() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [budgetMin, setBudgetMin] = useState('');
    const [budgetMax, setBudgetMax] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);

    const categories = [
        { id: '1', name: 'Plumbing', icon: '🔧' },
        { id: '2', name: 'Electrical', icon: '⚡' },
        { id: '3', name: 'Painting', icon: '🎨' },
        { id: '4', name: 'Carpentry', icon: '🪚' },
        { id: '5', name: 'AC Repair', icon: '❄️' },
        { id: '6', name: 'Cleaning', icon: '🧹' },
    ];

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Limbe', 'Kribi'];

    const handleSubmit = async () => {
        if (!title || !description || !category || !city) {
            window.alert('Please fill in all required fields (*)');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.alert('You must be logged in to post a job.');
            router.replace('/login');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/v1/jobs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                body: JSON.stringify({
                    title: title,
                    description: description,
                    category_id: category,
                    budget_min: budgetMin ? parseInt(budgetMin) : null,
                    budget_max: budgetMax ? parseInt(budgetMax) : null,
                    city: city,
                }),
            });

            const data = await response.json();
            setLoading(false);

            if (data.success) {
                window.alert('✅ Job published successfully!\n\nYour ad is now visible to handymen.');
                const myJobs = JSON.parse(localStorage.getItem('my_jobs') || '[]');
                myJobs.unshift(data.data);
                localStorage.setItem('my_jobs', JSON.stringify(myJobs));
                router.replace('/dashboard');
            } else {
                const msg = data.errors ? Object.values(data.errors).flat().join('\n') : (data.message || 'Error');
                window.alert('Error: ' + msg);
            }
        } catch (error) {
            setLoading(false);
            window.alert('Server connection error.');
        }
    };

    return (
        <View style={s.container}>

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
                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>📝</Text><Text style={[s.navLabel, s.navLabelActive]}>Post a Job</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem}>
                    <Text style={s.navIcon}>💬</Text><Text style={s.navLabel}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/profile')}>
                    <Text style={s.navIcon}>👤</Text><Text style={s.navLabel}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* ========== MAIN CONTENT ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                        <Text style={s.backBtnText}>← Back to Dashboard</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                    <Text style={s.pageTitle}>Post a New Job</Text>
                    <Text style={s.pageSubtitle}>Describe your needs and receive offers from verified handymen.</Text>

                    <View style={s.formCard}>
                        <Text style={s.sectionLabel}>JOB DETAILS</Text>

                        <Text style={s.label}>Title *</Text>
                        <TextInput style={s.input} placeholder="e.g. Pipe leak repair under kitchen sink" placeholderTextColor="#9CA3AF" value={title} onChangeText={setTitle} maxLength={100} />
                        <Text style={s.charCount}>{title.length}/100</Text>

                        <Text style={s.label}>Category *</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
                            {categories.map(cat => (
                                <TouchableOpacity key={cat.id} style={[s.catChip, category === cat.id && s.catChipActive]} onPress={() => setCategory(cat.id)}>
                                    <Text style={s.catIcon}>{cat.icon}</Text>
                                    <Text style={[s.catText, category === cat.id && s.catTextActive]}>{cat.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text style={s.label}>Description *</Text>
                        <TextInput style={[s.input, s.textArea]} placeholder="Describe the work in detail — materials needed, dimensions, urgency, access conditions..." placeholderTextColor="#9CA3AF" value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" />
                        <Text style={s.charCount}>{description.length}/500</Text>

                        <View style={s.divider} />
                        <Text style={s.sectionLabel}>BUDGET & LOCATION</Text>

                        <Text style={s.label}>Budget (FCFA)</Text>
                        <View style={s.row}>
                            <View style={s.half}>
                                <Text style={s.budgetLabel}>Minimum</Text>
                                <TextInput style={s.input} placeholder="5,000" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={budgetMin} onChangeText={setBudgetMin} />
                            </View>
                            <View style={s.half}>
                                <Text style={s.budgetLabel}>Maximum</Text>
                                <TextInput style={s.input} placeholder="50,000" placeholderTextColor="#9CA3AF" keyboardType="numeric" value={budgetMax} onChangeText={setBudgetMax} />
                            </View>
                        </View>

                        <Text style={s.label}>City *</Text>
                        <View style={s.cityGrid}>
                            {cities.map(c => (
                                <TouchableOpacity key={c} style={[s.cityChip, city === c && s.cityChipActive]} onPress={() => setCity(c)}>
                                    <Text style={[s.cityText, city === c && s.cityTextActive]}>📍 {c}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={s.divider} />

                        <View style={s.infoBox}>
                            <Text style={s.infoTitle}>💡 Good to Know</Text>
                            <Text style={s.infoText}>• Your ad will be visible to handymen in your city.</Text>
                            <Text style={s.infoText}>• You will receive offers in the application.</Text>
                            <Text style={s.infoText}>• Check ratings and reviews before accepting an offer.</Text>
                        </View>

                        <TouchableOpacity
                            style={[s.submitBtn, (!title || !description || !category || !city) && s.submitBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={!title || !description || !category || !city || loading}
                        >
                            {loading ? <ActivityIndicator color="#0B3D3E" /> : <Text style={s.submitBtnText}>Publish Job</Text>}
                        </TouchableOpacity>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },

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
    main: { flex: 1, paddingHorizontal: 28, paddingVertical: 20 },
    topbar: { marginBottom: 8 },
    backBtn: { alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
    backBtnText: { color: '#6B7280', fontSize: 13, fontWeight: '500' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginTop: 8 },
    pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4, marginBottom: 20 },
    scroll: { flex: 1 },

    // Form Card
    formCard: { backgroundColor: 'white', borderRadius: 14, padding: 24, borderWidth: 1, borderColor: '#E5E7EB' },
    sectionLabel: { fontSize: 10, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14, marginTop: 4 },
    label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 14 },
    input: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14, color: '#111827' },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    charCount: { textAlign: 'right', color: '#9CA3AF', fontSize: 10, marginTop: 3 },
    catScroll: { maxHeight: 80, marginBottom: 4 },
    catChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginRight: 8, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB' },
    catChipActive: { backgroundColor: '#FDF3E0', borderColor: '#D9A441' },
    catIcon: { fontSize: 20, marginBottom: 3 },
    catText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    catTextActive: { color: '#B8860B', fontWeight: '600' },
    divider: { borderTopWidth: 1, borderColor: '#E5E7EB', marginVertical: 18 },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    budgetLabel: { fontSize: 11, color: '#9CA3AF', marginBottom: 4 },
    cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: 'white' },
    cityChipActive: { backgroundColor: '#0B3D3E', borderColor: '#0B3D3E' },
    cityText: { color: '#374151', fontSize: 12 },
    cityTextActive: { color: 'white' },
    infoBox: { backgroundColor: '#FDF3E0', borderRadius: 10, padding: 14, marginTop: 4, borderWidth: 1, borderColor: '#F5D98E' },
    infoTitle: { fontSize: 13, fontWeight: '600', color: '#B8860B', marginBottom: 6 },
    infoText: { color: '#8B6914', fontSize: 12, lineHeight: 20 },
    submitBtn: { backgroundColor: '#D9A441', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 22 },
    submitBtnDisabled: { backgroundColor: '#F5D98E' },
    submitBtnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 15 },
});