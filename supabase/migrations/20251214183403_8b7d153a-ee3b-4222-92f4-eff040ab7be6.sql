-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('citizen', 'bbmp');

-- Create enum for area type
CREATE TYPE public.area_type AS ENUM ('residential', 'commercial');

-- Create enum for alert status
CREATE TYPE public.alert_status AS ENUM ('active', 'resolved');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'citizen',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create garbage bins table
CREATE TABLE public.garbage_bins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location TEXT NOT NULL,
  last_emptied_date DATE NOT NULL DEFAULT CURRENT_DATE,
  capacity_days INTEGER NOT NULL DEFAULT 7,
  current_garbage_level INTEGER NOT NULL DEFAULT 0 CHECK (current_garbage_level >= 0 AND current_garbage_level <= 100),
  area_type area_type NOT NULL DEFAULT 'residential',
  complaints_last_week INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bin_id UUID NOT NULL REFERENCES public.garbage_bins(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  status alert_status NOT NULL DEFAULT 'active',
  predicted_days_left INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.garbage_bins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Garbage bins policies (all authenticated users can view)
CREATE POLICY "Authenticated users can view bins" ON public.garbage_bins FOR SELECT TO authenticated USING (true);
CREATE POLICY "BBMP can insert bins" ON public.garbage_bins FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'bbmp')
);
CREATE POLICY "BBMP can update bins" ON public.garbage_bins FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'bbmp')
);

-- Alerts policies
CREATE POLICY "Authenticated users can view alerts" ON public.alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "System can insert alerts" ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "BBMP can update alerts" ON public.alerts FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'bbmp')
);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'citizen')
  );
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_garbage_bins_updated_at
  BEFORE UPDATE ON public.garbage_bins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample garbage bins data
INSERT INTO public.garbage_bins (location, last_emptied_date, capacity_days, current_garbage_level, area_type, complaints_last_week) VALUES
  ('MG Road, Bangalore', CURRENT_DATE - INTERVAL '3 days', 7, 45, 'commercial', 2),
  ('Koramangala 4th Block', CURRENT_DATE - INTERVAL '5 days', 7, 78, 'residential', 5),
  ('Indiranagar 100 Feet Road', CURRENT_DATE - INTERVAL '1 day', 7, 25, 'commercial', 0),
  ('Jayanagar 4th Block', CURRENT_DATE - INTERVAL '6 days', 7, 92, 'residential', 8),
  ('Whitefield Main Road', CURRENT_DATE - INTERVAL '2 days', 7, 35, 'commercial', 1),
  ('HSR Layout Sector 2', CURRENT_DATE - INTERVAL '4 days', 7, 65, 'residential', 3),
  ('Electronic City Phase 1', CURRENT_DATE - INTERVAL '7 days', 7, 95, 'commercial', 10),
  ('BTM Layout 2nd Stage', CURRENT_DATE - INTERVAL '3 days', 7, 55, 'residential', 2);