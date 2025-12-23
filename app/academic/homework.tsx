import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { academicService, Assignment } from '../../services/academic.service';
import { Colors } from '../../constants/Colors';

export default function HomeworkScreen() {
    const { childId } = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadHomework();
    }, [childId]);

    const loadHomework = async () => {
        if (!childId) return;
        try {
            const data = await academicService.getHomework(childId as string);
            setAssignments(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string) => {
        try {
            const assignment = assignments.find(a => a.id === id);
            if (!assignment) return;

            const newStatus: Assignment['status'] = assignment.status === 'Pending' ? 'Completed' : 'Pending';
            // Optimistic update
            const updated = assignments.map(a =>
                a.id === id ? { ...a, status: newStatus } : a
            );
            setAssignments(updated);

            await academicService.updateHomeworkStatus(id, newStatus);
        } catch (error) {
            console.error('Failed to update status', error);
            // Revert if needed
        }
    };

    const filtered = assignments.filter(a => a.status === activeTab);

    const renderItem = ({ item }: { item: Assignment }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.subjectTag}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                </View>
                <Text style={styles.date}>Due: {item.dueDate}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>

            <TouchableOpacity
                style={[styles.statusButton, item.status === 'Completed' && styles.completedBtn]}
                onPress={() => toggleStatus(item.id)}
            >
                <Ionicons
                    name={item.status === 'Completed' ? 'checkmark-circle' : 'radio-button-off'}
                    size={18}
                    color={item.status === 'Completed' ? Colors.secondary : Colors.gray[600]}
                />
                <Text style={[styles.statusText, item.status === 'Completed' && styles.completedText]}>
                    {item.status === 'Completed' ? 'Completed' : 'Mark as Done'}
                </Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Pending' && styles.activeTab]}
                    onPress={() => setActiveTab('Pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'Pending' && styles.activeTabText]}>Pending</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Completed' && styles.activeTab]}
                    onPress={() => setActiveTab('Completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'Completed' && styles.activeTabText]}>Completed</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No assignments found.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray[100],
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        padding: 4,
        margin: 16,
        borderRadius: 8,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: Colors.light,
    },
    tabText: {
        color: Colors.gray[600],
        fontWeight: '600',
    },
    activeTabText: {
        color: Colors.primary,
    },
    list: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    subjectTag: {
        backgroundColor: Colors.gray[100],
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    subjectText: {
        fontSize: 12,
        color: Colors.gray[800],
        fontWeight: '600',
    },
    date: {
        fontSize: 12,
        color: Colors.danger,
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.gray[800],
        marginBottom: 12,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
    },
    completedBtn: {
        opacity: 0.7,
    },
    statusText: {
        fontSize: 14,
        color: Colors.gray[600],
    },
    completedText: {
        color: Colors.secondary,
        fontWeight: '600',
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.gray[400],
    }
});
