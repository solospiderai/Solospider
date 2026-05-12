import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useActiveProject } from "@/hooks/useActiveProject";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Instagram, Sparkles, Save, Loader2,
  Image as ImageIcon, Hash, Layout, History, Send, Clock,
  Facebook, Linkedin, Twitter, Layers, CheckSquare, Square
} from "lucide-react";
import { generateHighQualityImage, generateSocialPostDraft, PostIdea } from "@/lib/social";

type SocialPost = {
  id: string;
  caption: string;
  hashtags: string[];
  image_url: string | null;
  image_prompt: string | null;
  scheduled_at: string | null;
  status: "draft" | "scheduled" | "published";
};

interface SocialPostEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  idea: PostIdea | null;
  existingPost: SocialPost | null;
  onSaved: () => void;
}

export function SocialPostEditor({ open, onOpenChange, projectId, idea, existingPost, onSaved }: SocialPostEditorProps) {
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [newHashtag, setNewHashtag] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatingMulti, setGeneratingMulti] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [imageVariants, setImageVariants] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram"]);
  const [addLogo, setAddLogo] = useState(true);
  const [activePlatform, setActivePlatform] = useState<string>("instagram");

  const { projects } = useActiveProject();
  const project = projects?.find((p) => p.id === projectId);

  useEffect(() => {
    if (idea) {
      setCaption(idea.caption || "");
      setHashtags(idea.hashtags || []);
      setImagePrompt(idea.hook || "");
      setImageUrl("");
    } else if (existingPost) {
      setCaption(existingPost.caption || "");
      setHashtags(existingPost.hashtags || []);
      setImageUrl(existingPost.image_url || "");
      setImagePrompt(existingPost.image_prompt || "");
      if (existingPost.scheduled_at) {
        setScheduledAt(new Date(existingPost.scheduled_at).toISOString().slice(0, 16));
      }
    } else {
      setCaption("");
      setHashtags([]);
      setImageUrl("");
      setImagePrompt("");
      setScheduledAt("");
    }
  }, [idea, existingPost, open]);

  const handleGenerateImage = async () => {
    if (!imagePrompt) {
      toast.error("Please provide an image concept");
      return;
    }
    setGeneratingImage(true);
    try {
      const url = await generateHighQualityImage(imagePrompt, projectId, activePlatform, addLogo);
      setImageUrl(url);
      setImageVariants([url]);
      toast.success("Visual asset generated");
    } catch {
      toast.error("Failed to generate asset");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleGenerateMultiple = async () => {
    if (!imagePrompt) {
      toast.error("Please provide an image concept");
      return;
    }
    setGeneratingMulti(true);
    setImageVariants([]);
    try {
      // Generate 4 images in parallel with platform and logo awareness
      const promises = Array.from({ length: 4 }, (_, i) =>
        generateHighQualityImage(
          `${imagePrompt}, variation ${i + 1}`,
          projectId,
          activePlatform,
          addLogo
        ).catch(() => null)
      );
      const results = (await Promise.all(promises)).filter(Boolean) as string[];
      if (results.length === 0) throw new Error("No images generated");
      setImageVariants(results);
      setImageUrl(results[0]);
      toast.success(`${results.length} image variations generated! Click one to use it.`);
    } catch {
      toast.error("Failed to generate image variations");
    } finally {
      setGeneratingMulti(false);
    }
  };

  const togglePlatform = (p: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleGenerateCopy = async () => {
    if (!project) {
      toast.error("Project not found. Please refresh and try again.");
      return;
    }
    setGeneratingCaption(true);
    try {
      const draft = await generateSocialPostDraft({
        brandName: project.brand_name || project.name || "Brand",
        brandDescription: project.brand_description || "",
        prompt: imagePrompt || idea?.hook || caption,
        tone: "confident",
        includeHashtags: true,
      });

      if (draft.caption) {
        setCaption(draft.caption);
      }
      if (draft.hashtags.length > 0) {
        setHashtags(draft.hashtags);
      }
      if (!imagePrompt && draft.imagePrompt) {
        setImagePrompt(draft.imagePrompt);
      }
      toast.success("Caption and hashtags generated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate post copy";
      toast.error(message);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleSave = async (status: "draft" | "scheduled") => {
    if (!caption) {
      toast.error("Caption is required");
      return;
    }
    setSaving(true);
    try {
      const isPublishNow = status === "scheduled" && !scheduledAt;
      const finalScheduledAt = status === "scheduled" 
        ? (scheduledAt || new Date().toISOString()) 
        : null;

      const postData = {
        project_id: projectId,
        platform: "instagram",
        caption,
        hashtags,
        image_url: imageUrl,
        image_prompt: imagePrompt,
        status,
        scheduled_at: finalScheduledAt,
        updated_at: new Date().toISOString(),
      };

      let savedPostId = existingPost?.id;

      if (savedPostId) {
        const { error } = await supabase
          .from("social_posts")
          .update(postData)
          .eq("id", savedPostId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("social_posts")
          .insert([postData])
          .select("id")
          .single();
        if (error) throw error;
        if (data) savedPostId = data.id;
      }

      if (isPublishNow) {
        toast.success("Campaign initiated. Publishing now...");
        if (savedPostId) {
          supabase.functions.invoke("process-scheduled-social-posts", {
            body: { post_ids: [savedPostId], force: true, limit: 1 },
          }).then(() => {
            onSaved();
          });
        }
      } else {
        toast.success(status === "scheduled" ? "Campaign deployed to schedule" : "Draft preserved");
      }

      onSaved();
      onOpenChange(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to preserve asset";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addHashtag = () => {
    if (newHashtag.trim() && !hashtags.includes(newHashtag.trim())) {
      setHashtags([...hashtags, newHashtag.trim().replace("#", "")]);
      setNewHashtag("");
    }
  };

  if (!open) return null;

  const fullCaption = `${caption}\n\n${(hashtags || []).map((h) => `#${h}`).join(" ")}`;

  return (
    <div className="w-full min-h-full bg-bg animate-in fade-in duration-300" id="social-post-editor-section">
      <div className="max-w-7xl mx-auto h-full p-6 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row h-full lg:min-h-[800px] bg-white border border-line premium-shadow rounded-[3rem] overflow-hidden">
          <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-line bg-slate-50/30">
          <div className="p-8 border-b border-line bg-white/50">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
                  <Layout className="h-6 w-6 text-primary" />
                  Campaign <span className="grad-text">Command Center</span>
                </h2>
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mt-1">
                  Calibrate and deploy social media assets
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-8 rounded-xl border-line bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-600">
                  V3 Engine Active
                </Badge>
                <Button variant="ghost" onClick={() => onOpenChange(false)} className="h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-ink/50 hover:bg-red-50 hover:text-red-500">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-8 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-80">
                    <Send className="h-3.5 w-3.5" /> Narrative Blueprint
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary">{(caption?.length || 0)}/2200</span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateCopy}
                      disabled={generatingCaption}
                      className="h-7 rounded-lg text-[9px] font-black tracking-widest border-line px-3"
                    >
                      {generatingCaption ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      AI COPY
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Engineer your brand narrative..."
                  className="min-h-[220px] rounded-[2rem] border-line bg-white premium-shadow-sm text-[15px] font-bold text-ink leading-relaxed resize-none p-8 focus:border-primary/40 transition-all"
                />
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-80">
                  <Hash className="h-3.5 w-3.5" /> Reach Optimization
                </Label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-6 rounded-2xl bg-bg border border-line">
                  {(hashtags || []).map((h) => (
                    <Badge key={h} className="bg-white border-line text-ink hover:bg-primary/5 hover:text-primary transition-all px-4 py-2 rounded-xl text-[11px] font-black group">
                      #{h}
                      <button onClick={() => setHashtags(hashtags.filter((tag) => tag !== h))} className="ml-2 opacity-50 group-hover:opacity-100 transition-opacity">x</button>
                    </Badge>
                  ))}
                  {(hashtags?.length || 0) === 0 && <span className="text-[11px] text-ink-2 font-bold italic opacity-40">Zero tags calibrated</span>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addHashtag()}
                    placeholder="Add strategic tag..."
                    className="flex-1 rounded-xl border-line bg-white h-12 text-sm font-bold text-ink"
                  />
                  <Button variant="outline" onClick={addHashtag} className="rounded-xl border-line font-black h-12 px-8 text-[10px] tracking-widest hover:bg-primary/5 transition-all">ADD</Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-80">
                    <ImageIcon className="h-3.5 w-3.5" /> Visual Intelligence
                  </Label>
                  <div className="flex items-center gap-2">
                     <span className="text-[9px] font-black text-primary uppercase tracking-widest mr-2">Brand Logo Aware</span>
                     <button 
                        onClick={() => setAddLogo(!addLogo)}
                        className={`w-10 h-5 rounded-full transition-all relative ${addLogo ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}
                     >
                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${addLogo ? 'left-6' : 'left-1'}`} />
                     </button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the neural visual concept..."
                    className="flex-1 rounded-xl border-line bg-white h-12 text-sm font-bold text-ink focus:border-primary/40 transition-all"
                  />
                  <div className="flex gap-2 shrink-0">
                    <Button
                      className="btn-grad text-white font-black rounded-xl h-12 px-6 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                      onClick={handleGenerateImage}
                      disabled={generatingImage || generatingMulti}
                    >
                      {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1.5" />}
                      GENERATE
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl h-12 px-4 border-line font-black text-[10px] uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all gap-1.5"
                      onClick={handleGenerateMultiple}
                      disabled={generatingImage || generatingMulti}
                      title="Generate 4 unique variations"
                    >
                      {generatingMulti ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                      ×4
                    </Button>
                  </div>
                </div>

                {/* Multi-image Variants Grid */}
                {imageVariants.length > 1 && (
                  <div className="space-y-2">
                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Click a variation to use it</p>
                    <div className="grid grid-cols-2 gap-2">
                      {imageVariants.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setImageUrl(url)}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-[1.02] ${
                            imageUrl === url ? "border-primary shadow-lg shadow-primary/30" : "border-line"
                          }`}
                        >
                          <img src={url} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" />
                          {imageUrl === url && (
                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                                <span className="text-white text-[10px] font-black">✓</span>
                              </div>
                            </div>
                          )}
                          <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md">#{i + 1}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generating multi placeholder */}
                {generatingMulti && imageVariants.length === 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="aspect-square rounded-xl bg-slate-100 border border-line flex items-center justify-center animate-pulse">
                        <Loader2 className="h-6 w-6 text-muted-foreground animate-spin" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Platform Selector */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-80">
                  <Layers className="h-3.5 w-3.5" /> Publish To Platforms
                </Label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "instagram", label: "Instagram", Icon: Instagram, color: "bg-pink-500" },
                    { id: "facebook", label: "Facebook", Icon: Facebook, color: "bg-blue-600" },
                    { id: "linkedin", label: "LinkedIn", Icon: Linkedin, color: "bg-sky-600" },
                    { id: "twitter", label: "Twitter/X", Icon: Twitter, color: "bg-gray-800" },
                  ].map(({ id, label, Icon, color }) => {
                    const active = selectedPlatforms.includes(id);
                    return (
                      <button
                        key={id}
                        onClick={() => {
                          togglePlatform(id);
                          setActivePlatform(id);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          active
                            ? "border-primary/30 bg-primary/5 text-primary"
                            : "border-line text-muted-foreground hover:border-line/80 hover:bg-slate-50"
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-sm ${active ? color : "bg-muted/30"} flex items-center justify-center`}>
                          <Icon className="h-2.5 w-2.5 text-white" />
                        </div>
                        {label}
                        {active ? <CheckSquare className="h-3 w-3" /> : <Square className="h-3 w-3 opacity-40" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[9px] text-muted-foreground pl-1">Connect accounts in <strong>Social Media → Connected Accounts</strong> to enable publishing</p>
              </div>


              <div className="space-y-4">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Deployment Logistics
                </Label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="rounded-xl border-line bg-white h-11 text-sm font-bold w-full md:w-64"
                />
              </div>
            </div>
          </ScrollArea>

          <div className="p-8 border-t border-line bg-white/50 flex flex-col md:flex-row gap-4">
            <Button variant="outline" className="flex-1 h-14 rounded-2xl border-line font-black uppercase tracking-widest hover:bg-slate-50" onClick={() => handleSave("draft")} disabled={saving}>
              <History className="h-4 w-4 mr-2" /> Preserve Draft
            </Button>
            <Button className="flex-[2] h-14 rounded-2xl btn-grad text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20" onClick={() => handleSave("scheduled")} disabled={saving}>
              <Send className="h-4 w-4 mr-2" /> {scheduledAt ? "Schedule Deployment" : "Initiate Campaign"}
            </Button>
          </div>
        </div>

        <div className="hidden lg:flex w-[400px] flex-col bg-white">
          <div className="p-8 border-b border-line bg-slate-50/50">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Live Intelligence</h3>
            <p className="text-sm font-bold text-ink">Mockup Calibration</p>
          </div>
          <div className="flex-1 p-8 flex items-center justify-center">
            <div className="w-[320px] rounded-[2.5rem] bg-white border border-line premium-shadow overflow-hidden">
              <div className="p-4 border-b border-line flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full btn-grad flex items-center justify-center text-[10px] text-white font-black">
                    {(project as { brand_name?: string; name?: string } | undefined)?.brand_name?.charAt(0) || project?.name?.charAt(0) || "S"}
                  </div>
                  <span className="text-[13px] font-black tracking-tight">{(project as { brand_name?: string; name?: string } | undefined)?.brand_name || project?.name || "solospider"}</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full bg-muted"></div>
                  <div className="w-1 h-1 rounded-full bg-muted"></div>
                  <div className="w-1 h-1 rounded-full bg-muted"></div>
                </div>
              </div>
              <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.retried) {
                        target.dataset.retried = "1";
                        target.src = imageUrl + (imageUrl.includes("?") ? "&" : "?") + `_retry=${Date.now()}`;
                      }
                    }}
                  />
                ) : (
                  <div className="text-center space-y-3 opacity-20">
                    <ImageIcon className="h-12 w-12 mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Vision</p>
                  </div>
                )}
                {generatingImage && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Synthesizing Asset...</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-4">
                  <Instagram className="h-5 w-5 text-ink" />
                  <Send className="h-5 w-5 text-ink" />
                  <div className="flex-1"></div>
                  <Save className="h-5 w-5 text-ink" />
                </div>
                <p className="text-[12px] text-ink font-medium leading-relaxed line-clamp-5 whitespace-pre-wrap">
                  {fullCaption || "Your brand narrative will materialize here..."}
                </p>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest pt-2">V3 Neural Preview</p>
              </div>
            </div>
          </div>
          <div className="p-8 border-t border-line bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">System Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
