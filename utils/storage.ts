import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
    save: async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Failed to save to storage', e);
        }
    },
    load: async <T>(key: string): Promise<T | null> => {
        try {
            const jsonValue = await AsyncStorage.getItem(key);
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    },
    remove: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (e) {
            console.error('Failed to remove from storage', e);
        }
    }
};
