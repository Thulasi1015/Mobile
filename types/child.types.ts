export interface ChildProfile {
    id: string;
    parent_id: string; // Link to parent profile
    name: string;
    grade?: string;
    school_name?: string;
    age?: number;
    avatar_url?: string;
    created_at?: string;
}

export interface AttendanceRecord {
    id: string;
    student_id: string; // Matches DB
    date: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excuse' | 'Half Day';
    check_in?: string; // snake_case from DB
    check_out?: string;
    remarks?: string;
}

export interface PerformanceReport {
    id: string;
    student_id: string; // Matches DB
    subject: string;
    score: number;
    total: number;
    grade: string;
    date: string; // We will map created_at to this if missing
    remarks?: string;
    comments?: string;
}
