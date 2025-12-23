export interface NotificationItem {
    id: string;
    title: string;
    body: string;
    date: string; // ISO string
    read: boolean;
    type: 'alert' | 'info' | 'reminder';
}
