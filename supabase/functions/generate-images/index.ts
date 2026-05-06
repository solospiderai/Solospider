import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Generate an image prompt via OpenRouter
async function generatePrompt(topic: string, context: string): Promise<string> {
    const key = Deno.env.get("OPENROUTER_API_KEY");
    if (!key) return `Professional photo of ${topic}, photorealistic, high resolution`;

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { 
                Authorization: `Bearer ${key}`, 
                "Content-Type": "application/json",
                "HTTP-Referer": "https://solospider.ai",
                "X-Title": "SoloSpider",
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.1-8b-instruct",
                messages: [
                    { role: "system", content: "You are an expert AI image prompt engineer. Create vivid, detailed prompts for photorealistic image generation. Include: subject, environment, lighting (golden hour, soft diffused, etc.), camera angle, and mood. Output ONLY the prompt, no quotes, no explanation. Maximum 45 words. End with: DSLR photography, 4K ultra HD, sharp focus, no text, no watermark." },
                    { role: "user", content: `Create a photorealistic image prompt for a blog about \"${context}\". The image should represent: \"${topic}\"` }
                ],
                max_tokens: 120,
                temperature: 0.7,
            }),
        });
        if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || `Professional photo of ${topic}, photorealistic, high resolution`;
    } catch (e) {
        console.error("Prompt gen error:", e);
        return `Professional photo of ${topic}, photorealistic, high resolution, no text`;
    }
}

// Generate image via Pollinations AI and return URL directly to bypass worker compute/memory limits
async function generateAndUpload(
    supabase: any, prompt: string, fileName: string, width: number, height: number
): Promise<string | null> {
    console.log(`Generating image via Pollinations AI: ${prompt.substring(0, 60)}...`);

    try {
        const encodedPrompt = encodeURIComponent(prompt);
        const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true`;
        return url;
    } catch (e) {
        console.error("generateAndUpload error:", e);
        return null;
    }
}

// Main generation logic
async function generateImagesForContent(supabase: any, contentId: string, userId: string) {
    console.log(`Starting image generation for content: ${contentId}`);

    const { data: content, error: fetchError } = await supabase
        .from("content_items")
        .select("main_keyword, h2_list, generated_content")
        .eq("id", contentId)
        .eq("user_id", userId)
        .single();

    if (fetchError || !content) {
        console.error("Content not found:", fetchError);
        return;
    }

    const { main_keyword, h2_list, generated_content } = content;
    let sectionHeadings: string[] = h2_list || [];

    // Extract headings from generated content if h2_list is empty
    if (sectionHeadings.length === 0 && generated_content) {
        const matches = generated_content.match(/^## (.+)$/gm);
        if (matches) sectionHeadings = matches.map((m: string) => m.replace("## ", ""));
    }

    console.log(`Found ${sectionHeadings.length} sections for: ${main_keyword}`);

    // ── Featured image ────────────────────────────────────────────────────────
    const featuredPrompt = await generatePrompt(`${main_keyword} hero image`, main_keyword);
    const featuredUrl = await generateAndUpload(
        supabase,
        featuredPrompt,
        `${contentId}/featured_${Date.now()}.jpg`,
        1024,
        576
    );

    if (featuredUrl) {
        await supabase.from("blog_images").insert({
            content_id: contentId, user_id: userId,
            image_url: featuredUrl, prompt: featuredPrompt,
            image_type: "featured", section_heading: null, status: "completed",
        });
        await supabase.from("content_items").update({ featured_image_url: featuredUrl }).eq("id", contentId);
        console.log("Featured image saved:", featuredUrl);
    } else {
        console.error("Featured image generation failed");
    }

    // ── Section images ────────────────────────────────────────────────────────
    for (const heading of sectionHeadings) {
        const h = heading.toLowerCase();
        if (h.includes("conclusion") || h.includes("faq") || h.includes("frequently")) continue;

        await sleep(500); // reduced sleep since we are not doing heavy uploads

        const sectionPrompt = await generatePrompt(heading, main_keyword);
        const slug = heading.replace(/\s+/g, "_").replace(/[^a-z0-9_]/gi, "").slice(0, 40);
        const sectionUrl = await generateAndUpload(
            supabase,
            sectionPrompt,
            `${contentId}/section_${slug}_${Date.now()}.jpg`,
            1024,
            576
        );

        if (sectionUrl) {
            await supabase.from("blog_images").insert({
                content_id: contentId, user_id: userId,
                image_url: sectionUrl, prompt: sectionPrompt,
                image_type: "section", section_heading: heading, status: "completed",
            });
            console.log(`Section image saved for "${heading}":`, sectionUrl);
        } else {
            console.error(`Section image failed for: ${heading}`);
        }
    }

    console.log("Image generation complete for:", contentId);
}

// HTTP Handler
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        if (!supabaseUrl || !supabaseKey) {
            return new Response(
                JSON.stringify({ error: "Missing Supabase credentials" }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const body = await req.json();
        const { contentId, userId } = body;

        if (!contentId || !userId) {
            return new Response(
                JSON.stringify({ error: "contentId and userId are required" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verify content exists
        const { data: content, error: fetchError } = await supabase
            .from("content_items").select("id").eq("id", contentId).eq("user_id", userId).single();

        if (fetchError || !content) {
            return new Response(
                JSON.stringify({ error: "Content not found or access denied" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Respond synchronously to ensure background task completes without worker termination
        console.log("Running image generation synchronously...");
        await generateImagesForContent(supabase, contentId, userId);

        // Fetch count to confirm
        const { count, error: countError } = await supabase
            .from("blog_images")
            .select("id", { count: "exact", head: true })
            .eq("content_id", contentId)
            .eq("user_id", userId);

        return new Response(
            JSON.stringify({ 
                success: true, 
                message: "Image generation complete", 
                contentId,
                count: count || 0
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (e) {
        console.error("Edge function error:", e);
        return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
