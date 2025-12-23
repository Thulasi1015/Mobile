import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PerformanceReport } from '../../types/child.types';
import { studentService } from '../../services/student.service';
import { Colors } from '../../constants/Colors';

export default function PerformanceScreen() {
    const { childId } = useLocalSearchParams();
    const router = useRouter();
    const [reports, setReports] = useState<PerformanceReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPerformance();
    }, [childId]);

    const loadPerformance = async () => {
        if (!childId) return;
        try {
            const data = await studentService.getPerformance(childId as string);
            setReports(data);
        } catch (error) {
            console.error('Error loading performance:', error);
        } finally {
            setLoading(false);
        }
    };

    const overallStats = useMemo(() => {
        if (reports.length === 0) return { average: 0, totalExams: 0 };
        const totalScore = reports.reduce((acc, curr) => acc + (curr.score / curr.total) * 100, 0);
        return {
            average: Math.round(totalScore / reports.length),
            totalExams: new Set(reports.map(r => r.date)).size
        };
    }, [reports]);

    const sections = useMemo(() => {
        const groups: { [key: string]: PerformanceReport[] } = {};
        reports.forEach(report => {
            // Group by Date as "Exam Name" proxy
            const dateObj = new Date(report.date);
            const title = `Exam on ${dateObj.toLocaleDateString()}`;
            if (!groups[title]) groups[title] = [];
            groups[title].push(report);
        });

        return Object.keys(groups).map(title => ({
            title,
            data: groups[title]
        }));
    }, [reports]);

    const getGradeColor = (percentage: number) => {
        if (percentage >= 90) return Colors.secondary; // Green
        if (percentage >= 75) return Colors.info;      // Blue
        if (percentage >= 50) return Colors.warning;   // Orange/Yellow
        return Colors.danger;                          // Red
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.overallCard}>
                <View>
                    <Text style={styles.overallLabel}>Overall Performance</Text>
                    <Text style={styles.overallValue}>{overallStats.average}%</Text>
                    <Text style={styles.overallSub}>Average Score</Text>
                </View>
                <View style={[styles.circularIndicator, { borderColor: getGradeColor(overallStats.average) }]}>
                    <Ionicons name="trending-up" size={32} color={getGradeColor(overallStats.average)} />
                </View>
            </View>
        </View>
    );

    const renderSubject = ({ item }: { item: PerformanceReport }) => {
        const percentage = (item.score / item.total) * 100;
        const color = getGradeColor(percentage);

        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.subjectContainer}>
                        <View style={[styles.subjectIcon, { backgroundColor: color + '20' }]}>
                            <Text style={[styles.subjectInitial, { color }]}>{item.subject.charAt(0)}</Text>
                        </View>
                        <Text style={styles.subject}>{item.subject}</Text>
                    </View>
                    <Text style={[styles.grade, { color }]}>{item.grade}</Text>
                </View>

                <View style={styles.scoreContainer}>
                    <View style={styles.scoreRow}>
                        <Text style={styles.scoreText}>{item.score} / {item.total}</Text>
                        <Text style={[styles.percentageText, { color }]}>{percentage.toFixed(1)}%</Text>
                    </View>
                    <View style={styles.progressBarBg}>
                        <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
                    </View>
                </View>

                {item.remarks && (
                    <View style={styles.remarkContainer}>
                        <Ionicons name="information-circle-outline" size={16} color={Colors.gray[400]} />
                        <Text style={styles.remarkText}>{item.remarks}</Text>
                    </View>
                )}
            </View>
        );
    };

    if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.gray[800]} />
                </TouchableOpacity>
                <Text style={styles.title}>Academic Performance</Text>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={item => item.id}
                renderItem={renderSubject}
                renderSectionHeader={({ section: { title } }) => (
                    <Text style={styles.sectionHeader}>{title}</Text>
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.list}
                stickySectionHeadersEnabled={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Ionicons name="school-outline" size={48} color={Colors.gray[300]} />
                        <Text style={styles.emptyText}>No academic records found</Text>
                    </View>
                }
            />
        </View>
    );
}

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
    headerContainer: {
        marginBottom: 20,
    },
    overallCard: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    overallLabel: {
        fontSize: 14,
        color: Colors.gray[500],
        marginBottom: 4,
    },
    overallValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.gray[900],
    },
    overallSub: {
        fontSize: 12,
        color: Colors.gray[400],
    },
    circularIndicator: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 4,
        justifyContent: 'center',
        alignItems: 'center',
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
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    subjectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subjectIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    subjectInitial: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    subject: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray[900],
    },
    grade: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    scoreContainer: {
        marginBottom: 12,
    },
    scoreRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    scoreText: {
        fontSize: 14,
        color: Colors.gray[600],
    },
    percentageText: {
        fontSize: 14,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: Colors.gray[100],
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    remarkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: Colors.gray[100],
    },
    remarkText: {
        marginLeft: 6,
        fontSize: 13,
        color: Colors.gray[500],
        fontStyle: 'italic',
        flex: 1,
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
