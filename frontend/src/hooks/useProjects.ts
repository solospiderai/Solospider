import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Project {
  id: string;
  user_id: string;
  name: string;
  domain: string;
  created_at: string;
}

export interface UserSubscription {
  plan_type: "free" | "pro" | "enterprise";
}

const PLAN_LIMITS = {
  free: 1,
  pro: 5,
  enterprise: Infinity,
};

export function useProjects() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ["projects", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
        return [];
      }
      return data as Project[];
    },
    enabled: !!user,
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        return null;
      }
      return data as UserSubscription;
    },
    enabled: !!user,
  });

  const currentPlan = subscription?.plan_type || "free";
  const projectLimit = PLAN_LIMITS[currentPlan];
  const canAddProject = projects.length < projectLimit;

  const addProject = useMutation({
    mutationFn: async (projectData: { name: string; domain: string }) => {
      if (!user) throw new Error("Must be logged in");
      if (!canAddProject) throw new Error("Project limit reached for your plan");

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            user_id: user.id,
            name: projectData.name,
            domain: projectData.domain,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", user?.id] });
      toast.success("Project created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create project");
    },
  });

  return {
    projects,
    isLoadingProjects,
    currentPlan,
    projectLimit,
    canAddProject,
    addProject,
  };
}
