import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
    return (
        <AuthProvider>
            <Stack>
                <Stack.Screen name="(parent)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/login" options={{ headerShown: false }} />
                <Stack.Screen name="auth/otp" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
                <Stack.Screen name="profile/edit" options={{ presentation: 'modal', title: 'Edit Profile' }} />
                <Stack.Screen name="children/add" options={{ presentation: 'modal', title: 'Add Child' }} />
                <Stack.Screen name="children/[id]" options={{ title: 'Child Profile' }} />
                <Stack.Screen name="attendance/[childId]" options={{ title: 'Attendance' }} />
                <Stack.Screen name="performance/[childId]" options={{ title: 'Performance' }} />
                <Stack.Screen name="academic/homework" options={{ title: 'Homework' }} />
                <Stack.Screen name="academic/timetable" options={{ title: 'Timetable' }} />
                <Stack.Screen name="admin/fees" options={{ title: 'School Fees' }} />
                <Stack.Screen name="admin/leave" options={{ title: 'Leave Application' }} />
            </Stack>
        </AuthProvider>
    );
}
