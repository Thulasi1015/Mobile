import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function EditProfileScreen() {
    const { user, updateUser } = useAuth();
    const router = useRouter();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [avatar, setAvatar] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);

    console.log('Current User State:', user);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setAvatar(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }

        setLoading(true);
        try {
            await updateUser({ name, email, avatar });
            Alert.alert("Success", "Profile updated successfully", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error(error);
            Alert.alert("Error", "Failed to update profile. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                <Image source={{ uri: avatar || 'https://via.placeholder.com/150' }} style={styles.avatar} />
                <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.gray[400]}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor={Colors.gray[400]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[600],
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.gray[900],
        backgroundColor: Colors.white,
    },
    saveButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.gray[200],
        marginBottom: 8,
    },
    changePhotoButton: {
        padding: 8,
    },
    changePhotoText: {
        color: Colors.primary,
        fontWeight: '600',
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '600',
    },
});
