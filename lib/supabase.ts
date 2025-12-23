import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const isValidUrl = (url: string) => {
    try {
        return new URL(url).protocol.startsWith('http');
    } catch {
        return false;
    }
};

const isConfigured = isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseUrl.includes('your_supabase_project_url');

if (!isConfigured) {
    console.warn('⚠️ Supabase not configured. Using fallback to prevent crash. Check .env');
}

// Custom storage adapter to handle Web SSR (where window is undefined)
const ExpoStorage = {
    getItem: (key: string) => {
        if (Platform.OS === 'web' && typeof window === 'undefined') {
            return Promise.resolve(null);
        }
        return AsyncStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
        if (Platform.OS === 'web' && typeof window === 'undefined') {
            return Promise.resolve();
        }
        return AsyncStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
        if (Platform.OS === 'web' && typeof window === 'undefined') {
            return Promise.resolve();
        }
        return AsyncStorage.removeItem(key);
    },
};

const createSafeClient = () => {
    try {
        const clientUrl = isConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co';
        const clientKey = isConfigured ? supabaseAnonKey : 'placeholder-key';

        return createClient(clientUrl, clientKey, {
            auth: {
                storage: ExpoStorage,
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: false,
            },
        });
    } catch (error) {
        console.warn('Supabase client creation failed. Using fallback.', error);
        // Absolute fallback to prevent crash
        return createClient('https://fallback.supabase.co', 'fallback', {
            auth: {
                storage: ExpoStorage,
                persistSession: false,
                autoRefreshToken: false,
                detectSessionInUrl: false,
            }
        });
    }
};

export const supabase = createSafeClient();
