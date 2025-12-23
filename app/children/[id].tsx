import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { ChildProfile } from '../../types/child.types';
import { studentService } from '../../services/student.service';
import { Colors } from '../../constants/Colors';

// const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function ChildProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [child, setChild] = useState<ChildProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadChild();
        }, [id])
    );

    const loadChild = async () => {
        if (!id) return;
        try {
            const data = await studentService.getChildDetails(id as string);
            setChild(data);
        } catch (error) {
            console.error('Error loading child details:', error);
            // Fallback or error state
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            "Delete Profile",
            "Are you sure you want to remove this child profile?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (!id) return;
                            await studentService.deleteChild(id as string);
                            router.back();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete profile');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    if (!child) {
        return (
            <View style={styles.center}>
                <Ionicons name="help-circle-outline" size={50} color={Colors.gray[300]} />
                <Text style={styles.notFoundText}>Child not found</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} bounces={false}>
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                style={styles.header}
            >
                <View style={[styles.avatar, { backgroundColor: getRandomColor(child.id) }]}>
                    <Text style={styles.avatarText}>{child.name.charAt(0)}</Text>
                </View>
                <Text style={styles.name}>{child.name}</Text>
                <Text style={styles.detail}>{child.grade} • {child.school_name || 'No school'}</Text>
                <Text style={styles.subDetail}>Age: {child.age}</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push(`/children/add?id=${child.id}`)}
                >
                    <Ionicons name="create-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
            </LinearGradient>

            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>

                <View style={styles.grid}>
                    <ActionButton
                        index={0}
                        icon="calendar"
                        label="Attendance"
                        color={Colors.secondary}
                        onPress={() => router.push(`/attendance/${child.id}`)}
                    />
                    <ActionButton
                        index={1}
                        icon="stats-chart"
                        label="Performance"
                        color={Colors.danger}
                        onPress={() => router.push(`/performance/${child.id}`)}
                    />
                    <ActionButton
                        index={2}
                        icon="book"
                        label="Homework"
                        color={Colors.warning}
                        onPress={() => router.push(`/academic/homework?childId=${child.id}`)}
                    />
                    <ActionButton
                        index={3}
                        icon="list"
                        label="Syllabus"
                        color="#9C27B0"
                        onPress={() => router.push(`/academic/syllabus?childId=${child.id}`)}
                    />
                    <ActionButton
                        index={4}
                        icon="time"
                        label="Timetable"
                        color={Colors.gray[600]}
                        onPress={() => router.push(`/academic/timetable?childId=${child.id}`)}
                    />
                    <ActionButton
                        index={5}
                        icon="bus"
                        label="Transport"
                        color="#FFC107"
                        onPress={() => router.push(`/admin/transport?childId=${child.id}`)}
                    />
                    <ActionButton
                        index={6}
                        icon="card"
                        label="Fees"
                        color="#C7F464"
                        onPress={() => router.push(`/admin/fees?childId=${child.id}`)}
                    />
                    <ActionButton
                        index={7}
                        icon="airplane"
                        label="Leave"
                        color={Colors.gray[400]}
                        onPress={() => router.push(`/admin/leave?childId=${child.id}`)}
                    />
                </View>

                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                    <Text style={styles.deleteText}>Remove Profile</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const ActionButton = ({ icon, label, color, onPress, index }: { icon: any, label: string, color: string, onPress: () => void, index: number }) => (
    <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
    >
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
            <Ionicons name={icon} size={24} color={Colors.white} />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
    </TouchableOpacity>
);

const getRandomColor = (id: string) => {
    const colors = [Colors.danger, Colors.secondary, Colors.primary, Colors.warning];
    const index = id.charCodeAt(id.length - 1) % colors.length;
    return colors[index];
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notFoundText: {
        marginTop: 10,
        color: Colors.gray[400],
        fontSize: 16,
    },
    header: {
        paddingTop: 40,
        paddingBottom: 40,
        alignItems: 'center',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.white,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    editButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
    },
    detail: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 2,
    },
    subDetail: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.7)',
    },
    actionsContainer: {
        padding: 20,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray[800],
        marginBottom: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[800],
    },
    deleteButton: {
        marginTop: 20,
        padding: 16,
        alignItems: 'center',
    },
    deleteText: {
        color: Colors.danger,
        fontWeight: '600',
    },
});
