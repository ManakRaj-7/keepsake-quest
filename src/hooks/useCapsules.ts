import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Tables } from "@/integrations/supabase/types";

export type Capsule = Tables<"capsules"> & {
  capsule_photos?: Tables<"capsule_photos">[];
  capsule_collaborators?: Tables<"capsule_collaborators">[];
};

export function useCapsules() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["capsules", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("capsules")
        .select("*, capsule_photos(*), capsule_collaborators(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Capsule[];
    },
    enabled: !!user,
  });
}

export function useCapsule(id: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["capsule", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capsules")
        .select("*, capsule_photos(*), capsule_collaborators(*)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Capsule | null;
    },
    enabled: !!user && !!id,
  });
}

export function useCreateCapsule() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string;
      notes: string;
      unlock_date: string;
      is_shared: boolean;
      tags: string[];
      shared_emails: string[];
      photos: File[];
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Create capsule
      const { data: capsule, error } = await supabase
        .from("capsules")
        .insert({
          user_id: user.id,
          title: input.title,
          description: input.description,
          notes: input.notes,
          unlock_date: input.unlock_date,
          is_shared: input.is_shared,
          tags: input.tags,
        })
        .select()
        .single();

      if (error) throw error;

      // Add collaborators
      if (input.is_shared && input.shared_emails.length > 0) {
        const collabs = input.shared_emails.map((email) => ({
          capsule_id: capsule.id,
          email,
        }));
        await supabase.from("capsule_collaborators").insert(collabs);
      }

      // Upload photos
      if (input.photos.length > 0) {
        for (const photo of input.photos) {
          const path = `${user.id}/${capsule.id}/${Date.now()}-${photo.name}`;
          const { error: uploadError } = await supabase.storage
            .from("capsule-media")
            .upload(path, photo);

          if (!uploadError) {
            await supabase.from("capsule_photos").insert({
              capsule_id: capsule.id,
              storage_path: path,
              file_name: photo.name,
            });
          }
        }
      }

      return capsule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capsules"] });
    },
  });
}

export function useDeleteCapsule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("capsules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capsules"] });
    },
  });
}

export function getPublicUrl(path: string) {
  const { data } = supabase.storage.from("capsule-media").getPublicUrl(path);
  return data.publicUrl;
}
