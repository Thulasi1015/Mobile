-- Allow authenticated users to insert their own profile row
-- This is necessary if the automatic trigger failed or for existing users who missed the trigger.

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Ensure the profiles table definitely has RLS enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
