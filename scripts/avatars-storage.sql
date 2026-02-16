-- Create avatars bucket (public) and storage RLS policies for uploads from authenticated users

-- Create bucket if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    PERFORM storage.create_bucket('avatars', true);
  END IF;
END$$;

-- Enable RLS on storage.objects to allow fine-grained control
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove existing policies (safe to run multiple times)
DROP POLICY IF EXISTS avatars_select ON storage.objects;
DROP POLICY IF EXISTS avatars_insert ON storage.objects;
DROP POLICY IF EXISTS avatars_update ON storage.objects;
DROP POLICY IF EXISTS avatars_delete ON storage.objects;

-- SELECT: allow selecting object metadata for the avatars bucket
-- (Note: for public buckets the files themselves are served publicly via public URL.)
CREATE POLICY avatars_select ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- INSERT: allow authenticated users to create objects in avatars
-- Requires the client to be authenticated (auth.role() = 'authenticated')
CREATE POLICY avatars_insert ON storage.objects
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND bucket_id = 'avatars'
  );

-- UPDATE: allow the owner (uploader) to update metadata/name for their objects
CREATE POLICY avatars_update ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND owner = auth.uid()
  ) WITH CHECK (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

-- DELETE: allow the owner (uploader) to delete their objects
CREATE POLICY avatars_delete ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND owner = auth.uid()
  );

-- Notes:
-- 1) This script creates a public bucket (`avatars`) so that `getPublicUrl` returns a usable URL.
--    If you prefer a private bucket, set the second parameter of storage.create_bucket to false
--    and use signed URLs in your client/server code (`createSignedUrl`).
-- 2) Policies require the client to be authenticated to INSERT. Server-side operations using
--    the service role key bypass RLS and will continue to work.
-- 3) Apply this script from the Supabase SQL editor (or psql) using an admin role.
