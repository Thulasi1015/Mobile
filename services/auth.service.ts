import { supabase } from '../lib/supabase';
import { UserProfile } from '../types/user.types';

// Service Functions
export const authService = {
    login: async (phone: string) => {
        const { error } = await supabase.auth.signInWithOtp({
            phone: `+${phone}`, // Ensure phone has country code if needed, or pass as is if user enters it
        });
        if (error) throw error;
        return { message: 'OTP sent' };
    },

    verifyOtp: async (phone: string, code: string) => {
        const { data, error } = await supabase.auth.verifyOtp({
            phone: `+${phone}`,
            token: code,
            type: 'sms',
        });

        if (error) throw error;
        if (!data.session) throw new Error('No session created');

        // Fetch user profile from 'profiles' table (auto-created via trigger)
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .single();

        if (profileError || !profile) {
            // Fallback: If trigger failed, manually create the profile row
            const newProfile = {
                id: data.session.user.id,
                phone: data.session.user.phone,
                name: 'New Parent',
                email: '',
            };

            const { error: insertError } = await supabase
                .from('profiles')
                .insert(newProfile);

            if (insertError) {
                console.error("Failed to create backup profile row:", insertError);
            }

            return {
                token: data.session.access_token,
                user: newProfile
            };
        }

        return {
            token: data.session.access_token,
            user: profile
        };
    },

    logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    updateProfile: async (data: Partial<UserProfile>) => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) throw new Error('No user logged in');

        const { data: updatedUser, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', session.session.user.id)
            .select()
            .single();

        if (error) throw error;
        return updatedUser;
    },

    savePushToken: async (token: string) => {
        const { data: session } = await supabase.auth.getSession();
        if (session.session) {
            // Check if column exists or use meta-data if table not updated yet
            // Assuming 'push_token' column exists in 'profiles'
            await supabase
                .from('profiles')
                .update({ push_token: token } as any)
                .eq('id', session.session.user.id);
        }
    }
};
