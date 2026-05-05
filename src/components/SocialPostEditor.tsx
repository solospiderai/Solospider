import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActiveProject } from "@/hooks/useActiveProject";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Instagram, Sparkles, Calendar, Save, Loader2, 
  Image as ImageIcon, Hash, Layout, History, Send, Clock
} from "lucide-react";
import { generatePollinationsImageUrl } from "@/lib/social";
import { cn } from "@/lib/utils";

interface SocialPostEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  idea: any;
  existingPost: any;
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
  
  const { projects } = useActiveProject();
  const project = projects?.find((p: any) => p.id === projectId);

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
      const url = await generatePollinationsImageUrl(imagePrompt);
      setImageUrl(url);
      toast.success("Elite visual asset generated");
    } catch (e) {
      toast.error("Failed to generate asset");
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleSave = async (status: "draft" | "scheduled") => {
    if (!caption) {
      toast.error("Caption is required");
      return;
    }
    setSaving(true);
    try {
      const postData = {
        project_id: projectId,
        platform: "instagram",
        caption,
        hashtags,
        image_url: imageUrl,
        image_prompt: imagePrompt,
        status,
        scheduled_at: status === "scheduled" ? scheduledAt : null,
        updated_at: new Date().toISOString(),
      };

      if (existingPost?.id) {
        const { error } = await supabase
          .from("social_posts")
          .update(postData)
          .eq("id", existingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("social_posts")
          .insert([postData]);
        if (error) throw error;
      }

      toast.success(status === "scheduled" ? "Campaign deployed to schedule" : "Draft preserved");
      onSaved();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to preserve asset");
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

  const fullCaption = `${caption}\n\n${(hashtags || []).map(h => `#${h}`).join(" ")}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden bg-white/95 backdrop-blur-2xl border-line premium-shadow rounded-[3rem]">
        <div className="flex h-full">
          {/* Editor Side */}
          <div className="flex-1 flex flex-col border-r border-line bg-slate-50/30">
            <DialogHeader className="p-8 border-b border-line bg-white/50">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-black text-ink tracking-tight flex items-center gap-2">
                    <Layout className="h-6 w-6 text-primary" />
                    Campaign <span className="grad-text">Command Center</span>
                  </DialogTitle>
                  <DialogDescription className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mt-1">
                    Calibrate and deploy social media assets
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="h-8 rounded-xl border-line bg-white px-4 text-[10px] font-black uppercase tracking-widest text-muted">
                    V3 Engine Active
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1">
              <div className="p-8 space-y-10">
                {/* Content Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-60">
                      <Send className="h-3.5 w-3.5" /> Narrative Blueprint
                    </Label>
                    <span className="text-[10px] font-black text-primary">{(caption?.length || 0)}/2200</span>
                  </div>
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Engineer your brand narrative..."
                    className="min-h-[220px] rounded-[2rem] border-line bg-white premium-shadow-sm text-[15px] font-bold text-ink leading-relaxed resize-none p-8 focus:border-primary/40 transition-all"
                  />
                </div>

                {/* Hashtags Section */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <Hash className="h-3.5 w-3.5" /> Reach Optimization
                  </Label>
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[40px] p-6 rounded-2xl bg-bg border border-line">
                    {(hashtags || []).map((h) => (
                      <Badge key={h} className="bg-white border-line text-ink hover:bg-primary/5 hover:text-primary transition-all px-4 py-2 rounded-xl text-[11px] font-black group">
                        #{h}
                        <button onClick={() => setHashtags(hashtags.filter(tag => tag !== h))} className="ml-2 opacity-30 group-hover:opacity-100 transition-opacity">×</button>
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

                {/* Visual Asset Section */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-ink uppercase tracking-widest flex items-center gap-2 opacity-60">
                    <ImageIcon className="h-3.5 w-3.5" /> Visual Intelligence
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      placeholder="Describe the neural visual concept..."
                      className="flex-1 rounded-xl border-line bg-white h-12 text-sm font-bold text-ink focus:border-primary/40 transition-all"
                    />
                    <Button 
                      className="btn-grad text-white font-black rounded-xl h-12 px-8 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
                      onClick={handleGenerateImage}
                      disabled={generatingImage}
                    >
                      {generatingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      GENERATE
                    </Button>
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-muted uppercase tracking-widest flex items-center gap-2">
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

            <DialogFooter className="p-8 border-t border-line bg-white/50 flex flex-col md:flex-row gap-4">
              <Button variant="outline" className="flex-1 h-14 rounded-2xl border-line font-black uppercase tracking-widest hover:bg-slate-50" onClick={() => handleSave("draft")} disabled={saving}>
                <History className="h-4 w-4 mr-2" /> Preserve Draft
              </Button>
              <Button className="flex-[2] h-14 rounded-2xl btn-grad text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20" onClick={() => handleSave("scheduled")} disabled={saving}>
                <Send className="h-4 w-4 mr-2" /> {scheduledAt ? "Schedule Deployment" : "Initiate Campaign"}
              </Button>
            </DialogFooter>
          </div>

          {/* Preview Side */}
          <div className="hidden lg:flex w-[400px] flex-col bg-white">
            <div className="p-8 border-b border-line bg-slate-50/50">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-[0.2em] mb-1">Live Intelligence</h3>
              <p className="text-sm font-bold text-ink">Mockup Calibration</p>
            </div>
            <div className="flex-1 p-8 flex items-center justify-center">
              <div className="w-[320px] rounded-[2.5rem] bg-white border border-line premium-shadow overflow-hidden reveal in">
                {/* Instagram Mockup UI */}
                <div className="p-4 border-b border-line flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full btn-grad flex items-center justify-center text-[10px] text-white font-black">
                      {(project as any)?.brand_name?.charAt(0) || project?.name?.charAt(0) || "S"}
                    </div>
                    <span className="text-[13px] font-black tracking-tight">{(project as any)?.brand_name || project?.name || "solospider"}</span>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-muted"></div>
                    <div className="w-1 h-1 rounded-full bg-muted"></div>
                    <div className="w-1 h-1 rounded-full bg-muted"></div>
                  </div>
                </div>
                <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden group">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
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
                  <p className="text-[12px] text-ink font-medium leading-relaxed line-clamp-5">
                    {fullCaption || "Your brand narrative will materialize here..."}
                  </p>
                  <p className="text-[10px] text-muted font-bold uppercase tracking-widest pt-2">V3 Neural Preview</p>
                </div>
              </div>
            </div>
            <div className="p-8 border-t border-line bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    <p className="text-[10px] font-black text-muted uppercase tracking-widest">System Operational</p>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
