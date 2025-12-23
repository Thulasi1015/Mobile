import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated, Dimensions, Alert, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { adminService, BusInfo } from '../../services/admin.service';
import { Colors } from '../../constants/Colors';

const { width } = Dimensions.get('window');

export default function TransportScreen() {
    const { childId } = useLocalSearchParams();
    const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
    const [loading, setLoading] = useState(true);

    // Animation val
    const busPosition = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        loadBusInfo();
    }, [childId]);

    useEffect(() => {
        if (!loading && busInfo) {
            startAnimation();
        }
    }, [loading, busInfo]);

    const loadBusInfo = async () => {
        try {
            const data = await adminService.getBusLocation(childId as string);
            setBusInfo(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(busPosition, {
                    toValue: 1,
                    duration: 5000,
                    useNativeDriver: true,
                }),
                Animated.timing(busPosition, {
                    toValue: 0,
                    duration: 0,
                    useNativeDriver: true,
                })
            ])
        ).start();
    };

    const handleCallDriver = () => {
        if (busInfo) {
            Alert.alert("Call Driver", `Calling ${busInfo.driverName} at ${busInfo.driverPhone}...`);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={Colors.primary} /></View>;

    if (!busInfo) return <View style={styles.center}><Text style={styles.noInfoText}>No transport info available.</Text></View>;

    const busTranslateX = busPosition.interpolate({
        inputRange: [0, 1],
        outputRange: [-20, width - 60] // Animates across the "road"
    });

    return (
        <View style={styles.container}>
            {/* Simulated Map / Route View */}
            <View style={styles.mapContainer}>
                <View style={styles.road}>
                    <View style={styles.roadLine} />
                    <View style={styles.stopStart} />
                    <View style={styles.stopEnd} />
                </View>

                <Animated.View style={[styles.busMarker, { transform: [{ translateX: busTranslateX }] }]}>
                    <Ionicons name="bus" size={24} color={Colors.white} />
                </Animated.View>

                <View style={styles.locationLabel}>
                    <Text style={styles.locationText}>School</Text>
                    <Text style={styles.locationText}>Home</Text>
                </View>

                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{busInfo.status}</Text>
                </View>
            </View>

            {/* Info Card */}
            <View style={styles.card}>
                <View style={styles.driverHeader}>
                    <View style={styles.driverAvatar}>
                        <Ionicons name="person" size={24} color={Colors.white} />
                    </View>
                    <View style={styles.driverInfo}>
                        <Text style={styles.label}>Driver</Text>
                        <Text style={styles.value}>{busInfo.driverName}</Text>
                        <Text style={styles.subValue}>Plate: {busInfo.plateNumber}</Text>
                    </View>
                    <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                        <Ionicons name="call" size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.divider} />

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Current Location</Text>
                        <Text style={styles.valueLarge}>{busInfo.currentLocation.address}</Text>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={styles.label}>Est. Arrival</Text>
                        <Text style={[styles.valueLarge, { color: Colors.secondary }]}>{busInfo.estimatedArrival}</Text>
                    </View>
                </View>
            </View>
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
    noInfoText: {
        color: Colors.gray[600],
        fontSize: 16,
    },
    mapContainer: {
        height: 250,
        backgroundColor: Colors.gray[300], // Placeholder for map
        justifyContent: 'center',
        overflow: 'hidden',
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        marginBottom: 20,
    },
    road: {
        height: 8,
        backgroundColor: Colors.gray[400],
        marginHorizontal: 30,
        borderRadius: 4,
        position: 'relative',
    },
    roadLine: {
        position: 'absolute',
        top: 3,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: Colors.white,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: Colors.white, // Simplified dashed effect
    },
    stopStart: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.primary,
        position: 'absolute',
        left: -8,
        top: -4,
    },
    stopEnd: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: Colors.secondary,
        position: 'absolute',
        right: -8,
        top: -4,
    },
    busMarker: {
        position: 'absolute',
        top: 110, // Approximate center manually adjusted
        left: 30,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    locationLabel: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 20,
        marginTop: 10,
    },
    locationText: {
        fontWeight: 'bold',
        color: Colors.gray[600],
    },
    statusBadge: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        color: Colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    card: {
        backgroundColor: Colors.white,
        margin: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    driverHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: Colors.gray[300],
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    driverInfo: {
        flex: 1,
    },
    callButton: {
        backgroundColor: Colors.secondary,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: Colors.gray[200],
        marginVertical: 16,
    },
    row: {
        marginBottom: 16,
    },
    col: {
        flex: 1,
    },
    label: {
        fontSize: 12,
        color: Colors.gray[400],
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.gray[800],
    },
    subValue: {
        fontSize: 14,
        color: Colors.gray[600],
    },
    valueLarge: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.gray[800],
    }
});
