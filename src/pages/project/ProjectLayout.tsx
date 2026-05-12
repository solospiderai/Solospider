import { createContext, useContext, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useActiveProject } from "@/hooks/useActiveProject";

interface Project {
  id: string;
  name: string;
  domain: string;
  brand_name: string | null;
  brand_tagline: string | null;
  brand_description: string | null;
  brand_logo_url: string | null;
  og_image_url: string | null;
  created_at: string;
}

interface ProjectContextValue {
  project: Project;
}

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used inside ProjectLayout");
  return ctx;
}

export function ProjectLayout({ children }: { children: ReactNode }) {
  const { activeProjectId, isLoadingProjects, projects } = useActiveProject();
  const { user } = useAuth();

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", activeProjectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", activeProjectId!)
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data as Project;
    },
    enabled: !!activeProjectId && !!user,
  });

  if (isLoadingProjects) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading project workspace...</p>
      </div>
    );
  }

  if (!activeProjectId || projects.length === 0) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading project data...</p>
      </div>
    );
  }

  if (isError || !project) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <ProjectContext.Provider value={{ project }}>
      {children}
    </ProjectContext.Provider>
  );
}
