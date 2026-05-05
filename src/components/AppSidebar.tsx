import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useActiveProject } from "@/hooks/useActiveProject";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { useState } from "react";
import {
  FileText, Layers, List, Calendar, Search, Share2, TrendingUp, Bot,
  Settings2, LogOut, Plus, ChevronDown, ChevronRight, Plug,
  BarChart2, Eye, Lightbulb, Link as LinkIcon, Video, Users,
  Fingerprint, Globe, Edit, ImageIcon,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  items: NavItem[];
}

const AppSidebar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { canAddProject, currentPlan, projectLimit } = useProjects();
  const { projects, isLoadingProjects, activeProject, setActiveProjectId } = useActiveProject();
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(["content"]);

  const pid = activeProject?.id;

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const navSections: NavSection[] = pid ? [
    {
      id: "content",
      label: "Content Creation",
      icon: FileText,
      color: "text-primary",
      items: [
        { to: `/project/${pid}/keyword-research`, label: "Keyword Research", icon: Search },
        { to: `/project/${pid}/generate`, label: "Single Post Creation", icon: Edit },
        { to: `/project/${pid}/bulk-generate`, label: "Bulk Post Creation", icon: Layers },
        { to: `/project/${pid}/manage-posts`, label: "Manage Blog Posts", icon: List },
        { to: `/project/${pid}/calendar`, label: "Content Calendar", icon: Calendar },
      ],
    },
    {
      id: "social",
      label: "Social Media",
      icon: Share2,
      color: "text-pink",
      items: [
        { to: `/project/${pid}/social-posts`, label: "Post Creation", icon: Share2 },
        { to: `/project/${pid}/social-image`, label: "Image Generation", icon: ImageIcon },
        { to: `/project/${pid}/social-calendar`, label: "Scheduling Calendar", icon: Calendar },
        { to: `/project/${pid}/social-reels`, label: "Video / Reel Generation", icon: Video, badge: "Soon" },
      ],
    },
    {
      id: "ads",
      label: "Performance Ads",
      icon: TrendingUp,
      color: "text-[#22d3ee]",
      items: [
        { to: `/project/${pid}/ads/meta`, label: "Meta Ads Improvement", icon: TrendingUp },
        { to: `/project/${pid}/ads/meta-analytics`, label: "Meta Ads Analytics", icon: BarChart2 },
        { to: `/project/${pid}/ads/google`, label: "Google Ads Improvement", icon: TrendingUp },
        { to: `/project/${pid}/ads/google-analytics`, label: "Google Ads Analytics", icon: BarChart2 },
      ],
    },
    {
      id: "seo",
      label: "SEO Optimization",
      icon: Search,
      color: "text-primary",
      items: [
        { to: `/project/${pid}/seo/keywords`, label: "SEO Keywords", icon: Search },
        { to: `/project/${pid}/seo/backlinks`, label: "Backlinks", icon: LinkIcon },
      ],
    },
    {
      id: "aeo",
      label: "AEO (AI Search)",
      icon: Bot,
      color: "text-pink",
      items: [
        { to: `/project/${pid}/aeo/prompt-generation`, label: "AI Prompt Generation", icon: Bot },
        { to: `/project/${pid}/aeo/analytics`, label: "AEO Analytics", icon: BarChart2 },
        { to: `/project/${pid}/aeo/visibility-score`, label: "AI Visibility Score", icon: Eye },
        { to: `/project/${pid}/aeo/opportunities`, label: "Opportunities", icon: Lightbulb },
      ],
    },
    {
      id: "brand",
      label: "Brand Workspace",
      icon: Globe,
      color: "text-[#22d3ee]",
      items: [
        { to: `/project/${pid}/brand`, label: "Brand Info", icon: Fingerprint },
        { to: `/project/${pid}/competitors`, label: "Competitors", icon: Users },
      ],
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings2,
      color: "text-muted-foreground",
      items: [
        { to: `/project/${pid}/integrations`, label: "Integrations", icon: Plug },
        { to: `/project/${pid}/settings`, label: "Project Settings", icon: Settings2 },
      ],
    },
  ] : [];

  return (
    <>
      <aside className="w-64 bg-panel flex flex-col min-h-screen border-r border-sidebar-border relative z-10">
        {/* Logo */}
        <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
          <Link to="/dashboard" className="flex items-center gap-2.5 group flex-1">
            <img src="/assets/solospider-logo.png" alt="Solo Spider" className="h-[28px] w-auto dark:invert dark:brightness-200" />
          </Link>
        </div>

        {/* Projects Section */}
        <div className="px-3 py-3 border-b border-sidebar-border/50">
          <h3 className="px-2 text-[10px] font-black text-ink uppercase tracking-[0.2em] mb-3">
            Projects
          </h3>
          <div className="space-y-1">
            {isLoadingProjects ? (
              <div className="px-3 py-2 text-xs text-muted-foreground animate-pulse">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="px-3 py-2 text-xs text-muted-foreground italic">No projects yet.</div>
            ) : (
              projects.map((project) => {
                const isActive = activeProject?.id === project.id;
                return (
                  <button
                    key={project.id}
                    onClick={() => {
                      setActiveProjectId(project.id);
                      navigate(`/project/${project.id}`);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all text-left",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-foreground border border-line shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded flex items-center justify-center text-xs font-bold shrink-0",
                      isActive ? "bg-primary text-primary-foreground" : "bg-sidebar-accent text-muted-foreground"
                    )}>
                      {(project.brand_name || project.name).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-xs font-semibold">{project.brand_name || project.name}</span>
                      <span className="truncate text-[10px] text-muted-foreground">{project.domain}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full flex justify-start gap-2 text-xs text-muted-foreground hover:text-foreground h-8 px-2"
              onClick={() => {
                if (canAddProject) {
                  setProjectDialogOpen(true);
                } else {
                  toast.error(`Your ${currentPlan} plan allows max ${projectLimit} project(s). Upgrade to add more.`);
                }
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Project
            </Button>
            {!canAddProject && (
              <Link to="/pricing" className="block px-2 py-0.5 text-[10px] text-primary hover:underline">
                Upgrade plan →
              </Link>
            )}
          </div>
        </div>

        {/* 7-Tab Navigation */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-thin">
          {activeProject ? (
            navSections.map((section) => {
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
                            key={item.to}
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
                            {item.badge && (
                              <span className="text-[9px] font-bold bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded-full uppercase">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-8 text-center">
              <p className="text-xs text-muted-foreground">Select or create a project to see navigation.</p>
            </div>
          )}
        </div>

        {/* Bottom */}
        <div className="p-3 space-y-1 border-t border-sidebar-border">
          <ThemeToggle />
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
