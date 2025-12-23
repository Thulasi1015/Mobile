import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { studentService } from '../../services/student.service';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';

export default function AddChildScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [name, setName] = useState('');
    const [grade, setGrade] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [age, setAge] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        if (isEditing) {
            loadChildDetails();
        }
    }, [id]);

    const loadChildDetails = async () => {
        setFetching(true);
        try {
            const data = await studentService.getChildDetails(id as string);
            if (data) {
                setName(data.name);
                setGrade(data.grade || '');
                setSchoolName(data.school_name || '');
                setAge(data.age ? data.age.toString() : '');
            }
        } catch (error) {
            console.error('Failed to load child details', error);
            Alert.alert('Error', 'Could not load child details.');
        } finally {
            setFetching(false);
        }
    };

    const handleSave = async () => {
        if (!name || !grade || !schoolName || !age) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (!user || !user.id) {
            Alert.alert('Error', 'You must be logged in to manage children');
            return;
        }

        setLoading(true);

        try {
            if (isEditing) {
                const { error } = await supabase
                    .from('students')
                    .update({
                        name,
                        grade,
                        school_name: schoolName,
                        age: parseInt(age, 10),
                    })
                    .eq('id', id);

                if (error) throw error;

                Alert.alert('Success', 'Child profile updated successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            } else {
                const { error } = await supabase.from('students').insert({
                    parent_id: user.id,
                    name,
                    grade,
                    school_name: schoolName,
                    age: parseInt(age, 10),
                });

                if (error) throw error;

                Alert.alert('Success', 'Child profile added successfully', [
                    { text: 'OK', onPress: () => router.back() }
                ]);
            }
        } catch (e: any) {
            console.error(e);
            Alert.alert('Error', e.message || 'Failed to save child profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient
                colors={[Colors.primary, Colors.primaryDark, Colors.dark]}
                style={styles.header}
            >
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={Colors.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEditing ? 'Edit Student' : 'Add New Student'}</Text>
                <Text style={styles.headerSubtitle}>{isEditing ? 'Update student details' : 'Enter details to track progress'}</Text>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.form}>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="person-outline" size={20} color={Colors.gray[500]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. John Doe"
                                value={name}
                                onChangeText={setName}
                                placeholderTextColor={Colors.gray[400]}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                            <Text style={styles.label}>Age</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="calendar-outline" size={20} color={Colors.gray[500]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 10"
                                    value={age}
                                    onChangeText={setAge}
                                    keyboardType="numeric"
                                    placeholderTextColor={Colors.gray[400]}
                                />
                            </View>
                        </View>

                        <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                            <Text style={styles.label}>Grade/Class</Text>
                            <View style={styles.inputContainer}>
                                <Ionicons name="school-outline" size={20} color={Colors.gray[500]} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 5th"
                                    value={grade}
                                    onChangeText={setGrade}
                                    placeholderTextColor={Colors.gray[400]}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>School Name</Text>
                        <View style={styles.inputContainer}>
                            <Ionicons name="business-outline" size={20} color={Colors.gray[500]} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="e.g. Springfield Elementary"
                                value={schoolName}
                                onChangeText={setSchoolName}
                                placeholderTextColor={Colors.gray[400]}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, loading && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={loading}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[Colors.primary, Colors.primaryDark]}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.saveButtonText}>
                                {loading ? 'Saving...' : isEditing ? 'Update Profile' : 'Save Student Profile'}
                            </Text>
                            {!loading && <Ionicons name="checkmark-circle-outline" size={20} color={Colors.white} style={{ marginLeft: 8 }} />}
                        </LinearGradient>
                    </TouchableOpacity>

                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light,
    },
    header: {
        paddingTop: 60,
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
        marginBottom: 10,
    },
    backButton: {
        marginBottom: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    form: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.gray[600],
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.gray[200],
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        shadowColor: Colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: Colors.gray[800],
    },
    saveButton: {
        marginTop: 30,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    gradientButton: {
        paddingVertical: 18,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    disabledButton: {
        opacity: 0.7,
    },
    saveButtonText: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
