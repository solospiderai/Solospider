import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { keyword } = await req.json();
    if (!keyword) {
      return new Response(JSON.stringify({ error: "Missing keyword" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not configured");

    const prompt = `Create an SEO title for the keyword: "${keyword}".
STRICT RULES:
- MUST contain the exact keyword "${keyword}" once
- Length: STRICTLY 50-65 characters
- Word count: 6-12 words
- MUST be formatted in strict Title Case (e.g., "The Quick Brown Fox Jumps Over the Lazy Dog")
- Use simple, everyday words only
- Make it specific and valuable (e.g. "How to...", "Why...", "Best...")
- No clickbait, no all-caps, no complex words
- Return ONLY the title text, nothing else, no quotes.`;

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
        messages: [{ role: "user", content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter error: ${errorText}`);
    }

    const data = await response.json();
    let title = data.choices?.[0]?.message?.content || "";
    title = title.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/^["']|["']$/g, "").trim();

    // Enforce Title Case fallback programmatically
    title = title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

    return new Response(JSON.stringify({ title }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Generate title error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
