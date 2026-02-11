
-- Fix: The collaborator check and policies reference auth.users which anon/authenticated can't read.
-- We need to use security definer functions that can access auth.users.

-- 1. Create a helper to get current user's email safely
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = auth.uid();
$$;

-- 2. Fix the is_capsule_collaborator function to use the helper
CREATE OR REPLACE FUNCTION public.is_capsule_collaborator(capsule_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.capsule_collaborators
    WHERE capsule_id = capsule_uuid
      AND (user_id = auth.uid() OR email = public.get_auth_email())
  );
$$;

-- 3. Fix collaborators SELECT policy that also references auth.users inline
DROP POLICY IF EXISTS "Collaborators can view their records" ON public.capsule_collaborators;
CREATE POLICY "Collaborators can view their records"
  ON public.capsule_collaborators FOR SELECT
  USING (user_id = auth.uid() OR email = public.get_auth_email());

-- 4. Alter unlock_date from DATE to TIMESTAMPTZ to support time
ALTER TABLE public.capsules ALTER COLUMN unlock_date TYPE timestamptz USING unlock_date::timestamptz;

-- 5. Add support for video and audio by adding a media_type column to capsule_photos
-- Rename table would be complex, so we just add a column
ALTER TABLE public.capsule_photos ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image';

-- 6. Add an email_sent flag to capsules for notification tracking
ALTER TABLE public.capsules ADD COLUMN IF NOT EXISTS email_sent boolean NOT NULL DEFAULT false;
