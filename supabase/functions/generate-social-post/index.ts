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
    const action = body.action || "ideas";
    const { type, prompt: userPrompt, brandName, brandDescription } = body;

    // ── 1. IMAGE GENERATION ──────────────────────────────────────────────────
    if (type === "image") {
      console.log("Generating elite image for prompt:", userPrompt);
      
      let enhancedPrompt = userPrompt;

      // STEP 1: Use Claude Opus 4.7 to enhance the prompt
      if (openrouterKey) {
        try {
          console.log("Enhancing prompt with Claude Opus 4.7...");
          const enhanceRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openrouterKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "anthropic/claude-opus-4.7",
              messages: [
                {
                  role: "system",
                  content: "You are a world-class prompt engineer for AI image generators (DALL-E 3, Flux). Your goal is to take a simple social media post idea and turn it into a highly detailed, visually stunning, professional image generation prompt. Focus on lighting, composition, style (premium/modern), and ensuring NO text or garbled letters are generated. Output ONLY the final enhanced prompt text."
                },
                {
                  role: "user",
                  content: `Enhance this for a high-end social media graphic: "${userPrompt}"`
                }
              ],
              max_tokens: 200,
            }),
          });

          if (enhanceRes.ok) {
            const enhanceData = await enhanceRes.json();
            enhancedPrompt = enhanceData.choices?.[0]?.message?.content || userPrompt;
            console.log("Enhanced Prompt:", enhancedPrompt);
          }
        } catch (err) {
          console.error("Prompt enhancement failed:", err);
        }
      }

      let imageBytes: Uint8Array | null = null;
      let contentType = "image/jpeg";

      // STEP 2: Generate image using the enhanced prompt via OpenRouter
      if (openrouterKey) {
        try {
          console.log("Generating image with OpenRouter (Flux Pro)...");
          const orRes = await fetch("https://openrouter.ai/api/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openrouterKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "black-forest-labs/flux-1.1-pro",
              prompt: enhancedPrompt,
              n: 1,
              size: "1024x1024",
            }),
          });

          if (orRes.ok) {
            const orData = await orRes.json();
            const imageUrl = orData?.data?.[0]?.url;
            if (imageUrl) {
              const imgRes = await fetch(imageUrl);
              if (imgRes.ok) {
                const arrayBuf = await imgRes.arrayBuffer();
                imageBytes = new Uint8Array(arrayBuf);
                contentType = imgRes.headers.get("content-type") || "image/jpeg";
              }
            }
          } else {
            const errText = await orRes.text();
            console.error("OpenRouter image gen failed:", orRes.status, errText);
          }
        } catch (err) {
          console.error("OpenRouter image gen threw:", err);
        }
      }

      // FALLBACK: If OpenRouter image gen fails, try Pollinations with the enhanced prompt
      if (!imageBytes) {
        console.log("OpenRouter image gen failed, falling back to Pollinations Flux...");
        try {
          const encodedPrompt = encodeURIComponent(`${enhancedPrompt}, no text overlay, professional 4K`);
          const polUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=1024&height=1024&nologo=true&seed=${Date.now() % 999999}`;
          const polRes = await fetch(polUrl);
          if (polRes.ok) {
            const arrayBuf = await polRes.arrayBuffer();
            imageBytes = new Uint8Array(arrayBuf);
            contentType = polRes.headers.get("content-type") || "image/jpeg";
          }
        } catch (err) {
          console.error("Pollinations fallback failed:", err);
        }
      }

      // STEP 3: Store in Supabase
      if (imageBytes && imageBytes.length > 0) {
        const ext = contentType.includes("png") ? "png" : "jpg";
        const fileName = `social/social_${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("blog_images")
          .upload(fileName, imageBytes, { contentType, upsert: true });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("blog_images").getPublicUrl(fileName);
          return new Response(JSON.stringify({ imageUrl: publicUrl }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }

      return new Response(JSON.stringify({ error: "Failed to generate image" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. IDEAS / CAPTION GENERATION ────────────────────────────────────────
    if (action === "ideas" || action === "caption" || action === "draft") {
      let systemPrompt = "";
      let userMessage = "";

      if (action === "ideas") {
        systemPrompt = "You are an elite social media strategist. Generate 5 creative post ideas in JSON array format.";
        userMessage = `Brand: ${brandName}\nDescription: ${brandDescription}\nGenerate JSON with fields: hook, caption, hashtags, type.`;
      } else {
        systemPrompt = "You are an expert social media copywriter.";
        userMessage = userPrompt || "Write a caption.";
      }

      const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "anthropic/claude-opus-4.7",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (llmRes.ok) {
        const llmData = await llmRes.json();
        const content = llmData.choices?.[0]?.message?.content || "";
        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
