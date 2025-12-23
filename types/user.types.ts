export interface UserProfile {
    id: string;
    name: string;
    email?: string;
    phone: string;
    avatar?: string;
}

export interface UserSession {
    user: UserProfile;
    token: string;
}
