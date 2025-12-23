import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { NotificationItem } from '../../types/notification.types';
import { storage } from '../../utils/storage';
import { Colors } from '../../constants/Colors';

export default function NotificationsScreen() {
    const [activeTab, setActiveTab] = useState<'All' | 'Unread'>('All');
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const navigation = useNavigation();

    useEffect(() => {
        loadNotifications();
    }, []);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => router.push('/settings/notifications' as any)} style={{ marginRight: 16 }}>
                    <Ionicons name="settings-outline" size={24} color={Colors.primary} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // ... existing logic ...

    const loadNotifications = async () => {
        let data: NotificationItem[] = (await storage.load('notifications')) || [];
        if (data.length === 0) {
            data = [
                { id: '1', title: 'Welcome', body: 'Welcome to the Parent Portal!', date: new Date().toISOString(), read: false, type: 'info' },
                { id: '2', title: 'New Grade', body: 'John scored A in Math', date: new Date(Date.now() - 86400000).toISOString(), read: true, type: 'alert' },
                { id: '3', title: 'Attendance Alert', body: 'Sarah was marked absent today', date: new Date().toISOString(), read: false, type: 'reminder' }
            ];
            await storage.save('notifications', data);
        }
        setNotifications(data);
        setLoading(false);
    };

    const markAsRead = async (id: string) => {
        const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
        setNotifications(updated);
        await storage.save('notifications', updated);
    };

    const filteredNotifications = activeTab === 'All'
        ? notifications
        : notifications.filter(n => !n.read);

    const renderItem = ({ item }: { item: NotificationItem }) => (
        <TouchableOpacity
            style={[styles.item, !item.read && styles.unreadItem]}
            onPress={() => markAsRead(item.id)}
        >
            <View style={styles.iconContainer}>
                <Ionicons
                    name={item.type === 'alert' ? 'alert-circle' : item.type === 'reminder' ? 'time' : 'information-circle'}
                    size={24}
                    color={item.read ? Colors.gray[400] : Colors.primary}
                />
            </View>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={[styles.title, !item.read && styles.bold]}>{item.title}</Text>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                </View>
                <Text style={[styles.body, !item.read && styles.bodyBold]} numberOfLines={2}>{item.body}</Text>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'All' && styles.activeTab]}
                    onPress={() => setActiveTab('All')}
                >
                    <Text style={[styles.tabText, activeTab === 'All' && styles.activeTabText]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Unread' && styles.activeTab]}
                    onPress={() => setActiveTab('Unread')}
                >
                    <Text style={[styles.tabText, activeTab === 'Unread' && styles.activeTabText]}>Unread</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={filteredNotifications}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNotifications} colors={[Colors.primary]} />}
                ListEmptyComponent={<Text style={styles.empty}>No notifications found.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    tabs: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    tab: {
        marginRight: 20,
        paddingBottom: 8,
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: 16,
        color: Colors.gray[600],
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    list: {
        padding: 0,
    },
    item: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[100],
        alignItems: 'center',
    },
    unreadItem: {
        backgroundColor: Colors.gray[100], // Or a very light primary tint if available
    },
    iconContainer: {
        marginRight: 16,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    title: {
        fontSize: 16,
        color: Colors.gray[900],
    },
    bold: {
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        color: Colors.gray[500],
    },
    body: {
        fontSize: 14,
        color: Colors.gray[600],
    },
    bodyBold: {
        color: Colors.gray[900],
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginLeft: 8,
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.gray[400],
    }
});
