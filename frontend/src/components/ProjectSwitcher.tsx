import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import { useActiveProject } from "@/hooks/useActiveProject";

export function ProjectSwitcher() {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { projects, activeProject, setActiveProjectId, isLoadingProjects } = useActiveProject();

  const handleSelect = (projectId: string) => {
    setActiveProjectId(projectId);
    setOpen(false);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-white text-ink shadow-sm border-line hover:bg-slate-50 transition-all px-3"
          >
            {activeProject ? (
              <div className="flex items-center gap-2 truncate">
                <div className="w-5 h-5 rounded bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {(activeProject.brand_name || activeProject.name).charAt(0).toUpperCase()}
                </div>
                <span className="truncate text-sm font-semibold">
                  {activeProject.brand_name || activeProject.name}
                </span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm font-medium">Select project...</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-2 border-line shadow-lg rounded-xl" align="start">
          <div className="mb-2 px-2 pb-2 border-b border-line">
            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
              Your Projects
            </p>
          </div>
          <div className="max-h-[300px] overflow-y-auto space-y-1 scrollbar-thin">
            {isLoadingProjects ? (
              <div className="p-2 text-xs text-muted-foreground animate-pulse">Loading...</div>
            ) : projects.length === 0 ? (
              <div className="p-2 text-xs text-muted-foreground">No projects found.</div>
            ) : (
              projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => handleSelect(project.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm text-left transition-colors",
                    activeProject?.id === project.id
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-ink hover:bg-slate-100 font-medium"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <div className={cn(
                      "w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold shrink-0",
                      activeProject?.id === project.id ? "bg-primary text-white" : "bg-slate-200 text-slate-600"
                    )}>
                      {(project.brand_name || project.name).charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate">{project.brand_name || project.name}</span>
                  </div>
                  {activeProject?.id === project.id && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
          <div className="mt-2 pt-2 border-t border-line">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-xs text-muted-foreground hover:text-ink font-semibold"
              onClick={() => {
                setOpen(false);
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create New Project
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <CreateProjectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
