import React, { useState, useCallback } from 'react';
import {
    View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { jobsAPI, notificationsAPI, reviewsAPI, getJobPhotoUrl } from '../src/services/api';

export default function Dashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [notifCount, setNotifCount] = useState(0);
    const [stats, setStats] = useState({ total: 0, active: 0, offers: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [reviewedJobIds, setReviewedJobIds] = useState(new Set());
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [reviewJobId, setReviewJobId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);
    const [activeJobTab, setActiveJobTab] = useState('New');
    const [statusType, setStatusType] = useState(null);
    const [statusMsg, setStatusMsg] = useState('');

    useFocusEffect(useCallback(() => {
        loadAllData();
    }, []));

    const loadAllData = async () => {
        setLoading(true);
        await Promise.all([fetchJobs(), fetchNotifications()]);
        setLoading(false);
    };

    const fetchJobs = async () => {
        try {
            const res = await jobsAPI.list();
            const data = res.data;
            if (data.success && data.data) {
                const jobList = data.data.data || data.data || [];
                const jobsArray = Array.isArray(jobList) ? jobList : [];
                setJobs(jobsArray);
                const open = jobsArray.filter(j => j.status === 'open').length;
                const done = jobsArray.filter(j => j.status === 'completed').length;
                setStats({
                    total: jobsArray.length,
                    active: open,
                    offers: jobsArray.reduce((sum, j) => sum + (j.bids_count ?? j.bids?.length ?? 0), 0),
                    completed: done,
                });
                const completedJobs = jobsArray.filter(j => j.status === 'completed');
                if (completedJobs.length > 0) {
                    const results = await Promise.all(
                        completedJobs.map(async (j) => {
                            try {
                                const r = await reviewsAPI.check(j.id);
                                return { id: j.id, reviewed: r.data.reviewed };
                            } catch { return { id: j.id, reviewed: true }; }
                        })
                    );
                    const ids = new Set();
                    results.forEach(r => { if (r.reviewed) ids.add(r.id); });
                    setReviewedJobIds(ids);
                }
            }
        } catch (err) {
            console.log('Error loading jobs:', err);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await notificationsAPI.list();
            const data = res.data;
            if (data.success) {
                const notifList = data.data?.data || data.data || [];
                const notifsArray = Array.isArray(notifList) ? notifList : [];
                setNotifications(notifsArray);
                setNotifCount(notifsArray.filter(n => !n.is_read).length);
            }
        } catch (err) {
            console.log('Error fetching notifications:', err);
        }
    };

    const handleCompleteJob = async (jobId) => {
        try {
            const res = await jobsAPI.complete(jobId);
            const data = res.data;
            if (data.success) {
                setStatusType('success');
                setStatusMsg('Job has been marked as completed.');
                setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
                loadAllData();
            } else {
                setStatusType('error');
                setStatusMsg(data.message || 'Error completing job');
                setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Server connection error';
            setStatusType('error');
            setStatusMsg(msg);
            setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
        }
    };

    const handleCancelJob = async (jobId) => {
        try {
            const res = await jobsAPI.cancel(jobId);
            const data = res.data;
            if (data.success) {
                setStatusType('success');
                setStatusMsg('Job has been cancelled.');
                setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
                loadAllData();
            } else {
                setStatusType('error');
                setStatusMsg(data.message || 'Error cancelling job');
                setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Server connection error';
            setStatusType('error');
            setStatusMsg(msg);
            setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
        }
    };

    const openReviewModal = (jobId) => {
        setReviewJobId(jobId);
        setReviewRating(5);
        setReviewComment('');
        setReviewModalVisible(true);
    };

    const submitReview = async () => {
        if (!reviewJobId) return;
        setReviewSubmitting(true);
        try {
            const res = await reviewsAPI.submit(reviewJobId, {
                rating: reviewRating,
                comment: reviewComment || null,
            });
            if (res.data.success) {
                setReviewModalVisible(false);
                setReviewedJobIds(prev => new Set([...prev, reviewJobId]));
                setStatusType('success');
                setStatusMsg('Your review has been submitted.');
                setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
            } else {
                setStatusType('error');
                setStatusMsg(res.data.message || 'Could not submit review');
                setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Server connection error';
            setStatusType('error');
            setStatusMsg(msg);
            setTimeout(() => { setStatusType(null); setStatusMsg(''); }, 4000);
        }
        setReviewSubmitting(false);
    };

    const handleLogout = async () => {
        await logout();
        router.replace('/login');
    };

    const getStatusStyle = (status) => {
        if (status === 'open') return { bg: '#FDF3E0', text: '#B8860B', dot: '#D9A441', label: 'OPEN' };
        if (status === 'assigned' || status === 'in_progress') return { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', label: 'IN PROGRESS' };
        if (status === 'completed') return { bg: '#E6F4F2', text: '#0F766E', dot: '#14B8A6', label: 'DONE' };
        if (status === 'cancelled') return { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444', label: 'CANCELLED' };
        return { bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF', label: status?.toUpperCase() || 'N/A' };
    };

    if (loading) {
        return (
            <View style={[s.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#D9A441" />
                <Text style={{ marginTop: 12, color: '#6B7280' }}>Loading dashboard...</Text>
            </View>
        );
    }

    return (
        <View style={s.container}>
            {/* ========== SIDEBAR ========== */}
            <View style={s.sidebar}>
                <View style={s.sidebarLogo}>
                    <View style={s.logoIcon}><Text style={s.logoIconText}>BL</Text></View>
                    <Text style={s.logoText}>BricoLoc</Text>
                </View>

                <TouchableOpacity style={[s.navItem, s.navActive]}>
                    <Text style={s.navIcon}>📊</Text><Text style={[s.navLabel, s.navLabelActive]}>Dashboard</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/post-job')}>
                    <Text style={s.navIcon}>📝</Text><Text style={s.navLabel}>Post a Job</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/dashboard')}>
                    <Text style={s.navIcon}>📋</Text><Text style={s.navLabel}>My Jobs</Text>
                    <View style={s.badge}><Text style={s.badgeText}>{jobs.length}</Text></View>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/chats')}>
                    <Text style={s.navIcon}>💬</Text><Text style={s.navLabel}>Messages</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/dashboard')}>
                    <Text style={s.navIcon}>⭐</Text><Text style={s.navLabel}>Reviews</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/profile')}>
                    <Text style={s.navIcon}>👤</Text><Text style={s.navLabel}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.navItem} onPress={() => router.push('/notifications')}>
                    <Text style={s.navIcon}>🔔</Text>
                    <Text style={s.navLabel}>Notifications</Text>
                    {notifCount > 0 && (
                        <View style={s.notifRedBadge}>
                            <Text style={s.notifRedBadgeText}>{notifCount}</Text>
                        </View>
                    )}
                </TouchableOpacity>

                <View style={s.sidebarFooter}>
                    <View style={s.sidebarUser}>
                        <View style={s.userAvatar}><Text style={s.userAvatarText}>{user?.name?.charAt(0) || 'U'}</Text></View>
                        <View>
                            <Text style={s.userName}>{user?.name || 'User'}</Text>
                            <Text style={s.userRole}>Client · {user?.city || 'Douala'}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleLogout} style={s.logoutBtn}>
                        <Text style={s.logoutBtnText}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ========== MAIN CONTENT ========== */}
            <View style={s.main}>
                <View style={s.topbar}>
                    <View>
                        <Text style={s.pageTitle}>Dashboard</Text>
                        <Text style={s.pageSubtitle}>Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
                    </View>
                    <TouchableOpacity style={s.refreshBtn} onPress={loadAllData}>
                        <Text style={s.refreshBtnText}>🔄</Text>
                    </TouchableOpacity>
                </View>

                {/* Status Banner */}
                {statusType && (
                    <View style={[s.statusBanner, statusType === 'error' && s.statusBannerError, statusType === 'success' && s.statusBannerSuccess]}>
                        <Text style={[s.statusText, statusType === 'error' && s.statusTextError, statusType === 'success' && s.statusTextSuccess]}>
                            {statusType === 'success' ? '✅ ' : '❌ '}{statusMsg}
                        </Text>
                    </View>
                )}

                {/* Stats Row */}
                <View style={s.statsRow}>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>TOTAL JOBS</Text>
                        <Text style={s.statValue}>{stats.total}</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>ACTIVE</Text>
                        <Text style={s.statValue}>{stats.active}</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>OFFERS</Text>
                        <Text style={s.statValue}>{stats.offers}</Text>
                    </View>
                    <View style={s.statCard}>
                        <Text style={s.statLabel}>COMPLETED</Text>
                        <Text style={s.statValue}>{stats.completed}</Text>
                    </View>
                </View>

                <ScrollView style={s.scrollArea} showsVerticalScrollIndicator={false}>

                    {/* ===== NOTIFICATIONS ===== */}
                    {notifications.length > 0 && (
                        <>
                            <View style={s.sectionHeader}>
                                <Text style={s.sectionTitle}>🔔 Notifications</Text>
                                <View style={s.notifAmberBadge}>
                                    <Text style={s.notifAmberBadgeText}>{notifications.length}</Text>
                                </View>
                            </View>
                            {notifications.slice(0, 5).map((notif, index) => {
                                const notifData = notif.data ? (typeof notif.data === 'string' ? JSON.parse(notif.data) : notif.data) : {};
                                return (
                                    <TouchableOpacity
                                        key={notif.id || index}
                                        style={s.notifCard}
                                        onPress={() => {
                                            if (notifData.job_id) {
                                                if (notif.type === 'new_bid' || notif.type === 'bid_accepted' || notif.type === 'bid_rejected' || notif.type === 'new_review') {
                                                    router.push({ pathname: '/job/[id]', params: { id: String(notifData.job_id) } });
                                                } else if (notif.type === 'new_message' && notifData.chat_id) {
                                                    router.push({ pathname: '/chat/[id]', params: { id: String(notifData.chat_id) } });
                                                }
                                            }
                                        }}
                                    >
                                        <View style={[s.notifDot, { backgroundColor: notif.type === 'new_bid' ? '#D9A441' : notif.type === 'bid_accepted' ? '#059669' : notif.type === 'new_message' ? '#2563EB' : notif.type === 'new_review' ? '#F59E0B' : '#6B7280' }]} />
                                        <View style={{ flex: 1 }}>
                                            <Text style={s.notifTitle}>{notif.title}</Text>
                                            <Text style={s.notifBody}>{notif.body}</Text>
                                            <Text style={s.notifTime}>
                                                {notif.created_at ? new Date(notif.created_at).toLocaleString() : 'Just now'}
                                            </Text>
                                        </View>
                                        <Text style={{ color: '#9CA3AF', fontSize: 16 }}>›</Text>
                                    </TouchableOpacity>
                                );
                            })}
                            <View style={s.divider} />
                        </>
                    )}

                    {/* ===== JOBS SECTION ===== */}
                    <View style={s.sectionHeader}>
                        <Text style={s.sectionTitle}>📋 My Jobs</Text>
                        <Text style={s.sectionCount}>{jobs.length}</Text>
                    </View>

                    {/* Job Tabs */}
                    {jobs.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 14 }} contentContainerStyle={{ gap: 6 }}>
                            {[
                                { key: 'New', label: '🆕 New', filter: j => j.status === 'open' && (j.bids_count === 0 && (!j.bids || j.bids.length === 0)) },
                                { key: 'Offers', label: '💬 With Offers', filter: j => j.status === 'open' && (j.bids_count > 0 || (j.bids && j.bids.length > 0)) },
                                { key: 'Active', label: '🔧 In Progress', filter: j => j.status === 'assigned' || j.status === 'in_progress' },
                                { key: 'Completed', label: '✅ Completed', filter: j => j.status === 'completed' },
                                { key: 'Cancelled', label: '❌ Cancelled', filter: j => j.status === 'cancelled' },
                            ].map(tab => {
                                const count = jobs.filter(tab.filter).length;
                                return (
                                    <TouchableOpacity
                                        key={tab.key}
                                        style={[s.jobTab, activeJobTab === tab.key && s.jobTabActive]}
                                        onPress={() => setActiveJobTab(tab.key)}
                                    >
                                        <Text style={[s.jobTabText, activeJobTab === tab.key && s.jobTabTextActive]}>{tab.label}</Text>
                                        {count > 0 && (
                                            <View style={[s.jobTabBadge, activeJobTab === tab.key && s.jobTabBadgeActive]}>
                                                <Text style={[s.jobTabBadgeText, activeJobTab === tab.key && s.jobTabBadgeTextActive]}>{count}</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    )}

                    {jobs.length === 0 ? (
                        <View style={s.emptyState}>
                            <Text style={s.emptyIcon}>📭</Text>
                            <Text style={s.emptyTitle}>No jobs yet</Text>
                            <Text style={s.emptyDesc}>Post your first job and receive offers from verified handymen.</Text>
                            <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/post-job')}>
                                <Text style={s.primaryBtnText}>Post a Job</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        (() => {
                            const jobTabs = [
                                { key: 'New', filter: j => j.status === 'open' && (j.bids_count === 0 && (!j.bids || j.bids.length === 0)) },
                                { key: 'Offers', filter: j => j.status === 'open' && (j.bids_count > 0 || (j.bids && j.bids.length > 0)) },
                                { key: 'Active', filter: j => j.status === 'assigned' || j.status === 'in_progress' },
                                { key: 'Completed', filter: j => j.status === 'completed' },
                                { key: 'Cancelled', filter: j => j.status === 'cancelled' },
                            ];
                            const activeFilter = jobTabs.find(t => t.key === activeJobTab)?.filter || (() => true);
                            const filteredJobs = jobs.filter(activeFilter);
                            if (filteredJobs.length === 0) {
                                return (
                                    <View style={s.emptyState}>
                                        <Text style={s.emptyIcon}>📭</Text>
                                        <Text style={s.emptyTitle}>No {activeJobTab.toLowerCase()} jobs</Text>
                                        <Text style={s.emptyDesc}>
                                            {activeJobTab === 'New' ? 'Post your first job and receive offers from verified handymen.' : 'No jobs in this category yet.'}
                                        </Text>
                                        {activeJobTab === 'New' && (
                                            <TouchableOpacity style={s.primaryBtn} onPress={() => router.push('/post-job')}>
                                                <Text style={s.primaryBtnText}>Post a Job</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                );
                            }
                            return filteredJobs.map((job, index) => {
                                const st = getStatusStyle(job.status);
                                return (
                                <View key={job.id || index} style={s.jobTicket}>
                                    <TouchableOpacity onPress={() => router.push({ pathname: '/job/[id]', params: { id: String(job.id) } })}>
                                        {job.photo_url && (
                                            <Image
                                                source={{ uri: getJobPhotoUrl(job.photo_url) }}
                                                style={s.ticketPhoto}
                                                resizeMode="cover"
                                            />
                                        )}
                                        <View style={s.ticketBody}>
                                            <View style={s.ticketHeader}>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={s.ticketTitle}>{job.title}</Text>
                                                    <Text style={s.ticketCategory}>{job.category?.name || 'General'}</Text>
                                                </View>
                                                <View style={[s.statusStamp, { backgroundColor: st.bg }]}>
                                                    <View style={[s.statusDot, { backgroundColor: st.dot }]} />
                                                    <Text style={[s.statusText, { color: st.text }]}>{st.label}</Text>
                                                </View>
                                            </View>
                                            <Text style={s.ticketDesc} numberOfLines={2}>{job.description}</Text>
                                        </View>
                                    </TouchableOpacity>
                                    <View style={s.ticketDivider} />
                                    <View style={s.ticketFooter}>
                                        <View style={s.ticketMeta}>
                                            <Text style={s.metaText}>📍 {job.city || 'N/A'}</Text>
                                            <Text style={s.metaText}>📅 {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                            {(job.bids_count > 0 || job.bids?.length > 0) && (
                                                <Text style={s.bidCount}>💬 {job.bids_count || job.bids?.length || 0} bid</Text>
                                            )}
                                            <Text style={s.ticketPrice}>{job.budget_max ? job.budget_max.toLocaleString() : '0'} FCFA</Text>
                                        </View>
                                    </View>

                                    {/* ===== CHAT BUTTON (for assigned jobs) ===== */}
                                    {job.status === 'assigned' && (
                                        <TouchableOpacity 
                                            style={[s.actionBtn, { backgroundColor: '#2563EB' }]}
                                            onPress={() => {
                                                const cId = job.chat?.id || job.id;
                                                router.push({ pathname: '/chat/[id]', params: { id: String(cId) } });
                                            }}
                                        >
                                            <Text style={s.actionBtnText}>💬 Chat with Bricoleur</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* ===== MARK COMPLETE BUTTON ===== */}
                                    {(job.status === 'assigned' || job.status === 'in_progress') && (
                                        <TouchableOpacity 
                                            style={s.completeBtn}
                                            onPress={() => handleCompleteJob(job.id)}
                                        >
                                            <Text style={s.completeBtnText}>✅ Mark as Complete</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* ===== CANCEL JOB BUTTON ===== */}
                                    {(job.status === 'open' || job.status === 'assigned') && (
                                        <TouchableOpacity 
                                            style={s.cancelBtn}
                                            onPress={() => handleCancelJob(job.id)}
                                        >
                                            <Text style={s.cancelBtnText}>❌ Cancel Job</Text>
                                        </TouchableOpacity>
                                    )}

                                    {/* ===== RATE BRICOLEUR BUTTON ===== */}
                                    {job.status === 'completed' && !reviewedJobIds.has(job.id) && (
                                        <TouchableOpacity 
                                            style={s.rateBtn}
                                            onPress={() => openReviewModal(job.id)}
                                        >
                                            <Text style={s.rateBtnText}>⭐ Rate Bricoleur</Text>
                                        </TouchableOpacity>
                                    )}

                                    {job.status === 'completed' && reviewedJobIds.has(job.id) && (
                                        <View style={s.reviewedBadge}>
                                            <Text style={s.reviewedBadgeText}>✅ Reviewed</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        });
                            })()
                    )}
                    <View style={{ height: 30 }} />
                </ScrollView>
            </View>

            {/* ===== REVIEW MODAL ===== */}
            <Modal visible={reviewModalVisible} transparent animationType="slide">
                <View style={s.modalOverlay}>
                    <View style={s.modalContent}>
                        <Text style={s.modalTitle}>Rate the Bricoleur</Text>
                        <Text style={s.modalSub}>How was your experience?</Text>

                        <View style={s.starsRow}>
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                                    <Text style={[s.star, star <= reviewRating && s.starActive]}>
                                        {star <= reviewRating ? '★' : '☆'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={s.ratingLabel}>{reviewRating}/5 stars</Text>

                        <Text style={s.inputLabel}>Comment (optional)</Text>
                        <TextInput
                            style={s.commentInput}
                            value={reviewComment}
                            onChangeText={setReviewComment}
                            placeholder="Share your experience..."
                            placeholderTextColor="#9CA3AF"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={s.modalButtons}>
                            <TouchableOpacity style={s.modalCancelBtn} onPress={() => setReviewModalVisible(false)}>
                                <Text style={s.modalCancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.modalSubmitBtn} onPress={submitReview} disabled={reviewSubmitting}>
                                {reviewSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text style={s.modalSubmitBtnText}>Submit Review</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F6F6' },
    sidebar: { width: 240, backgroundColor: '#072E2F', paddingVertical: 24, paddingHorizontal: 16 },
    sidebarLogo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 28, paddingHorizontal: 4 },
    logoIcon: { width: 34, height: 34, backgroundColor: '#D9A441', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    logoIconText: { fontSize: 16, fontWeight: '700', color: '#0B3D3E' },
    logoText: { fontSize: 18, fontWeight: '700', color: 'white' },
    navItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 2, gap: 10 },
    navActive: { backgroundColor: 'rgba(217,164,65,0.15)' },
    navIcon: { fontSize: 16, width: 22, textAlign: 'center' },
    navLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 13, flex: 1 },
    navLabelActive: { color: '#D9A441', fontWeight: '500' },
    badge: { backgroundColor: '#D9A441', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
    badgeText: { color: '#0B3D3E', fontSize: 10, fontWeight: '600' },
    notifRedBadge: { backgroundColor: '#EF4444', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, minWidth: 20, alignItems: 'center' },
    notifRedBadgeText: { color: 'white', fontSize: 10, fontWeight: '700' },
    sidebarFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sidebarUser: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    userAvatar: { width: 32, height: 32, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    userAvatarText: { color: 'white', fontWeight: '600', fontSize: 13 },
    userName: { color: 'white', fontSize: 12, fontWeight: '500' },
    userRole: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
    logoutBtn: { padding: 6 },
    logoutBtnText: { fontSize: 16 },
    main: { flex: 1, paddingHorizontal: 28, paddingVertical: 24 },
    topbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
    pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
    refreshBtn: { padding: 8, backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
    refreshBtnText: { fontSize: 18 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, backgroundColor: 'white', borderRadius: 12, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
    statLabel: { fontSize: 10, fontWeight: '500', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
    statValue: { fontSize: 26, fontWeight: '600', color: '#1A1A1A' },
    scrollArea: { flex: 1 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    notifAmberBadge: { backgroundColor: '#D9A441', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    notifAmberBadgeText: { color: '#0B3D3E', fontSize: 11, fontWeight: '600' },
    notifCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
    notifDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
    notifTitle: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },
    notifBody: { fontSize: 12, color: '#6B7280', marginTop: 2, lineHeight: 18 },
    notifTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4 },
    divider: { borderTopWidth: 1, borderColor: '#E5E7EB', marginVertical: 14 },
    sectionCount: { fontSize: 12, color: '#9CA3AF', backgroundColor: '#E5E7EB', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    primaryBtn: { backgroundColor: '#D9A441', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 6 },
    primaryBtnText: { color: '#0B3D3E', fontWeight: '600', fontSize: 13 },
    jobTicket: { backgroundColor: 'white', borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB', overflow: 'hidden' },
    ticketPhoto: { width: '100%', height: 180 },
    ticketBody: { padding: 16 },
    ticketHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    ticketTitle: { fontSize: 15, fontWeight: '600', color: '#1A1A1A' },
    ticketCategory: { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
    statusStamp: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    ticketDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
    ticketDivider: { borderTopWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    ticketFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FAFBFC', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    ticketMeta: { flexDirection: 'row', gap: 12 },
    metaText: { fontSize: 11, color: '#9CA3AF' },
    bidCount: { fontSize: 11, color: '#D9A441', fontWeight: '600' },
    ticketPrice: { fontSize: 14, fontWeight: '600', color: '#D9A441' },
    actionBtn: { paddingVertical: 10, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    actionBtnText: { color: 'white', fontWeight: '700', fontSize: 13 },
    completeBtn: { backgroundColor: '#059669', paddingVertical: 12, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    completeBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
    cancelBtn: { backgroundColor: '#FEE2E2', paddingVertical: 10, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    cancelBtnText: { color: '#991B1B', fontWeight: '600', fontSize: 13 },
    rateBtn: { backgroundColor: '#D9A441', paddingVertical: 12, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    rateBtnText: { color: '#0B3D3E', fontWeight: '700', fontSize: 13 },
    reviewedBadge: { backgroundColor: '#E6F4F2', paddingVertical: 10, alignItems: 'center', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    reviewedBadgeText: { color: '#0F766E', fontWeight: '600', fontSize: 12 },

    // Modal
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { backgroundColor: 'white', borderRadius: 16, padding: 24, width: '90%', maxWidth: 420 },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', textAlign: 'center' },
    modalSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 20 },
    starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 },
    star: { fontSize: 36, color: '#D1D5DB' },
    starActive: { color: '#F59E0B' },
    ratingLabel: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 18 },
    inputLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
    commentInput: { backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#111827', minHeight: 90, marginBottom: 20 },
    modalButtons: { flexDirection: 'row', gap: 10 },
    modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#F3F4F6', alignItems: 'center' },
    modalCancelBtnText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
    modalSubmitBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: '#D9A441', alignItems: 'center' },
    modalSubmitBtnText: { color: '#0B3D3E', fontWeight: '600', fontSize: 14 },
    emptyState: { alignItems: 'center', paddingVertical: 40, backgroundColor: 'white', borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed' },
    emptyIcon: { fontSize: 40, marginBottom: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
    emptyDesc: { fontSize: 13, color: '#6B7280', marginBottom: 16, textAlign: 'center', paddingHorizontal: 20 },
    statusBanner: { borderRadius: 8, padding: 12, marginBottom: 14, borderWidth: 1 },
    statusBannerError: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
    statusBannerSuccess: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
    statusText: { fontSize: 13, lineHeight: 20 },
    statusTextError: { color: '#991B1B' },
    statusTextSuccess: { color: '#166534' },
    jobTab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'white', borderWidth: 1.5, borderColor: '#E5E7EB' },
    jobTabActive: { backgroundColor: '#0B3D3E', borderColor: '#0B3D3E' },
    jobTabText: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
    jobTabTextActive: { color: 'white', fontWeight: '600' },
    jobTabBadge: { backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8 },
    jobTabBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
    jobTabBadgeText: { fontSize: 10, fontWeight: '600', color: '#6B7280' },
    jobTabBadgeTextActive: { color: 'white' },
});