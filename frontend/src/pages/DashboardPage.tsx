/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, FileText, Trash2, RefreshCw, Layers, Fingerprint, Lightbulb, ArrowRight, Bot } from "lucide-react";
import { toast } from "sonner";
import { SkeletonDashboard } from "@/components/SkeletonCard";
import { useActiveProject } from "@/hooks/useActiveProject";

interface ContentItem {
  id: string;
  main_keyword: string;
  h1: string;
  status: string;
  word_count_target: number;
  generated_title: string | null;
  created_at: string;
  sections_completed: number | null;
  total_sections: number | null;
}

interface AeoAnalysisStatus {
  id: string;
  status: string;
  overall_score: number | null;
  created_at: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-slate-100", text: "text-slate-700", dot: "bg-slate-500" },
  generating: { bg: "bg-amber-500/10", text: "text-amber-700", dot: "bg-amber-500 animate-pulse" },
  completed: { bg: "bg-emerald-500/10", text: "text-emerald-700", dot: "bg-emerald-500" },
  failed: { bg: "bg-red-500/10", text: "text-red-700", dot: "bg-red-500" },
  published: { bg: "bg-blue-500/10", text: "text-blue-700", dot: "bg-blue-500" },
};

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { activeProjectId, setActiveProjectId } = useActiveProject();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<{ total: number; used: number; remaining: number; reset_date: string } | null>(null);
  const [aeoStatus, setAeoStatus] = useState<AeoAnalysisStatus | null>(null);

  useEffect(() => {
    const handlePendingAudit = async () => {
      const pendingUrl = sessionStorage.getItem("pendingSeoAuditUrl");
      if (pendingUrl && user?.id) {
        sessionStorage.removeItem("pendingSeoAuditUrl");
        try {
          const { data: existing } = await supabase
            .from("projects")
            .select("id")
            .eq("user_id", user.id)
            .eq("domain", pendingUrl)
            .limit(1);

          let projectIdToUse;
          if (existing && existing.length > 0) {
            projectIdToUse = existing[0].id;
          } else {
            let name = pendingUrl.replace(/^https?:\/\//, '').split('/')[0] || "New Project";
            const { data: newProject, error } = await supabase
              .from("projects")
              .insert({
                user_id: user.id,
                name: name,
                domain: pendingUrl,
              })
              .select()
              .single();
            if (error) throw error;
            projectIdToUse = newProject.id;
          }

          if (projectIdToUse) {
            setActiveProjectId(projectIdToUse);
            toast.success("Ready for SEO Audit! Redirecting...");
            navigate(`/app/en/aeo/visibility-score`);
          }
        } catch (e: any) {
          toast.error("Failed to setup project for SEO audit.");
        }
      }
    };
    handlePendingAudit();
  }, [user?.id, navigate, setActiveProjectId]);

  const fetchData = useCallback(async () => {
    if (!user?.id) {
      setItems([]);
      setAeoStatus(null);
      setCredits(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (!activeProjectId) {
      setItems([]);
      setAeoStatus(null);
      setLoading(false);
      return;
    }
    const { data: contentData } = await supabase
      .from("content_items")
      .select("id, main_keyword, h1, status, word_count_target, generated_title, created_at, sections_completed, total_sections")
      .eq("user_id", user.id)
      .eq("project_id", activeProjectId)
      .order("created_at", { ascending: false });

    setItems(contentData || []);

    const { data: latestAeo } = await supabase
      .from("aeo_analyses" as any)
      .select("id, status, overall_score, created_at")
      .eq("project_id", activeProjectId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setAeoStatus((latestAeo as AeoAnalysisStatus) || null);

    const { data: creditData } = await (supabase
      .from("workspace_credits" as any)
      .select("total_credits, used_credits, locked_credits, reset_date")
      .eq("user_id", user.id)
      .single() as any);

    if (creditData) {
      setCredits({
        total: creditData.total_credits,
        used: creditData.used_credits,
        remaining: creditData.total_credits - creditData.used_credits - creditData.locked_credits,
        reset_date: creditData.reset_date
      });
    } else {
      // Auto-provision 5 credits for new users
      const { error: insertError } = await supabase
        .from("workspace_credits" as any)
        .insert({
          user_id: user.id,
          total_credits: 5,
          used_credits: 0,
          locked_credits: 0
        } as any);

      if (!insertError) {
        // Approximate reset date for fallback state
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCredits({ total: 5, used: 0, remaining: 5, reset_date: nextMonth.toISOString() });
      } else {
        console.error("Failed to provision initial credits", insertError);
        setCredits({ total: 0, used: 0, remaining: 0, reset_date: new Date().toISOString() });
      }
    }
    setLoading(false);
  }, [activeProjectId, user?.id]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("dashboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "content_items" }, fetchData)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchData]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("content_items")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id)
      .eq("project_id", activeProjectId);

    if (error) toast.error("Failed to delete");
    else {
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success("Deleted");
    }
  };

  const handleRetry = async (id: string) => {
    try {
      // Reset the content item
      const { error: updateError } = await supabase.from("content_items").update({
        status: "generating",
        sections_completed: 0,
        total_sections: null,
        current_section: null,
        generated_content: null,
        generated_title: null,
      })
        .eq("id", id)
        .eq("user_id", user?.id)
        .eq("project_id", activeProjectId);

      if (updateError) throw updateError;

      // Re-trigger generation
      supabase.functions.invoke("generate-blog", {
        body: { contentId: id },
      }).catch((err: any) => console.error("Retry invoke error:", err));

      toast.success("Retrying generation...");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to retry");
    }
  };

  const completedCount = items.filter(i => i.status === "completed" || i.status === "published").length;
  const totalWords = items.reduce((sum, i) => sum + i.word_count_target, 0);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between border-b border-line pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink mb-1">
            Welcome back to Solo Spider
          </h1>
          <p className="text-slate-700 text-sm font-medium">Your AI-powered marketing platform. Select a project to get started.</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="default" className="shadow-sm">Quick Tour</Button>
        </div>
      </div>

      {/* Plan Info Card */}
      {credits && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md shadow-slate-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">Current Plan</span>
              <Badge variant="secondary" className="font-bold bg-primary/10 text-primary border border-primary/20">
                {credits.total === 5 ? "Starter Plan" : credits.total === 30 ? "Pro Plan" : "Scale Plan"}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{credits.remaining}</span>
              <span className="text-slate-800 font-bold">/ {credits.total} Credits Remaining</span>
            </div>
            <p className="text-sm text-slate-800 mt-2">
              Renews / Expires on: <span className="font-bold text-foreground">{new Date(credits.reset_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>

          <div className="flex-shrink-0 w-full md:w-auto">
            {credits.total === 5 ? (
              <Button asChild className="w-full md:w-auto shadow-md btn-grad text-white font-bold rounded-xl">
                <Link to="/pricing">Upgrade to Pro</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full md:w-auto shadow-md font-bold rounded-xl border-slate-300">
                <Link to="/pricing">Renew Plan</Link>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tip of the Day */}
      <div className="bg-gradient-to-r from-primary/10 to-pink/10 border border-primary/20 rounded-xl p-5 flex items-start gap-4 text-sm shadow-sm">
        <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <p><span className="font-bold text-primary">Pro Tip:</span> <span className="text-slate-900 font-medium">Group related content around pillar topics to establish topical authority before generating posts.</span></p>
      </div>

      {/* AEO Scan Status */}
      {activeProjectId && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-md shadow-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900">AEO Scan Status</p>
              {!aeoStatus && (
                <p className="text-xs text-slate-800 font-medium">No scan yet. Create a project or run AEO scan manually.</p>
              )}
              {aeoStatus?.status === "running" && (
                <p className="text-xs text-slate-800 font-medium">Initial AEO scan is running for this project.</p>
              )}
              {aeoStatus?.status === "completed" && (
                <p className="text-xs text-slate-800 font-medium">
                  Latest score: <span className="font-bold text-foreground">{aeoStatus.overall_score ?? 0}</span> · Updated {new Date(aeoStatus.created_at).toLocaleString()}
                </p>
              )}
              {aeoStatus?.status === "failed" && (
                <p className="text-xs text-red-700 font-medium">Last AEO scan failed. Open AEO analytics and retry.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Badge variant="secondary" className="font-bold bg-slate-100 text-slate-800 border border-slate-200">
              {aeoStatus ? aeoStatus.status : "not_started"}
            </Badge>
            <Button asChild size="sm" variant="outline" className="font-bold rounded-xl border-slate-300 shadow-sm">
              <Link to="/app/en/aeo/analytics">Open AEO</Link>
            </Button>
          </div>
        </div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Post */}
        <Link to="/app/en/content/generate" className="p-7 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[200px] overflow-hidden relative hover:border-blue-400">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
            <FileText className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-black text-xl text-blue-950">Create Post</h3>
            </div>
            <p className="text-xs text-blue-900/90 font-semibold leading-relaxed">Write a highly optimized, AI-assisted blog post from a single keyword.</p>
          </div>
          <div className="relative z-10 flex items-center text-blue-700 text-xs font-black mt-4 group-hover:text-blue-800 uppercase tracking-widest">
            Start Writing <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Bulk Creation */}
        <Link to="/app/en/content/bulk-generate" className="p-7 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[200px] overflow-hidden relative hover:border-emerald-400">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
            <Layers className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Layers className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-black text-xl text-emerald-950">Bulk Creation</h3>
            </div>
            <p className="text-xs text-emerald-900/90 font-semibold leading-relaxed">Generate dozens of articles automatically and build topical authority fast.</p>
          </div>
          <div className="relative z-10 flex items-center text-emerald-700 text-xs font-black mt-4 group-hover:text-emerald-800 uppercase tracking-widest">
            Launch Run <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Brand Identity */}
        <Link to="/brand-identity" className="p-7 rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-fuchsia-50/40 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between min-h-[200px] overflow-hidden relative hover:border-purple-400">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-300">
            <Fingerprint className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-black text-xl text-purple-950">Brand Identity</h3>
            </div>
            <p className="text-xs text-purple-900/90 font-semibold leading-relaxed">Train the AI on your brand voice, tone, and specific business details.</p>
          </div>
          <div className="relative z-10 flex items-center text-purple-700 text-xs font-black mt-4 group-hover:text-purple-800 uppercase tracking-widest">
            Configure <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>

      {/* Recent Posts List */}
      <div className="pt-8 pb-10">
        <h2 className="text-xl font-black mb-4 text-slate-900 tracking-tight">Recent Blog Posts</h2>
        {loading ? (
          <SkeletonDashboard />
        ) : items.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
            <p className="text-slate-800 font-semibold mb-4">No blog posts found. Create your first blog post!</p>
            <Button asChild className="shadow-md btn-grad text-white font-bold rounded-xl">
              <Link to="/app/en/content/generate">
                Create Blog Post
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {items.map((item, index) => {
              const status = statusConfig[item.status] || statusConfig.draft;
              return (
                <Link
                  key={item.id}
                  to={`/app/en/content/${item.id}`}
                  className="flex items-center justify-between p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-lg hover:border-primary/40 hover:-translate-y-0.5 transition-all duration-300 group animate-slide-in shadow-sm shadow-slate-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <h3 className="font-bold text-slate-900 truncate group-hover:text-primary transition-colors text-base tracking-tight">
                        {item.generated_title || item.h1}
                      </h3>
                      <Badge variant="secondary" className={`${status.bg} ${status.text} gap-1.5 font-bold border border-slate-200/50`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {item.status === "generating"
                          ? `Generating ${item.sections_completed || 0}/${item.total_sections || "?"}`
                          : item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-800 font-semibold">
                      {item.main_keyword} · <span className="text-primary">{item.word_count_target.toLocaleString()} words</span> · {new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(item.status === "generating" || item.status === "failed") && (
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRetry(item.id); }}
                        className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-800 hover:text-primary transition-all rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/20"
                        title="Retry generation"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(item.id); }}
                      className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-800 hover:text-destructive transition-all rounded-xl hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
