import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { academicService, SyllabusTopic } from '../../services/academic.service';
import { Colors } from '../../constants/Colors';

export default function SyllabusScreen() {
    const { childId } = useLocalSearchParams();
    const [sections, setSections] = useState<{ title: string; data: SyllabusTopic[] }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSyllabus();
    }, [childId]);

    const loadSyllabus = async () => {
        if (!childId) return;
        try {
            const data = await academicService.getSyllabus(childId as string);

            // Group by subject
            const grouped = data.reduce((acc, topic) => {
                if (!acc[topic.subject]) {
                    acc[topic.subject] = [];
                }
                acc[topic.subject].push(topic);
                return acc;
            }, {} as Record<string, SyllabusTopic[]>);

            const sectionData = Object.keys(grouped).map(subject => ({
                title: subject,
                data: grouped[subject]
            }));

            setSections(sectionData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed': return 'checkmark-circle';
            case 'In Progress': return 'time';
            default: return 'ellipse-outline';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed': return Colors.secondary;
            case 'In Progress': return Colors.warning;
            default: return Colors.gray[400];
        }
    };

    const renderItem = ({ item }: { item: SyllabusTopic }) => (
        <View style={styles.itemContainer}>
            <Ionicons
                name={getStatusIcon(item.status)}
                size={22}
                color={getStatusColor(item.status)}
                style={styles.icon}
            />
            <View style={styles.textContainer}>
                <Text style={styles.topic}>{item.topic}</Text>
                <Text style={[styles.status, { color: getStatusColor(item.status) }]}>
                    {item.status} {item.completionDate && `• ${item.completionDate}`}
                </Text>
            </View>
        </View>
    );

    const renderSectionHeader = ({ section: { title } }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
    );

    if (loading) {
        return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                contentContainerStyle={styles.listContent}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={<Text style={styles.empty}>No syllabus data available.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray[100],
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 16,
    },
    sectionHeader: {
        backgroundColor: Colors.gray[100],
        paddingVertical: 8,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray[800],
        backgroundColor: Colors.white,
        padding: 10,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        marginLeft: 8, // Indent items slightly
    },
    icon: {
        marginRight: 12,
    },
    textContainer: {
        flex: 1,
    },
    topic: {
        fontSize: 16,
        color: Colors.gray[900],
        marginBottom: 4,
    },
    status: {
        fontSize: 12,
    },
    empty: {
        textAlign: 'center',
        marginTop: 20,
        color: Colors.gray[600],
    },
});
