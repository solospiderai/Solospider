import { useProject } from "./ProjectLayout";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Layers, Search, TrendingUp, Bot, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectOverviewPage() {
  const { project } = useProject();

  const tabs = [
    {
      label: "Content Creation",
      icon: FileText,
      color: "primary",
      description: "AI blog posts, keyword research, content calendar.",
      href: "generate",
    },
    {
      label: "Social Media",
      icon: Share2,
      color: "pink",
      description: "Create and schedule social posts and reels.",
      href: "social-posts",
    },
    {
      label: "Performance Ads",
      icon: TrendingUp,
      color: "cyan",
      description: "Optimize Meta & Google Ads campaigns.",
      href: "ads/meta",
    },
    {
      label: "SEO Optimization",
      icon: Search,
      color: "primary",
      description: "Keyword strategy and backlink management.",
      href: "seo/keywords",
    },
    {
      label: "AEO (AI Search)",
      icon: Bot,
      color: "pink",
      description: "AI prompt generation and visibility scoring.",
      href: "aeo/prompt-generation",
    },
    {
      label: "Brand Workspace",
      icon: Layers,
      color: "cyan",
      description: "Your brand info, tagline, and competitors.",
      href: "brand",
    },
  ];

  const colorMap: Record<string, string> = {
    primary: "bg-primary/10 text-primary border-primary/20",
    pink: "bg-pink/10 text-pink border-pink/20",
    cyan: "bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/20",
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10 reveal in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 reveal d1">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-black shadow-2xl shadow-primary/30 border-4 border-bg">
              {(project.brand_name || project.name).charAt(0).toUpperCase()}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-black text-ink tracking-tight">{project.brand_name || project.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              {project.brand_tagline && (
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">{project.brand_tagline}</span>
              )}
              <div className="h-1.5 w-1.5 rounded-full bg-primary/20" />
              <a
                href={project.domain}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black text-ink uppercase tracking-[0.3em] hover:text-primary transition-colors"
              >
                {project.domain}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Brand description */}
      {project.brand_description && (
        <div className="glass rounded-[2.5rem] p-10 reveal d2 border-primary/10 shadow-2xl shadow-primary/5">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Neural Brand Blueprint</p>
          <p className="text-base font-bold text-ink leading-relaxed">
            {project.brand_description}
          </p>
        </div>
      )}

      {/* Quick access grid */}
      <div className="reveal d3">
        <h2 className="text-[10px] font-black text-ink uppercase tracking-[0.3em] mb-8 pl-1 opacity-60">Strategic Command Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.href}
                className="p-8 rounded-[2.5rem] glass border-line hover:border-primary/40 hover:-translate-y-2 transition-all duration-500 group flex flex-col gap-6 shadow-xl shadow-primary/5 hover:shadow-primary/10"
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
                  Initiate Sync <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
