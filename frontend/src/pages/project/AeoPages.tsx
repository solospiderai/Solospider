import { useState, useEffect } from "react";
import { useProject } from "./ProjectLayout";
import { supabase } from "@/integrations/supabase/client";
import { runAeoAnalysis, AeoAnalysisResult } from "@/lib/aeo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BarChart2, Sparkles, Loader2, Globe, Hash, TrendingUp, CheckCircle2,
  AlertTriangle, Lightbulb, Search, Activity, Target
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Shared AEO State & Fetching
// ─────────────────────────────────────────────────────────────────────────────

function useAeoAnalysis(projectId: string) {
  return useQuery({
    queryKey: ["aeo_analysis", projectId],
    queryFn: async () => {
      const { data } = await supabase
        .from("aeo_analyses" as any)
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data as any;
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN AUDIT / ANALYTICS PAGE (Form + Dashboard)
// ─────────────────────────────────────────────────────────────────────────────

export function AeoAnalyticsPage() {
  const { project } = useProject();
  const qc = useQueryClient();
  const { data: analysis, isLoading } = useAeoAnalysis(project.id);

  const [website, setWebsite] = useState(project.website || "");
  const [brandName, setBrandName] = useState(project.brand_name || project.name);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (project) {
      if (!website && project.website) setWebsite(project.website);
      if (!brandName && (project.brand_name || project.name)) setBrandName(project.brand_name || project.name);
    }
  }, [project]);

  const handleAddTopic = (e?: React.KeyboardEvent) => {
    if (e && e.key !== "Enter") return;
    if (e) e.preventDefault();
    if (topicInput.trim() && !topics.includes(topicInput.trim())) {
      setTopics([...topics, topicInput.trim()]);
    }
    setTopicInput("");
  };

  const handleRunAudit = async () => {
    if (!website || !brandName || topics.length === 0) {
      toast.error("Please fill all fields and add at least one topic.");
      return;
    }
    setRunning(true);
    let createdRecordId: string | null = null;
    try {
      // Create pending record
      const { data: record, error: insertError } = await supabase
        .from("aeo_analyses" as any)
        .insert([{
          project_id: project.id,
          website,
          brand_name: brandName,
          topics,
          status: 'running'
        }])
        .select()
        .single();

      if (insertError) throw insertError;
      if (record) {
        createdRecordId = record.id;
      }

      // Run AI Analysis via Pollinations
      const result = await runAeoAnalysis({
        website,
        brandName,
        topics,
        brandDescription: project.brand_description || ""
      });

      // Update record with results
      await supabase.from("aeo_analyses" as any).update({
        status: 'completed',
        overall_score: result.overallScore,
        chatgpt_score: result.providers.find(p => p.id === 'chatgpt')?.score,
        gemini_score: result.providers.find(p => p.id === 'gemini')?.score,
        claude_score: result.providers.find(p => p.id === 'claude')?.score,
        perplexity_score: result.providers.find(p => p.id === 'perplexity')?.score,
        category_scores: result.categoryScores,
        ai_insights: result.providers,
        recommendations: result.recommendations,
        prompt_suggestions: result.promptSuggestions,
      }).eq('id', createdRecordId);

      toast.success("AEO Analysis completed!");
      qc.invalidateQueries({ queryKey: ["aeo_analysis", project.id] });
    } catch (e: any) {
      console.error("AEO handleRunAudit failed:", e);
      toast.error("Analysis failed: " + e.message);
      if (createdRecordId) {
        await supabase
          .from("aeo_analyses" as any)
          .update({ status: 'failed' })
          .eq('id', createdRecordId);
        qc.invalidateQueries({ queryKey: ["aeo_analysis", project.id] });
      }
    } finally {
      setRunning(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-neon-blue" /></div>;

  // ── 1. INPUT FORM (No analysis yet) ──
  if (!analysis || analysis.status === 'failed') {
    return (
      <div className="p-6 max-w-4xl mx-auto min-h-[600px] flex flex-col justify-center">
        <div className="text-center mb-10">
          <Badge className="bg-neon-blue/10 text-neon-blue mb-4">AI Search Visibility</Badge>
          <h1 className="text-4xl font-bold mb-4">Check how you rank in <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">ChatGPT</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Gemini</span></h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Track and find opportunities in AI results to get your brand mentioned by LLM platforms.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-2xl mx-auto w-full shadow-2xl relative overflow-hidden">
          {running && (
            <div className="absolute inset-0 bg-[#050505]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-neon-blue animate-spin mb-4" />
              <p className="text-lg font-bold">Running AEO Analysis...</p>
              <p className="text-sm text-muted-foreground mt-2">Simulating queries across ChatGPT, Claude, and Gemini.</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Globe className="h-4 w-4" /> Website *</label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="yourbrand.com"
                  className="bg-black/20 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Target className="h-4 w-4" /> Brand Name *</label>
                <Input
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Brand Name"
                  className="bg-black/20 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2"><Search className="h-4 w-4" /> Topics / Keywords *</label>
              <div className="flex gap-2">
                <Input
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={handleAddTopic}
                  placeholder="e.g. SEO software, content marketing"
                  className="bg-black/20 border-white/10"
                />
                <Button variant="outline" onClick={() => handleAddTopic()} className="border-white/10">Add</Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 p-3 bg-black/20 rounded-lg border border-white/5 min-h-[50px]">
                  {topics.map(t => (
                    <Badge key={t} variant="secondary" className="bg-neon-blue/10 text-neon-blue hover:bg-neon-blue/20 cursor-pointer" onClick={() => setTopics(topics.filter(x => x !== t))}>
                      {t} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              className="w-full h-12 text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple text-white shadow-lg shadow-neon-blue/20"
              onClick={handleRunAudit}
              disabled={running}
            >
              Run First Analysis
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── 2. DASHBOARD VIEW (Analysis complete) ──
  const providers = analysis.ai_insights || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6 text-neon-blue" /> AEO Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Audit for <strong className="text-foreground">{analysis.brand_name}</strong> on {analysis.website}</p>
        </div>
        <Button variant="outline" className="border-white/10 text-muted-foreground" onClick={() => qc.invalidateQueries({ queryKey: ["aeo_analysis", project.id] })}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Score */}
        <div className="col-span-1 md:col-span-3 lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-6 flex flex-col items-center justify-center text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 rounded-full bg-neon-blue blur-xl opacity-20" />
            <div className="w-32 h-32 rounded-full border-4 border-neon-blue/30 flex flex-col items-center justify-center relative bg-[#050505]">
              <span className="text-4xl font-black text-neon-blue">{analysis.overall_score}</span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Score</span>
            </div>
          </div>
          <h2 className="text-lg font-bold">Overall Visibility</h2>
          <p className="text-sm text-muted-foreground mt-2">How often AI engines recommend your brand.</p>
        </div>

        {/* AI Providers Breakdown */}
        <div className="col-span-1 md:col-span-3 lg:col-span-2 grid grid-cols-2 gap-4">
          {providers.map((p: any) => (
            <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold">{p.name}</h3>
                <Badge className={cn("text-xs font-bold",
                  p.status === 'high' ? "bg-green-500/10 text-green-400" :
                  p.status === 'low' ? "bg-red-500/10 text-red-400" :
                  "bg-amber-500/10 text-amber-400"
                )}>
                  {p.score}/100
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{p.insight}</p>
              <div className="text-xs font-medium bg-black/30 p-2 rounded text-muted-foreground">
                Est. Brand Mentions: <strong className="text-foreground">{p.mentions}</strong>/mo
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links / Marketeam-style bottom nav */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><BarChart2 className="h-5 w-5" /></div>
          <div>
            <h4 className="font-bold text-sm">Category Scores</h4>
            <p className="text-xs text-muted-foreground mt-1">See how you rank in different topics</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
          <div className="p-3 bg-neon-blue/10 rounded-lg text-neon-blue"><Lightbulb className="h-5 w-5" /></div>
          <div>
            <h4 className="font-bold text-sm">AI Insights</h4>
            <p className="text-xs text-muted-foreground mt-1">Get actionable insights per provider</p>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400"><AlertTriangle className="h-5 w-5" /></div>
          <div>
            <h4 className="font-bold text-sm">Recommendations</h4>
            <p className="text-xs text-muted-foreground mt-1">Recommended actions to improve</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// VISIBILITY SCORE PAGE (Categories)
// ─────────────────────────────────────────────────────────────────────────────

export function AeoVisibilityScorePage() {
  const { project } = useProject();
  const { data: analysis, isLoading } = useAeoAnalysis(project.id);

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin text-neon-blue" /></div>;
  if (!analysis) return <div className="p-8 text-muted-foreground">No analysis found. Go to AEO Analytics to run an audit.</div>;

  const categories = analysis.category_scores || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-neon-blue" /> Category Visibility
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Your brand's performance across different topics and keywords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((c: any, i: number) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-black/30 border border-white/10 flex items-center justify-center font-bold text-lg text-neon-blue">
                {c.score}
              </div>
              <div>
                <h3 className="font-bold">{c.category}</h3>
                <span className={cn("text-xs flex items-center gap-1 mt-1",
                  c.trend === 'up' ? "text-green-400" :
                  c.trend === 'down' ? "text-red-400" : "text-muted-foreground"
                )}>
                  {c.trend === 'up' ? <TrendingUp className="h-3 w-3" /> :
                   c.trend === 'down' ? <TrendingUp className="h-3 w-3 rotate-180" /> : <span className="w-3">-</span>}
                  {c.trend.charAt(0).toUpperCase() + c.trend.slice(1)} Trend
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPPORTUNITIES PAGE (Recommendations)
// ─────────────────────────────────────────────────────────────────────────────

export function AeoOpportunitiesPage() {
  const { project } = useProject();
  const { data: analysis, isLoading } = useAeoAnalysis(project.id);

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin text-neon-blue" /></div>;
  if (!analysis) return <div className="p-8 text-muted-foreground">No analysis found. Go to AEO Analytics to run an audit.</div>;

  const recommendations = analysis.recommendations || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="h-6 w-6 text-amber-400" /> AEO Opportunities
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Actionable recommendations to improve AI search visibility.</p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec: any, i: number) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-5 group hover:border-white/20 transition-all">
            <div className="flex items-start gap-4">
              <div className={cn("mt-1 p-2 rounded-lg shrink-0",
                rec.priority === 'high' ? "bg-red-500/10 text-red-400" :
                rec.priority === 'medium' ? "bg-amber-500/10 text-amber-400" :
                "bg-blue-500/10 text-blue-400"
              )}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-lg">{rec.title}</h3>
                  <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider",
                    rec.priority === 'high' ? "border-red-500/30 text-red-400" :
                    rec.priority === 'medium' ? "border-amber-500/30 text-amber-400" :
                    "border-blue-500/30 text-blue-400"
                  )}>
                    {rec.priority} Priority
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">{rec.description}</p>
                <div className="bg-black/20 rounded-lg p-3 border border-white/5 text-sm">
                  <strong className="text-emerald-400 flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="h-4 w-4" /> Recommended Action:
                  </strong>
                  {rec.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT GENERATION PAGE (Suggestions)
// ─────────────────────────────────────────────────────────────────────────────

export function AeoPromptGenerationPage() {
  const { project } = useProject();
  const { data: analysis, isLoading } = useAeoAnalysis(project.id);

  if (isLoading) return <div className="p-8"><Loader2 className="animate-spin text-neon-blue" /></div>;
  if (!analysis) return <div className="p-8 text-muted-foreground">No analysis found. Go to AEO Analytics to run an audit.</div>;

  const prompts = analysis.prompt_suggestions || [];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-400" /> AI Prompt Generation
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Suggested prompts to query AI engines and test your visibility.</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {prompts.map((p: any, i: number) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="bg-black/30 px-5 py-3 border-b border-white/10 flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">{p.topic}</span>
            </div>
            <div className="p-5">
              <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-lg p-4 mb-4">
                <p className="font-medium text-lg leading-relaxed text-foreground">"{p.prompt}"</p>
              </div>
              <p className="text-sm text-muted-foreground"><strong className="text-foreground">Why test this?</strong> {p.rationale}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
