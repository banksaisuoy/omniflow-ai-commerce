-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policy for public read access
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Create policy for authenticated users to upload
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Create policy for admin to delete
CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images' AND EXISTS (
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));