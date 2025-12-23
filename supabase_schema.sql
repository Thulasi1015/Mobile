-- Create tables for the School App

-- 1. Profiles (Managed by Auth, but we extend it)
-- Note: 'auth.users' is a system table. We usually create a public 'profiles' table.
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT,
  phone TEXT,
  email TEXT,
  avatar TEXT,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Students (Children)
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  age INTEGER,
  grade TEXT,
  school_name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Attendance
CREATE TABLE public.attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT CHECK (status IN ('present', 'absent', 'late')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Performance
CREATE TABLE public.performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  score INTEGER,
  total INTEGER,
  grade TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS Policies (Row Level Security)

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Students: Parents can view their own children
CREATE POLICY "Parents can view own children" ON public.students
  FOR SELECT USING (auth.uid() = parent_id);

CREATE POLICY "Parents can insert own children" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

CREATE POLICY "Parents can update own children" ON public.students
  FOR UPDATE USING (auth.uid() = parent_id);

CREATE POLICY "Parents can delete own children" ON public.students
  FOR DELETE USING (auth.uid() = parent_id);

-- Attendance: Parents can view attendance for their own children
CREATE POLICY "Parents can view child attendance" ON public.attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = attendance.student_id AND students.parent_id = auth.uid())
  );

-- Performance: Parents can view performance for their own children
CREATE POLICY "Parents can view child performance" ON public.performance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = performance.student_id AND students.parent_id = auth.uid())
  );

-- Function to handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (new.id, new.phone);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on sign up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Syllabus
CREATE TABLE public.syllabus (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT CHECK (status IN ('Completed', 'In Progress', 'Pending')),
  completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Homework
CREATE TABLE public.homework (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status TEXT CHECK (status IN ('Pending', 'Completed')) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Timetable
CREATE TABLE public.timetable (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  day TEXT NOT NULL, -- Mon, Tue, Wed, Thu, Fri, Sat, Sun
  period INTEGER NOT NULL,
  start_time TEXT, -- e.g. "08:00"
  end_time TEXT, -- e.g. "08:45"
  subject TEXT NOT NULL,
  teacher TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- RLS for Academic Tables
ALTER TABLE public.syllabus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view child syllabus" ON public.syllabus
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = syllabus.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage child syllabus" ON public.syllabus
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = syllabus.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Parents can view child homework" ON public.homework
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = homework.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage child homework" ON public.homework
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = homework.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Parents can view child timetable" ON public.timetable
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = timetable.student_id AND students.parent_id = auth.uid())
  );

CREATE POLICY "Parents can manage child timetable" ON public.timetable
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.students WHERE students.id = timetable.student_id AND students.parent_id = auth.uid())
  );

