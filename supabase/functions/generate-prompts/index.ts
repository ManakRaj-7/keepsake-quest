import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Fetch user's recent capsule titles/tags for context
    const { data: capsules } = await supabase
      .from("capsules")
      .select("title, tags, notes")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    const context = capsules?.length
      ? capsules.map((c: any) => `"${c.title}" (tags: ${c.tags?.join(", ") || "none"})`).join("; ")
      : "No capsules yet";

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a warm, empathetic journaling companion. Generate creative journaling prompts that help people reflect on memories, relationships, and meaningful moments. Make prompts emotionally resonant but gentle.",
          },
          {
            role: "user",
            content: `Generate 8 unique journaling prompts for a user. Their recent memory capsules include: ${context}. Make some prompts relate to their themes and some be fresh explorations. Return ONLY a JSON array of 8 strings, no other text.`,
          },
        ],
        temperature: 0.9,
      }),
    });

    if (!aiResponse.ok) {
      throw new Error(`AI gateway error [${aiResponse.status}]: ${await aiResponse.text()}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "[]";

    // Parse JSON from the response (handle markdown code blocks)
    let prompts: string[];
    try {
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
      prompts = JSON.parse(cleaned);
    } catch {
      prompts = [
        "What's a sound from your childhood that instantly brings back memories?",
        "Describe a meal that someone special once made for you.",
        "What's a place you've visited that changed how you see the world?",
        "Write about a moment when a stranger showed you unexpected kindness.",
        "What song takes you back to a specific time in your life?",
        "Describe the view from a window you used to look out of often.",
        "What's something you learned from a grandparent or elder?",
        "Write about a rainy day that turned into something wonderful.",
      ];
    }

    return new Response(JSON.stringify({ prompts }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in generate-prompts:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
