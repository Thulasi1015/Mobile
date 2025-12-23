import React, { createContext, useState, useContext, useEffect } from 'react';
import { storage } from '../utils/storage';
import { useRouter, useSegments } from 'expo-router';
import { authService } from '../services/auth.service';
import { UserProfile } from '../types/user.types';

interface AuthContextType {
    user: any | null;
    isLoading: boolean;
    signIn: (phone: string) => Promise<void>;
    verifyOtp: (code: string) => Promise<boolean>;
    signOut: () => Promise<void>;
    updateUser: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    verifyOtp: async () => false,
    signOut: async () => { },
    updateUser: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
    const rootSegment = useSegments()[0];
    const router = useRouter();

    useEffect(() => {
        // Check for persisted user and onboarding state
        const checkBootstrap = async () => {
            try {
                const [userData, onboardingStatus] = await Promise.all([
                    storage.load('user_session'),
                    storage.load('has_seen_onboarding')
                ]);

                if (userData) {
                    setUser(userData);
                }
                if (onboardingStatus) {
                    setHasSeenOnboarding(true);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        checkBootstrap();
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = rootSegment === 'auth';
        const inOnboarding = rootSegment === 'onboarding';

        if (!hasSeenOnboarding && !inOnboarding) {
            // Redirect to onboarding if not seen and not already there
            router.replace('/onboarding');
        } else if (hasSeenOnboarding && !user && !inAuthGroup) {
            // Redirect to login if seen onboarding, not auth, and not in auth group
            router.replace('/auth/login');
        } else if (user && inAuthGroup) {
            // Redirect to dashboard if authenticated
            router.replace('/dashboard');
        }
    }, [user, rootSegment, isLoading]);

    const [tempPhone, setTempPhone] = useState('');

    // ... useEffect ...

    const signIn = async (phone: string) => {
        try {
            setTempPhone(phone);
            await authService.login(phone);
        } catch (error: any) {
            console.error('Login failed', error);
            throw new Error(error.message || error.response?.data?.message || 'Login failed');
        }
    };

    const verifyOtp = async (code: string) => {
        try {
            // Use stored phone number
            const response = await authService.verifyOtp(tempPhone, code);

            // In a real app, response.user would match UserProfile
            const userSession = {
                ...response.user,
                token: response.token
            };

            setUser(userSession);
            await storage.save('user_session', userSession);
            return true;
        } catch (error) {
            console.error('OTP Verification failed', error);
            return false;
        }
    };

    const signOut = async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.error(e);
        }
        setUser(null);
        await storage.remove('user_session');
    };

    const updateUser = async (data: Partial<UserProfile>) => {
        try {
            const updatedUser = await authService.updateProfile(data);
            const newSession = { ...user, ...updatedUser };
            setUser(newSession);
            await storage.save('user_session', newSession);
        } catch (error) {
            console.error('Update profile failed', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, verifyOtp, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}
