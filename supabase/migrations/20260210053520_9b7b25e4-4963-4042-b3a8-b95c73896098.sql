
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Capsules table
CREATE TABLE public.capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  unlock_date DATE NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY "Owners can view their capsules"
  ON public.capsules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can create capsules"
  ON public.capsules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their capsules"
  ON public.capsules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Owners can delete their capsules"
  ON public.capsules FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_capsules_updated_at
  BEFORE UPDATE ON public.capsules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Capsule collaborators
CREATE TABLE public.capsule_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.capsule_collaborators ENABLE ROW LEVEL SECURITY;

-- Capsule owner can manage collaborators
CREATE POLICY "Capsule owners can manage collaborators"
  ON public.capsule_collaborators FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.capsules
      WHERE capsules.id = capsule_collaborators.capsule_id
        AND capsules.user_id = auth.uid()
    )
  );

-- Collaborators can view capsules shared with them
CREATE POLICY "Collaborators can view shared capsules"
  ON public.capsules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capsule_collaborators cc
      WHERE cc.capsule_id = capsules.id
        AND (cc.user_id = auth.uid() OR cc.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Collaborators can view their own collaborator records
CREATE POLICY "Collaborators can view their records"
  ON public.capsule_collaborators FOR SELECT
  USING (
    user_id = auth.uid()
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Capsule photos table
CREATE TABLE public.capsule_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capsule_id UUID NOT NULL REFERENCES public.capsules(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.capsule_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Capsule owners can manage photos"
  ON public.capsule_photos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.capsules
      WHERE capsules.id = capsule_photos.capsule_id
        AND capsules.user_id = auth.uid()
    )
  );

CREATE POLICY "Collaborators can view shared capsule photos"
  ON public.capsule_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.capsule_collaborators cc
      JOIN public.capsules c ON c.id = cc.capsule_id
      WHERE cc.capsule_id = capsule_photos.capsule_id
        AND (cc.user_id = auth.uid() OR cc.email = (SELECT email FROM auth.users WHERE id = auth.uid()))
    )
  );

-- Storage bucket for capsule media
INSERT INTO storage.buckets (id, name, public) VALUES ('capsule-media', 'capsule-media', true);

CREATE POLICY "Authenticated users can upload capsule media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'capsule-media'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Anyone can view capsule media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'capsule-media');

CREATE POLICY "Users can delete their own media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'capsule-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
