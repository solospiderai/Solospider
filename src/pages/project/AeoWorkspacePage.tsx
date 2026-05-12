/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useProject } from "./ProjectLayout";
import { supabase } from "@/integrations/supabase/client";
import { runAeoAnalysis } from "@/lib/aeo";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BarChart2, Bot, Eye, Lightbulb, Loader2, Plus, Sparkles, Target, Grid3X3, Quote, GitBranch, Map as MapIcon, LineChart, ChevronRight, Search as SearchIcon, AlertCircle, Database } from "lucide-react";
import { BarChart, Bar, CartesianGrid, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, LineChart as RechartsLineChart } from "recharts";
import { useProjects } from "@/hooks/useProjects";
import { UpgradeDialog } from "@/components/UpgradeDialog";

type AeoTab =
  | "home"
  | "visibility"
  | "heatmap"
  | "citations"
  | "prompts"
  | "competitors"
  | "fanouts"
  | "sitemap"
  | "referrals"
  | "bot-analytics";

function tabFromPath(path: string): AeoTab {
  if (path.includes("prompt-generation")) return "prompts";
  if (path.includes("visibility-score")) return "visibility";
  if (path.includes("opportunities")) return "competitors";
  return "home";
}

const AXIS_STYLE = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const SCORE_DOMAIN = [0, 100] as [number, number];
const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "10px",
  fontSize: "12px",
} as const;

export function AeoWorkspacePage({ pathKey }: { pathKey: string }) {
  const { project } = useProject();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { currentPlan } = useProjects();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [website, setWebsite] = useState(project.domain || "");
  const [brandName, setBrandName] = useState(project.brand_name || project.name);
  const [topicInput, setTopicInput] = useState("");
  const [topics, setTopics] = useState<string[]>(["brand visibility", "ai search"]);
  const [running, setRunning] = useState(false);
  const [newPromptTopic, setNewPromptTopic] = useState("");
  const [newPromptText, setNewPromptText] = useState("");
  const [ga4PropertyId, setGa4PropertyId] = useState("");
  const [syncingGa4, setSyncingGa4] = useState(false);
  const [testingGa4, setTestingGa4] = useState(false);
  const [gscSiteUrl, setGscSiteUrl] = useState("");
  const [syncingGsc, setSyncingGsc] = useState(false);
  const [testingGsc, setTestingGsc] = useState(false);
  const [citationsProviderFilter, setCitationsProviderFilter] = useState("all");
  const [citationsQueryFilter, setCitationsQueryFilter] = useState("");
  const [fanoutSearch, setFanoutSearch] = useState("");
  const [fanoutTopicFilter, setFanoutTopicFilter] = useState("all");
  const [expandedFanoutRows, setExpandedFanoutRows] = useState<string[]>([]);
  const [sitemapRange, setSitemapRange] = useState<"7d" | "30d">("7d");
  const [sitemapOverlay, setSitemapOverlay] = useState<"none" | "gsc" | "recommendations">("none");
  const [selectedSitemapNode, setSelectedSitemapNode] = useState<string | null>(null);

  const activeTab = tabFromPath(pathKey);
  const [tab, setTab] = useState<AeoTab>(activeTab);

  const { data: analysis, isLoading: isAnalysisLoading, error: analysisError } = useQuery({
    queryKey: ["aeo_analysis", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("aeo_analyses" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any;
    },
  });

  const { data: analysisHistory = [], isLoading: isAnalysisHistoryLoading, error: analysisHistoryError } = useQuery({
    queryKey: ["aeo_analyses_history", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("aeo_analyses" as any)
        .select("id, overall_score, created_at")
        .eq("project_id", project.id)
        .eq("status", "completed")
        .order("created_at", { ascending: true })
        .limit(90);
      return (data || []) as any[];
    },
  });

  const { data: savedPrompts = [], refetch: refetchPrompts, isLoading: isPromptsLoading, error: promptsError } = useQuery({
    queryKey: ["aeo_prompts", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("aeo_prompts" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
  });

  const { data: citations = [], isLoading: isCitationsLoading, error: citationsError } = useQuery({
    queryKey: ["aeo_citations", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("aeo_citations" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(50);
      return (data || []) as any[];
    },
  });

  const { data: fanouts = [], isLoading: isFanoutsLoading, error: fanoutsError } = useQuery({
    queryKey: ["query_fanouts", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("query_fanouts" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(100);
      return (data || []) as any[];
    },
  });

  const { data: referrals = [], isLoading: isReferralsLoading, error: referralsError } = useQuery({
    queryKey: ["ai_referrals", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("ai_referrals" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("event_date", { ascending: true })
        .limit(180);
      return (data || []) as any[];
    },
  });

  const { data: botEvents = [], isLoading: isBotEventsLoading, error: botEventsError } = useQuery({
    queryKey: ["bot_analytics_events", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("bot_analytics_events" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("event_at", { ascending: true })
        .limit(500);
      return (data || []) as any[];
    },
  });

  const { data: ga4Connection } = useQuery({
    queryKey: ["project_ga4_connection", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("project_ga4_connections" as any)
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle();
      return (data || null) as any;
    },
  });

  const { data: gscConnection } = useQuery({
    queryKey: ["project_gsc_connection", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("project_gsc_connections" as any)
        .select("*")
        .eq("project_id", project.id)
        .maybeSingle();
      return (data || null) as any;
    },
  });

  const { data: gscMetrics = [], isLoading: isGscMetricsLoading, error: gscMetricsError } = useQuery({
    queryKey: ["gsc_query_metrics", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("gsc_query_metrics" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("metric_date", { ascending: false })
        .limit(100);
      return (data || []) as any[];
    },
  });

  const { data: contentUrls = [], isLoading: isContentUrlsLoading, error: contentUrlsError } = useQuery({
    queryKey: ["aeo_content_urls", project.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_items" as any)
        .select("id, h1, published_url, created_at")
        .eq("project_id", project.id)
        .not("published_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(120);
      return (data || []) as any[];
    },
  });

  const addTopic = () => {
    const v = topicInput.trim();
    if (!v || topics.includes(v)) return;
    setTopics((t) => [...t, v]);
    setTopicInput("");
  };

  useEffect(() => {
    setWebsite(project.domain || "");
    setBrandName(project.brand_name || project.name);
  }, [project.id, project.domain, project.brand_name, project.name]);

  useEffect(() => {
    if (ga4Connection?.ga4_property_id) setGa4PropertyId(ga4Connection.ga4_property_id);
  }, [ga4Connection?.ga4_property_id]);

  useEffect(() => {
    if (gscConnection?.site_url) setGscSiteUrl(gscConnection.site_url);
    else if (project.domain) setGscSiteUrl(project.domain);
  }, [gscConnection?.site_url, project.domain]);

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const channel = supabase
      .channel(`aeo-live-${project.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "aeo_analyses", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["aeo_analysis", project.id] });
        qc.invalidateQueries({ queryKey: ["aeo_analyses_history", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "aeo_prompts", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["aeo_prompts", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "aeo_citations", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["aeo_citations", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "query_fanouts", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["query_fanouts", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "gsc_query_metrics", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["gsc_query_metrics", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "ai_referrals", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["ai_referrals", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "bot_analytics_events", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["bot_analytics_events", project.id] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "content_items", filter: `project_id=eq.${project.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["aeo_content_urls", project.id] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [project.id, qc]);

  const runAudit = async () => {
    if (currentPlan === "free" && analysisHistory && analysisHistory.length >= 1) {
      setShowUpgrade(true);
      return;
    }

    const scanTopics = topics.length > 0 ? topics : ["brand visibility", "ai search", "seo optimization"];
    if (!website || !brandName) {
      toast.error("Please enter website and brand name.");
      return;
    }
    setRunning(true);
    try {
      const { data: record, error } = await supabase
        .from("aeo_analyses" as any)
        .insert([{ project_id: project.id, website, brand_name: brandName, topics: scanTopics, status: "running" }])
        .select()
        .single();
      if (error) throw error;

      const result = await runAeoAnalysis({ website, brandName, topics: scanTopics, brandDescription: project.brand_description || "" });

      await supabase
        .from("aeo_analyses" as any)
        .update({
          status: "completed",
          overall_score: result.overallScore,
          ai_insights: result.providers,
          category_scores: result.categoryScores,
          recommendations: result.recommendations,
          prompt_suggestions: result.promptSuggestions,
        })
        .eq("id", record.id);

      // Persist scan output into history tables for Sitefire-style modules.
      const citationRows = (result.providers || []).map((p, idx) => ({
        project_id: project.id,
        analysis_id: record.id,
        provider: p.name,
        query: `Best ${topics[0] || "AI"} tools`,
        cited_url: website,
        cited_title: brandName,
        position: idx + 1,
        metadata: { score: p.score, mentions: p.mentions, insight: p.insight },
      }));
      if (citationRows.length > 0) {
        await supabase.from("aeo_citations" as any).insert(citationRows);
      }

      const fanoutRows = (result.promptSuggestions || []).map((ps) => ({
        project_id: project.id,
        analysis_id: record.id,
        root_query: topics[0] || "ai visibility",
        engine: "openrouter",
        branch_query: ps.prompt,
        intent: ps.topic,
        score: result.overallScore,
        metadata: { rationale: ps.rationale },
      }));
      if (fanoutRows.length > 0) {
        await supabase.from("query_fanouts" as any).insert(fanoutRows);
      }

      toast.success("AEO scan completed.");
      qc.invalidateQueries({ queryKey: ["aeo_analysis", project.id] });
      qc.invalidateQueries({ queryKey: ["aeo_citations", project.id] });
      qc.invalidateQueries({ queryKey: ["query_fanouts", project.id] });
    } catch (e: any) {
      toast.error(e.message || "Scan failed");
    } finally {
      setRunning(false);
    }
  };

  const savePrompt = async () => {
    if (!newPromptTopic.trim() || !newPromptText.trim()) {
      toast.error("Please fill topic and prompt text.");
      return;
    }
    const { error } = await supabase.from("aeo_prompts" as any).insert({
      project_id: project.id,
      topic: newPromptTopic.trim(),
      prompt: newPromptText.trim(),
      rationale: "Custom prompt from workspace",
      category: "custom",
    });
    if (error) {
      toast.error("Failed to save prompt");
      return;
    }
    setNewPromptTopic("");
    setNewPromptText("");
    refetchPrompts();
    toast.success("Prompt saved.");
  };

  const handleGa4ConnectAndSync = async () => {
    if (!ga4PropertyId.trim()) {
      toast.error("Enter GA4 Property ID (e.g. 123456789)");
      return;
    }
    if (!user?.id) return;
    setSyncingGa4(true);
    try {
      const { error: upsertError } = await supabase.from("project_ga4_connections" as any).upsert({
        project_id: project.id,
        ga4_property_id: ga4PropertyId.trim(),
        connected_by: user.id,
        last_sync_status: "running",
        last_sync_error: null,
      }, { onConflict: "project_id" });
      if (upsertError) throw upsertError;

      const { error: syncError } = await supabase.functions.invoke("sync-ga4-referrals", {
        body: {
          project_id: project.id,
          ga4_property_id: ga4PropertyId.trim(),
          days: 30,
        },
      });
      if (syncError) throw syncError;

      await supabase
        .from("project_ga4_connections" as any)
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: "success",
          last_sync_error: null,
        })
        .eq("project_id", project.id);

      toast.success("GA4 connected and AI referrals synced.");
      qc.invalidateQueries({ queryKey: ["project_ga4_connection", project.id] });
      qc.invalidateQueries({ queryKey: ["ai_referrals", project.id] });
    } catch (e: any) {
      await supabase
        .from("project_ga4_connections" as any)
        .update({
          last_sync_status: "failed",
          last_sync_error: e.message || "Unknown error",
        })
        .eq("project_id", project.id);
      toast.error(e.message || "GA4 sync failed");
    } finally {
      setSyncingGa4(false);
    }
  };

  const handleGa4TestConnection = async () => {
    if (!ga4PropertyId.trim()) {
      toast.error("Enter GA4 Property ID first");
      return;
    }
    setTestingGa4(true);
    try {
      const { error } = await supabase.functions.invoke("sync-ga4-referrals", {
        body: {
          project_id: project.id,
          ga4_property_id: ga4PropertyId.trim(),
          days: 1,
        },
      });
      if (error) throw error;
      toast.success("GA4 test connection successful.");
    } catch (e: any) {
      toast.error(e.message || "GA4 test failed");
    } finally {
      setTestingGa4(false);
    }
  };

  const handleGa4RetryLastSync = async () => {
    if (!ga4PropertyId.trim()) {
      toast.error("No GA4 property configured.");
      return;
    }
    await handleGa4ConnectAndSync();
  };

  const handleGa4Disconnect = async () => {
    try {
      const { error } = await supabase.from("project_ga4_connections" as any).delete().eq("project_id", project.id);
      if (error) throw error;
      setGa4PropertyId("");
      toast.success("GA4 disconnected.");
      qc.invalidateQueries({ queryKey: ["project_ga4_connection", project.id] });
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect GA4");
    }
  };

  const handleGscConnectAndSync = async () => {
    if (!gscSiteUrl.trim()) {
      toast.error("Enter GSC site URL (example: sc-domain:example.com or https://example.com/)");
      return;
    }
    if (!user?.id) return;
    setSyncingGsc(true);
    try {
      const { error: upsertError } = await supabase.from("project_gsc_connections" as any).upsert({
        project_id: project.id,
        site_url: gscSiteUrl.trim(),
        connected_by: user.id,
        last_sync_status: "running",
        last_sync_error: null,
      }, { onConflict: "project_id" });
      if (upsertError) throw upsertError;

      const { error: syncError } = await supabase.functions.invoke("sync-gsc-metrics", {
        body: {
          project_id: project.id,
          site_url: gscSiteUrl.trim(),
          days: 30,
        },
      });
      if (syncError) throw syncError;

      await supabase
        .from("project_gsc_connections" as any)
        .update({
          last_sync_at: new Date().toISOString(),
          last_sync_status: "success",
          last_sync_error: null,
        })
        .eq("project_id", project.id);

      toast.success("GSC connected and query metrics synced.");
      qc.invalidateQueries({ queryKey: ["project_gsc_connection", project.id] });
      qc.invalidateQueries({ queryKey: ["gsc_query_metrics", project.id] });
    } catch (e: any) {
      await supabase
        .from("project_gsc_connections" as any)
        .update({
          last_sync_status: "failed",
          last_sync_error: e.message || "Unknown error",
        })
        .eq("project_id", project.id);
      toast.error(e.message || "GSC sync failed");
    } finally {
      setSyncingGsc(false);
    }
  };

  const handleGscTestConnection = async () => {
    if (!gscSiteUrl.trim()) {
      toast.error("Enter GSC site URL first");
      return;
    }
    setTestingGsc(true);
    try {
      const { error } = await supabase.functions.invoke("sync-gsc-metrics", {
        body: {
          project_id: project.id,
          site_url: gscSiteUrl.trim(),
          days: 1,
        },
      });
      if (error) throw error;
      toast.success("GSC test connection successful.");
    } catch (e: any) {
      toast.error(e.message || "GSC test failed");
    } finally {
      setTestingGsc(false);
    }
  };

  const handleGscRetryLastSync = async () => {
    if (!gscSiteUrl.trim()) {
      toast.error("No GSC site URL configured.");
      return;
    }
    await handleGscConnectAndSync();
  };

  const handleGscDisconnect = async () => {
    try {
      const { error } = await supabase.from("project_gsc_connections" as any).delete().eq("project_id", project.id);
      if (error) throw error;
      setGscSiteUrl(project.domain || "");
      toast.success("GSC disconnected.");
      qc.invalidateQueries({ queryKey: ["project_gsc_connection", project.id] });
    } catch (e: any) {
      toast.error(e.message || "Failed to disconnect GSC");
    }
  };

  const uniqueCitationProviders = Array.from(new Set(citations.map((c: any) => c.provider).filter(Boolean)));
  const filteredCitations = citations.filter((c: any) => {
    const providerOk = citationsProviderFilter === "all" || c.provider === citationsProviderFilter;
    const queryNeedle = citationsQueryFilter.trim().toLowerCase();
    const queryOk = !queryNeedle
      || String(c.query || "").toLowerCase().includes(queryNeedle)
      || String(c.cited_title || "").toLowerCase().includes(queryNeedle);
    return providerOk && queryOk;
  });

  const exportCitationsCsv = () => {
    const rows = filteredCitations.map((c: any) => ({
      provider: c.provider || "",
      query: c.query || "",
      cited_title: c.cited_title || "",
      cited_url: c.cited_url || "",
      position: c.position ?? "",
      citation_date: c.citation_date || "",
    }));
    if (rows.length === 0) {
      toast.error("No citation rows to export.");
      return;
    }
    const header = Object.keys(rows[0]).join(",");
    const body = rows
      .map((r) => Object.values(r).map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const csv = `${header}\n${body}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `citations-${project.id}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const competitorRows = useMemo(() => {
    const ownBrand = (brandName || "").toLowerCase();
    const map = new globalThis.Map<string, { name: string; citations: number; avgPositionSum: number; avgPositionCount: number; queryHits: number }>();

    for (const c of citations as any[]) {
      const title = String(c.cited_title || "").trim();
      const url = String(c.cited_url || "").trim();
      const nameFromTitle = title.split(/[-–—:,]/)[0]?.trim() || "";
      let candidate = nameFromTitle;
      if (!candidate && url) {
        try {
          const host = new URL(url).hostname.replace(/^www\./, "");
          candidate = host.split(".")[0] || host;
        } catch {
          candidate = "";
        }
      }
      if (!candidate) continue;
      if (candidate.toLowerCase().includes(ownBrand) || ownBrand.includes(candidate.toLowerCase())) continue;
      const row = map.get(candidate) || { name: candidate, citations: 0, avgPositionSum: 0, avgPositionCount: 0, queryHits: 0 };
      row.citations += 1;
      if (typeof c.position === "number") {
        row.avgPositionSum += c.position;
        row.avgPositionCount += 1;
      }
      map.set(candidate, row);
    }

    // Boost with GSC "vs" queries when available
    for (const q of gscMetrics as any[]) {
      const query = String(q.query || "").toLowerCase();
      if (!query.includes(" vs ")) continue;
      const parts = query.split(" vs ").map((p) => p.trim()).filter(Boolean);
      for (const p of parts) {
        if (!p || p.includes(ownBrand) || ownBrand.includes(p)) continue;
        const row = map.get(p) || { name: p, citations: 0, avgPositionSum: 0, avgPositionCount: 0, queryHits: 0 };
        row.queryHits += Number(q.impressions || 0);
        map.set(p, row);
      }
    }

    return Array.from(map.values())
      .map((r) => ({
        name: r.name,
        citations: r.citations,
        avgPosition: r.avgPositionCount ? r.avgPositionSum / r.avgPositionCount : null,
        queryHits: r.queryHits,
        score: Math.round((r.citations * 10) + (r.queryHits / 50) - ((r.avgPosition || 10) * 2)),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [citations, gscMetrics, brandName]);

  const sitemapGraph = useMemo(() => {
    const site = website || project.domain || "";
    if (!site) return { nodes: [], links: [] as Array<{ source: string; target: string }> };
    const root = {
      id: "root",
      label: site.replace(/^https?:\/\//, "").replace(/\/$/, ""),
      size: 36,
      color: "#111827",
      depth: 0,
      meta: "Source sitemap graph",
    };

    const pagesFromGsc = (gscMetrics || [])
      .map((r: any) => String(r.page || "").trim())
      .filter(Boolean)
      .slice(0, sitemapRange === "7d" ? 10 : 18);

    const pagesFromContent = (contentUrls || [])
      .map((r: any) => String(r.published_url || "").trim())
      .filter(Boolean);

    const pageSeeds = Array.from(new Set([...(pagesFromGsc || []), ...(pagesFromContent || [])]));
    if (pageSeeds.length === 0) return { nodes: [root], links: [] as Array<{ source: string; target: string }> };
    const pageNodes = pageSeeds.map((path, i) => {
      const clean = path.startsWith("http")
        ? (() => {
          try {
            return new URL(path).pathname || "/";
          } catch {
            return path;
          }
        })()
        : path;
      const slug = clean === "/" ? "home" : clean.split("/").filter(Boolean).slice(-1)[0] || `page-${i + 1}`;
      const base = 14 + (i % 4) * 2;
      const colorPalette = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899"];
      return {
        id: `page-${i}`,
        label: slug.length > 9 ? `${slug.slice(0, 8)}…` : slug,
        size: base,
        color: colorPalette[i % colorPalette.length],
        depth: 1,
        meta: clean,
      };
    });

    const overlays: Array<{ id: string; label: string; size: number; color: string; depth: number; meta: string }> = [];
    if (sitemapOverlay === "gsc") {
      const topQueries = (gscMetrics || []).slice(0, 6).map((q: any) => String(q.query || "").trim()).filter(Boolean);
      overlays.push(...topQueries.map((q, i) => ({
        id: `gsc-${i}`,
        label: q.length > 12 ? `${q.slice(0, 11)}…` : q,
        size: 10,
        color: "#94a3b8",
        depth: 2,
        meta: q,
      })));
    }
    if (sitemapOverlay === "recommendations") {
      const topRecs = (analysis?.recommendations || []).slice(0, 6).map((r: any) => String(r.title || "").trim()).filter(Boolean);
      overlays.push(...topRecs.map((r, i) => ({
        id: `rec-${i}`,
        label: r.length > 12 ? `${r.slice(0, 11)}…` : r,
        size: 11,
        color: "#64748b",
        depth: 2,
        meta: r,
      })));
    }

    const nodes = [root, ...pageNodes, ...overlays];
    const links: Array<{ source: string; target: string }> = [];
    pageNodes.forEach((n) => links.push({ source: root.id, target: n.id }));
    overlays.forEach((n, idx) => {
      const pageTarget = pageNodes[idx % Math.max(1, pageNodes.length)];
      if (pageTarget) links.push({ source: pageTarget.id, target: n.id });
    });

    return { nodes, links };
  }, [website, project.domain, gscMetrics, contentUrls, analysis?.recommendations, sitemapOverlay, sitemapRange]);

  const fanoutPromptRows = useMemo(() => {
    const grouped = new globalThis.Map<string, {
      prompt: string;
      topic: string;
      branchQueries: string[];
      executions: number;
      scoreTotal: number;
    }>();

    for (const row of fanouts as any[]) {
      const prompt = String(row.root_query || row.branch_query || "").trim();
      if (!prompt) continue;
      const topic = String(row.intent || "general").trim().toLowerCase();
      const key = `${prompt}__${topic}`;
      const existing = grouped.get(key) || {
        prompt,
        topic,
        branchQueries: [],
        executions: 0,
        scoreTotal: 0,
      };
      existing.executions += 1;
      existing.scoreTotal += Number(row.score || 0);
      if (row.branch_query) existing.branchQueries.push(String(row.branch_query));
      grouped.set(key, existing);
    }

    const rows = Array.from(grouped.values()).map((r) => ({
      id: `${r.prompt}__${r.topic}`,
      prompt: r.prompt,
      topic: r.topic,
      queryCount: r.branchQueries.length,
      queriesPerExecution: r.executions > 0 ? r.branchQueries.length / r.executions : 0,
      branchQueries: Array.from(new Set(r.branchQueries)),
    }));

    const needle = fanoutSearch.trim().toLowerCase();
    return rows
      .filter((r) => (fanoutTopicFilter === "all" || r.topic === fanoutTopicFilter))
      .filter((r) => !needle || r.prompt.toLowerCase().includes(needle) || r.topic.toLowerCase().includes(needle))
      .sort((a, b) => b.queryCount - a.queryCount);
  }, [fanouts, fanoutSearch, fanoutTopicFilter]);

  const uniqueFanoutTopics = useMemo(() => {
    return Array.from(new Set((fanouts as any[]).map((f) => String(f.intent || "general").trim().toLowerCase()))).filter(Boolean);
  }, [fanouts]);

  const botByName = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of botEvents as any[]) {
      const name = String(row.bot_name || "unknown");
      counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([name, hits]) => ({ name, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 8);
  }, [botEvents]);

  const topBotPaths = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of botEvents as any[]) {
      const path = String(row.path || "/unknown");
      counts.set(path, (counts.get(path) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([path, hits]) => ({ path, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 8);
  }, [botEvents]);

  const referralsByDate = useMemo(() => groupReferralsByDate(referrals), [referrals]);
  const botEventsByDate = useMemo(() => groupBotEventsByDate(botEvents), [botEvents]);
  const mergedPrompts = useMemo(() => ([...(analysis?.prompt_suggestions || []), ...savedPrompts]), [analysis?.prompt_suggestions, savedPrompts]);

  const sitemapLayout = useMemo(() => {
    const width = 1180;
    const height = 620;
    const centerX = width / 2;
    const centerY = height / 2;
    const positions: Record<string, { x: number; y: number }> = {};

    const root = sitemapGraph.nodes.find((n) => n.depth === 0);
    if (root) positions[root.id] = { x: centerX, y: centerY };

    const layer1 = sitemapGraph.nodes.filter((n) => n.depth === 1);
    const layer2 = sitemapGraph.nodes.filter((n) => n.depth === 2);

    layer1.forEach((node, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(1, layer1.length);
      positions[node.id] = {
        x: centerX + Math.cos(angle) * 120,
        y: centerY + Math.sin(angle) * 120,
      };
    });
    layer2.forEach((node, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(1, layer2.length);
      positions[node.id] = {
        x: centerX + Math.cos(angle) * 210,
        y: centerY + Math.sin(angle) * 210,
      };
    });

    return { width, height, positions };
  }, [sitemapGraph]);

  const tabPanelClass = "space-y-4 mt-4";
  const surfaceCardClass = "rounded-2xl border-line bg-white shadow-sm";
  const sectionTitleClass = "text-lg md:text-xl font-bold tracking-tight";
  const emptyStateClass = "text-sm text-muted-foreground border rounded-lg p-4";
  const chartWrapClass = "h-80 rounded-xl border border-line bg-muted/20 p-3 md:p-4";
  const axisStyle = AXIS_STYLE;
  const gridColor = "hsl(var(--border))";
  const tooltipStyle = TOOLTIP_STYLE;

  const visibilityChartData = useMemo(() => {
    return (analysis?.ai_insights || [])
      .filter((p: any) => p && typeof p === "object")
      .map((p: any) => ({
        provider: String(p.name || p.id || "Unknown"),
        score: Number(p.score || 0),
        mentions: Number(p.mentions || 0),
      }));
  }, [analysis?.ai_insights]);

  const visibilityTrendData = useMemo(() => {
    return (analysisHistory || [])
      .filter((row: any) => row && row.created_at)
      .map((row: any) => {
        try {
          const d = new Date(row.created_at);
          if (isNaN(d.getTime())) {
            return null;
          }
          return {
            date: d.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
            score: Number(row.overall_score || 0),
          };
        } catch {
          return null;
        }
      })
      .filter(Boolean) as { date: string; score: number }[];
  }, [analysisHistory]);

  const tabMeta = useMemo<Record<AeoTab, { source: string; updatedAt?: string | null }>>(() => ({
    home: { source: "AEO", updatedAt: analysis?.created_at || null },
    visibility: { source: "AEO", updatedAt: analysis?.created_at || null },
    heatmap: { source: "AEO", updatedAt: analysis?.created_at || null },
    citations: { source: "AEO", updatedAt: citations?.[0]?.created_at || null },
    prompts: { source: "AEO", updatedAt: savedPrompts?.[0]?.created_at || analysis?.created_at || null },
    competitors: { source: "AEO + GSC", updatedAt: citations?.[0]?.created_at || gscMetrics?.[0]?.created_at || null },
    fanouts: { source: "AEO", updatedAt: fanouts?.[0]?.created_at || null },
    sitemap: { source: "GSC + Content URLs", updatedAt: gscMetrics?.[0]?.created_at || contentUrls?.[0]?.created_at || null },
    referrals: { source: "GA4", updatedAt: referrals?.[referrals.length - 1]?.created_at || ga4Connection?.last_sync_at || null },
    "bot-analytics": { source: "Logs", updatedAt: botEvents?.[botEvents.length - 1]?.created_at || null },
  }), [analysis?.created_at, citations, savedPrompts, gscMetrics, fanouts, contentUrls, referrals, ga4Connection?.last_sync_at, botEvents]);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink">AEO Command Center</h1>
          <p className="text-sm text-slate-600 mt-1">Sitefire-style workflow: discover visibility, generate prompts, and act on opportunities.</p>
        </div>
        <Badge className="bg-primary/10 text-primary">{project.brand_name || project.name}</Badge>
      </div>

      <Card className={surfaceCardClass}>
        <CardHeader className="pb-3">
          <CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><Target className="h-5 w-5" /> Run AEO Scan</CardTitle>
          <CardDescription className="text-sm leading-relaxed text-slate-600">Track brand visibility across ChatGPT, Gemini, Claude, and Perplexity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-3">
            <Input className="bg-white placeholder:text-slate-400" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Website" />
            <Input className="bg-white placeholder:text-slate-400" value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="Brand Name" />
          </div>
          <div className="flex gap-2">
            <Input
              className="bg-white placeholder:text-slate-400"
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTopic())}
              placeholder="Add topic keyword"
            />
            <Button type="button" variant="outline" onClick={addTopic}><Plus className="h-4 w-4" /></Button>
            <Button onClick={runAudit} disabled={running}>{running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Scan</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => <Badge key={t} className="bg-primary/10 text-primary border border-primary/20" variant="secondary">{t}</Badge>)}
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as AeoTab)} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 h-auto rounded-xl bg-slate-100 p-1 border border-line">
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="home">Home</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="visibility">Visibility</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="heatmap">Heatmap</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="citations">Citations</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="prompts">Prompts</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="competitors">You vs Competitors</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="fanouts">Query-Fanouts</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="referrals">AI Referrals</TabsTrigger>
          <TabsTrigger className="rounded-lg text-slate-600 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm" value="bot-analytics">Bot Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="home" className={tabPanelClass}>
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard title="Overall Score" value={analysis?.overall_score ?? "--"} icon={Eye} />
            <MetricCard title="Prompt Suggestions" value={(analysis?.prompt_suggestions || []).length} icon={Bot} />
            <MetricCard title="Opportunities" value={(analysis?.recommendations || []).length} icon={Lightbulb} />
            <MetricCard title="Saved Prompts" value={savedPrompts.length} icon={Sparkles} />
          </div>
        </TabsContent>

        <TabsContent value="visibility" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.visibility.source} updatedAt={tabMeta.visibility.updatedAt} />
          {isAnalysisLoading || isAnalysisHistoryLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
            <Card className={surfaceCardClass}>
              <CardHeader className="pb-3"><CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><BarChart2 className="h-5 w-5" /> Provider Breakdown</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {(analysisError || analysisHistoryError) && (
                  <QueryError
                    message={String((analysisError || analysisHistoryError) as any)}
                    onRetry={() => {
                      qc.invalidateQueries({ queryKey: ["aeo_analysis", project.id] });
                      qc.invalidateQueries({ queryKey: ["aeo_analyses_history", project.id] });
                    }}
                  />
                )}
                {!analysis?.ai_insights?.length && (
                  <EmptyStateCard
                    message="No AEO analysis yet for this project."
                    actionLabel="Run AEO Scan"
                    onAction={runAudit}
                    actionDisabled={running}
                  />
                )}
                {!!visibilityTrendData.length && (
                  <div className={chartWrapClass}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={visibilityTrendData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={SCORE_DOMAIN} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {!!visibilityChartData.length && (
                  <div className={chartWrapClass}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visibilityChartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="provider" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} domain={SCORE_DOMAIN} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Bar dataKey="score" name="Visibility Score" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {(analysis?.ai_insights || []).map((p: any) => (
                  <div key={p.id} className="flex items-center justify-between border rounded-lg p-3.5 bg-white">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{p.name}</div>
                      <div className="text-xs text-slate-600 mt-0.5">{p.insight}</div>
                    </div>
                    <Badge className="bg-primary text-white">{p.score}/100</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="heatmap" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.heatmap.source} updatedAt={tabMeta.heatmap.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><Grid3X3 className="h-5 w-5" /> AI Query Heatmap</CardTitle></CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-3">
              {(analysis?.category_scores || []).map((c: any, i: number) => (
                <div key={i} className="border rounded-lg p-3.5 flex items-center justify-between">
                  <div className="font-medium text-sm">{c.category}</div>
                  <Badge variant="outline">{c.score}</Badge>
                </div>
              ))}
              {!analysis?.category_scores?.length && (
                <EmptyStateCard
                  message="No heatmap categories available yet."
                  actionLabel="Run AEO Scan"
                  onAction={runAudit}
                  actionDisabled={running}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="citations" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.citations.source} updatedAt={tabMeta.citations.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><Quote className="h-5 w-5" /> Citations</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  value={citationsQueryFilter}
                  onChange={(e) => setCitationsQueryFilter(e.target.value)}
                  placeholder="Filter by query/title"
                />
                <select
                  value={citationsProviderFilter}
                  onChange={(e) => setCitationsProviderFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All providers</option>
                  {uniqueCitationProviders.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <div className="md:col-span-2 flex justify-end">
                  <Button variant="outline" onClick={exportCitationsCsv}>Export CSV</Button>
                </div>
              </div>

              {citationsError && (
                <QueryError
                  message={String(citationsError as any)}
                  onRetry={() => qc.invalidateQueries({ queryKey: ["aeo_citations", project.id] })}
                />
              )}
              {isCitationsLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {filteredCitations.length === 0 && !isCitationsLoading && (
                <EmptyStateCard
                  message="No citation history yet."
                  actionLabel="Run AEO Scan"
                  onAction={runAudit}
                  actionDisabled={running}
                />
              )}
              {filteredCitations.length > 0 && (
                <>
                  <div className="md:hidden space-y-2">
                    {filteredCitations.map((c: any) => (
                      <div key={c.id} className="rounded-lg border p-3 bg-white">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="secondary">{c.provider || "-"}</Badge>
                          <span className="text-[11px] text-muted-foreground">{c.citation_date || "-"}</span>
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{c.query || "-"}</p>
                        <p className="mt-1 text-sm font-medium line-clamp-1">{c.cited_title || brandName}</p>
                        <p className="mt-1 text-xs text-primary truncate">{c.cited_url || "-"}</p>
                        <div className="mt-2 text-[11px] text-muted-foreground">Position: {typeof c.position === "number" ? c.position : "-"}</div>
                      </div>
                    ))}
                  </div>
                  <div className="hidden md:block rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[980px]">
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold bg-slate-50 border-b sticky top-0 z-10">
                          <div className="col-span-2">Provider</div>
                          <div className="col-span-3">Query</div>
                          <div className="col-span-3">Title</div>
                          <div className="col-span-2">URL</div>
                          <div className="col-span-1 text-right">Pos</div>
                          <div className="col-span-1 text-right">Date</div>
                        </div>
                        {filteredCitations.map((c: any) => (
                          <div key={c.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs border-b last:border-b-0 bg-white hover:bg-slate-50/60">
                            <div className="col-span-2 font-semibold truncate">{c.provider || "-"}</div>
                            <div className="col-span-3 truncate text-muted-foreground">{c.query || "-"}</div>
                            <div className="col-span-3 truncate">{c.cited_title || brandName}</div>
                            <div className="col-span-2 truncate text-primary">{c.cited_url || "-"}</div>
                            <div className="col-span-1 text-right">{typeof c.position === "number" ? c.position : "-"}</div>
                            <div className="col-span-1 text-right">{c.citation_date || "-"}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="competitors" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.competitors.source} updatedAt={tabMeta.competitors.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><LineChart className="h-5 w-5" /> You vs Competitors</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">Live leaderboard updates from citation stream and GSC query signals.</div>
              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                <div className="font-semibold text-foreground mb-1">Score formula breakdown</div>
                <div>`score = (citations × 10) + (query signals ÷ 50) - (avg position × 2)`</div>
                <div className="mt-1">Higher score means stronger competitor pressure in AI + search surfaces.</div>
              </div>
              {competitorRows.length === 0 && (
                <EmptyStateCard
                  message="No competitor signals yet."
                  actionLabel="Run AEO Scan"
                  onAction={runAudit}
                  actionDisabled={running}
                  secondaryLabel="Sync GSC"
                  onSecondaryAction={handleGscConnectAndSync}
                  secondaryDisabled={syncingGsc}
                />
              )}
              {competitorRows.map((r, i) => (
                <div key={`${r.name}-${i}`} className="border rounded-lg p-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm capitalize">{r.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Citations: {r.citations} · Query Signals: {r.queryHits} · Avg Position: {r.avgPosition ? r.avgPosition.toFixed(1) : "--"}
                    </div>
                  </div>
                  <Badge variant="outline">{r.score}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fanouts" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.fanouts.source} updatedAt={tabMeta.fanouts.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><GitBranch className="h-5 w-5" /> Query-Fanouts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative w-full md:w-64">
                  <SearchIcon className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={fanoutSearch}
                    onChange={(e) => setFanoutSearch(e.target.value)}
                    placeholder="Find prompt..."
                    className="pl-9"
                  />
                </div>
                <select
                  value={fanoutTopicFilter}
                  onChange={(e) => setFanoutTopicFilter(e.target.value)}
                  className="h-10 rounded-md border border-input bg-white px-3 text-sm"
                >
                  <option value="all">All topics</option>
                  {uniqueFanoutTopics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFanoutSearch("");
                    setFanoutTopicFilter("all");
                    setExpandedFanoutRows([]);
                  }}
                >
                  Reset
                </Button>
              </div>

              {fanoutsError && (
                <QueryError
                  message={String(fanoutsError as any)}
                  onRetry={() => qc.invalidateQueries({ queryKey: ["query_fanouts", project.id] })}
                />
              )}
              {isFanoutsLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {fanoutPromptRows.length === 0 && !isFanoutsLoading && (
                <EmptyStateCard
                  message="No fanout data yet."
                  actionLabel="Run AEO Scan"
                  onAction={runAudit}
                  actionDisabled={running}
                />
              )}

              {fanoutPromptRows.length > 0 && (
                <>
                  <div className="md:hidden space-y-2">
                    {fanoutPromptRows.map((row) => {
                      const expanded = expandedFanoutRows.includes(row.id);
                      return (
                        <div key={row.id} className="rounded-lg border bg-white">
                          <button
                            type="button"
                            className="w-full p-3 text-left"
                            onClick={() => {
                              setExpandedFanoutRows((prev) =>
                                prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                              );
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-sm font-medium line-clamp-2">{row.prompt}</p>
                                <div className="mt-1 flex items-center gap-2">
                                  <Badge variant="secondary">{row.topic}</Badge>
                                  <span className="text-[11px] text-muted-foreground">{row.queryCount} queries</span>
                                </div>
                              </div>
                              <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
                            </div>
                          </button>
                          {expanded && (
                            <div className="px-3 pb-3">
                              <div className="rounded-md border bg-slate-50/60 p-2 space-y-1">
                                {row.branchQueries.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No branch queries captured.</p>
                                ) : (
                                  row.branchQueries.slice(0, 12).map((q, idx) => (
                                    <p key={`${row.id}-${idx}`} className="text-xs text-slate-700">• {q}</p>
                                  ))
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden md:block rounded-xl border overflow-hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[980px]">
                        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-semibold bg-slate-50 border-b sticky top-0 z-10">
                          <div className="col-span-6">Prompt</div>
                          <div className="col-span-3">Topic</div>
                          <div className="col-span-1 text-right">Queries</div>
                          <div className="col-span-2 text-right">Queries / Execution</div>
                        </div>
                        {fanoutPromptRows.map((row) => {
                          const expanded = expandedFanoutRows.includes(row.id);
                          return (
                            <div key={row.id} className="border-b last:border-b-0">
                              <button
                                type="button"
                                className="w-full grid grid-cols-12 gap-2 px-3 py-2 text-sm hover:bg-slate-50 text-left"
                                onClick={() => {
                                  setExpandedFanoutRows((prev) =>
                                    prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]
                                  );
                                }}
                              >
                                <div className="col-span-6 flex items-center gap-2 min-w-0">
                                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
                                  <span className="truncate">{row.prompt}</span>
                                </div>
                                <div className="col-span-3">
                                  <Badge variant="secondary">{row.topic}</Badge>
                                </div>
                                <div className="col-span-1 text-right font-semibold">{row.queryCount}</div>
                                <div className="col-span-2 text-right text-muted-foreground">{row.queriesPerExecution.toFixed(1)}</div>
                              </button>
                              {expanded && (
                                <div className="px-8 pb-3">
                                  <div className="rounded-md border bg-slate-50/60 p-2 space-y-1">
                                    {row.branchQueries.length === 0 ? (
                                      <p className="text-xs text-muted-foreground">No branch queries captured.</p>
                                    ) : (
                                      row.branchQueries.slice(0, 12).map((q, idx) => (
                                        <p key={`${row.id}-${idx}`} className="text-xs text-slate-700">• {q}</p>
                                      ))
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.sitemap.source} updatedAt={tabMeta.sitemap.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={`flex items-center gap-2 ${sectionTitleClass}`}><MapIcon className="h-5 w-5" /> Sitemap Priorities</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border rounded-md p-2 bg-slate-50">
                <div className="flex items-center gap-2">
                  <Button
                    variant={sitemapRange === "7d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSitemapRange("7d")}
                  >
                    Last 7 days
                  </Button>
                  <Button
                    variant={sitemapRange === "30d" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSitemapRange("30d")}
                  >
                    Last 30 days
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={sitemapOverlay}
                    onChange={(e) => setSitemapOverlay(e.target.value as "none" | "gsc" | "recommendations")}
                    className="h-9 rounded-md border border-input bg-white px-3 text-sm"
                  >
                    <option value="none">No overlay</option>
                    <option value="gsc">GSC query overlay</option>
                    <option value="recommendations">Recommendations overlay</option>
                  </select>
                  <Button variant="outline" onClick={runAudit} disabled={running}>
                    {running ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Sitemap"}
                  </Button>
                </div>
              </div>

              {(gscMetricsError || contentUrlsError) && (
                <QueryError
                  message={String((gscMetricsError || contentUrlsError) as any)}
                  onRetry={() => {
                    qc.invalidateQueries({ queryKey: ["gsc_query_metrics", project.id] });
                    qc.invalidateQueries({ queryKey: ["aeo_content_urls", project.id] });
                  }}
                />
              )}
              {(isGscMetricsLoading || isContentUrlsLoading) && <Loader2 className="h-5 w-5 animate-spin" />}
              {sitemapGraph.nodes.length <= 1 ? (
                <EmptyStateCard
                  message="No sitemap nodes yet."
                  actionLabel="Connect & Sync GSC"
                  onAction={handleGscConnectAndSync}
                  actionDisabled={syncingGsc}
                  secondaryLabel="Retry Fetch"
                  onSecondaryAction={() => {
                    qc.invalidateQueries({ queryKey: ["gsc_query_metrics", project.id] });
                    qc.invalidateQueries({ queryKey: ["aeo_content_urls", project.id] });
                  }}
                />
              ) : (
                <div
                  className="w-full overflow-auto rounded-xl border border-line bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:70px_70px] bg-white"
                  style={{ minHeight: 620 }}
                >
                  <svg width={sitemapLayout.width} height={sitemapLayout.height}>
                    {sitemapGraph.links.map((link, i) => {
                      const s = sitemapLayout.positions[link.source];
                      const t = sitemapLayout.positions[link.target];
                      if (!s || !t) return null;
                      return (
                        <line
                          key={`link-${i}`}
                          x1={s.x}
                          y1={s.y}
                          x2={t.x}
                          y2={t.y}
                          stroke="#94a3b8"
                          strokeOpacity="0.45"
                          strokeWidth="1.6"
                        />
                      );
                    })}
                    {sitemapGraph.nodes.map((node) => {
                      const p = sitemapLayout.positions[node.id];
                      if (!p) return null;
                      const active = selectedSitemapNode === node.id;
                      return (
                        <g
                          key={node.id}
                          transform={`translate(${p.x},${p.y})`}
                          onMouseEnter={() => setSelectedSitemapNode(node.id)}
                          onMouseLeave={() => setSelectedSitemapNode(null)}
                          style={{ cursor: "pointer" }}
                        >
                          <circle
                            r={node.size}
                            fill={node.color}
                            stroke={active ? "#111827" : "#ffffff"}
                            strokeWidth={active ? 3 : 2}
                            opacity={node.depth === 0 ? 1 : 0.9}
                          />
                          <text
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={node.depth === 0 ? 12 : 11}
                            fontWeight={700}
                            fill="#ffffff"
                          >
                            {node.label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              )}
              {selectedSitemapNode && (
                <div className="text-xs text-muted-foreground rounded-md border p-2 bg-slate-50">
                  {sitemapGraph.nodes.find((n) => n.id === selectedSitemapNode)?.meta}
                </div>
              )}

              <div className="mb-2 p-3 border rounded-md space-y-3">
                <p className="text-sm font-semibold">Connect Google Search Console</p>
                <div className="flex gap-2">
                  <Input
                    value={gscSiteUrl}
                    onChange={(e) => setGscSiteUrl(e.target.value)}
                    placeholder="sc-domain:example.com or https://example.com/"
                  />
                  <Button variant="outline" onClick={handleGscTestConnection} disabled={testingGsc}>
                    {testingGsc ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Connection"}
                  </Button>
                  <Button onClick={handleGscConnectAndSync} disabled={syncingGsc}>
                    {syncingGsc ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect & Sync"}
                  </Button>
                  <Button variant="destructive" onClick={handleGscDisconnect}>
                    Disconnect
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={statusDotClass(gscConnection?.last_sync_status)} />
                    Status: <span className="font-semibold">{gscConnection?.last_sync_status || "not_synced"}</span>
                  </span>
                  {gscConnection?.last_sync_at && (
                    <span> · Last sync: {new Date(gscConnection.last_sync_at).toLocaleString()}</span>
                  )}
                  {gscConnection?.last_sync_error && (
                    <span> · Error: {gscConnection.last_sync_error}</span>
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={handleGscRetryLastSync} disabled={syncingGsc}>
                    Retry Last Sync
                  </Button>
                </div>
              </div>

              {(analysis?.recommendations || []).slice(0, 4).map((r: any, i: number) => (
                <div key={i} className="border rounded-lg p-3.5">
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{r.action}</div>
                </div>
              ))}

              <div className="mt-4 border rounded-md overflow-hidden">
                <div className="px-3 py-2 text-sm font-semibold border-b">Top GSC Queries</div>
                {gscMetrics.length === 0 ? (
                  <div className="px-3 py-3 text-sm text-muted-foreground">No GSC data yet.</div>
                ) : (
                  <div className="max-h-72 overflow-auto">
                    {gscMetrics.slice(0, 20).map((row: any) => (
                      <div key={row.id} className="grid grid-cols-12 gap-2 px-3 py-2 text-xs border-b last:border-b-0">
                        <div className="col-span-5 truncate">{row.query}</div>
                        <div className="col-span-2">{row.clicks} clicks</div>
                        <div className="col-span-2">{row.impressions} imp</div>
                        <div className="col-span-1">{(Number(row.ctr) * 100).toFixed(1)}%</div>
                        <div className="col-span-2">pos {Number(row.position).toFixed(1)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.referrals.source} updatedAt={tabMeta.referrals.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={sectionTitleClass}>AI Referrals</CardTitle></CardHeader>
            <CardContent>
              <div className="mb-4 p-3 border rounded-md space-y-3">
                <p className="text-sm font-semibold">Connect GA4</p>
                <div className="flex gap-2">
                  <Input
                    value={ga4PropertyId}
                    onChange={(e) => setGa4PropertyId(e.target.value)}
                    placeholder="GA4 Property ID (numbers only)"
                  />
                  <Button variant="outline" onClick={handleGa4TestConnection} disabled={testingGa4}>
                    {testingGa4 ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test Connection"}
                  </Button>
                  <Button onClick={handleGa4ConnectAndSync} disabled={syncingGa4}>
                    {syncingGa4 ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect & Sync"}
                  </Button>
                  <Button variant="destructive" onClick={handleGa4Disconnect}>
                    Disconnect
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <span className={statusDotClass(ga4Connection?.last_sync_status)} />
                    Status: <span className="font-semibold">{ga4Connection?.last_sync_status || "not_synced"}</span>
                  </span>
                  {ga4Connection?.last_sync_at && (
                    <span> · Last sync: {new Date(ga4Connection.last_sync_at).toLocaleString()}</span>
                  )}
                  {ga4Connection?.last_sync_error && (
                    <span> · Error: {ga4Connection.last_sync_error}</span>
                  )}
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={handleGa4RetryLastSync} disabled={syncingGa4}>
                    Retry Last Sync
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requires edge function envs: <code>GOOGLE_SERVICE_ACCOUNT_EMAIL</code> and <code>GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code>.
                </p>
              </div>
              {referralsError && (
                <QueryError
                  message={String(referralsError as any)}
                  onRetry={() => qc.invalidateQueries({ queryKey: ["ai_referrals", project.id] })}
                />
              )}
              {isReferralsLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {referrals.length === 0 && !isReferralsLoading ? (
                <EmptyStateCard
                  message="No referral data yet."
                  actionLabel="Connect & Sync GA4"
                  onAction={handleGa4ConnectAndSync}
                  actionDisabled={syncingGa4}
                  secondaryLabel="Retry Fetch"
                  onSecondaryAction={() => qc.invalidateQueries({ queryKey: ["ai_referrals", project.id] })}
                />
              ) : (
                <div className="space-y-4">
                  <div className={chartWrapClass}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={referralsByDate} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Bar dataKey="sessions" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="conversions" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bot-analytics" className={tabPanelClass}>
          <TabMetaRow source={tabMeta["bot-analytics"].source} updatedAt={tabMeta["bot-analytics"].updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={sectionTitleClass}>Bot Analytics</CardTitle></CardHeader>
            <CardContent>
              {botEventsError && (
                <QueryError
                  message={String(botEventsError as any)}
                  onRetry={() => qc.invalidateQueries({ queryKey: ["bot_analytics_events", project.id] })}
                />
              )}
              {isBotEventsLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              {botEvents.length === 0 && !isBotEventsLoading ? (
                <EmptyStateCard
                  message="No bot activity yet."
                  actionLabel="Retry Fetch"
                  onAction={() => qc.invalidateQueries({ queryKey: ["bot_analytics_events", project.id] })}
                />
              ) : (
                <div className="space-y-4">
                  <div className={chartWrapClass}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={botEventsByDate} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" tick={axisStyle} axisLine={false} tickLine={false} />
                        <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }} />
                        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Line type="monotone" dataKey="hits" stroke="#8b5cf6" strokeWidth={2} />
                        <Line type="monotone" dataKey="avgMs" stroke="#06b6d4" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-semibold mb-2">Top Bots</div>
                      <div className="space-y-1.5">
                        {botByName.map((b) => (
                          <div key={b.name} className="flex items-center justify-between text-xs">
                            <span className="truncate">{b.name}</span>
                            <Badge variant="outline">{b.hits}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-semibold mb-2">Top Paths</div>
                      <div className="space-y-1.5">
                        {topBotPaths.map((p) => (
                          <div key={p.path} className="flex items-center justify-between text-xs">
                            <span className="truncate">{p.path}</span>
                            <Badge variant="outline">{p.hits}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className={tabPanelClass}>
          <TabMetaRow source={tabMeta.prompts.source} updatedAt={tabMeta.prompts.updatedAt} />
          <Card className={surfaceCardClass}>
            <CardHeader className="pb-3"><CardTitle className={sectionTitleClass}>Prompt Lab</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid md:grid-cols-2 gap-2">
                <Input placeholder="Prompt topic" value={newPromptTopic} onChange={(e) => setNewPromptTopic(e.target.value)} />
                <Input placeholder="Prompt text" value={newPromptText} onChange={(e) => setNewPromptText(e.target.value)} />
              </div>
              <Button onClick={savePrompt}>Save Prompt</Button>
              {promptsError && (
                <QueryError
                  message={String(promptsError as any)}
                  onRetry={() => qc.invalidateQueries({ queryKey: ["aeo_prompts", project.id] })}
                />
              )}
              {isPromptsLoading && <Loader2 className="h-5 w-5 animate-spin" />}
              <div className="space-y-2">
                {mergedPrompts.map((p: any, i: number) => (
                  <div key={i} className="border rounded-md p-3">
                    <div className="text-xs text-muted-foreground">{p.topic || "General"}</div>
                    <div className="font-medium">{p.prompt}</div>
                    {p.created_at && (
                      <div className="text-[11px] text-muted-foreground mt-1">Saved: {new Date(p.created_at).toLocaleString()}</div>
                    )}
                  </div>
                ))}
                {mergedPrompts.length === 0 && !isPromptsLoading && (
                  <EmptyStateCard
                    message="No prompts saved yet."
                    actionLabel="Run AEO Scan"
                    onAction={runAudit}
                    actionDisabled={running}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      <UpgradeDialog isOpen={showUpgrade} onOpenChange={setShowUpgrade} featureTitle="AEO Scan & Analytics" />
    </div>
  );
}

function MetricCard({ title, value, icon: Icon }: { title: string; value: string | number; icon: any }) {
  return (
    <Card className="rounded-2xl border-line bg-card shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription className="text-xs uppercase tracking-wide">{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-black tracking-tight">{value}</span>
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

function groupReferralsByDate(rows: any[]) {
  const byDate: Record<string, { date: string; sessions: number; conversions: number }> = {};
  rows.forEach((r) => {
    const d = r.event_date || "unknown";
    if (!byDate[d]) byDate[d] = { date: d, sessions: 0, conversions: 0 };
    byDate[d].sessions += Number(r.sessions || 0);
    byDate[d].conversions += Number(r.conversions || 0);
  });
  return Object.values(byDate);
}

function groupBotEventsByDate(rows: any[]) {
  const byDate: Record<string, { date: string; hits: number; avgMs: number; _sumMs: number }> = {};
  rows.forEach((r) => {
    const d = String(r.event_at || "").slice(0, 10) || "unknown";
    if (!byDate[d]) byDate[d] = { date: d, hits: 0, avgMs: 0, _sumMs: 0 };
    byDate[d].hits += 1;
    byDate[d]._sumMs += Number(r.response_time_ms || 0);
  });
  return Object.values(byDate).map((v) => ({
    date: v.date,
    hits: v.hits,
    avgMs: v.hits > 0 ? Math.round(v._sumMs / v.hits) : 0,
  }));
}

function statusDotClass(status?: string | null) {
  switch (status) {
    case "success":
      return "inline-block h-2 w-2 rounded-full bg-emerald-500";
    case "running":
      return "inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse";
    case "failed":
      return "inline-block h-2 w-2 rounded-full bg-red-500";
    default:
      return "inline-block h-2 w-2 rounded-full bg-slate-400";
  }
}

function TabMetaRow({ source, updatedAt }: { source: string; updatedAt?: string | null }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-muted/20 px-3 py-2">
      <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Database className="h-3.5 w-3.5" />
        <span>Source: <span className="font-semibold text-foreground">{source}</span></span>
      </div>
      <div className="text-xs text-muted-foreground">
        Last updated:{" "}
        <span className="font-semibold text-foreground">
          {updatedAt ? new Date(updatedAt).toLocaleString() : "Not available"}
        </span>
      </div>
    </div>
  );
}

function QueryError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <div className="inline-flex items-center gap-2 font-semibold">
        <AlertCircle className="h-4 w-4" />
        Data load failed
      </div>
      <div className="mt-1 text-xs">{message}</div>
      {onRetry && (
        <div className="mt-2">
          <Button variant="outline" size="sm" onClick={onRetry}>Retry</Button>
        </div>
      )}
    </div>
  );
}

function EmptyStateCard({
  message,
  actionLabel,
  onAction,
  actionDisabled,
  secondaryLabel,
  onSecondaryAction,
  secondaryDisabled,
}: {
  message: string;
  actionLabel: string;
  onAction: () => void;
  actionDisabled?: boolean;
  secondaryLabel?: string;
  onSecondaryAction?: () => void;
  secondaryDisabled?: boolean;
}) {
  return (
    <div className="text-sm text-muted-foreground border rounded-lg p-4">
      <p>{message}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={onAction} disabled={actionDisabled}>{actionLabel}</Button>
        {secondaryLabel && onSecondaryAction && (
          <Button size="sm" variant="outline" onClick={onSecondaryAction} disabled={secondaryDisabled}>
            {secondaryLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
