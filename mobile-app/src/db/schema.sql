-- ==============================================================================
-- schema.sql — Secure Database Layout with Row Level Security (RLS)
--
-- Target Platform: Supabase (PostgreSQL)
-- Description: Creates a secure 'profiles' table automatically linked to
--              Supabase Auth user signup, with strict RLS policies.
-- ==============================================================================

-- 1. Create Public Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    
    CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Enable Row Level Security (RLS)
-- By default, this blocks all access to the table unless policies are defined.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Define Row Level Security Policies

-- Policy A: Allow anyone to view profiles (public read access)
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles
    FOR SELECT
    USING (true);

-- Policy B: Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy C: Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy D: Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
    ON public.profiles
    FOR DELETE
    USING (auth.uid() = id);

-- 3. Automatic Profile Linking via Database Trigger
-- This function automatically creates a profile entry when a new user registers in Supabase Auth.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        new.id,
        new.raw_user_meta_data->>'username',
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute handle_new_user() on auth.users inserts
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
