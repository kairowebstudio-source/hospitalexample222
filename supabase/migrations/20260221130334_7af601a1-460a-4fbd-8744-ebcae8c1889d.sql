
-- Add image_url column to doctors table
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS image_url text DEFAULT '';

-- Create storage bucket for doctor images
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-images', 'doctor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to doctor-images bucket
CREATE POLICY "Admin can upload doctor images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'doctor-images' AND public.has_role(auth.uid(), 'admin'));

-- Allow public read access to doctor images
CREATE POLICY "Public can read doctor images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'doctor-images');

-- Allow admin to delete doctor images
CREATE POLICY "Admin can delete doctor images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'doctor-images' AND public.has_role(auth.uid(), 'admin'));
