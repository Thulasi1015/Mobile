import { supabase } from '../lib/supabase';

export interface Assignment {
    id: string;
    student_id: string;
    subject: string;
    title: string;
    dueDate: string; // mapped from due_date
    status: 'Pending' | 'Completed';
    description?: string;
}

export interface TimeSlot {
    period: number;
    time: string; // constructed from start_time - end_time
    subject: string;
    teacher: string;
}

export interface DaySchedule {
    day: string;
    slots: TimeSlot[];
}

export interface SyllabusTopic {
    id: string;
    student_id: string;
    subject: string;
    topic: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    completionDate?: string; // mapped from completion_date
}

export const academicService = {
    getHomework: async (childId: string) => {
        const { data, error } = await supabase
            .from('homework')
            .select('*')
            .eq('student_id', childId)
            .order('due_date', { ascending: true });

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            student_id: item.student_id,
            subject: item.subject,
            title: item.title,
            dueDate: item.due_date,
            status: item.status,
            description: item.description
        })) as Assignment[];
    },

    updateHomeworkStatus: async (assignmentId: string, status: 'Pending' | 'Completed') => {
        const { error } = await supabase
            .from('homework')
            .update({ status })
            .eq('id', assignmentId);

        if (error) throw error;
        return { success: true };
    },

    getTimetable: async (childId: string) => {
        const { data, error } = await supabase
            .from('timetable')
            .select('*')
            .eq('student_id', childId)
            .order('period', { ascending: true });

        if (error) throw error;

        // Group by day
        const grouped: Record<string, TimeSlot[]> = {};
        const daysOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        data.forEach((item: any) => {
            if (!grouped[item.day]) {
                grouped[item.day] = [];
            }
            grouped[item.day].push({
                period: item.period,
                time: `${item.start_time} - ${item.end_time}`,
                subject: item.subject,
                teacher: item.teacher || 'N/A'
            });
        });

        // Convert to DaySchedule array
        return Object.keys(grouped).map(day => ({
            day,
            slots: grouped[day]
        })).sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
    },

    getSyllabus: async (childId: string) => {
        const { data, error } = await supabase
            .from('syllabus')
            .select('*')
            .eq('student_id', childId)
            .order('subject', { ascending: true });

        if (error) throw error;

        return data.map((item: any) => ({
            id: item.id,
            student_id: item.student_id,
            subject: item.subject,
            topic: item.topic,
            status: item.status,
            completionDate: item.completion_date
        })) as SyllabusTopic[];
    }
};

