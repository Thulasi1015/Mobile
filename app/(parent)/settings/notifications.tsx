import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { usePushNotifications } from '../../../hooks/usePushNotifications';
import { storage } from '../../../utils/storage';
import { Colors } from '../../../constants/Colors';

export default function NotificationSettingsScreen() {
    const router = useRouter();
    const [preferences, setPreferences] = useState({
        attendance: true,
        performance: true,
        news: true,
        reminders: true
    });

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        const saved = await storage.load('notification_preferences');
        if (saved) {
            setPreferences(saved);
        }
    };

    const toggleSwitch = async (key: keyof typeof preferences) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);
        await storage.save('notification_preferences', newPreferences);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Alert Types</Text>

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.label}>Attendance Alerts</Text>
                        <Text style={styles.description}>Get notified when your child is absent or late</Text>
                    </View>
                    <Switch
                        value={preferences.attendance}
                        onValueChange={() => toggleSwitch('attendance')}
                        trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    />
                </View>

                <View style={styles.separator} />

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.label}>Performance Updates</Text>
                        <Text style={styles.description}>Exam results and grade reports</Text>
                    </View>
                    <Switch
                        value={preferences.performance}
                        onValueChange={() => toggleSwitch('performance')}
                        trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    />
                </View>

                <View style={styles.separator} />

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.label}>School News</Text>
                        <Text style={styles.description}>Announcements and events</Text>
                    </View>
                    <Switch
                        value={preferences.news}
                        onValueChange={() => toggleSwitch('news')}
                        trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    />
                </View>

                <View style={styles.separator} />

                <View style={styles.row}>
                    <View style={styles.rowText}>
                        <Text style={styles.label}>General Reminders</Text>
                        <Text style={styles.description}>Fee deadlines and holiday notices</Text>
                    </View>
                    <Switch
                        value={preferences.reminders}
                        onValueChange={() => toggleSwitch('reminders')}
                        trackColor={{ false: Colors.gray[300], true: Colors.primary }}
                    />
                </View>
            </View>

            <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                    Note: Push notifications must be enabled in your device settings for these preferences to take effect.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    section: {
        marginTop: 20,
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.gray[200],
    },
    sectionHeader: {
        padding: 16,
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[500],
        textTransform: 'uppercase',
    },
    row: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowText: {
        flex: 1,
        marginRight: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: Colors.gray[900],
        marginBottom: 4,
    },
    description: {
        fontSize: 13,
        color: Colors.gray[500],
    },
    separator: {
        height: 1,
        backgroundColor: Colors.gray[100],
        marginLeft: 16,
    },
    infoSection: {
        padding: 20,
    },
    infoText: {
        fontSize: 13,
        color: Colors.gray[500],
        textAlign: 'center',
        lineHeight: 20,
    }
});
