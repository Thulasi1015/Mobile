import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Colors } from '../../constants/Colors';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const router = useRouter();
    const { signIn } = useAuth();

    const handleSendOtp = async () => {
        if (phone.length < 10) {
            alert('Please enter a valid phone number');
            return;
        }
        await signIn(phone);
        router.push({ pathname: '/auth/otp', params: { phone } });
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to access your child's progress</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Mobile Number</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter 10-digit number"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                        maxLength={10}
                        placeholderTextColor={Colors.gray[400]}
                    />

                    <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                        <Text style={styles.buttonText}>Get OTP</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.white,
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: Colors.gray[900],
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.gray[600],
    },
    form: {
        gap: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[800],
        marginBottom: -8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray[300],
        borderRadius: 8,
        padding: 16,
        fontSize: 18,
        backgroundColor: Colors.gray[100],
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
