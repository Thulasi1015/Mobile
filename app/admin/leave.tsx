import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService, LeaveRequest } from '../../services/admin.service';
import { Colors } from '../../constants/Colors';

export default function LeaveScreen() {
    const { childId } = useLocalSearchParams();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Form State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        loadLeaves();
    }, [childId]);

    const loadLeaves = async () => {
        try {
            if (!childId) return;
            const data = await adminService.getLeaves(childId as string);
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!startDate || !reason) {
            Alert.alert("Error", "Please fill in required fields.");
            return;
        }

        try {
            const data = await adminService.applyLeave({
                startDate,
                endDate: endDate || startDate,
                reason,
                type: 'Other' // Mock type for now
            });

            const updated = [data, ...requests];
            setRequests(updated);

            setModalVisible(false);
            setStartDate('');
            setEndDate('');
            setReason('');
            Alert.alert("Success", "Leave application submitted.");
        } catch (error) {
            Alert.alert('Error', 'Failed to submit leave application');
        }
    };

    const renderItem = ({ item }: { item: LeaveRequest }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.date}>{item.startDate} {item.endDate !== item.startDate ? `to ${item.endDate}` : ''}</Text>
                    <Text style={styles.reason}>{item.reason}</Text>
                </View>
                <View style={[
                    styles.badge,
                    item.status === 'Approved' ? styles.badgeApproved : item.status === 'Rejected' ? styles.badgeRejected : styles.badgePending
                ]}>
                    <Text style={[
                        styles.badgeText,
                        item.status === 'Approved' ? styles.textApproved : item.status === 'Rejected' ? styles.textRejected : styles.textPending
                    ]}>{item.status}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No leave history.</Text>}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Ionicons name="add" size={30} color={Colors.white} />
            </TouchableOpacity>

            <Modal animationType="slide" transparent={true} visible={modalVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Apply for Leave</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Start Date (YYYY-MM-DD)"
                            placeholderTextColor={Colors.gray[400]}
                            value={startDate}
                            onChangeText={setStartDate}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="End Date (Optional)"
                            placeholderTextColor={Colors.gray[400]}
                            value={endDate}
                            onChangeText={setEndDate}
                        />
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Reason"
                            placeholderTextColor={Colors.gray[400]}
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                                <Text style={styles.submitText}>Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.gray[100],
    },
    list: {
        padding: 16,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: Colors.black,
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    date: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.gray[800],
        marginBottom: 4,
    },
    reason: {
        fontSize: 14,
        color: Colors.gray[600],
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeApproved: { backgroundColor: Colors.successLight }, // Assuming successLight exists or user approximation
    badgePending: { backgroundColor: Colors.warningLight },
    badgeRejected: { backgroundColor: Colors.dangerLight },
    badgeText: { fontSize: 12, fontWeight: '600' },
    textApproved: { color: Colors.success },
    textPending: { color: Colors.warning },
    textRejected: { color: Colors.danger },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: Colors.black,
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.gray[400],
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: Colors.gray[900],
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
        color: Colors.gray[900],
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelBtn: {
        flex: 1,
        padding: 14,
        alignItems: 'center',
        marginRight: 8,
    },
    submitBtn: {
        flex: 1,
        backgroundColor: Colors.primary,
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginLeft: 8,
    },
    cancelText: {
        color: Colors.gray[600],
        fontWeight: '600',
    },
    submitText: {
        color: Colors.white,
        fontWeight: '600',
    }
});
