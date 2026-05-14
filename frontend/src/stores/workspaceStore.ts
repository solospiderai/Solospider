import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkspaceState {
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  
  setActiveWorkspace: (id: string | null) => void;
  setActiveProject: (id: string | null) => void;
  clearState: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeProjectId: null,

      setActiveWorkspace: (id) => set({ activeWorkspaceId: id, activeProjectId: null }), // Reset project when switching workspaces
      setActiveProject: (id) => set({ activeProjectId: id }),
      clearState: () => set({ activeWorkspaceId: null, activeProjectId: null }),
    }),
    {
      name: 'solospider-context-storage', // unique name for localStorage key
    }
  )
);
