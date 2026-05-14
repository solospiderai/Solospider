import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { useActiveProject } from "@/hooks/useActiveProject";

type ContentRow = {
  id: string;
  main_keyword: string;
  h1: string;
  generated_title: string | null;
  status: string;
  created_at: string;
};

export const ManagePostsPage = () => {
  const { activeProjectId } = useActiveProject();
  const projectId = activeProjectId;
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ContentRow[]>([]);

  const loadRows = async () => {
    const effectiveProjectId = projectId || activeProjectId;
    if (!effectiveProjectId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("content_items")
      .select("id, main_keyword, h1, generated_title, status, created_at")
      .eq("project_id", effectiveProjectId)
      .in("status", ["generating", "completed", "published", "failed"])
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Failed to load posts");
      setLoading(false);
      return;
    }
    setRows((data || []) as ContentRow[]);
    setLoading(false);
  };

  useEffect(() => {
    loadRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, activeProjectId]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-ink">Manage Blog Posts</h1>
          <p className="text-muted-foreground mt-1">Recent generated posts for the selected project.</p>
        </div>
        <Button variant="outline" onClick={loadRows}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="border rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-muted/40 text-xs font-black uppercase tracking-wider">
          <div className="col-span-6">Title / Keyword</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Created</div>
          <div className="col-span-2">View</div>
        </div>

        {loading ? (
          <div className="p-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading posts...
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts found.</div>
        ) : (
          <div className="divide-y">
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-12 gap-3 px-4 py-4 items-center">
                <div className="col-span-6 min-w-0">
                  <p className="font-semibold truncate">{r.generated_title || r.h1 || r.main_keyword}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.main_keyword}</p>
                </div>
                <div className="col-span-2">
                  <Badge variant="outline" className="capitalize">{r.status}</Badge>
                </div>
                <div className="col-span-2 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
                <div className="col-span-2">
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/app/en/content/${r.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const BrandIdentityPage = () => {
  return (
    <div className="p-8 max-w-5xl">
      <h1 className="text-2xl font-bold">Brand Identity</h1>
      <p className="text-muted-foreground mt-2">Manage your workspace brand voice and assets.</p>
    </div>
  );
};
