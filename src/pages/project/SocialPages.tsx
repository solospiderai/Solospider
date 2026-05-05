import { useState, useEffect } from "react";
import { useProject } from "./ProjectLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SocialPostEditor } from "@/components/SocialPostEditor";
import {
  fetchInstagramProfile,
  generatePostIdeas,
  generatePollinationsImageUrl,
  InstagramProfile,
  PostIdea,
} from "@/lib/social";
import {
  Instagram, Loader2, Sparkles, RefreshCw, Plus, Users,
  BarChart2, Image as ImageIcon, ArrowRight, Link2, Edit2, Trash2,
  Share2, LayoutGrid, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const TYPE_COLORS: Record<string, string> = {
  educational: "border-accent/20 bg-accent/5 hover:border-accent/40",
  promotional: "border-primary/20 bg-primary/5 hover:border-primary/40",
  engagement: "border-pink/20 bg-pink/5 hover:border-pink/40",
  story: "border-primary/20 bg-primary/5 hover:border-primary/40",
  product: "border-accent/20 bg-accent/5 hover:border-accent/40",
};

const TYPE_BADGE: Record<string, string> = {
  educational: "bg-accent/10 text-accent font-black border-accent/20",
  promotional: "bg-primary/10 text-primary font-black border-primary/20",
  engagement: "bg-pink/10 text-pink font-black border-pink/20",
  story: "bg-primary/10 text-primary font-black border-primary/20",
  product: "bg-accent/10 text-accent font-black border-accent/20",
};

export function SocialPostsPage() {
  const { project } = useProject();
  const qc = useQueryClient();

  const [step, setStep] = useState<"dashboard" | "connect" | "scanning" | "ideas">("dashboard");
  const [igInput, setIgInput] = useState("");
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [ideas, setIdeas] = useState<PostIdea[]>([]);
  const [generatingIdeas, setGeneratingIdeas] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<PostIdea | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editPost, setEditPost] = useState<any | null>(null);

  const { data: savedAccount } = useQuery({
    queryKey: ["social_account", project?.id, "instagram"],
    queryFn: async () => {
      const { data } = await supabase
        .from("social_accounts")
        .select("*")
        .eq("project_id", project?.id)
        .eq("platform", "instagram")
        .maybeSingle();
      return data as any;
    },
    enabled: !!project?.id
  });

  const { data: savedPosts = [], refetch: refetchPosts } = useQuery({
    queryKey: ["social_posts", project?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("social_posts")
        .select("*")
        .eq("project_id", project?.id)
        .order("created_at", { ascending: false });
      return (data || []) as any[];
    },
    enabled: !!project?.id
  });

  useEffect(() => {
    if (savedAccount) {
      setProfile({
        handle: savedAccount.handle,
        fullName: savedAccount.handle,
        bio: savedAccount.bio || "",
        profilePicUrl: savedAccount.profile_pic_url || "",
        followersCount: savedAccount.followers_count || "—",
        postsCount: savedAccount.posts_count || "—",
        isPrivate: false,
        recentCaptions: savedAccount.recent_captions || [],
        recentHashtags: savedAccount.recent_hashtags || [],
      });
      setStep("dashboard");
    }
  }, [savedAccount]);

  const handleConnect = async () => {
    if (!igInput.trim()) return;
    setStep("scanning");
    try {
        const fetched = await fetchInstagramProfile(igInput.trim());
        setProfile(fetched);

        await supabase.from("social_accounts").upsert({
            project_id: project?.id,
            platform: "instagram",
            handle: fetched.handle,
            profile_pic_url: fetched.profilePicUrl,
            bio: fetched.bio,
            followers_count: fetched.followersCount,
            posts_count: fetched.postsCount,
            recent_captions: fetched.recentCaptions,
            recent_hashtags: fetched.recentHashtags,
        } as any, { onConflict: "project_id,platform" });

        qc.invalidateQueries({ queryKey: ["social_account", project?.id, "instagram"] });
        setStep("dashboard");
    } catch (e) {
        toast.error("Failed to connect account");
        setStep("connect");
    }
  };

  const handleGenerateIdeas = async () => {
    setGeneratingIdeas(true);
    setStep("ideas");
    try {
        const generated = await generatePostIdeas({
            brandName: project?.brand_name || project?.name || "Brand",
            brandDescription: project?.brand_description || "",
            instagramBio: profile?.bio || "",
            recentCaptions: profile?.recentCaptions || [],
            recentHashtags: profile?.recentHashtags || [],
        });
        setIdeas(generated);
    } catch (e) {
        toast.error("Failed to generate ideas");
    } finally {
        setGeneratingIdeas(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    await supabase.from("social_posts").delete().eq("id", id);
    refetchPosts();
    toast.success("Asset decommissioned");
  };

  if (step === "connect") {
    return (
      <div className="p-8 max-w-xl mx-auto flex flex-col items-center justify-center min-h-[600px] text-center reveal in">
        <div className="h-24 w-24 rounded-[2.5rem] btn-grad flex items-center justify-center mb-10 shadow-2xl shadow-primary/30 transition-transform hover:scale-110">
          <Instagram className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-4xl font-black mb-4 text-ink tracking-tight">Connect Your <span className="grad-text">Instagram</span></h1>
        <p className="text-ink-2 text-[16px] mb-12 leading-relaxed font-bold uppercase tracking-widest opacity-60">
            Audit your brand voice for AI calibration
        </p>
        <div className="w-full space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
              <span className="text-primary font-black text-lg">@</span>
            </div>
            <Input
              value={igInput}
              onChange={(e) => setIgInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              placeholder="handle"
              className="h-16 pl-12 rounded-2xl text-[16px] font-black border-line bg-bg/50 backdrop-blur-xl focus:border-primary/50 transition-all text-ink"
            />
          </div>
          <Button
            className="w-full h-16 text-lg font-black btn-grad shadow-xl shadow-primary/20 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
            onClick={handleConnect}
            disabled={!igInput.trim()}
          >
            <Zap className="h-5 w-5 mr-3" /> ANALYZE PROFILE HISTORY
          </Button>
          <p className="text-[10px] text-ink font-black uppercase tracking-[0.2em] mt-6 opacity-40">Secure Neural Analysis • Privacy Compliant</p>
        </div>
      </div>
    );
  }

  if (step === "scanning") {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[600px] text-center reveal in">
        <div className="relative h-24 w-24 mb-8">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative h-24 w-24 rounded-[2rem] btn-grad flex items-center justify-center shadow-2xl shadow-primary/40">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-ink mb-2">Synchronizing with Instagram</h2>
        <p className="text-muted text-[12px] font-bold uppercase tracking-[0.2em]">
          Scoping content patterns, hashtags, and brand voice...
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10 reveal in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 reveal d1">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-ink tracking-tight">Social <span className="grad-text">Intelligence</span> Hub</h1>
          <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60 pl-1">
            Engineered Social Media Strategy for {project?.brand_name || project?.name || "Your Brand"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile ? (
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-6 text-ink-2 font-black uppercase text-[10px] tracking-widest border-line hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
              onClick={() => { setStep("connect"); setIgInput(""); }}
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Switch Account
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-6 text-ink-2 font-black uppercase text-[10px] tracking-widest border-line hover:bg-primary/5 hover:text-primary transition-all rounded-xl"
              onClick={() => { setStep("connect"); setIgInput(""); }}
            >
              <Instagram className="h-4 w-4 mr-2" /> Link Profile
            </Button>
          )}
          <Button
            className="h-12 px-8 btn-grad text-white font-black rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all gap-2"
            onClick={() => { setSelectedIdea(null); setEditPost(null); setEditorOpen(true); }}
          >
            <Plus className="h-5 w-5" /> NEW CAMPAIGN
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
            {/* Profile Dashboard Card */}
            {profile ? (
                <div className="glass rounded-[2.5rem] p-8 flex items-start gap-8 reveal d2 hover:border-primary/20 transition-all group">
                    <div className="relative shrink-0">
                        {profile.profilePicUrl ? (
                        <img
                            src={profile.profilePicUrl}
                            alt={profile.handle}
                            className="h-24 w-24 rounded-[2rem] object-cover border-4 border-bg shadow-2xl transition-transform duration-500 group-hover:scale-105"
                            onError={(e: any) => { e.target.style.display = "none"; }}
                        />
                        ) : (
                        <div className="h-24 w-24 rounded-[2rem] btn-grad flex items-center justify-center text-4xl font-black text-white shadow-lg">
                            {profile.handle.charAt(0).toUpperCase()}
                        </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 h-9 w-9 rounded-2xl btn-grad flex items-center justify-center border-4 border-bg shadow-xl">
                            <Instagram className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0 pt-2">
                        <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-black text-2xl text-ink tracking-tight">@{profile.handle}</h3>
                            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest border border-primary/20">
                                Neural Sync Active
                            </div>
                        </div>
                        {profile.bio && <p className="text-[14px] text-ink line-clamp-2 mb-6 leading-relaxed font-bold opacity-80">{profile.bio}</p>}
                        <div className="flex gap-10">
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60">Audience</p>
                                <p className="text-xl font-black text-ink">{profile.followersCount}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60">Assets</p>
                                <p className="text-xl font-black text-ink">{profile.postsCount}</p>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60">Calibration</p>
                                <p className="text-xl font-black text-primary">Elite</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-[2.5rem] bg-ink text-bg p-10 flex flex-col md:flex-row items-center gap-10 justify-between reveal d2 premium-shadow relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
                    <div className="relative z-10 space-y-4">
                        <h3 className="font-black text-3xl tracking-tight">Generate <span className="text-primary">Elite</span> Content</h3>
                        <p className="text-[12px] text-bg/40 max-w-sm font-bold uppercase tracking-widest leading-loose">
                            AI-driven content strategies calibrated for your audience velocity.
                        </p>
                    </div>
                    <Button
                        className="relative z-10 shrink-0 h-16 px-10 btn-grad text-lg font-black rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.05] active:scale-[0.95] transition-all"
                        onClick={handleGenerateIdeas}
                        disabled={generatingIdeas}
                    >
                        <Sparkles className="h-6 w-6 mr-3" /> INITIATE AI
                    </Button>
                </div>
            )}

            {/* Content Portfolio */}
            <div className="space-y-6 reveal d3">
                <div className="flex items-center justify-between">
                    <h2 className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Strategy Portfolio</h2>
                    <div className="flex gap-2">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <LayoutGrid className="h-4 w-4 text-muted/30" />
                        </div>
                    </div>
                </div>

                {savedPosts.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-line rounded-[2.5rem] bg-bg/30">
                        <Sparkles className="h-12 w-12 mx-auto mb-6 text-primary opacity-20" />
                        <p className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-40">Zero scheduled assets detected</p>
                        <Button
                            variant="link"
                            className="text-primary font-black uppercase text-[10px] tracking-widest mt-4"
                            onClick={handleGenerateIdeas}
                        >
                            Launch AI Architect <ArrowRight className="h-3 w-3 ml-2" />
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedPosts.map((post: any) => (
                        <div
                            key={post.id}
                            className="group relative rounded-[2rem] glass hover:border-primary/40 transition-all overflow-hidden"
                        >
                            <div className="aspect-[16/10] bg-bg overflow-hidden relative">
                            {post.image_url ? (
                                <img src={post.image_url} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-8 w-8 text-ink opacity-10" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => { setEditPost(post); setSelectedIdea(null); setEditorOpen(true); }}
                                    className="h-10 w-10 rounded-xl bg-bg/90 backdrop-blur-sm text-ink hover:text-primary premium-shadow-sm flex items-center justify-center transition-all"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleDeletePost(post.id)}
                                    className="h-10 w-10 rounded-xl bg-bg/90 backdrop-blur-sm text-ink hover:text-red-500 premium-shadow-sm flex items-center justify-center transition-all"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <Badge className={cn("px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-transparent",
                                    post.status === "scheduled" ? "bg-primary text-white" :
                                    post.status === "published" ? "bg-[#22d3ee] text-black" :
                                    "bg-ink-2 text-white"
                                )}>
                                    {post.status}
                                </Badge>
                            </div>
                            </div>
                            <div className="p-6 space-y-3">
                                <p className="text-[13px] font-bold text-ink line-clamp-2 leading-relaxed">{post.caption}</p>
                                <div className="flex items-center justify-between pt-2 border-t border-line">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-md bg-slate-50 flex items-center justify-center text-[10px] font-black text-muted">#</div>
                                        <span className="text-[10px] font-black text-muted uppercase">{(post.hashtags?.length || 0)} Tags</span>
                                    </div>
                                    {post.scheduled_at && (
                                        <span className="text-[10px] font-black text-primary uppercase">
                                            {new Date(post.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* Sidebar: AI Tactical Insights */}
        <div className="lg:col-span-4 space-y-10 reveal d4">
            <div className="glass rounded-[2.5rem] p-8 space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">AI Intelligence</h3>
                    <Sparkles className="h-4 w-4 text-primary shadow-[0_0_10px_rgba(144,37,242,0.4)]" />
                </div>

                {step === "ideas" ? (
                    <div className="space-y-6">
                        {generatingIdeas ? (
                            <div className="space-y-4">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-32 rounded-2xl bg-slate-50 animate-pulse border border-line" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {ideas.map((idea) => (
                                    <div
                                        key={idea.id}
                                        onClick={() => { setSelectedIdea(idea); setEditPost(null); setEditorOpen(true); }}
                                        className={cn(
                                            "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group relative",
                                            TYPE_COLORS[idea.type] || "border-line bg-white"
                                        )}
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge className={cn("px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border-transparent", TYPE_BADGE[idea.type] || "bg-muted text-muted")}>
                                                {idea.type}
                                            </Badge>
                                            <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                        <p className="text-[12px] font-black text-ink mb-1 truncate">{idea.hook}</p>
                                        <p className="text-[11px] text-muted font-medium line-clamp-2 leading-relaxed">{idea.caption}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button 
                            variant="ghost" 
                            className="w-full text-[10px] font-black uppercase text-muted tracking-widest hover:text-primary"
                            onClick={handleGenerateIdeas}
                        >
                            <RefreshCw className="h-3 w-3 mr-2" /> Regenerate Logic
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6 text-center py-10">
                        <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                            <BarChart2 className="h-7 w-7 text-muted/20" />
                        </div>
                        <p className="text-[12px] text-muted font-bold leading-relaxed">Connect your profile or initiate AI to see content opportunities.</p>
                        <Button
                            className="btn-grad text-white text-[10px] font-black uppercase tracking-widest px-8 rounded-xl"
                            onClick={handleGenerateIdeas}
                        >
                            Process Now
                        </Button>
                    </div>
                )}
            </div>

            {/* Profile Analytics Snapshot */}
            <div className="glass rounded-[2.5rem] p-8 space-y-6">
                <h3 className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">Growth Metrics</h3>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-bg flex items-center justify-center border border-line">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-2 uppercase tracking-tighter opacity-60">Audience</p>
                                <p className="text-[15px] font-black text-ink">{profile?.followersCount || "—"}</p>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-lg">+12%</div>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-bg flex items-center justify-center border border-line">
                                <Share2 className="h-5 w-5 text-pink" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-ink-2 uppercase tracking-tighter opacity-60">Velocity</p>
                                <p className="text-[15px] font-black text-ink">{profile?.postsCount || "—"}</p>
                            </div>
                        </div>
                        <div className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg">High</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <SocialPostEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        projectId={project?.id || ""}
        idea={selectedIdea}
        existingPost={editPost}
        onSaved={() => { refetchPosts(); setStep("dashboard"); }}
      />
    </div>
  );
}
