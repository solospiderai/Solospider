import { useEffect } from "react";
import { useProjects, Project } from "./useProjects";
import { useWorkspaceStore } from "@/stores/workspaceStore";

export function useActiveProject() {
  const { projects, isLoadingProjects } = useProjects();
  const { activeProjectId, setActiveProject } = useWorkspaceStore();

  const setActiveProjectId = (id: string | null) => {
    setActiveProject(id);
  };

  // Auto-select first project if nothing selected and projects loaded
  useEffect(() => {
    if (!isLoadingProjects && projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
    }
    // If the stored project no longer exists (deleted), reset to first
    if (!isLoadingProjects && activeProjectId && projects.length > 0) {
      const exists = projects.find((p) => p.id === activeProjectId);
      if (!exists) {
        setActiveProjectId(projects[0].id);
      }
    }
  }, [projects, isLoadingProjects]);

  const activeProject: Project | null =
    projects.find((p) => p.id === activeProjectId) ?? null;

  return { activeProject, activeProjectId, setActiveProjectId, projects, isLoadingProjects };
}
