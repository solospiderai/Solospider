import { useProject } from "./ProjectLayout";
import { Link } from "react-router-dom";
import { ArrowRight, Eye, Search, Bot, Layers, Users, ShieldAlert, CheckCircle, Activity, Sparkles, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ProjectOverviewPage() {
  const { project } = useProject();

  const v1Modules = [
    {
      label: "Visibility Scoring",
      icon: Eye,
      color: "primary",
      description: "Mention rate, citation rate, and Share of Voice HUD.",
      href: "aeo/visibility-score",
    },
    {
      label: "Competitor Tracking",
      icon: Users,
      color: "pink",
      description: "Why competitors are winning in AI search recommendations.",
      href: "competitors",
    },
    {
      label: "Prompt Universe",
      icon: Bot,
      color: "cyan",
      description: "Generated prompt matrix across commercial buyer intents.",
      href: "aeo/prompt-generation",
    },
    {
      label: "AI Monitoring Runs",
      icon: Activity,
      color: "pink",
      description: "Surveillance execution logs across OpenAI, Gemini & Perplexity.",
      href: "aeo/analytics",
    },
    {
      label: "Sitemap Crawler",
      icon: Search,
      color: "primary",
      description: "Extracted pages, headings, entities, and semantic embeddings.",
      href: "seo/keywords",
    },
    {
      label: "Topic Extraction",
      icon: Layers,
      color: "cyan",
      description: "Distilled brand context, tone, audience, and commercial intents.",
      href: "brand",
    },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    pink: "bg-pink/10 text-pink border-pink/20",
    cyan: "bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/20",
  };

  const steps = [
    { num: "01", title: "Add Domain", status: "Active", desc: project.domain },
    { num: "02", title: "Sitemap Crawl", status: "Done", desc: "384 pages indexed & embedded" },
    { num: "03", title: "Brand Context", status: "Done", desc: "Commercial tone & topics distilled" },
    { num: "04", title: "Prompt Universe", status: "Active", desc: "412 high-intent search queries" },
    { num: "05", title: "AI Model Runs", status: "Active", desc: "OpenAI, Gemini & Perplexity monitored" },
    { num: "06", title: "Visibility Score", status: "Calculated", desc: "18.4% Share of Voice" },
    { num: "07", title: "Gap Detection", status: "Alert", desc: "Competitors winning in CRM comparisons" },
    { num: "08", title: "Action Engine", status: "Pending", desc: "Recommended comparison pages" },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header HUD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-line pb-8">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black shadow-2xl shadow-primary/30 border-4 border-bg">
              {(project.brand_name || project.name).charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-white text-[10px] font-black uppercase tracking-widest">AI Visibility OS</Badge>
              <span className="text-xs text-ink-2 font-mono">Event Pipeline: Active</span>
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight mt-1">{project.brand_name || project.name}</h1>
            <div className="flex items-center gap-4 mt-1 text-xs text-ink-2">
              <span className="font-semibold text-primary">{project.industry || "Enterprise AI Software"}</span>
              <span>·</span>
              <a href={project.domain} target="_blank" rel="noopener noreferrer" className="font-mono underline hover:text-primary transition-colors">
                {project.domain}
              </a>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-xs font-semibold">
            <RefreshCw className="h-3.5 w-3.5" />
            Run Visibility Sync
          </Button>
        </div>
      </div>

      {/* KILLER FEATURE BANNER: Why competitors are winning */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-amber-500/10 via-pink-500/5 to-purple-500/10 border border-amber-500/20 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-600">Killer Feature Intelligence</span>
          </div>
          <Badge className="bg-amber-500 text-white font-mono text-[10px]">Priority Alert</Badge>
        </div>
        <h2 className="text-2xl font-black text-ink tracking-tight">
          “Why competitors are winning in AI search.”
        </h2>
        <p className="text-xs text-ink-2 leading-relaxed max-w-3xl">
          LLMs (OpenAI, Gemini, Perplexity) frequently recommend <b className="text-ink">acme.com</b> and <b className="text-ink">hubspot.com</b> over your brand because their sitemap clusters heavily target <span className="underline font-semibold">"startup CRM comparison workflows"</span> and <span className="underline font-semibold">"email automation integrations"</span>. 
        </p>
        <div className="pt-2 flex items-center gap-4">
          <Link to="competitors">
            <Button size="sm" className="bg-ink text-panel text-xs font-semibold gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Explore Competitor Gaps
            </Button>
          </Link>
          <Link to="aeo/visibility-score">
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-primary">
              View Visibility Score Matrix &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* 8-Step Event Pipeline Progression */}
      <div>
        <div className="flex items-center justify-between mb-6 pl-1 opacity-80">
          <h2 className="text-[10px] font-black text-ink uppercase tracking-[0.3em]">Lean V1 Event Loop Pipeline</h2>
          <span className="text-[11px] font-mono text-ink-2">EVENT &rarr; JOB &rarr; WORKER &rarr; RESULT</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {steps.map((step) => (
            <div key={step.num} className="p-4 rounded-2xl glass border border-line bg-panel/50 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-primary">{step.num}</span>
                <span className={`h-2 w-2 rounded-full ${step.status === "Alert" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
              </div>
              <div>
                <div className="font-bold text-xs text-ink line-clamp-1">{step.title}</div>
                <div className="text-[10px] text-ink-2 mt-1 line-clamp-2">{step.desc}</div>
              </div>
              <Badge className="w-fit text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 mt-2 bg-slate-100 text-ink-2">
                {step.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Lean V1 Strategic Modules */}
      <div>
        <h2 className="text-[10px] font-black text-ink uppercase tracking-[0.3em] mb-6 pl-1 opacity-80">Core Command Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {v1Modules.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.href}
                className="p-8 rounded-[2.5rem] glass border-line hover:border-primary/40 hover:-translate-y-2 transition-all duration-500 group flex flex-col gap-6 shadow-xl shadow-primary/5 hover:shadow-primary/10 bg-panel"
              >
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center border shadow-lg transition-transform group-hover:scale-110 duration-500",
                  colorMap[tab.color]
                )}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-ink text-lg tracking-tight group-hover:text-primary transition-colors">{tab.label}</h3>
                  <p className="text-[11px] font-bold text-ink-2 mt-2 leading-relaxed opacity-60">{tab.description}</p>
                </div>
                <div className="flex items-center text-primary text-[10px] font-black uppercase tracking-widest mt-4 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Access Intelligence <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
