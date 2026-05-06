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

    // ── 1. PREMIUM IMAGE GENERATION (OPENROUTER FLUX PRO + STORAGE) ──────────────
    if (type === "image") {
      console.log("Generating premium high-quality image...");
      let finalUrl = "";

      if (openrouterKey) {
        try {
          console.log("Calling OpenRouter with Flux Pro...");
          const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { 
              Authorization: `Bearer ${openrouterKey}`, 
              "Content-Type": "application/json",
              "HTTP-Referer": "https://solospider.ai",
              "X-Title": "SoloSpider",
            },
            body: JSON.stringify({
              model: "black-forest-labs/flux-1.1-pro,black-forest-labs/flux-1-dev,black-forest-labs/flux-1-schnell",
              messages: [
                { role: "user", content: userPrompt }
              ],
              modalities: ["image"],
              image_config: {
                aspect_ratio: "1:1"
              }
            }),
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`OpenRouter image gen status ${response.status}: ${errText}`);
          }

          const data = await response.json();
          const base64String = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

          if (base64String && base64String.includes("base64,")) {
            console.log("Premium image generated successfully. Uploading to Supabase Storage...");
            const base64Data = base64String.split("base64,")[1];
            
            // Convert base64 to Uint8Array for Supabase storage
            const binary = atob(base64Data);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }

            const fileName = `social/social_${Date.now()}.png`;
            const { error: uploadError } = await supabase.storage
              .from("blog_images")
              .upload(fileName, bytes, {
                contentType: "image/png",
                upsert: true
              });

            if (uploadError) {
              console.error("Storage upload error:", uploadError);
              throw new Error("Failed to upload social image to Supabase Storage");
            }

            const { data: { publicUrl } } = supabase.storage
              .from("blog_images")
              .getPublicUrl(fileName);

            finalUrl = publicUrl;
            console.log("Premium image uploaded and hosted at:", finalUrl);
          } else {
            console.warn("OpenRouter did not return expected base64 format:", base64String ? base64String.substring(0, 100) : "empty");
          }
        } catch (e: any) {
          console.error("OpenRouter premium image generation failed. Falling back to Pollinations:", e.message || e);
        }
      } else {
        console.log("No OPENROUTER_API_KEY found, bypassing premium image path...");
      }

      // Robust fallback to Pollinations AI URL-only mode if premium path wasn't completed
      if (!finalUrl) {
        console.log("Using Pollinations AI as fallback/default URL mode...");
        const encodedPrompt = encodeURIComponent(userPrompt);
        finalUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;
      }
      
      return new Response(JSON.stringify({ imageUrl: finalUrl }), {
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
