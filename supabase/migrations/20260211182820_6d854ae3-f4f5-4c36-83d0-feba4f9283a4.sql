
-- Drop all existing policies to rebuild them correctly
DROP POLICY IF EXISTS "Owners can view their capsules" ON public.capsules;
DROP POLICY IF EXISTS "Owners can create capsules" ON public.capsules;
DROP POLICY IF EXISTS "Owners can update their capsules" ON public.capsules;
DROP POLICY IF EXISTS "Owners can delete their capsules" ON public.capsules;
DROP POLICY IF EXISTS "Collaborators can view shared capsules" ON public.capsules;

DROP POLICY IF EXISTS "Capsule owners can manage collaborators" ON public.capsule_collaborators;
DROP POLICY IF EXISTS "Collaborators can view their records" ON public.capsule_collaborators;

DROP POLICY IF EXISTS "Capsule owners can manage photos" ON public.capsule_photos;
DROP POLICY IF EXISTS "Collaborators can view shared capsule photos" ON public.capsule_photos;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Security definer function to check capsule ownership (breaks recursion)
CREATE OR REPLACE FUNCTION public.is_capsule_owner(capsule_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.capsules
    WHERE id = capsule_uuid AND user_id = auth.uid()
  );
$$;

-- Security definer function to check if user is a collaborator
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
      AND (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );
$$;

-- CAPSULES policies (PERMISSIVE)
CREATE POLICY "Owners can view their capsules"
  ON public.capsules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Collaborators can view shared capsules"
  ON public.capsules FOR SELECT
  USING (public.is_capsule_collaborator(id));

CREATE POLICY "Owners can create capsules"
  ON public.capsules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their capsules"
  ON public.capsules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their capsules"
  ON public.capsules FOR DELETE
  USING (auth.uid() = user_id);

-- CAPSULE_COLLABORATORS policies (PERMISSIVE)
CREATE POLICY "Capsule owners can manage collaborators"
  ON public.capsule_collaborators FOR ALL
  USING (public.is_capsule_owner(capsule_id));

CREATE POLICY "Collaborators can view their records"
  ON public.capsule_collaborators FOR SELECT
  USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- CAPSULE_PHOTOS policies (PERMISSIVE)
CREATE POLICY "Capsule owners can manage photos"
  ON public.capsule_photos FOR ALL
  USING (public.is_capsule_owner(capsule_id));

CREATE POLICY "Collaborators can view shared capsule photos"
  ON public.capsule_photos FOR SELECT
  USING (public.is_capsule_collaborator(capsule_id));

-- PROFILES policies (PERMISSIVE)
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);
