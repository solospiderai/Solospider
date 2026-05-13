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
    let brandName = bodyBrandName;
    let brandDesc = bodyBrandDesc;
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
              model: "anthropic/claude-3.5-sonnet", // Using the most advanced model for design reasoning
              messages: [
                {
                  role: "system",
                  content: `You are a Senior Art Director & Design Engineer at a world-class advertising agency (think Recraft, Apple, or Behance-level).
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
            console.log("Pro Art Brief:", finalBrief);
          }
        } catch (e) {
          console.error("Art Director failure:", e);
        }

        try {
          const width = platform === "instagram" ? 1024 : 1792;
          const height = 1024;
          console.log("Calling Cloud Image Generation API with prompt...");
          
          // Let the user's prompt drive the core concept, but enhance it for premium advertising quality
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
                  // Small delay to allow propagation in Supabase infrastructure
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
      } else {
        return new Response(JSON.stringify({ error: "Missing openrouterKey" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Default return for text actions...
    const llmRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${openrouterKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus",
        messages: [{ role: "user", content: `Generate social media post for ${brandName}. JSON.` }],
        response_format: { type: "json_object" }
      }),
    });
    const data = await llmRes.json();
    return new Response(data.choices?.[0]?.message?.content || "{}", { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
