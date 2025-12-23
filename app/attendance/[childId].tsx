import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceRecord } from '../../types/child.types';
import { studentService } from '../../services/student.service';
import { Colors } from '../../constants/Colors';

export default function AttendanceScreen() {
    const { childId } = useLocalSearchParams();
    const router = useRouter();
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAttendance();
    }, [childId]);

    const loadAttendance = async () => {
        if (!childId) return;
        try {
            const data = await studentService.getAttendance(childId as string);
            setRecords(data);
        } catch (error) {
            console.error('Error loading attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const summary = useMemo(() => {
        const stats = { Present: 0, Absent: 0, Late: 0, Total: records.length };
        records.forEach(r => {
            if (r.status === 'Present') stats.Present++;
            else if (r.status === 'Absent') stats.Absent++;
            else if (r.status === 'Late') stats.Late++;
        });
        return stats;
    }, [records]);

    const sections = useMemo(() => {
        const groups: { [key: string]: AttendanceRecord[] } = {};
        records.forEach(record => {
            const date = new Date(record.date);
            const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (!groups[monthYear]) groups[monthYear] = [];
            groups[monthYear].push(record);
        });

        return Object.keys(groups).map(title => ({
            title,
            data: groups[title]
        }));
    }, [records]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return Colors.secondary;
            case 'Absent': return Colors.danger;
            case 'Late': return Colors.warning;
            case 'Excuse': return Colors.info;
            case 'Half Day': return Colors.warning; // or another color
            default: return Colors.gray[400];
        }
    };

    const renderItem = ({ item }: { item: AttendanceRecord }) => (
        <View style={styles.card}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                    </View>
                </View>
                <View style={styles.timeContainer}>
                    {item.check_in && (
                        <View style={styles.timeBlock}>
                            <Ionicons name="log-in-outline" size={16} color={Colors.gray[500]} />
                            <Text style={styles.timeText}>{item.check_in}</Text>
                        </View>
                    )}
                    {item.check_out && (
                        <View style={styles.timeBlock}>
                            <Ionicons name="log-out-outline" size={16} color={Colors.gray[500]} />
                            <Text style={styles.timeText}>{item.check_out}</Text>
                        </View>
                    )}
                </View>
                {item.remarks && <Text style={styles.remarks}>{item.remarks}</Text>}
            </View>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.summaryContainer}>
            <SummaryCard label="Present" count={summary.Present} color={Colors.secondary} icon="checkmark-circle" />
            <SummaryCard label="Absent" count={summary.Absent} color={Colors.danger} icon="close-circle" />
            <SummaryCard label="Late" count={summary.Late} color={Colors.warning} icon="time" />
        </View>
    );

    if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.gray[800]} />
                </TouchableOpacity>
                <Text style={styles.title}>Attendance History</Text>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.list}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color={Colors.gray[300]} />
                        <Text style={styles.emptyText}>No attendance records found</Text>
                    </View>
                }
            />
        </View>
    );
}

const SummaryCard = ({ label, count, color, icon }: { label: string, count: number, color: string, icon: any }) => (
    <View style={styles.summaryCard}>
        <View style={[styles.iconBox, { backgroundColor: color + '20' }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.summaryCount}>{count}</Text>
        <Text style={styles.summaryLabel}>{label}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light, // Using light bg
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.gray[800],
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 12,
        marginHorizontal: 4,
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    iconBox: {
        padding: 8,
        borderRadius: 20,
        marginBottom: 8,
    },
    summaryCount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.gray[900],
    },
    summaryLabel: {
        fontSize: 12,
        color: Colors.gray[500],
    },
    list: {
        padding: 16,
    },
    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[500],
        marginBottom: 12,
        marginTop: 8,
        marginLeft: 4,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    statusIndicator: {
        width: 4,
    },
    cardContent: {
        flex: 1,
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    date: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray[800],
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    timeContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    timeBlock: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    timeText: {
        fontSize: 14,
        color: Colors.gray[600],
        marginLeft: 4,
    },
    remarks: {
        marginTop: 4,
        fontSize: 13,
        color: Colors.gray[500],
        fontStyle: 'italic',
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        marginTop: 10,
        color: Colors.gray[400],
    }
});
