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
    const { type, prompt: userPrompt, brandName: bodyBrandName, brandDescription: bodyBrandDesc, projectId, platform, addLogo } = body;

    // Fetch Brand Intelligence
    let brandName = bodyBrandName || "Wildlife Gir Resort";
    let brandDesc = bodyBrandDesc || "";
    let brandTagline = "";
    let industry = "General Business";
    let style = "Professional";
    let palette: string[] = [];

    if (projectId) {
      console.log(`Fetching project data for: ${projectId}`);
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("name, brand_description, brand_tagline, industry, brand_palette, brand_style")
        .eq("id", projectId)
        .single();
      
      if (projectError) {
        console.error("Error fetching project (likely missing columns):", projectError);
      }

      if (project) {
        brandName = project.brand_name || project.name || brandName;
        brandDesc = project.brand_description || brandDesc;
        brandTagline = project.brand_tagline || brandTagline;
        industry = project.industry || "General Business";
        palette = project.brand_palette || [];
        style = project.brand_style || "Professional";
        
        // Add DNA to context for LLM
        brandDesc = `${brandDesc}\nIndustry: ${industry}\nVisual Style: ${style}\nPalette: ${Array.isArray(palette) ? palette.join(", ") : ""}`;
      }
    }

    // ── 1. IMAGE GENERATION (AD AGENCY PRO MODE) ──────────────────────────
    if (type === "image") {
      console.log(`Generating PRO AD Asset for: ${brandName}`);
      
      let finalBrief = userPrompt;

      if (openrouterKey) {
        try {
          const directorRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${openrouterKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "anthropic/claude-3.5-sonnet",
              messages: [
                {
                  role: "system",
                  content: `You are a Senior Art Director & Design Engineer at a world-class advertising agency.
Your goal is to transform a simple user request into a "Modular Design Blueprint" for a high-end social media ad.

STRICT DESIGN PRINCIPLES:
1. COMPOSITION: Use "Swiss-grid" editorial composition. Prioritize asymmetric balance, strong diagonal splits, and layered shapes.
2. VOCABULARY: Use advanced design terms: "geometric masking", "focal hierarchy", "negative space", "rounded cuts", "floating elements", "vector-style overlays".
3. LAYOUT LOGIC: Define a clear layout (e.g., "left content / right hero" or "split asymmetric").
4. BRAND DNA: Strictly adhere to Industry: "${industry}", Visual Style: "${style}", and Brand Name: "${brandName}".
5. RENDERING: Specify Behance-quality, ultra-clean vector shapes, and sharp contrast. Avoid generic AI "realistic photography" unless it's a lifestyle shot inside a geometric mask.

PROMPT FORMULA TO OUTPUT:
[Design Type] + [Brand Style] + [Layout Composition] + [Color Palette] + [Typography Style] + [Visual Elements] + [Mood] + [Quality Terms] + [Platform Constraints]

OUTPUT ONLY THE FINAL CONSTRUCTED PROMPT FOR THE IMAGE MODEL.`
                },
                {
                  role: "user",
                  content: `Create an elite agency advertisement for: "${userPrompt}"\nContext: ${brandDesc}`
                }
              ],
            }),
          });

          if (directorRes.ok) {
            const data = await directorRes.json();
            finalBrief = data.choices?.[0]?.message?.content || userPrompt;
            console.log("Senior Art Brief:", finalBrief);
          } else {
            const errorText = await directorRes.text();
            console.error("OpenRouter Error:", errorText);
            finalBrief = `Premium modern social media advertisement for ${brandName}. Subject: ${userPrompt}. Style: Modern SaaS branding, Swiss-inspired layout, asymmetric balance, Behance-quality composition, high-end digital agency aesthetic. Mood: Professional, conversion-focused.`;
          }
        } catch (e) {
          console.error("Art Director failure:", e);
          finalBrief = `Premium modern social media advertisement for ${brandName}. Subject: ${userPrompt}. Style: Modern SaaS branding, Swiss-inspired layout, asymmetric balance, Behance-quality composition, high-end digital agency aesthetic. Mood: Professional, conversion-focused.`;
        }
      } else {
        // Build robust brand brief if openrouter is not configured
        finalBrief = `Premium modern social media advertisement for ${brandName}. Subject: ${userPrompt}. Style: Modern SaaS branding, Swiss-inspired layout, asymmetric balance, Behance-quality composition, high-end digital agency aesthetic. Mood: Professional, conversion-focused.`;
      }

      try {
        // FOR POST LAYOUT 3X3 (SQUARE 1:1), ALWAYS USE 1024x1024
        const width = 1024;
        const height = 1024;
        console.log(`Calling Cloud Image Generation API with prompt... Resolution: ${width}x${height}`);
        
        const dynamicPrompt = `${finalBrief}. Premium professional advertising photography, 4K, high conversion rate social media aesthetic. If text is requested, render it clearly.`;
        const encodedPrompt = encodeURIComponent(dynamicPrompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&seed=${Date.now()}`;
        
        const imgRes = await fetch(pollinationsUrl);
        if (!imgRes.ok) {
          throw new Error(`Failed to generate image from API: ${imgRes.status}`);
        }
        
        const arrayBuf = await imgRes.arrayBuffer();
        const bytes = new Uint8Array(arrayBuf);

        const bucketName = 'social_assets';
        const fileName = `pro_ad_${Date.now()}.png`;
        
        // Ensure bucket exists
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.find(b => b.name === bucketName);
        
        if (!bucketExists) {
          console.log(`Bucket '${bucketName}' missing. Attempting to create...`);
          const { error: createError } = await supabase.storage.createBucket(bucketName, { 
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg']
          });
          if (createError) {
            console.error("Bucket creation failed:", createError);
          } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        console.log(`Uploading to ${bucketName}/${fileName}...`);
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, bytes, { contentType: "image/png", upsert: true });

        if (uploadError) {
          console.error("Upload Error:", uploadError);
          throw new Error("Failed to upload image");
        }
        
        const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);
        console.log("Upload successful. Public URL:", publicUrl);
        return new Response(JSON.stringify({ imageUrl: publicUrl }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Cloud Image Generation failure:", e);
        return new Response(JSON.stringify({ error: "Image generation failure" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ── 2. TEXT GENERATION (CAPTION, HASHTAGS, IDEAS) ──────────────────────
    const textPrompt = action === "single_post" 
      ? `You are an elite social media manager. Generate a professional high-converting social media post for:
Brand Name: ${brandName}
Description: ${brandDesc}
Goal: ${body.goal || "Brand Awareness"}
Tone: ${body.tone || "confident"}
Topic/Prompt: ${body.prompt || "Write an engaging caption"}

Provide the output in JSON format exactly with the following structure:
{
  "hook": "a catchy hook",
  "caption": "the full engaging caption text with relevant emojis",
  "hashtags": ["list", "of", "relevant", "tags"],
  "imagePrompt": "visual concepts"
}`
      : `You are an expert content strategist. Generate 5 high-performing social post ideas for this brand:
Brand Name: ${brandName}
Description: ${brandDesc}

Return ONLY a valid JSON array with exactly 5 objects. Each object must have:
- "id": unique string like "idea_1"
- "type": one of "educational", "promotional", "engagement", "story", "product"
- "hook": a powerful opening line (max 15 words)
- "caption": full Instagram/Facebook caption (150-300 chars, engaging, with emojis)
- "hashtags": array of 10 relevant hashtags (without # symbol)
- "imagePrompt": a detailed visual description for image generation`;

    let generatedText = "";

    if (openrouterKey) {
      try {
        console.log(`Calling OpenRouter API for action: ${action}`);
        const textRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: { 
            Authorization: `Bearer ${openrouterKey}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-pro",
            messages: [{ role: "user", content: textPrompt }],
            response_format: { type: "json_object" }
          }),
        });

        if (textRes.ok) {
          const data = await textRes.json();
          generatedText = data.choices?.[0]?.message?.content || "";
        } else {
          const errorText = await textRes.text();
          console.error("OpenRouter Text Generation Error:", errorText);
        }
      } catch (err) {
        console.error("OpenRouter Text Generation exception:", err);
      }
    }

    // ROBUST FALLBACK: POLLINATIONS AI TEXT ENDPOINT (Free, Fast, Reliable)
    if (!generatedText) {
      try {
        console.log("Using Pollinations AI Text Fallback...");
        const encodedPrompt = encodeURIComponent(`${textPrompt}\nReturn ONLY the JSON string. Do not wrap in markdown code blocks.`);
        const pollinationsTextUrl = `https://text.pollinations.ai/${encodedPrompt}?model=openai&json=true`;
        
        const res = await fetch(pollinationsTextUrl);
        if (res.ok) {
          generatedText = await res.text();
          console.log("Pollinations Text Response:", generatedText);
        }
      } catch (fallbackErr) {
        console.error("Pollinations Text Fallback failed:", fallbackErr);
      }
    }

    // Final Parse and Return
    let parsedData = {};
    try {
      // Clean up markdown block wraps if present
      const cleanJson = generatedText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("JSON parsing failed, returning template placeholder:", e);
      parsedData = action === "single_post" ? {
        hook: `Welcome to ${brandName}`,
        caption: `Discover the difference with ${brandName}. We're dedicated to delivering the best solutions for our community! 🌟`,
        hashtags: ["innovation", "excellence", "branding", "community"],
        imagePrompt: `A vibrant office workspace illustrating creativity and teamwork`
      } : [
        {
          id: "idea_1",
          type: "educational",
          hook: `Discover ${brandName}`,
          caption: `We are passionate about offering top-tier solutions. Let's grow together!`,
          hashtags: ["growth", "solutions"],
          imagePrompt: `Premium modern workspace theme`
        }
      ];
    }

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
