import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService, Invoice } from '../../services/admin.service';
import { Colors } from '../../constants/Colors';

export default function FeesScreen() {
    const { childId } = useLocalSearchParams();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFees();
    }, [childId]);

    const loadFees = async () => {
        try {
            if (!childId) return;
            const data = await adminService.getFees(childId as string);
            setInvoices(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async (invoice: Invoice) => {
        Alert.alert(
            "Confirm Payment",
            `Pay $${invoice.amount} for ${invoice.title}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Pay Now",
                    onPress: async () => {
                        try {
                            await adminService.payFee(invoice.id);
                            // Optimistic update
                            const updated = invoices.map(inv =>
                                inv.id === invoice.id ? { ...inv, status: 'Paid' as const } : inv
                            );
                            setInvoices(updated);
                            Alert.alert("Success", "Payment processed successfully!");
                        } catch (error) {
                            Alert.alert('Error', 'Payment failed');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Invoice }) => (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.title}>{item.title}</Text>
                <View style={[
                    styles.badge,
                    item.status === 'Paid' ? styles.badgePaid : item.status === 'Overdue' ? styles.badgeOverdue : styles.badgeUnpaid
                ]}>
                    <Text style={[
                        styles.badgeText,
                        item.status === 'Paid' ? styles.textPaid : item.status === 'Overdue' ? styles.textOverdue : styles.textUnpaid
                    ]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.details}>
                <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
                <Text style={styles.date}>Due: {item.dueDate}</Text>
            </View>

            {item.status !== 'Paid' && (
                <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item)}>
                    <Text style={styles.payButtonText}>Pay Now</Text>
                    <Ionicons name="card" size={16} color={Colors.white} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator style={{ marginTop: 20 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={invoices}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>No invoices found.</Text>}
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
    list: {
        padding: 16,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.gray[800],
        flex: 1,
        marginRight: 8,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgePaid: { backgroundColor: '#e8f5e9' },
    badgeUnpaid: { backgroundColor: '#fff3e0' },
    badgeOverdue: { backgroundColor: '#ffebee' },
    badgeText: { fontSize: 12, fontWeight: '600' },
    textPaid: { color: '#4caf50' },
    textUnpaid: { color: '#ff9800' },
    textOverdue: { color: '#f44336' },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    amount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.gray[900],
    },
    date: {
        color: Colors.gray[600],
        fontSize: 14,
    },
    payButton: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    payButtonText: {
        color: Colors.white,
        fontWeight: '600',
        fontSize: 16,
    },
    empty: {
        textAlign: 'center',
        marginTop: 40,
        color: Colors.gray[400],
    }
});
