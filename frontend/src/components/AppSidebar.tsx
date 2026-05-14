import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useActiveProject } from "@/hooks/useActiveProject";
import { ProjectSwitcher } from "@/components/ProjectSwitcher";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { useState, useEffect } from "react";
import {
  FileText, Layers, List, Calendar, Search, Share2, TrendingUp, Bot,
  Settings2, LogOut, Plus, ChevronDown, ChevronRight, Plug,
  BarChart2, Eye, Lightbulb, Link as LinkIcon, Video, Users,
  Fingerprint, Globe, Edit, ImageIcon, Link2,
} from "lucide-react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getEffectivePlan } from "@/lib/featureAccess";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  requiresPro?: boolean;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: NavItem[];
}

const AppSidebar = () => {
  const { user, isAdmin, role, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { canAddProject, currentPlan, projectLimit } = useProjects();
  const { projects, isLoadingProjects, activeProject, setActiveProjectId } = useActiveProject();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["content"]);

  // Auto-expand sections based on current path
  useEffect(() => {
    const path = location.pathname;
    const sectionIds = navSections
      .filter(section => section.items.some(item => path.startsWith(item.to)))
      .map(section => section.id);
    
    if (sectionIds.length > 0) {
      setOpenSections(prev => [...new Set([...prev, ...sectionIds])]);
    }
  }, [location.pathname]);

  const pid = activeProject?.id;
  const effectivePlan = getEffectivePlan(currentPlan);

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const navSections: NavSection[] = [
    {
      id: "visibility",
      label: "Visibility Intelligence",
      icon: Eye,
      color: "text-primary",
      items: [
        { to: "/app/en/dashboard", label: "Executive Dashboard", icon: BarChart2 },
        { to: "/app/en/aeo/visibility-score", label: "Visibility Scoring", icon: Eye },
        { to: "/app/en/competitors", label: "Competitor Tracking", icon: Users },
      ],
    },
    {
      id: "engine",
      label: "AI Surveillance Mesh",
      icon: Bot,
      color: "text-pink",
      items: [
        { to: "/app/en/aeo/prompt-generation", label: "Prompt Universe", icon: Bot },
        { to: "/app/en/aeo/analytics", label: "AI Monitoring Runs", icon: Layers },
        { to: "/app/en/seo/backlinks", label: "Citation Extraction", icon: LinkIcon },
      ],
    },
    {
      id: "crawler",
      label: "Sitemap & Brand DNA",
      icon: Search,
      color: "text-[#22d3ee]",
      items: [
        { to: "/app/en/seo/keywords", label: "Sitemap Crawler", icon: Search },
        { to: "/app/en/brand", label: "Topic Extraction", icon: Fingerprint },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings2,
      color: "text-muted-foreground",
      items: [
        { to: "/app/en/settings/project", label: "Project Settings", icon: Settings2 },
      ],
    },
    ...(isAdmin ? [{
      id: "admin",
      label: role === "super_admin" ? "Superadmin HUD" : "Support Operator HUD",
      icon: Eye,
      color: role === "super_admin" ? "text-amber-500" : "text-primary",
      items: [
        { to: "/admin", label: "Command Center", icon: BarChart2 },
      ],
    }] : []),
  ];

  return (
    <>
      <aside className="flex w-64 bg-panel flex-col min-h-screen border-r border-sidebar-border relative z-10">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-1">
            <img src="/assets/solospider-logo.png" alt="Solo Spider" className="h-[28px] w-auto" />
          </Link>
        </div>

        {/* Global Context Switcher */}
        <div className="p-3 border-b border-sidebar-border/50 bg-slate-50/50">
          <ProjectSwitcher />
        </div>

        {/* 7-Tab Navigation */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {!activeProject && (
            <div className="mx-3 mb-3 rounded-lg border border-dashed border-line bg-primary/5 p-3">
              <p className="text-[11px] font-semibold text-ink">Create a project to unlock all modules.</p>
              <Button
                size="sm"
                className="mt-2 h-7 w-full text-xs"
                onClick={() => setProjectDialogOpen(true)}
              >
                Add Project
              </Button>
            </div>
          )}
          {navSections.map((section) => {
            const isOpen = openSections.includes(section.id);
            const SectionIcon = section.icon;
            const hasActive = section.items.some((i) => location.pathname === i.to);
            return (
              <div key={section.id} className="mb-0.5">
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-4 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                    hasActive
                      ? "text-ink bg-primary/5"
                      : "text-ink hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <SectionIcon className={cn("h-3.5 w-3.5 shrink-0", section.color)} />
                  <span className="flex-1 text-left">{section.label}</span>
                  {isOpen ? (
                    <ChevronDown className="h-3 w-3 opacity-60" />
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-60" />
                  )}
                </button>
                {isOpen && (
                  <div className="pb-1 space-y-0.5 px-2">
                    {section.items.map((item) => {
                      const active = location.pathname === item.to;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={`${section.id}-${item.label}-${item.to}`}
                          to={item.to}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-all rounded-md",
                            active
                              ? "bg-sidebar-accent text-primary font-bold"
                              : "text-ink-2 hover:bg-sidebar-accent/40 hover:text-primary"
                          )}
                        >
                          <Icon className={cn("h-3.5 w-3.5 shrink-0", active ? "text-primary" : "text-ink-2")} />
                          <span className="flex-1 truncate">{item.label}</span>
                          {(item.badge || (effectivePlan === "free" && item.requiresPro)) && (
                            <span
                              className={cn(
                               "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase",
                                item.badge === "Soon"
                                  ? "bg-amber-500/10 text-amber-500"
                                  : "bg-primary/10 text-primary"
                              )}
                            >
                              {item.badge || "Pro"}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom */}
        <div className="p-3 space-y-1 border-t border-sidebar-border">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
      <CreateProjectDialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen} />
    </>
  );
};

export default AppSidebar;
