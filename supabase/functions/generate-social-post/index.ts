import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);
    const body = await req.json();
    const { type, prompt: userPrompt, brandName, brandDescription } = body;

    // ── 1. HIGH-QUALITY IMAGE GENERATION (POLLINATIONS) ─────────────────────────
    if (type === "image") {
      console.log("Generating high-quality image via Pollinations...");
      const encodedPrompt = encodeURIComponent(userPrompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
      
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Pollinations error: ${res.status}`);
      }

      const imageData = await res.arrayBuffer();
      const fileName = `social/${Date.now()}.jpg`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("blog-images") // Reusing existing bucket
        .upload(fileName, new Uint8Array(imageData), {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("blog-images").getPublicUrl(uploadData.path);
      return new Response(JSON.stringify({ imageUrl: publicUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. PROMPT REFINEMENT (OPENROUTER) ────────────────────────────────────
    if (body.refineOnly) {
      if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not configured");
      const refineSysPrompt = `You are an expert AI image prompt engineer. Your job is to take a simple image description and turn it into a high-quality, detailed prompt for photorealistic image generation.
Include: subject, environment, lighting (golden hour, soft diffused, etc.), camera angle, and professional mood.
Output ONLY the refined prompt, no quotes, no explanation. Maximum 40 words. 
End with keywords like: DSLR photography, 4K, sharp focus, masterpiece.`;

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: { 
          Authorization: `Bearer ${openrouterKey}`, 
          "Content-Type": "application/json",
          "HTTP-Referer": "https://solospider.ai",
          "X-Title": "SoloSpider",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            { role: "system", content: refineSysPrompt },
            { role: "user", content: `Refine this image prompt for the brand "${brandName}": "${userPrompt}"` }
          ],
        }),
      });

      if (!response.ok) throw new Error("OpenRouter refinement failed");
      const data = await response.json();
      return new Response(JSON.stringify({ refinedPrompt: data.choices[0].message.content.trim() }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 3. POST IDEAS GENERATION (OPENROUTER) ────────────────────────────────
    if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not configured");
    const { instagramBio, recentCaptions, recentHashtags } = body;
    const genPrompt = `You are an expert Instagram content strategist. Generate 5 high-performing Instagram post ideas for this brand.

Brand: ${brandName}
Description: ${brandDescription || "Not provided"}
Instagram Bio: ${instagramBio || "Not provided"}
Recent Post Samples: ${recentCaptions?.slice(0, 3).join(" | ") || "None"}
Common Hashtags: ${recentHashtags?.slice(0, 10).join(", ") || "None"}

Return ONLY a valid JSON array with exactly 5 objects. Each object must have:
- "id": unique string like "idea_1"
- "type": one of "educational", "promotional", "engagement", "story", "product"
- "hook": a powerful opening line (max 15 words)
- "caption": full Instagram caption (150-300 chars, engaging, with emojis)
- "hashtags": array of 15-20 relevant hashtags (without # symbol)
- "imagePrompt": a detailed visual description for image generation (describe the scene, style, colors, photorealistic, 4k)

Make captions authentic, engaging, and platform-native. Mix the types across the 5 posts.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openrouterKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: genPrompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter error: ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);
    const ideas = Array.isArray(parsed) ? parsed : (parsed.ideas || Object.values(parsed)[0]);

    return new Response(JSON.stringify(ideas), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("Social gen error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
