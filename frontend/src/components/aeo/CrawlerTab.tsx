import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { submitCrawlJob, workerAvailable } from "@/lib/worker-client";
import {
  Globe, Loader2, CheckCircle2, AlertCircle, FileText,
  Search, ExternalLink, LayoutList, Code2, HelpCircle,
  Zap, RefreshCw, ChevronDown, ChevronRight, Clock, Server
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface CrawledPage {
  id: string;
  url: string;
  title: string | null;
  meta_desc: string | null;
  h1: string | null;
  word_count: number;
  schema_types: string[];
  has_faq_schema: boolean;
  has_howto: boolean;
  status_code: number | null;
  source: string;
  crawled_at: string;
}

interface CrawlRun {
  id: string;
  status: "pending" | "running" | "done" | "failed";
  pages_found: number;
  pages_crawled: number;
  error: string | null;
  started_at: string;
  finished_at: string | null;
}

interface CrawlerTabProps {
  projectId: string;
  website: string;
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function SchemaTypeBadge({ type }: { type: string }) {
  const isFaq = type.toLowerCase().includes("faq");
  const isHowTo = type.toLowerCase().includes("howto");
  const isArticle = type.toLowerCase().includes("article");
  const isProduct = type.toLowerCase().includes("product");

  return (
    <span className={cn(
      "inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
      isFaq      && "bg-emerald-500/10 text-emerald-600 border-emerald-300/40",
      isHowTo    && "bg-blue-500/10 text-blue-600 border-blue-300/40",
      isArticle  && "bg-purple-500/10 text-purple-600 border-purple-300/40",
      isProduct  && "bg-orange-500/10 text-orange-600 border-orange-300/40",
      !isFaq && !isHowTo && !isArticle && !isProduct && "bg-slate-100 text-slate-500 border-slate-200",
    )}>
      {type.slice(0, 20)}
    </span>
  );
}

function StatusDot({ code }: { code: number | null }) {
  if (!code) return <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />;
  if (code >= 200 && code < 300) return <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />;
  if (code >= 300 && code < 400) return <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />;
  return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />;
}

function CrawlProgressBar({ run }: { run: CrawlRun | null }) {
  if (!run) return null;
  const pct = run.pages_found > 0
    ? Math.min(100, Math.round((run.pages_crawled / run.pages_found) * 100))
    : (run.status === "running" ? 15 : 0);

  const statusColor =
    run.status === "done"    ? "bg-emerald-500" :
    run.status === "failed"  ? "bg-red-500" :
    run.status === "running" ? "bg-primary" :
    "bg-slate-300";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-slate-600">
        <span className="flex items-center gap-2">
          {run.status === "running" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
          {run.status === "done"    && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          {run.status === "failed"  && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
          <span className="capitalize">{run.status}</span>
          {run.status === "running" && <span className="text-slate-400">— crawling pages…</span>}
        </span>
        <span className="text-slate-400">
          {run.pages_crawled}/{run.pages_found > 0 ? run.pages_found : "?"} pages
        </span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", statusColor,
            run.status === "running" && "animate-pulse")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────

export function CrawlerTab({ projectId, website }: CrawlerTabProps) {
  const [crawling, setCrawling] = useState(false);
  const [crawlRun, setCrawlRun] = useState<CrawlRun | null>(null);
  const [pages, setPages] = useState<CrawledPage[]>([]);
  const [search, setSearch] = useState("");
  const [filterSchema, setFilterSchema] = useState<"all" | "faq" | "howto" | "no-schema">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [maxPages, setMaxPages] = useState(50);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Load existing crawl data on mount ──────────────────────
  useEffect(() => {
    loadLatestRun();
    loadPages();
  }, [projectId]);

  async function loadLatestRun() {
    const { data } = await supabase
      .from("crawl_runs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) setCrawlRun(data as CrawlRun);
  }

  async function loadPages() {
    const { data } = await supabase
      .from("crawled_pages")
      .select("*")
      .eq("project_id", projectId)
      .order("crawled_at", { ascending: false })
      .limit(200);
    if (data) setPages(data as CrawledPage[]);
  }

  // ── Poll for live progress while running ───────────────────
  function startPolling() {
    stopPolling();
    pollRef.current = setInterval(async () => {
      await loadLatestRun();
      await loadPages();
    }, 2500);
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  useEffect(() => {
    if (crawlRun?.status === "running") {
      startPolling();
    } else {
      stopPolling();
    }
    return stopPolling;
  }, [crawlRun?.status]);

  // ── Start a crawl ──────────────────────────────────────────
  async function startCrawl() {
    if (!website) {
      toast.error("No website URL configured for this project.");
      return;
    }
    setCrawling(true);

    try {
      if (workerAvailable()) {
        // ── Railway Worker path ──────────────────────────────────────────────
        toast.info("🚂 Sending crawl job to Railway worker…");
        await submitCrawlJob({ project_id: projectId, website, max_pages: maxPages });
        toast.success("✅ Crawl job queued — watching for live updates…");
        startPolling(); // DB updates come from the worker writing to Supabase
      } else {
        // ── Edge Function fallback ───────────────────────────────────────────
        toast.info("🕷️ Crawling via Edge Function (set VITE_WORKER_URL for Railway)…");
        const { data, error } = await supabase.functions.invoke("crawl-website", {
          body: { project_id: projectId, website, max_pages: maxPages },
        });
        if (error) throw error;
        toast.success(`✅ Crawled ${data.pages_crawled} pages`);
      }
      await loadLatestRun();
      await loadPages();
    } catch (e: any) {
      toast.error(`Crawl failed: ${e?.message || "Unknown error"}`);
      setCrawlRun(prev => prev ? { ...prev, status: "failed", error: e?.message } : null);
    } finally {
      setCrawling(false);
    }
  }

  // ── Derived stats ──────────────────────────────────────────
  const faqCount    = pages.filter(p => p.has_faq_schema).length;
  const howToCount  = pages.filter(p => p.has_howto).length;
  const noSchemaCount = pages.filter(p => p.schema_types.length === 0).length;
  const okCount     = pages.filter(p => (p.status_code ?? 0) >= 200 && (p.status_code ?? 0) < 300).length;

  const filtered = pages.filter(p => {
    const matchSearch = !search || p.url.toLowerCase().includes(search.toLowerCase())
      || (p.title || "").toLowerCase().includes(search.toLowerCase());
    const matchSchema =
      filterSchema === "all"       ? true :
      filterSchema === "faq"       ? p.has_faq_schema :
      filterSchema === "howto"     ? p.has_howto :
      filterSchema === "no-schema" ? p.schema_types.length === 0 : true;
    return matchSearch && matchSchema;
  });

  // ─────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 mt-2">

      {/* ─── CONTROL CARD ─── */}
      <div className="rounded-2xl border border-line bg-card p-6 space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="font-black text-lg text-ink flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Site Crawler
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Discovers all pages via <code className="bg-slate-100 px-1 rounded">sitemap.xml</code> (falls back to homepage link crawl) · Extracts title, meta, H1, schema types
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-bold text-slate-500">Max pages</label>
              <select
                value={maxPages}
                onChange={e => setMaxPages(Number(e.target.value))}
                className="h-8 rounded-lg border border-line bg-bg px-2 text-xs font-bold text-ink"
              >
                {[25, 50, 100, 200].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={startCrawl}
              disabled={crawling || crawlRun?.status === "running"}
              className="h-9 px-5 rounded-xl font-black text-xs btn-grad text-white shadow-lg shadow-primary/20 hover:scale-[1.03] transition-all"
            >
              {crawling || crawlRun?.status === "running"
                ? <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Crawling…</>
                : pages.length > 0
                  ? <><RefreshCw className="h-3.5 w-3.5 mr-2" /> Re-Crawl</>
                  : <><Zap className="h-3.5 w-3.5 mr-2" /> Start Crawl</>
              }
            </Button>
          </div>
        </div>

        {/* Progress */}
        {crawlRun && <CrawlProgressBar run={crawlRun} />}

        {/* Last crawl timestamp */}
        {crawlRun?.finished_at && (
          <p className="text-[10px] text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last crawl: {new Date(crawlRun.finished_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* ─── STAT CARDS ─── */}
      {pages.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Pages", value: pages.length, icon: LayoutList, color: "text-primary" },
            { label: "OK (2xx)", value: okCount, icon: CheckCircle2, color: "text-emerald-500" },
            { label: "FAQ Schema", value: faqCount, icon: HelpCircle, color: "text-blue-500" },
            { label: "No Schema", value: noSchemaCount, icon: Code2, color: "text-orange-500" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-line bg-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className={cn("text-2xl font-black mt-0.5", s.color)}>{s.value}</p>
              </div>
              <s.icon className={cn("h-6 w-6", s.color)} />
            </div>
          ))}
        </div>
      )}

      {/* ─── AEO INSIGHT BANNER ─── */}
      {pages.length > 0 && noSchemaCount > 0 && (
        <div className="rounded-2xl border border-orange-300/40 bg-orange-50/60 px-5 py-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-sm text-orange-700">
              {noSchemaCount} pages have no Schema.org markup
            </p>
            <p className="text-xs text-orange-600 mt-0.5 leading-relaxed">
              AI engines like ChatGPT and Claude prioritise structured content.
              Add <strong>FAQPage</strong> or <strong>HowTo</strong> schema to these pages to dramatically increase citation rate.
            </p>
          </div>
        </div>
      )}

      {/* ─── PAGES TABLE ─── */}
      {pages.length > 0 && (
        <div className="rounded-2xl border border-line bg-card overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-line flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Filter by URL or title…"
                className="pl-9 h-9 text-xs rounded-xl border-line bg-bg"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(["all", "faq", "howto", "no-schema"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilterSchema(f)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider border transition-all",
                    filterSchema === f
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "border-line text-slate-500 hover:border-primary/40"
                  )}
                >
                  {f === "all" ? `All (${pages.length})` :
                   f === "faq" ? `FAQ Schema (${faqCount})` :
                   f === "howto" ? `HowTo (${howToCount})` :
                   `No Schema (${noSchemaCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Table header */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/60 border-b border-line">
            <div className="col-span-1">Status</div>
            <div className="col-span-4">URL</div>
            <div className="col-span-3">Title / H1</div>
            <div className="col-span-2">Schema Types</div>
            <div className="col-span-1 text-right">Words</div>
            <div className="col-span-1 text-right">Source</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-line max-h-[520px] overflow-y-auto">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-slate-400">
                No pages match your filter.
              </div>
            )}
            {filtered.map(page => (
              <div key={page.id}>
                {/* Main row */}
                <div
                  className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-slate-50/60 cursor-pointer transition-colors group"
                  onClick={() => setExpandedId(expandedId === page.id ? null : page.id)}
                >
                  <div className="col-span-1 flex items-center gap-1.5">
                    <StatusDot code={page.status_code} />
                    <span className="text-[10px] font-bold text-slate-400 hidden md:inline">{page.status_code || "?"}</span>
                  </div>
                  <div className="col-span-4 min-w-0">
                    <p className="text-xs font-bold text-primary truncate">{page.url}</p>
                  </div>
                  <div className="col-span-3 min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{page.title || "—"}</p>
                    {page.h1 && page.h1 !== page.title && (
                      <p className="text-[10px] text-slate-400 truncate">H1: {page.h1}</p>
                    )}
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {page.schema_types.length === 0 && (
                      <span className="text-[10px] text-slate-300 font-bold">none</span>
                    )}
                    {page.schema_types.slice(0, 2).map(t => (
                      <SchemaTypeBadge key={t} type={t} />
                    ))}
                    {page.schema_types.length > 2 && (
                      <span className="text-[9px] text-slate-400">+{page.schema_types.length - 2}</span>
                    )}
                  </div>
                  <div className="col-span-1 text-right text-[10px] font-bold text-slate-400">
                    {page.word_count > 0 ? page.word_count.toLocaleString() : "—"}
                  </div>
                  <div className="col-span-1 text-right flex justify-end items-center gap-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300 hidden md:inline">{page.source}</span>
                    {expandedId === page.id
                      ? <ChevronDown className="h-3 w-3 text-slate-400" />
                      : <ChevronRight className="h-3 w-3 text-slate-300 group-hover:text-slate-400" />
                    }
                  </div>
                </div>

                {/* Expanded detail row */}
                {expandedId === page.id && (
                  <div className="px-6 pb-5 pt-2 bg-slate-50/80 border-t border-line space-y-3">
                    <div className="grid md:grid-cols-2 gap-4">
                      {page.meta_desc && (
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Meta Description</p>
                          <p className="text-xs text-slate-600 leading-relaxed">{page.meta_desc}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">All Schema Types</p>
                        <div className="flex flex-wrap gap-1">
                          {page.schema_types.length === 0
                            ? <span className="text-xs text-slate-400 italic">No schema markup detected</span>
                            : page.schema_types.map(t => <SchemaTypeBadge key={t} type={t} />)
                          }
                        </div>
                      </div>
                    </div>

                    {/* AEO tips for this page */}
                    {page.schema_types.length === 0 && (
                      <div className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 p-3">
                        <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-orange-700">
                          <strong>AEO Opportunity:</strong> This page has no structured schema. Adding FAQPage or HowTo markup could significantly increase AI citation likelihood.
                        </p>
                      </div>
                    )}
                    {page.has_faq_schema && (
                      <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-emerald-700">
                          <strong>FAQ Schema detected</strong> — this page is well-optimised for AI engine citation.
                        </p>
                      </div>
                    )}

                    <a
                      href={page.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" /> Open page
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-line bg-slate-50/40 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400">
              Showing {filtered.length} of {pages.length} pages
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {faqCount} with FAQ · {howToCount} with HowTo · {noSchemaCount} without schema
            </span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {pages.length === 0 && !crawling && (
        <div className="rounded-2xl border border-dashed border-slate-200 py-16 flex flex-col items-center gap-4 text-center">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Globe className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="font-black text-base text-ink">No pages crawled yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click <strong>Start Crawl</strong> above to discover all pages on{" "}
              <span className="text-primary font-bold">{website || "your website"}</span>.
              We'll extract titles, meta descriptions, H1s and Schema.org markup automatically.
            </p>
          </div>
          <Button
            onClick={startCrawl}
            disabled={crawling}
            className="btn-grad text-white font-black px-8 h-11 rounded-xl shadow-lg shadow-primary/20"
          >
            <Zap className="h-4 w-4 mr-2" /> Start Crawl
          </Button>
        </div>
      )}
    </div>
  );
}
