-- Create complaint status enum
CREATE TYPE public.complaint_status AS ENUM ('pending', 'in_progress', 'resolved');

-- Create issue type enum
CREATE TYPE public.issue_type AS ENUM ('pothole', 'streetlight', 'garbage', 'drainage', 'road_damage', 'other');

-- Create complaints table
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  issue_type issue_type NOT NULL,
  image_url TEXT,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  status complaint_status NOT NULL DEFAULT 'pending',
  resolution_remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Citizens can view their own complaints
CREATE POLICY "Citizens can view own complaints"
ON public.complaints
FOR SELECT
USING (auth.uid() = user_id);

-- Citizens can insert their own complaints
CREATE POLICY "Citizens can insert own complaints"
ON public.complaints
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- BBMP can view all complaints
CREATE POLICY "BBMP can view all complaints"
ON public.complaints
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'bbmp'::user_role
));

-- BBMP can update complaints
CREATE POLICY "BBMP can update complaints"
ON public.complaints
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.id = auth.uid() AND profiles.role = 'bbmp'::user_role
));

-- Create trigger for updated_at
CREATE TRIGGER update_complaints_updated_at
BEFORE UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for complaint images
INSERT INTO storage.buckets (id, name, public) VALUES ('complaint-images', 'complaint-images', true);

-- Storage policies
CREATE POLICY "Anyone can view complaint images"
ON storage.objects FOR SELECT
USING (bucket_id = 'complaint-images');

CREATE POLICY "Authenticated users can upload complaint images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'complaint-images' AND auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.complaints;