import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Model → OpenRouter model ID mapping ─────────────────────────────────────
const MODEL_MAP: Record<string, string> = {
  chatgpt:   "openai/gpt-4o-mini",
  gemini:    "google/gemini-2.0-flash-001",
  claude:    "anthropic/claude-3-haiku",
  perplexity:"perplexity/llama-3.1-sonar-small-128k-online", // has web access!
  grok:      "x-ai/grok-3-mini-beta",
  deepseek:  "deepseek/deepseek-chat",
};

// ─── Citation Parser ──────────────────────────────────────────────────────────
function parseCitations(
  responseText: string,
  brandName: string,
  competitors: string[]
): {
  brandMentioned: boolean;
  mentionPosition: number | null;
  mentionContext: string | null;
  mentionSentiment: string;
  mentionCount: number;
  competitorsMentioned: string[];
} {
  const lower = responseText.toLowerCase();
  const brandLower = brandName.toLowerCase();

  // Count all brand mentions
  const mentionCount = (lower.match(new RegExp(brandLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  const brandMentioned = mentionCount > 0;

  // Find first mention position (which sentence)
  let mentionPosition: number | null = null;
  let mentionContext: string | null = null;

  if (brandMentioned) {
    // Split into sentences
    const sentences = responseText.split(/(?<=[.!?])\s+/);
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].toLowerCase().includes(brandLower)) {
        mentionPosition = i + 1; // 1-indexed
        mentionContext = sentences[i].trim().slice(0, 400);
        break;
      }
    }
  }

  // Sentiment detection (simple keyword scoring)
  let mentionSentiment = "not_mentioned";
  if (brandMentioned) {
    const positiveWords = ["best", "top", "recommended", "excellent", "great", "leading", "trusted", "popular", "powerful", "innovative", "perfect"];
    const negativeWords = ["avoid", "bad", "poor", "limited", "expensive", "problematic", "disappointing", "worst", "lacking", "buggy"];
    const ctx = mentionContext?.toLowerCase() || lower;
    const posScore = positiveWords.filter(w => ctx.includes(w)).length;
    const negScore = negativeWords.filter(w => ctx.includes(w)).length;
    if (posScore > negScore) mentionSentiment = "positive";
    else if (negScore > posScore) mentionSentiment = "negative";
    else mentionSentiment = "neutral";
  }

  // Which competitors are mentioned?
  const competitorsMentioned = competitors.filter(c =>
    lower.includes(c.toLowerCase())
  );

  return { brandMentioned, mentionPosition, mentionContext, mentionSentiment, mentionCount, competitorsMentioned };
}

// ─── Query a single AI model via OpenRouter ───────────────────────────────────
async function queryModel(
  openrouterKey: string,
  modelId: string,
  promptText: string,
  brandName: string
): Promise<{ text: string; latencyMs: number }> {
  const start = Date.now();

  const systemPrompt = `You are a helpful assistant. Answer the following question naturally and comprehensively. If you know of any products, tools, services, or brands that are relevant to the question, mention them by name. Be specific and mention actual company/product names where relevant.`;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openrouterKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://solospider.ai",
      "X-Title": "SoloSpider AEO Prompt Scanner",
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: promptText },
      ],
      max_tokens: 800,
      temperature: 0.3, // lower temp = more consistent/factual
    }),
  });

  const latencyMs = Date.now() - start;

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter ${modelId} returned ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return { text, latencyMs };
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const openrouterKey = Deno.env.get("OPENROUTER_API_KEY") ?? "";
  const supabase    = createClient(supabaseUrl, serviceKey);

  if (!openrouterKey) {
    return new Response(JSON.stringify({ error: "OPENROUTER_API_KEY not configured" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const projectId  = String(body.project_id || "").trim();
    const brandName  = String(body.brand_name || "").trim();
    const models     = Array.isArray(body.models) ? body.models : ["chatgpt", "gemini", "perplexity", "claude"];
    const competitors = Array.isArray(body.competitors) ? body.competitors : [];
    // Optional: specific prompt IDs to run, or run all active prompts
    const promptIds: string[] | null = Array.isArray(body.prompt_ids) ? body.prompt_ids : null;

    if (!projectId || !brandName) {
      throw new Error("project_id and brand_name are required");
    }

    // ── 1. Load prompts from DB ───────────────────────────────────────────────
    let promptQuery = supabase
      .from("aeo_prompts")
      .select("id, prompt, topic")
      .eq("project_id", projectId)
      .eq("is_active", true);

    if (promptIds && promptIds.length > 0) {
      promptQuery = promptQuery.in("id", promptIds);
    }

    const { data: prompts, error: promptsErr } = await promptQuery.limit(20);
    if (promptsErr) throw promptsErr;

    if (!prompts || prompts.length === 0) {
      throw new Error("No active prompts found for this project. Add prompts in the Prompt Lab tab first.");
    }

    // ── 2. Create scan run record ─────────────────────────────────────────────
    const totalOps = prompts.length * models.length;
    const { data: runRow, error: runErr } = await supabase
      .from("prompt_scan_runs")
      .insert({
        project_id: projectId,
        brand_name: brandName,
        models,
        status: "running",
        total_prompts: totalOps,
        completed: 0,
      })
      .select("id")
      .single();
    if (runErr) throw runErr;
    const runId = runRow.id as string;

    console.log(`Scan run ${runId}: ${prompts.length} prompts × ${models.length} models = ${totalOps} queries`);

    // ── 3. Run each prompt × model combination ────────────────────────────────
    let completed = 0;
    let brandMentionedCount = 0;

    for (const prompt of prompts) {
      for (const modelKey of models) {
        const openrouterModelId = MODEL_MAP[modelKey];
        if (!openrouterModelId) {
          console.warn(`Unknown model key: ${modelKey}, skipping`);
          continue;
        }

        let responseText = "";
        let latencyMs = 0;
        let status = "success";
        let errorMessage: string | null = null;

        try {
          console.log(`Querying ${modelKey} (${openrouterModelId}) with: "${prompt.prompt.slice(0, 80)}..."`);
          const result = await queryModel(openrouterKey, openrouterModelId, prompt.prompt, brandName);
          responseText = result.text;
          latencyMs = result.latencyMs;
        } catch (e: unknown) {
          status = "error";
          errorMessage = e instanceof Error ? e.message : String(e);
          console.error(`Model ${modelKey} error:`, errorMessage);
        }

        // Parse citations from the response
        const citations = parseCitations(responseText, brandName, competitors);
        if (citations.brandMentioned) brandMentionedCount++;

        // Save result to DB
        const { error: insertErr } = await supabase.from("prompt_scan_results").insert({
          project_id:           projectId,
          prompt_id:            prompt.id,
          prompt_text:          prompt.prompt,
          model:                modelKey,
          response_text:        responseText,
          brand_mentioned:      citations.brandMentioned,
          mention_position:     citations.mentionPosition,
          mention_context:      citations.mentionContext,
          mention_sentiment:    citations.mentionSentiment,
          mention_count:        citations.mentionCount,
          competitors_mentioned: citations.competitorsMentioned,
          status,
          error_message:        errorMessage,
          latency_ms:           latencyMs,
        });
        if (insertErr) console.warn("Insert error:", insertErr.message);

        // Also upsert into aeo_citations table (the existing one) for backward compat
        if (citations.brandMentioned) {
          await supabase.from("aeo_citations").insert({
            project_id:    projectId,
            provider:      modelKey,
            query:         prompt.prompt,
            cited_title:   brandName,
            position:      citations.mentionPosition,
            metadata: {
              context:     citations.mentionContext,
              sentiment:   citations.mentionSentiment,
              source:      "prompt_scan",
              run_id:      runId,
            },
          }).then(() => {});
        }

        completed++;
        // Update progress on run
        await supabase
          .from("prompt_scan_runs")
          .update({ completed, brand_mentioned_count: brandMentionedCount })
          .eq("id", runId);

        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 200));
      }
    }

    // ── 4. Mark run complete ───────────────────────────────────────────────────
    await supabase
      .from("prompt_scan_runs")
      .update({
        status: "done",
        completed,
        brand_mentioned_count: brandMentionedCount,
        finished_at: new Date().toISOString(),
      })
      .eq("id", runId);

    // ── 5. Return summary ──────────────────────────────────────────────────────
    const mentionRate = totalOps > 0 ? Math.round((brandMentionedCount / completed) * 100) : 0;

    return new Response(JSON.stringify({
      ok: true,
      run_id: runId,
      prompts_scanned: prompts.length,
      models_scanned: models.length,
      total_queries: completed,
      brand_mentioned: brandMentionedCount,
      mention_rate_pct: mentionRate,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("run-prompt-scan fatal error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
