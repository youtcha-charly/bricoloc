import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [user, setUser] = useState(null);

    const getToken = () => localStorage.getItem('auth_token');

    useEffect(() => {
        const userData = localStorage.getItem('user_data');
        if (userData) setUser(JSON.parse(userData));
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const token = getToken();
            const response = await fetch(`http://127.0.0.1:8000/api/v1/chats/${id}`, {
                headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' },
            });
            const data = await response.json();
            if (data.success) {
                setMessages(data.data || []);
            }
        } catch (err) {
            console.log('Error loading messages:', err);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim()) return;
        try {
            const token = getToken();
            await fetch(`http://127.0.0.1:8000/api/v1/chats/${id}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ message_text: newMessage }),
            });
            setNewMessage('');
            loadMessages();
        } catch (err) {
            console.log('Error sending message:', err);
        }
    };

    return (
        <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Back</Text>
                </TouchableOpacity>
                <Text style={s.headerTitle}>Chat</Text>
                <View style={{ width: 50 }} />
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <View style={[s.msgBubble, item.sender_id === user?.id ? s.myMsg : s.theirMsg]}>
                        <Text style={s.msgText}>{item.message_text}</Text>
                        <Text style={s.msgTime}>{new Date(item.created_at).toLocaleTimeString()}</Text>
                    </View>
                )}
                style={s.msgList}
            />

            <View style={s.inputRow}>
                <TextInput
                    style={s.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    value={newMessage}
                    onChangeText={setNewMessage}
                />
                <TouchableOpacity style={s.sendBtn} onPress={sendMessage}>
                    <Text style={s.sendBtnText}>Send</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F6' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B3D3E', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
    backBtn: { color: 'white', fontSize: 16 },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    msgList: { flex: 1, padding: 16 },
    msgBubble: { padding: 12, borderRadius: 12, marginBottom: 8, maxWidth: '80%' },
    myMsg: { alignSelf: 'flex-end', backgroundColor: '#D9A441' },
    theirMsg: { alignSelf: 'flex-start', backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB' },
    msgText: { fontSize: 14, color: '#1A1A1A' },
    msgTime: { fontSize: 10, color: '#6B7280', marginTop: 4, textAlign: 'right' },
    inputRow: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8 },
    input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
    sendBtn: { backgroundColor: '#D9A441', borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center' },
    sendBtnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 14 },
});