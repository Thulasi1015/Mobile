export const supabase = {
    auth: {
        signInWithOtp: jest.fn(),
        verifyOtp: jest.fn(),
        signOut: jest.fn(),
        getSession: jest.fn(),
    },
    from: jest.fn(() => ({
        select: jest.fn(() => ({
            eq: jest.fn(() => ({
                single: jest.fn(),
                order: jest.fn(),
            })),
            single: jest.fn(),
        })),
        insert: jest.fn(() => ({
            select: jest.fn(() => ({
                single: jest.fn(),
            })),
        })),
        update: jest.fn(() => ({
            eq: jest.fn(() => ({
                select: jest.fn(() => ({
                    single: jest.fn(),
                })),
            })),
        })),
        delete: jest.fn(() => ({
            eq: jest.fn(),
        })),
    })),
};
