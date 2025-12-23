import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { storage } from '../utils/storage';

// Base API configuration
const API_URL = 'https://api.school-app.com';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
apiClient.interceptors.request.use(
    async (config) => {
        const userSession = await storage.load<{ token: string }>('user_session');
        if (userSession?.token) {
            config.headers.Authorization = `Bearer ${userSession.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Handle unauthorized access (e.g., clear session)
            storage.remove('user_session');
        }
        return Promise.reject(error);
    }
);

// Mock Adapter configuration (Toggle this for real API)
export const mock = new MockAdapter(apiClient, { delayResponse: 500 }); // 500ms delay to simulate network

// MOCK DATA SETUP
// We will initialize mock handlers in a central place or per service file.
// Ideally, we move this to a separate file, but for simplicity, we can export it here.
