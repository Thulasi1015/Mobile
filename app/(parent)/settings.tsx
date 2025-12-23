import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { usePushNotifications } from '../../hooks/usePushNotifications';
import { Colors } from '../../constants/Colors';

export default function SettingsScreen() {
    const { user, signOut } = useAuth();
    const router = useRouter();
    const { expoPushToken } = usePushNotifications();

    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(false);

    const togglePush = () => setPushEnabled(prev => !prev);
    const toggleEmail = () => setEmailEnabled(prev => !prev);

    const handleCopyToken = () => {
        Alert.alert('Push Token', expoPushToken || 'Not available');
    };

    const handleLogout = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Sign Out", style: "destructive", onPress: signOut }
            ]
        );
    };

    return (
        <ScrollView style={styles.container}>
            {/* Profile Section */}
            <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{user?.name?.[0] || 'U'}</Text>
                </View>
                <Text style={styles.userName}>{user?.name || 'Parent User'}</Text>
                <Text style={styles.userPhone}>{user?.phone || 'No phone linked'}</Text>

                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => router.push('/profile/edit')}
                >
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Settings Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>

                <View style={styles.row}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.rowLabel}>Push Notifications</Text>
                        <Text style={styles.rowDesc}>Receive alerts on this device</Text>
                    </View>
                    <Switch value={pushEnabled} onValueChange={togglePush} trackColor={{ true: Colors.primary }} />
                </View>

                <View style={styles.separator} />

                <TouchableOpacity
                    style={styles.row}
                    onPress={() => router.push('/settings/notifications')}
                >
                    <View style={styles.rowInfo}>
                        <Text style={styles.rowLabel}>Notification Preferences</Text>
                        <Text style={styles.rowDesc}>Manage alert types (Attendance, Grades, etc)</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray[300]} />
                </TouchableOpacity>

                <View style={styles.separator} />

                <View style={styles.row}>
                    <View style={styles.rowInfo}>
                        <Text style={styles.rowLabel}>Email Alerts</Text>
                    </View>
                    <Switch value={emailEnabled} onValueChange={toggleEmail} trackColor={{ true: Colors.primary }} />
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support & About</Text>
                <TouchableOpacity style={styles.row} onPress={handleCopyToken}>
                    <Text style={styles.rowLabel}>Debug Push Token</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.gray[300]} />
                </TouchableOpacity>
                <View style={styles.separator} />
                <TouchableOpacity style={styles.row}>
                    <Text style={styles.rowLabel}>About App</Text>
                    <Text style={styles.version}>v1.0.0</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    profileHeader: {
        backgroundColor: Colors.white,
        alignItems: 'center',
        padding: 30,
        borderBottomWidth: 1,
        borderBottomColor: Colors.gray[200],
        marginBottom: 20,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.gray[200],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.gray[500],
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.gray[900],
        marginBottom: 4,
    },
    userPhone: {
        fontSize: 14,
        color: Colors.gray[600],
        marginBottom: 16,
    },
    editButton: {
        borderWidth: 1,
        borderColor: Colors.primary,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    editButtonText: {
        color: Colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    section: {
        backgroundColor: Colors.white,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.gray[200],
        paddingVertical: 8,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[500],
        marginLeft: 16,
        marginBottom: 8,
        marginTop: 8,
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    rowInfo: {
        flex: 1,
        marginRight: 16,
    },
    rowLabel: {
        fontSize: 16,
        color: Colors.gray[900],
    },
    rowDesc: {
        fontSize: 12,
        color: Colors.gray[500],
        marginTop: 2,
    },
    separator: {
        height: 1,
        backgroundColor: Colors.gray[100],
        marginLeft: 16,
    },
    version: {
        color: Colors.gray[400],
    },
    logoutButton: {
        margin: 20,
        backgroundColor: Colors.white,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.danger,
    },
    logoutText: {
        color: Colors.danger,
        fontSize: 16,
        fontWeight: '600',
    }
});
