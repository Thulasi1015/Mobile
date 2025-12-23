import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function OtpScreen() {
    const { phone } = useLocalSearchParams();
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const { verifyOtp } = useAuth();
    const router = useRouter();

    const handleVerify = async () => {
        if (code.length !== 6) {
            alert('Please enter the 6-digit code');
            return;
        }

        setLoading(true);
        const success = await verifyOtp(code);
        setLoading(false);

        if (success) {
            // Navigation is handled by AuthContext effect
        } else {
            alert('Invalid code.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Verify Phone</Text>
            <Text style={styles.subtitle}>Code sent to {phone}</Text>

            <TextInput
                style={styles.input}
                placeholder="123456"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                maxLength={6}
                autoFocus
                placeholderTextColor={Colors.gray[300]}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleVerify}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.buttonText}>Verify & Login</Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.resend} onPress={() => alert('Resent!')}>
                <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
        padding: 24,
        paddingTop: 80,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.gray[900],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray[600],
        marginBottom: 40,
    },
    input: {
        borderBottomWidth: 2,
        borderBottomColor: Colors.primary,
        fontSize: 32,
        textAlign: 'center',
        padding: 16,
        marginBottom: 40,
        letterSpacing: 8,
        color: Colors.gray[900],
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    resend: {
        marginTop: 24,
        alignItems: 'center',
    },
    resendText: {
        color: Colors.primary,
        fontSize: 16,
    }
});
