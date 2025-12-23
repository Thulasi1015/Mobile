import { supabase } from '../lib/supabase';
import { ChildProfile, AttendanceRecord, PerformanceReport } from '../types/child.types';

export const studentService = {
    getChildren: async () => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) throw new Error('No user logged in');

        const { data, error } = await supabase
            .from('students')
            .select('*')
            // RLS ensures we only see our own children, but explicit filter doesn't hurt
            .eq('parent_id', session.session.user.id);

        if (error) throw error;
        return data as ChildProfile[];
    },

    getChildDetails: async (id: string) => {
        const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as ChildProfile;
    },

    addChild: async (data: Omit<ChildProfile, 'id'>) => {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) throw new Error('No user logged in');

        const userId = session.session.user.id;

        // Ensure parent profile exists to satisfy FK constraint
        const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .single();

        if (!profile) {
            // Auto-create profile if missing
            await supabase.from('profiles').insert({
                id: userId,
                phone: session.session.user.phone,
                name: 'Parent', // Default name
                email: session.session.user.email || ''
            });
        }

        const { data: newChild, error } = await supabase
            .from('students')
            .insert({
                ...data,
                parent_id: userId
            })
            .select()
            .single();

        if (error) throw error;
        return newChild as ChildProfile;
    },

    deleteChild: async (id: string) => {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    getAttendance: async (childId: string) => {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', childId)
            .order('date', { ascending: false });

        if (error) throw error;

        // Map DB types to UI types
        return data.map((record: any) => ({
            id: record.id,
            student_id: record.student_id,
            date: record.date,
            status: record.status.charAt(0).toUpperCase() + record.status.slice(1), // 'present' -> 'Present'
            check_in: record.check_in,
            check_out: record.check_out,
            remarks: record.remarks
        })) as AttendanceRecord[];
    },

    getPerformance: async (childId: string) => {
        const { data, error } = await supabase
            .from('performance')
            .select('*')
            .eq('student_id', childId)
            .order('created_at', { ascending: false }); // Use created_at if date is missing

        if (error) throw error;

        return data.map((report: any) => ({
            id: report.id,
            student_id: report.student_id,
            subject: report.subject,
            score: report.score,
            total: report.total,
            grade: report.grade,
            // Use date column if exists, else fallback to created_at
            date: report.date || new Date(report.created_at).toISOString().split('T')[0],
            remarks: report.remarks
        })) as PerformanceReport[];
    }
};
