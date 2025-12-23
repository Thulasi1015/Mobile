import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl, StatusBar } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ChildProfile } from '../../types/child.types';
import { studentService } from '../../services/student.service';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Colors } from '../../constants/Colors';

export default function DashboardScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [children, setChildren] = useState<ChildProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good Morning');
        else if (hour < 18) setGreeting('Good Afternoon');
        else setGreeting('Good Evening');
    }, []);

    const loadChildren = useCallback(async () => {
        setLoading(true);
        try {
            const data = await studentService.getChildren();
            setChildren(data);
        } catch (error) {
            console.error('Failed to load children', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Register Push Token
    const { expoPushToken } = usePushNotifications();
    useEffect(() => {
        if (expoPushToken) {
            authService.savePushToken(expoPushToken).catch(err => console.log('Token save failed', err));
        }
    }, [expoPushToken]);

    useFocusEffect(
        useCallback(() => {
            loadChildren();
        }, [loadChildren])
    );

    const renderChildCard = ({ item, index }: { item: ChildProfile, index: number }) => (
        <View>
            <TouchableOpacity
                activeOpacity={0.9}
                style={styles.card}
                onPress={() => router.push(`/children/${item.id}`)}
            >
                <View style={styles.cardContent}>
                    <View style={[styles.avatarContainer, { backgroundColor: getRandomColor(item.id) }]}>
                        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                        <Text style={styles.childName}>{item.name}</Text>
                        <Text style={styles.childDetail}>{item.grade} • {item.school_name}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray[300]} />
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark, Colors.dark]}
                style={styles.headerGradient}
            >
                <View style={styles.headerContent}>
                    <View>
                        <Text style={styles.greeting}>{greeting},</Text>
                        <Text style={styles.userName}>{user?.name || 'Parent'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push('/children/add')}
                    >
                        <Ionicons name="add" size={28} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <View style={styles.contentContainer}>
                <Text style={styles.sectionTitle}>My Children</Text>
                <FlatList
                    data={children}
                    keyExtractor={(item) => item.id}
                    renderItem={renderChildCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={loading} onRefresh={loadChildren} colors={[Colors.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={60} color={Colors.gray[300]} />
                            <Text style={styles.emptyText}>No children added yet.</Text>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => router.push('/children/add')}
                            >
                                <Text style={styles.emptyButtonText}>Add Your First Child</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>
        </View>
    );
}

const getRandomColor = (id: string) => {
    // Keeping these varied for avatars, or could map to Colors.primary, etc.
    const colors = [Colors.danger, Colors.secondary, Colors.gray[600], Colors.warning, Colors.info];
    const index = id.charCodeAt(id.length - 1) % colors.length;
    return colors[index];
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    headerGradient: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    greeting: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 4,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
    },
    addButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        marginTop: -20,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
        marginTop: 30,
        color: Colors.gray[800],
    },
    listContent: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 16,
    },
    childName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray[800],
        marginBottom: 4,
    },
    childDetail: {
        fontSize: 14,
        color: Colors.gray[500],
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 16,
        color: Colors.gray[400],
        marginVertical: 16,
    },
    emptyButton: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    emptyButtonText: {
        color: Colors.white,
        fontWeight: '600',
    },
});
