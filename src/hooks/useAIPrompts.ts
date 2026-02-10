import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";

const fallbackPrompts = [
  "What's a sound from your childhood that instantly brings back memories?",
  "Describe a meal that someone special once made for you.",
  "What's a place you've visited that changed how you see the world?",
  "Write about a moment when a stranger showed you unexpected kindness.",
  "What song takes you back to a specific time in your life?",
  "Describe the view from a window you used to look out of often.",
  "What's something you learned from a grandparent or elder?",
  "Write about a rainy day that turned into something wonderful.",
];

export function useAIPrompts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ai-prompts", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke("generate-prompts", {
          body: { userId: user?.id },
        });
        if (error) throw error;
        return (data?.prompts ?? fallbackPrompts) as string[];
      } catch {
        return fallbackPrompts;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 min
    enabled: !!user,
  });
}

export { fallbackPrompts };
