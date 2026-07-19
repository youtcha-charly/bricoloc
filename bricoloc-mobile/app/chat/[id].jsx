import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';
import { chatsAPI } from '../../src/services/api';

export default function ChatScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [chatInfo, setChatInfo] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef(null);

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const res = await chatsAPI.get(id);
            const data = res.data;
            if (data.success) {
                setMessages(data.data?.messages || []);
                setChatInfo(data.data?.chat || null);
            }
        } catch (err) {
            console.log('Error loading messages:', err);
            Alert.alert('Error', 'Could not load messages');
        }
        setLoading(false);
    };

    const sendMessage = async () => {
        const text = newMessage.trim();
        if (!text || sending) return;

        setSending(true);
        try {
            await chatsAPI.sendMessage(id, text);
            setNewMessage('');
            await loadMessages();
        } catch (err) {
            console.log('Error sending message:', err);
            Alert.alert('Error', err?.response?.data?.message || 'Could not send message');
        }
        setSending(false);
    };

    const otherName = chatInfo?.other_user?.name || chatInfo?.client?.name || chatInfo?.bricoleur?.name || 'Chat';

    return (
        <View style={s.container}>
            <View style={s.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={s.backBtn}>← Back</Text>
                </TouchableOpacity>
                <View style={s.headerCenter}>
                    <Text style={s.headerTitle}>{otherName}</Text>
                    {chatInfo?.job?.title && (
                        <Text style={s.headerSub} numberOfLines={1}>📂 {chatInfo.job.title}</Text>
                    )}
                </View>
                <View style={{ width: 50 }} />
            </View>

            <ScrollView
                ref={scrollRef}
                style={s.msgList}
                contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                onLayout={() => scrollRef.current?.scrollToEnd({ animated: false })}
            >
                {loading ? (
                    <View style={s.loadingWrap}>
                        <Text style={{ color: '#6B7280' }}>Loading messages...</Text>
                    </View>
                ) : messages.length === 0 ? (
                    <View style={s.emptyChat}>
                        <Text style={s.emptyIcon}>💬</Text>
                        <Text style={s.emptyText}>No messages yet</Text>
                        <Text style={s.emptySub}>Send the first message</Text>
                    </View>
                ) : (
                    messages.map(msg => {
                        const isMe = msg.sender_id === user?.id || msg.sender?.id === user?.id;
                        return (
                            <View key={msg.id} style={[s.msgWrap, isMe ? s.msgRight : s.msgLeft]}>
                                {!isMe && msg.sender?.name && (
                                    <Text style={s.senderName}>{msg.sender.name}</Text>
                                )}
                                <View style={[s.bubble, isMe ? s.bubbleMe : s.bubbleThem]}>
                                    <Text style={[s.bubbleText, isMe && s.bubbleTextMe]}>{msg.message}</Text>
                                </View>
                                <Text style={[s.msgTime, isMe && s.msgTimeMe]}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            <View style={s.inputRow}>
                <TextInput
                    style={s.input}
                    placeholder="Type a message..."
                    placeholderTextColor="#9CA3AF"
                    value={newMessage}
                    onChangeText={setNewMessage}
                    returnKeyType="send"
                    onSubmitEditing={sendMessage}
                    editable={!sending}
                />
                <TouchableOpacity
                    style={[s.sendBtn, (!newMessage.trim() || sending) && { opacity: 0.5 }]}
                    onPress={sendMessage}
                    disabled={!newMessage.trim() || sending}
                >
                    <Text style={s.sendBtnText}>{sending ? '...' : 'Send'}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F6F6' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        backgroundColor: '#0B3D3E', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 12,
    },
    backBtn: { color: 'white', fontSize: 16 },
    headerCenter: { flex: 1, alignItems: 'center' },
    headerTitle: { color: 'white', fontSize: 17, fontWeight: 'bold' },
    headerSub: { color: '#D9A441', fontSize: 11, marginTop: 2 },
    msgList: { flex: 1 },
    loadingWrap: { alignItems: 'center', paddingTop: 80 },
    emptyChat: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyText: { fontSize: 16, fontWeight: '600', color: '#374151' },
    emptySub: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
    msgWrap: { marginBottom: 10, maxWidth: '80%' },
    msgRight: { alignSelf: 'flex-end' },
    msgLeft: { alignSelf: 'flex-start' },
    senderName: { fontSize: 10, color: '#6B7280', marginBottom: 2, marginLeft: 4 },
    bubble: { padding: 12, borderRadius: 14 },
    bubbleMe: { backgroundColor: '#D9A441', borderBottomRightRadius: 4 },
    bubbleThem: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 14, color: '#1A1A1A', lineHeight: 20 },
    bubbleTextMe: { color: '#0B3D3E' },
    msgTime: { fontSize: 10, color: '#9CA3AF', marginTop: 3, marginLeft: 4 },
    msgTimeMe: { textAlign: 'right', marginRight: 4 },
    inputRow: {
        flexDirection: 'row', padding: 12, paddingBottom: 14,
        backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 8,
    },
    input: {
        flex: 1, backgroundColor: '#F9FAFB', borderRadius: 20,
        paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: '#1A1A1A',
        borderWidth: 1, borderColor: '#E5E7EB',
    },
    sendBtn: {
        backgroundColor: '#D9A441', borderRadius: 20, paddingHorizontal: 22,
        justifyContent: 'center', alignItems: 'center',
    },
    sendBtnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 14 },
});
