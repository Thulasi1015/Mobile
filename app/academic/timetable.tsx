import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { academicService, DaySchedule, TimeSlot } from '../../services/academic.service';
import { Colors } from '../../constants/Colors';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export default function TimetableScreen() {
    const { childId } = useLocalSearchParams();
    const [selectedDay, setSelectedDay] = useState('Mon');
    const [timetable, setTimetable] = useState<DaySchedule[]>([]);

    React.useEffect(() => {
        loadTimetable();
    }, []);

    const loadTimetable = async () => {
        if (!childId) return;
        try {
            const data = await academicService.getTimetable(childId as string);
            setTimetable(data);
        } catch (error) {
            console.error(error);
        }
    };

    const currentDaySchedule = timetable.find(d => d.day === selectedDay);
    const periods = currentDaySchedule ? currentDaySchedule.slots : [];

    const renderPeriod = ({ item }: { item: TimeSlot }) => (
        <View style={styles.periodRow}>
            <View style={styles.timeCol}>
                <Text style={styles.timeText}>{item.time.split(' - ')[0]}</Text>
                <Text style={styles.endTimeText}>{item.time.split(' - ')[1]}</Text>
            </View>
            <View style={styles.infoCol}>
                <Text style={styles.subject}>{item.subject}</Text>
                <Text style={styles.teacher}>{item.teacher}</Text>
            </View>
            <View style={styles.periodBadge}>
                <Text style={styles.periodText}>{item.period}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.dayTabs}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
                    {DAYS.map(day => (
                        <TouchableOpacity
                            key={day}
                            style={[styles.dayTab, selectedDay === day && styles.activeDayTab]}
                            onPress={() => setSelectedDay(day)}
                        >
                            <Text style={[styles.dayText, selectedDay === day && styles.activeDayText]}>{day}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={periods}
                keyExtractor={item => `${selectedDay}-${item.period}`}
                renderItem={renderPeriod}
                contentContainerStyle={styles.list}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    dayTabs: {
        backgroundColor: Colors.gray[100],
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
    },
    tabsContent: {
        padding: 12,
    },
    dayTab: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        backgroundColor: Colors.white,
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.gray[300],
    },
    activeDayTab: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    dayText: {
        color: Colors.gray[600],
        fontWeight: '600',
    },
    activeDayText: {
        color: Colors.white,
    },
    list: {
        padding: 16,
    },
    periodRow: {
        flexDirection: 'row',
        marginBottom: 20,
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        padding: 16,
    },
    timeCol: {
        width: 60,
        marginRight: 16,
        borderRightWidth: 1,
        borderRightColor: Colors.gray[200],
    },
    timeText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.gray[800],
    },
    endTimeText: {
        fontSize: 12,
        color: Colors.gray[500],
    },
    infoCol: {
        flex: 1,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.gray[900],
        marginBottom: 4,
    },
    teacher: {
        fontSize: 14,
        color: Colors.gray[600],
    },
    periodBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.gray[100],
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    periodText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    }
});
