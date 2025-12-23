import { apiClient, mock } from './api.client';

export interface Invoice {
    id: string;
    title: string;
    amount: number;
    dueDate: string;
    status: 'Paid' | 'Unpaid' | 'Overdue';
    date: string;
}

export interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    appliedOn: string;
}

export interface BusInfo {
    id: string;
    routeId: string;
    driverName: string;
    driverPhone: string;
    plateNumber: string;
    currentLocation: { lat: number; lng: number; address: string };
    status: 'On Route' | 'Stopped' | 'Arrived';
    estimatedArrival: string;
}


// Mock Data
const MOCK_FEES: Invoice[] = [
    { id: 'INV-001', title: 'Tuition Fee - Term 1', amount: 1500, dueDate: '2023-11-01', status: 'Unpaid', date: '2023-10-01' },
    { id: 'INV-002', title: 'Bus Fee - Oct', amount: 200, dueDate: '2023-11-05', status: 'Unpaid', date: '2023-10-05' },
    { id: 'INV-003', title: 'Tuition Fee - Term 2', amount: 1500, dueDate: '2023-04-01', status: 'Paid', date: '2023-03-01' },
    { id: 'INV-004', title: 'Book Fee', amount: 300, dueDate: '2023-09-01', status: 'Overdue', date: '2023-08-15' },
];

const MOCK_LEAVES: LeaveRequest[] = [
    { id: '1', type: 'Sick Leave', startDate: '2023-10-24', endDate: '2023-10-24', reason: 'Fever', status: 'Approved', appliedOn: '2023-10-23' },
    { id: '2', type: 'Family Function', startDate: '2023-11-10', endDate: '2023-11-12', reason: 'Wedding', status: 'Pending', appliedOn: '2023-10-26' },
];

const MOCK_BUS_INFO: BusInfo = {
    id: 'BUS-101',
    routeId: 'RT-05',
    driverName: 'Rajesh Kumar',
    driverPhone: '+91 98765 43210',
    plateNumber: 'KA-01-AB-1234',
    currentLocation: { lat: 12.9716, lng: 77.5946, address: 'MG Road, Bangalore' },
    status: 'On Route',
    estimatedArrival: '15 mins'
};


// Mock Handlers
mock.onGet(new RegExp('/admin/fees.*')).reply(200, MOCK_FEES);
mock.onPost('/admin/fees/pay').reply(200, { success: true });

mock.onGet(new RegExp('/admin/leaves.*')).reply(200, MOCK_LEAVES);
mock.onPost('/admin/leaves').reply((config) => {
    const data = JSON.parse(config.data);
    return [201, { ...data, id: Math.random().toString(), status: 'Pending', appliedOn: new Date().toISOString() }];
});

mock.onGet(new RegExp('/admin/transport.*')).reply(200, MOCK_BUS_INFO);


// Service
export const adminService = {
    getFees: async (studentId: string) => {
        const response = await apiClient.get<Invoice[]>(`/admin/fees?studentId=${studentId}`);
        return response.data;
    },

    payFee: async (invoiceId: string) => {
        const response = await apiClient.post('/admin/fees/pay', { invoiceId });
        return response.data;
    },

    getLeaves: async (studentId: string) => {
        const response = await apiClient.get<LeaveRequest[]>(`/admin/leaves?studentId=${studentId}`);
        return response.data;
    },

    applyLeave: async (data: Omit<LeaveRequest, 'id' | 'status' | 'appliedOn'>) => {
        const response = await apiClient.post<LeaveRequest>('/admin/leaves', data);
        return response.data;
    },

    getBusLocation: async (childId: string) => {
        const response = await apiClient.get<BusInfo>(`/admin/transport?childId=${childId}`);
        return response.data;
    }
};
