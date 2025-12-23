import { Redirect } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { storage } from '../utils/storage';
import { Colors } from '../constants/Colors';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

    useEffect(() => {
        checkOnboarding();
    }, []);

    const checkOnboarding = async () => {
        try {
            const value = await storage.load('has_seen_onboarding');
            setHasSeenOnboarding(!!value);
        } catch (error) {
            console.error('Error checking onboarding status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    return <Redirect href={hasSeenOnboarding ? "/auth/login" : "/onboarding"} />;
}
