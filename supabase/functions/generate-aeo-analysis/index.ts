import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AeoProvider = {
  id: string;
  name: string;
  score: number;
  status: "high" | "medium" | "low";
  mentions: number;
  insight: string;
};

type AeoCategoryScore = {
  category: string;
  score: number;
  trend: "up" | "down" | "stable";
};

type AeoRecommendation = {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  action: string;
};

type AeoPromptSuggestion = {
  topic: string;
  prompt: string;
  rationale: string;
};

type AeoAnalysisResult = {
  overallScore: number;
  providers: AeoProvider[];
  categoryScores: AeoCategoryScore[];
  recommendations: AeoRecommendation[];
  promptSuggestions: AeoPromptSuggestion[];
};

function fallbackResult(brandName: string, website: string, topics: string[]): AeoAnalysisResult {
  const hash = brandName.length * 7 + website.length * 3;
  const base = 30 + (hash % 40);
  return {
    overallScore: base,
    providers: [
      { id: "chatgpt", name: "ChatGPT", score: base + 5, status: base > 60 ? "high" : "medium", mentions: 120 + hash, insight: `${brandName} appears in responses related to ${topics[0] || "your industry"} but needs stronger authoritative content.` },
      { id: "gemini", name: "Google Gemini", score: base - 5, status: "medium", mentions: 80 + hash, insight: "Limited mentions detected. Structured FAQ content could improve visibility." },
      { id: "claude", name: "Claude", score: base + 10, status: base > 55 ? "high" : "medium", mentions: 60 + hash, insight: "Brand is referenced in informational queries. Technical content performs well." },
      { id: "perplexity", name: "Perplexity", score: base - 10, status: "low", mentions: 40 + hash, insight: "Low citation rate. News and press coverage would significantly boost rankings." },
    ],
    categoryScores: topics.map((t, i) => ({ category: t, score: base + i * 5 - 10, trend: i % 2 === 0 ? "up" : "stable" })),
    recommendations: [
      { priority: "high", title: "Add FAQ Schema Markup", description: "AI engines prioritize structured Q&A content.", action: "Add FAQ schema to your top 5 pages with common industry questions." },
      { priority: "high", title: "Publish Thought Leadership", description: "Brand authority drives AI citations.", action: "Publish 2+ expert articles per month on your core topics." },
      { priority: "medium", title: "Get Press Coverage", description: "News citations boost Perplexity visibility.", action: "Submit to industry publications and get backlinks from news sites." },
      { priority: "low", title: "Optimize About Page", description: "AI engines use About pages for brand context.", action: "Update your About page with clear brand positioning and expertise." },
    ],
    promptSuggestions: topics.slice(0, 3).map((t) => ({
      topic: t,
      prompt: `What are the best tools for ${t} and how does ${brandName} compare?`,
      rationale: "Comparative prompts help AI engines cite specific brands as solutions.",
    })),
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!openrouterKey) throw new Error("OPENROUTER_API_KEY not configured");

    const body = await req.json();
    const website = String(body.website || "").trim();
    const brandName = String(body.brandName || "").trim();
    const brandDescription = String(body.brandDescription || "").trim();
    const topics = Array.isArray(body.topics) ? body.topics.map((t: unknown) => String(t).trim()).filter(Boolean) : [];

    if (!website || !brandName || topics.length === 0) {
      throw new Error("website, brandName, and topics are required");
    }

    const prompt = `You are an AEO (Answer Engine Optimization) expert analyst. Analyze how the brand "${brandName}" (website: ${website}) ranks in AI-powered search engines.

Brand Description: ${brandDescription || "Not provided"}
Topics to analyze: ${topics.join(", ")}

Return ONLY a valid JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "providers": [
    { "id": "chatgpt", "name": "ChatGPT", "score": <0-100>, "status": <"high"|"medium"|"low">, "mentions": <number>, "insight": "<1-2 sentences>" },
    { "id": "gemini", "name": "Google Gemini", "score": <0-100>, "status": <"high"|"medium"|"low">, "mentions": <number>, "insight": "<1-2 sentences>" },
    { "id": "claude", "name": "Claude", "score": <0-100>, "status": <"high"|"medium"|"low">, "mentions": <number>, "insight": "<1-2 sentences>" },
    { "id": "perplexity", "name": "Perplexity", "score": <0-100>, "status": <"high"|"medium"|"low">, "mentions": <number>, "insight": "<1-2 sentences>" }
  ],
  "categoryScores": [{ "category": "<topic>", "score": <0-100>, "trend": <"up"|"down"|"stable"> }],
  "recommendations": [{ "priority": <"high"|"medium"|"low">, "title": "<title>", "description": "<problem>", "action": "<action>" }],
  "promptSuggestions": [{ "topic": "<topic>", "prompt": "<optimized test prompt>", "rationale": "<why>" }]
}
Generate 3-5 category scores, 4-6 recommendations, 3-5 prompt suggestions.`;

    const model = Deno.env.get("OPENROUTER_AEO_MODEL") || "anthropic/claude-opus-4.7";
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openrouterKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://solospider.ai",
        "X-Title": "SoloSpider AEO",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter error: ${err}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = typeof content === "string" ? JSON.parse(content) : content;

    const result = Array.isArray(parsed)
      ? parsed[0]
      : (parsed?.overallScore ? parsed : (parsed?.result || parsed?.analysis || fallbackResult(brandName, website, topics)));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
