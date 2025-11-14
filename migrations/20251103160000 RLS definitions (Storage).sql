/**************************************************/
/*** Policies for AVATARS table                 ***/
/**************************************************/

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES 
('avatars', 'avatars', true);

CREATE POLICY "ANYONE can SELECT avatars" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "ANYONE can INSERT their own avatar" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "ANYONE can UPDATE their own avatar" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "ANYONE can DELETE their own avatar" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );