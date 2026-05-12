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
    const { type, prompt: userPrompt, brandName, brandDescription, projectId, platform, addLogo } = body;

    // Fetch Brand Intelligence if projectId is provided
    let brandLogo = null;
    let brandTagline = null;
    if (projectId) {
      console.log("Fetching Brand Intelligence for project:", projectId);
      const { data: projectData } = await supabase
        .from("projects")
        .select("brand_logo_url, brand_tagline, brand_description, name")
        .eq("id", projectId)
        .single();
      
      if (projectData) {
        brandLogo = projectData.brand_logo_url;
        brandTagline = projectData.brand_tagline;
        console.log("Brand Intelligence synced:", projectData.name);
      }
    }

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
                  content: `You are a world-class visual director and prompt engineer for high-end marketing assets. 
                  Your goal is to transform a simple post idea into a precise visual directive for Flux 1.1 Pro.
                  
                  STRATEGY:
                  - Do not generate "pretty pictures". Generate "Marketing Graphics".
                  - Structure: Use a clear hierarchy. Subject, Background, Lighting, and Composition.
                  - Branding: The brand name is "${brandName}". Tagline: "${brandTagline || ""}".
                  - Layout: ${addLogo ? "Reserve the top-left corner for a professional logo placement. Describe a clean, integrated logo area." : "Full bleed composition."}
                  - Platform: ${platform || "Instagram"}. Ensure the composition works for this medium.
                  - Quality: Photorealistic, cinematic, high-contrast, premium B2B aesthetic.
                  - Constraint: Ensure NO garbled text. Describe the scene so well that Flux understands the context.
                  
                  Output ONLY the final enhanced prompt text.`
                },
                {
                  role: "user",
                  content: `Engineer a high-converting marketing visual for: "${userPrompt}"\nContext: ${brandDescription}`
                }
              ],
              max_tokens: 300,
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
              size: platform === "twitter" || platform === "x" ? "1280x720" : 
                    platform === "linkedin" || platform === "facebook" ? "1200x630" : "1024x1024",
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

    // ── 2. IDEAS / CAPTION / SINGLE POST GENERATION ─────────────────────────
    if (action === "ideas" || action === "caption" || action === "draft" || action === "single_post") {
      let systemPrompt = "";
      let userMessage = "";

      if (action === "ideas") {
        systemPrompt = "You are an elite social media strategist. Generate 5 creative post ideas in JSON array format.";
        userMessage = `Brand: ${brandName}\nDescription: ${brandDescription}\nGenerate JSON with fields: hook, caption, hashtags, type.`;
      } else if (action === "single_post") {
        systemPrompt = "You are an expert social media copywriter and visual director. Generate a complete high-converting social media post in JSON format.";
        userMessage = `Brand: ${brandName}\nDescription: ${brandDescription}\nGoal: ${body.goal || "Engagement"}\nTone: ${body.tone || "Engaging"}\nPrompt/Context: ${userPrompt}\n\nReturn JSON with exactly these fields:\n- "hook": a powerful opening line\n- "caption": the full body copy\n- "hashtags": array of 15 relevant hashtags\n- "imagePrompt": a detailed visual directive for image generation`;
      } else {
        systemPrompt = "You are an expert social media copywriter.";
        userMessage = userPrompt || "Write a caption.";
      }

      if (!openrouterKey) {
        return new Response(JSON.stringify({ error: "Missing OPENROUTER_API_KEY environment variable" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openrouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://solospider.ai",
          "X-Title": "Solospider AI",
        },
        body: JSON.stringify({
          model: "anthropic/claude-opus-4.7",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: { type: "json_object" }
        }),
      });

      if (llmRes.ok) {
        const llmData = await llmRes.json();
        const content = llmData.choices?.[0]?.message?.content || "";
        
        // If it's a single post or ideas, we expect JSON
        if (action === "single_post" || action === "ideas") {
           try {
             const parsed = JSON.parse(content);
             return new Response(JSON.stringify(parsed), {
               headers: { ...corsHeaders, "Content-Type": "application/json" },
             });
           } catch (e) {
             console.error("Failed to parse LLM JSON:", content);
             // Fallback if JSON is garbled but content is there
             return new Response(JSON.stringify({ caption: content, hashtags: [], hook: "", imagePrompt: userPrompt }), {
               headers: { ...corsHeaders, "Content-Type": "application/json" },
             });
           }
        }

        return new Response(JSON.stringify({ content }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const errText = await llmRes.text();
        console.error("OpenRouter LLM failed:", llmRes.status, errText);
        return new Response(JSON.stringify({ error: `LLM Error: ${errText}` }), {
          status: llmRes.status,
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
