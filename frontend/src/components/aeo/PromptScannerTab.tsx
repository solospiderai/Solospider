import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { submitPromptScanJob, workerAvailable } from "@/lib/worker-client";
import {
  Loader2, Zap, CheckCircle2, XCircle, Minus,
  TrendingUp, TrendingDown, Brain, RefreshCw, ChevronDown, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ScanResult {
  id: string;
  prompt_text: string;
  model: string;
  response_text: string | null;
  brand_mentioned: boolean;
  mention_position: number | null;
  mention_context: string | null;
  mention_sentiment: string;
  mention_count: number;
  competitors_mentioned: string[];
  status: string;
  latency_ms: number | null;
  scanned_at: string;
}

interface ScanRun {
  id: string;
  status: string;
  total_prompts: number;
  completed: number;
  brand_mentioned_count: number;
  started_at: string;
  finished_at: string | null;
}

const MODEL_COLORS: Record<string, string> = {
  chatgpt:   "#10a37f",
  gemini:    "#4285f4",
  perplexity:"#262626",
  claude:    "#d97757",
  grok:      "#1da1f2",
  deepseek:  "#6366f1",
};

const AI_MODELS = [
  { id: "chatgpt",    label: "ChatGPT" },
  { id: "gemini",     label: "Gemini" },
  { id: "perplexity", label: "Perplexity" },
  { id: "claude",     label: "Claude" },
  { id: "grok",       label: "Grok" },
  { id: "deepseek",   label: "DeepSeek" },
];

interface Props {
  projectId: string;
  brandName: string;
  selectedModels: string[];
}

export function PromptScannerTab({ projectId, brandName, selectedModels }: Props) {
  const [scanning, setScanning]       = useState(false);
  const [scanRun, setScanRun]         = useState<ScanRun | null>(null);
  const [results, setResults]         = useState<ScanResult[]>([]);
  const [activeModels, setActiveModels] = useState<string[]>(selectedModels);
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterMention, setFilterMention] = useState<"all" | "mentioned" | "not_mentioned">("all");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { loadLatestRun(); loadResults(); }, [projectId]);
  useEffect(() => { setActiveModels(selectedModels); }, [selectedModels]);

  async function loadLatestRun() {
    const { data } = await supabase
      .from("prompt_scan_runs").select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (data) setScanRun(data as ScanRun);
  }

  async function loadResults() {
    const { data } = await supabase
      .from("prompt_scan_results").select("*")
      .eq("project_id", projectId)
      .order("scanned_at", { ascending: false }).limit(200);
    if (data) setResults(data as ScanResult[]);
  }

  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      await loadLatestRun();
      await loadResults();
    }, 3000);
  }

  function stopPolling() {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  }

  useEffect(() => {
    if (scanRun?.status === "running") startPolling();
    else stopPolling();
    return stopPolling;
  }, [scanRun?.status]);

  async function startScan() {
    if (!brandName) { toast.error("Set a brand name in the scan card first."); return; }
    if (activeModels.length === 0) { toast.error("Select at least one AI model."); return; }
    setScanning(true);

    try {
      if (workerAvailable()) {
        // ── Railway Worker path ────────────────────────────────────────────
        toast.info("🚂 Sending scan job to Railway worker…");
        await submitPromptScanJob({
          project_id: projectId,
          brand_name: brandName,
          models: activeModels,
        });
        toast.success("✅ Scan job queued — results will appear as AI models respond…");
        startPolling();
      } else {
        // ── Edge Function fallback ─────────────────────────────────────────
        toast.info("🤖 Querying AI models via Edge Function…");
        const { data, error } = await supabase.functions.invoke("run-prompt-scan", {
          body: { project_id: projectId, brand_name: brandName, models: activeModels },
        });
        if (error) throw error;
        toast.success(`✅ Scan done — brand mentioned in ${data.brand_mentioned}/${data.total_queries} responses (${data.mention_rate_pct}%)`);
      }
      await loadLatestRun();
      await loadResults();
    } catch (e: any) {
      toast.error(`Scan failed: ${e?.message || "Unknown error"}`);
    } finally {
      setScanning(false);
    }
  }

  // Stats
  const mentionedCount  = results.filter(r => r.brand_mentioned).length;
  const mentionRate     = results.length > 0 ? Math.round((mentionedCount / results.length) * 100) : 0;
  const positiveCount   = results.filter(r => r.mention_sentiment === "positive").length;
  const avgLatency      = results.length > 0
    ? Math.round(results.reduce((a, b) => a + (b.latency_ms || 0), 0) / results.length)
    : 0;

  // Per-model stats
  const modelStats = AI_MODELS.map(m => {
    const modelResults = results.filter(r => r.model === m.id);
    const mentioned = modelResults.filter(r => r.brand_mentioned).length;
    return { ...m, total: modelResults.length, mentioned, rate: modelResults.length > 0 ? Math.round((mentioned / modelResults.length) * 100) : 0 };
  }).filter(m => m.total > 0);

  // Filter results
  const filtered = results.filter(r => {
    if (filterModel !== "all" && r.model !== filterModel) return false;
    if (filterMention === "mentioned" && !r.brand_mentioned) return false;
    if (filterMention === "not_mentioned" && r.brand_mentioned) return false;
    return true;
  });

  const pct = scanRun && scanRun.total_prompts > 0
    ? Math.min(100, Math.round((scanRun.completed / scanRun.total_prompts) * 100))
    : (scanRun?.status === "running" ? 15 : 0);

  return (
    <div className="space-y-6 mt-2">

      {/* ── Control Card ── */}
      <div className="rounded-2xl border border-line bg-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-black text-lg text-ink flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> AI Prompt Scanner
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sends your tracked prompts to real AI models and checks if <strong>{brandName || "your brand"}</strong> is cited in the answers.
            </p>
          </div>
          <Button
            onClick={startScan}
            disabled={scanning || scanRun?.status === "running"}
            className="h-9 px-5 rounded-xl font-black text-xs btn-grad text-white shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all"
          >
            {scanning || scanRun?.status === "running"
              ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Scanning…</>
              : results.length > 0
                ? <><RefreshCw className="h-3.5 w-3.5 mr-2" /> Re-Run Scan</>
                : <><Zap className="h-3.5 w-3.5 mr-2" /> Run Scan</>
            }
          </Button>
        </div>

        {/* Model selector */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Models to Query</p>
          <div className="flex flex-wrap gap-2">
            {AI_MODELS.map(m => (
              <button
                key={m.id}
                onClick={() => setActiveModels(prev =>
                  prev.includes(m.id) ? prev.filter(x => x !== m.id) : [...prev, m.id]
                )}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold border transition-all",
                  activeModels.includes(m.id) ? "text-white border-transparent shadow-sm" : "bg-white border-slate-200 text-slate-500"
                )}
                style={activeModels.includes(m.id) ? { backgroundColor: MODEL_COLORS[m.id] } : {}}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeModels.includes(m.id) ? "rgba(255,255,255,0.7)" : MODEL_COLORS[m.id] }} />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {scanRun && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span className="flex items-center gap-2">
                {scanRun.status === "running" && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                {scanRun.status === "done"    && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                <span className="capitalize">{scanRun.status}</span>
              </span>
              <span>{scanRun.completed}/{scanRun.total_prompts} queries</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full transition-all duration-500",
                scanRun.status === "done" ? "bg-emerald-500" :
                scanRun.status === "failed" ? "bg-red-500" : "bg-primary animate-pulse"
              )} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ── */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Queries Run",     value: results.length,     color: "text-ink" },
            { label: "Brand Mentioned", value: `${mentionedCount} (${mentionRate}%)`, color: mentionRate > 50 ? "text-emerald-500" : "text-orange-500" },
            { label: "Positive Sentiment", value: positiveCount,  color: "text-blue-500" },
            { label: "Avg Latency",     value: `${avgLatency}ms`, color: "text-slate-500" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-line bg-card p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
              <p className={cn("text-2xl font-black mt-1", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Per-Model Breakdown ── */}
      {modelStats.length > 0 && (
        <div className="rounded-2xl border border-line bg-card p-5">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Citation Rate by AI Model</p>
          <div className="grid md:grid-cols-3 gap-3">
            {modelStats.map(m => (
              <div key={m.id} className="rounded-xl border border-line p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${MODEL_COLORS[m.id]}20` }}>
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: MODEL_COLORS[m.id] }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm text-ink">{m.label}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.rate}%`, backgroundColor: MODEL_COLORS[m.id] }} />
                    </div>
                    <span className="text-[11px] font-black text-slate-500">{m.rate}%</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400">{m.mentioned}/{m.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Results Table ── */}
      {results.length > 0 && (
        <div className="rounded-2xl border border-line bg-card overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-line flex flex-wrap gap-2 items-center">
            <select
              value={filterModel}
              onChange={e => setFilterModel(e.target.value)}
              className="h-8 rounded-lg border border-line bg-bg px-2 text-xs font-bold text-ink"
            >
              <option value="all">All Models</option>
              {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            {(["all", "mentioned", "not_mentioned"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterMention(f)}
                className={cn("px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all",
                  filterMention === f ? "bg-primary text-white border-primary" : "border-line text-slate-500 hover:border-primary/40"
                )}
              >
                {f === "all" ? "All" : f === "mentioned" ? "✓ Cited" : "✗ Not Cited"}
              </button>
            ))}
            <span className="ml-auto text-[10px] text-slate-400 font-bold">{filtered.length} results</span>
          </div>

          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/60 border-b border-line">
            <div className="col-span-1">Model</div>
            <div className="col-span-5">Prompt</div>
            <div className="col-span-2">Cited?</div>
            <div className="col-span-2">Sentiment</div>
            <div className="col-span-2">Latency</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-line max-h-[480px] overflow-y-auto">
            {filtered.map(r => (
              <div key={r.id}>
                <div
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/60 cursor-pointer group transition-colors"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                >
                  <div className="col-span-1">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-[9px] font-black"
                      style={{ backgroundColor: MODEL_COLORS[r.model] || "#888" }}>
                      {r.model.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="col-span-5 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{r.prompt_text}</p>
                  </div>
                  <div className="col-span-2">
                    {r.brand_mentioned
                      ? <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Cited</span>
                      : <span className="inline-flex items-center gap-1 text-[11px] font-black text-slate-400"><XCircle className="h-3.5 w-3.5" /> Not cited</span>
                    }
                  </div>
                  <div className="col-span-2">
                    {r.mention_sentiment === "positive" && <span className="text-[11px] font-black text-emerald-500 flex items-center gap-1"><TrendingUp className="h-3 w-3"/>Positive</span>}
                    {r.mention_sentiment === "negative" && <span className="text-[11px] font-black text-red-500 flex items-center gap-1"><TrendingDown className="h-3 w-3"/>Negative</span>}
                    {r.mention_sentiment === "neutral"  && <span className="text-[11px] font-black text-slate-400 flex items-center gap-1"><Minus className="h-3 w-3"/>Neutral</span>}
                    {r.mention_sentiment === "not_mentioned" && <span className="text-[11px] text-slate-300">—</span>}
                  </div>
                  <div className="col-span-2 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">{r.latency_ms ? `${r.latency_ms}ms` : "—"}</span>
                    {expandedId === r.id ? <ChevronDown className="h-3 w-3 text-slate-400" /> : <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === r.id && (
                  <div className="px-6 pb-5 pt-3 bg-slate-50/80 border-t border-line space-y-4">
                    {r.mention_context && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Brand Citation Context</p>
                        <blockquote className="border-l-2 border-primary pl-3 text-xs italic text-slate-600 leading-relaxed">
                          "{r.mention_context}"
                        </blockquote>
                        {r.mention_count > 1 && (
                          <p className="text-[10px] text-primary font-black mt-1">+ {r.mention_count - 1} more mentions in response</p>
                        )}
                      </div>
                    )}
                    {r.competitors_mentioned.length > 0 && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Competitors Also Mentioned</p>
                        <div className="flex flex-wrap gap-1.5">
                          {r.competitors_mentioned.map(c => (
                            <span key={c} className="px-2 py-0.5 rounded-lg bg-pink-50 border border-pink-200 text-[10px] font-black text-pink-600">{c}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {r.response_text && (
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Full AI Response</p>
                        <div className="bg-bg border border-line rounded-xl p-3 text-xs text-slate-600 leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                          {r.response_text}
                        </div>
                      </div>
                    )}
                    {r.status === "error" && (
                      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                        <XCircle className="h-4 w-4 shrink-0" /> {r.response_text || "API error"}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 py-3 border-t border-line bg-slate-50/40 flex justify-between text-[10px] font-bold text-slate-400">
            <span>Showing {filtered.length} of {results.length} results</span>
            <span>{mentionedCount} cited · {results.length - mentionedCount} not cited · {mentionRate}% overall rate</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {results.length === 0 && !scanning && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Brain className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-black text-base text-ink">No scan results yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Add prompts in the <strong>Prompt Lab</strong> tab, then click <strong>Run Scan</strong> to query real AI models and see if they cite your brand.
            </p>
          </div>
          <Button onClick={startScan} disabled={scanning}
            className="btn-grad text-white font-black px-8 h-11 rounded-xl shadow-lg shadow-primary/20">
            <Zap className="h-4 w-4 mr-2" /> Run First Scan
          </Button>
        </div>
      )}
    </div>
  );
}
