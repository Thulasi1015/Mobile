import { authService } from './auth.service';
import { supabase } from '../lib/supabase';

// Mock the supabase client import
jest.mock('../lib/supabase');

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should receive OTP for valid phone number', async () => {
        // Mock successful OTP send
        (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: null });

        const response = await authService.login('1234567890');
        expect(response.message).toBe('OTP sent');
        expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ phone: '+1234567890' });
    });

    it('should fail for API error', async () => {
        // Mock error response
        (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValue({ error: { message: 'Failed' } });

        try {
            await authService.login('1234567890');
            fail('Should have thrown error');
        } catch (error: any) {
            expect(error.message).toBe('Failed');
        }
    });

    it('should verify correct OTP', async () => {
        const mockSession = { user: { id: 'user-123', phone: '1234567890' }, access_token: 'valid-token' };

        // Mock verify success
        (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({
            data: { session: mockSession },
            error: null
        });

        // Mock profile fetch success
        const mockProfile = { id: 'user-123', name: 'John Doe' };
        // We need to chain mocks for .from().select().eq().single()
        const mockSingle = jest.fn().mockResolvedValue({ data: mockProfile, error: null });
        const mockEq = jest.fn(() => ({ single: mockSingle }));
        const mockSelect = jest.fn(() => ({ eq: mockEq }));
        const mockFrom = jest.fn(() => ({ select: mockSelect }));
        (supabase.from as jest.Mock).mockImplementation(mockFrom);

        const response = await authService.verifyOtp('1234567890', '1234');
        expect(response.token).toBe('valid-token');
        expect(response.user.name).toBe('John Doe');
    });

    it('should reject incorrect OTP', async () => {
        (supabase.auth.verifyOtp as jest.Mock).mockResolvedValue({ data: { session: null }, error: { message: 'Invalid OTP' } });

        try {
            await authService.verifyOtp('1234567890', '0000');
            fail('Should have thrown error');
        } catch (error: any) {
            expect(error.message).toBe('Invalid OTP');
        }
    });
});
