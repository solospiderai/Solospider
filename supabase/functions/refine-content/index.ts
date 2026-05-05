import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    try {
        const authHeader = req.headers.get("Authorization");
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

        if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not configured");

        // Verify user auth
        const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
            global: { headers: { Authorization: authHeader || "" } },
        });
        const { data: { user }, error: userError } = await anonClient.auth.getUser();
        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const { contentId, prompt } = await req.json();
        if (!contentId || !prompt) {
            return new Response(JSON.stringify({ error: "Missing contentId or prompt" }), {
                status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch the content
        const { data: content, error: fetchError } = await supabase
            .from("content_items")
            .select("generated_content, user_id")
            .eq("id", contentId)
            .eq("user_id", user.id)
            .single();

        if (fetchError || !content) {
            return new Response(JSON.stringify({ error: "Content not found" }), {
                status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        const currentContent = content.generated_content || "";

        // Call OpenRouter to refine the content based on the user's prompt
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
                    {
                        role: "system",
                        content: `You are a content editor. The user will give you blog content and an editing instruction. Apply the instruction to the content and return the FULL modified content. Keep all markdown formatting, headings, bold text, and structure exactly the same. Only change what the user asks you to change. Return ONLY the modified content, nothing else. No explanations, no preamble.`,
                    },
                    {
                        role: "user",
                        content: `Here is the blog content:\n\n---\n${currentContent}\n---\n\nApply this edit: ${prompt}\n\nReturn the full modified content with the edit applied. Keep all formatting intact.`,
                    },
                ],
                max_tokens: 4000,
                temperature: 0.3,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter error: ${errorText}`);
        }

        const data = await response.json();
        const refinedContent = data.choices?.[0]?.message?.content || "";

        if (!refinedContent) {
            throw new Error("Empty response from AI");
        }

        // Clean up any think tags
        const cleaned = refinedContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

        // Update the content in the database
        const { error: updateError } = await supabase
            .from("content_items")
            .update({ generated_content: cleaned })
            .eq("id", contentId);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, content: cleaned }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (e) {
        console.error("Refine content error:", e);
        return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
            status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
