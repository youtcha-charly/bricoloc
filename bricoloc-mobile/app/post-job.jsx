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
        { id: '1', name: 'Plomberie', icon: '🔧' },
        { id: '2', name: 'Electricite', icon: '⚡' },
        { id: '3', name: 'Peinture', icon: '🎨' },
        { id: '4', name: 'Menuiserie', icon: '🪚' },
        { id: '5', name: 'Climatisation', icon: '❄️' },
        { id: '6', name: 'Menage', icon: '🧹' },
    ];

    const cities = ['Douala', 'Yaounde', 'Bafoussam', 'Bamenda', 'Garoua', 'Limbe', 'Kribi'];

    const handleSubmit = async () => {
        if (!title || !description || !category || !city) {
            window.alert('Veuillez remplir tous les champs obligatoires (*)');
            return;
        }

        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.alert('Vous devez etre connecte pour publier un travail.');
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
                window.alert('✅ Travail publie avec succes !\n\nVotre annonce est maintenant visible par les bricoleurs.');
                
                // Save job to localStorage for dashboard
                const myJobs = JSON.parse(localStorage.getItem('my_jobs') || '[]');
                myJobs.unshift(data.data);
                localStorage.setItem('my_jobs', JSON.stringify(myJobs));
                
                router.replace('/dashboard');
            } else {
                const msg = data.errors ? Object.values(data.errors).flat().join('\n') : (data.message || 'Erreur');
                window.alert('Erreur : ' + msg);
            }
        } catch (error) {
            setLoading(false);
            window.alert('Erreur de connexion au serveur.');
        }
    };

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Retour</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Publier un travail</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
                <View style={s.form}>
                    <Text style={s.label}>Titre du travail *</Text>
                    <TextInput style={s.input} placeholder="Ex: Reparation fuite eau sous evier" value={title} onChangeText={setTitle} maxLength={100} />

                    <Text style={s.label}>Categorie *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
                        {categories.map(cat => (
                            <TouchableOpacity key={cat.id} style={[s.catChip, category === cat.id && s.catChipActive]} onPress={() => setCategory(cat.id)}>
                                <Text style={s.catIcon}>{cat.icon}</Text>
                                <Text style={[s.catText, category === cat.id && s.catTextActive]}>{cat.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={s.label}>Description *</Text>
                    <TextInput style={[s.input, s.textArea]} placeholder="Decrivez le travail en detail..." value={description} onChangeText={setDescription} multiline numberOfLines={5} textAlignVertical="top" />

                    <Text style={s.label}>Budget (FCFA)</Text>
                    <View style={s.row}>
                        <View style={s.half}>
                            <Text style={s.budgetLabel}>Minimum</Text>
                            <TextInput style={s.input} placeholder="5,000" keyboardType="numeric" value={budgetMin} onChangeText={setBudgetMin} />
                        </View>
                        <View style={s.half}>
                            <Text style={s.budgetLabel}>Maximum</Text>
                            <TextInput style={s.input} placeholder="50,000" keyboardType="numeric" value={budgetMax} onChangeText={setBudgetMax} />
                        </View>
                    </View>

                    <Text style={s.label}>Ville *</Text>
                    <View style={s.cityGrid}>
                        {cities.map(c => (
                            <TouchableOpacity key={c} style={[s.cityChip, city === c && s.cityChipActive]} onPress={() => setCity(c)}>
                                <Text style={[s.cityText, city === c && s.cityTextActive]}>{c}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[s.submitBtn, (!title || !description || !category || !city) && s.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={!title || !description || !category || !city || loading}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={s.submitBtnText}>📢 Publier le travail</Text>}
                    </TouchableOpacity>
                    <View style={{ height: 60 }} />
                </View>
            </ScrollView>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#2563EB', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    scroll: { flex: 1 },
    form: { padding: 16 },
    label: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 16, marginBottom: 8 },
    input: { backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827' },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    catScroll: { maxHeight: 80, marginBottom: 4 },
    catChip: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, marginRight: 8, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB' },
    catChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
    catIcon: { fontSize: 22, marginBottom: 4 },
    catText: { fontSize: 11, color: '#6B7280', fontWeight: '500' },
    catTextActive: { color: '#2563EB' },
    row: { flexDirection: 'row', gap: 10 },
    half: { flex: 1 },
    budgetLabel: { fontSize: 12, color: '#6B7280', marginBottom: 4 },
    cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    cityChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: 'white' },
    cityChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
    cityText: { color: '#374151', fontSize: 13 },
    cityTextActive: { color: 'white' },
    submitBtn: { backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 24 },
    submitBtnDisabled: { backgroundColor: '#93C5FD' },
    submitBtnText: { color: 'white', fontWeight: '700', fontSize: 17 },
});