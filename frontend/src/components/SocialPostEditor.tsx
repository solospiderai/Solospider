import { useState, useEffect, useRef } from "react";
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
  Facebook, Linkedin, Twitter, Youtube, Layers, CheckSquare, Square,
  Music, MessageCircle, Cloud, MapPin, Store, CheckCircle2, Info, Upload,
  ChevronDown, Smartphone, Laptop, Trash2, Plus, Play, Smile, MoreHorizontal,
  ThumbsUp, MessageSquare, Share2, Globe, Heart, Eye
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
  const [generatingTags, setGeneratingTags] = useState(false);
  const [imageVariants, setImageVariants] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["instagram", "facebook"]);
  const [addLogo, setAddLogo] = useState(true);
  const [activePlatform, setActivePlatform] = useState<string>("instagram");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redesign state variables matching Meta Business Suite
  const [postType, setPostType] = useState<"Post" | "Reel" | "Story">("Post");
  const [previewPlatform, setPreviewPlatform] = useState<"Facebook" | "Instagram">("Facebook");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [showPostToDropdown, setShowPostToDropdown] = useState(false);

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
        setScheduleEnabled(true);
      }
    } else {
      setCaption("");
      setHashtags([]);
      setImageUrl("");
      setImagePrompt("");
      setScheduledAt("");
      setScheduleEnabled(false);
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
    } catch (err: any) {
      console.error("Image Gen Error:", err);
      toast.error(err.message || "Failed to generate asset. Check API settings.");
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

  const handleGenerateOnlyCaption = async () => {
    if (!project) {
      toast.error("Project not found. Please refresh and try again.");
      return;
    }
    setGeneratingCaption(true);
    try {
      const draft = await generateSocialPostDraft({
        brandName: project.brand_name || project.name || "Brand",
        brandDescription: project.brand_description || "",
        prompt: imagePrompt || idea?.hook || "Write an engaging social media post caption.",
        tone: "confident",
        includeHashtags: false,
      });

      if (draft.caption) {
        setCaption(draft.caption);
      }
      if (!imagePrompt && draft.imagePrompt) {
        setImagePrompt(draft.imagePrompt);
      }
      toast.success("Caption generated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate caption";
      toast.error(message);
    } finally {
      setGeneratingCaption(false);
    }
  };

  const handleGenerateOnlyTags = async () => {
    if (!project) {
      toast.error("Project not found. Please refresh and try again.");
      return;
    }
    setGeneratingTags(true);
    try {
      const draft = await generateSocialPostDraft({
        brandName: project.brand_name || project.name || "Brand",
        brandDescription: project.brand_description || "",
        prompt: caption || imagePrompt || idea?.hook || "Generate relevant social media hashtags.",
        tone: "confident",
        includeHashtags: true,
      });

      if (draft.hashtags && draft.hashtags.length > 0) {
        const newTags = draft.hashtags.filter(t => !hashtags.includes(t));
        setHashtags([...hashtags, ...newTags]);
        toast.success("Hashtags generated");
      } else {
        toast.error("No hashtags generated from prompt.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to generate hashtags";
      toast.error(message);
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${projectId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('blog_images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('blog_images')
        .getPublicUrl(filePath);

      setImageUrl(publicUrl);
      setImageVariants([publicUrl]);
      toast.success("Image uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (status: "draft" | "scheduled" | "published") => {
    if (!caption && !imageUrl) {
      toast.error("Post must have at least a caption or an image");
      return;
    }
    setSaving(true);
    try {
      const isPublishNow = status === "scheduled" && !scheduleEnabled;
      const finalScheduledAt = scheduleEnabled 
        ? (scheduledAt || new Date().toISOString()) 
        : null;

      const postData = {
        project_id: projectId,
        platform: selectedPlatforms.includes("instagram") ? "instagram" : "facebook",
        caption,
        hashtags,
        image_url: imageUrl,
        image_prompt: imagePrompt,
        status: isPublishNow ? "published" : status,
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
  const displayBrandName = project?.brand_name || project?.name || "Wildlife Gir Resort";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-0 md:p-4">
      <div className="bg-slate-100 w-full h-full md:h-[95vh] md:max-w-7xl md:rounded-[1.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header - Create Post */}
        <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Create post</h2>
          </div>
          <button 
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
          >
            Dismiss
          </button>
        </div>

        {/* Workspace/Form Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Form Area */}
          <ScrollArea className="flex-1 bg-white border-r border-slate-200">
            <div className="p-6 space-y-6 max-w-2xl mx-auto">
              
              {/* Post To Dropdown Section */}
              <div className="space-y-2 relative">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Post to</Label>
                <div 
                  onClick={() => setShowPostToDropdown(!showPostToDropdown)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer hover:border-slate-400 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {selectedPlatforms.includes("facebook") && (
                        <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <Facebook className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {selectedPlatforms.includes("instagram") && (
                        <div className="w-5 h-5 rounded-full bg-pink-500 flex items-center justify-center">
                          <Instagram className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {selectedPlatforms.length === 2 
                        ? `${displayBrandName} and 1 other`
                        : selectedPlatforms.length === 1
                          ? displayBrandName
                          : "Select channels..."}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </div>

                {showPostToDropdown && (
                  <div className="absolute top-[100%] left-0 w-full bg-white border border-slate-200 shadow-xl rounded-xl mt-1.5 z-50 overflow-hidden divide-y divide-slate-100">
                    <div className="p-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Post to Facebook and Instagram</div>
                    
                    {/* Facebook Option */}
                    <div 
                      onClick={() => togglePlatform("facebook")}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <Facebook className="h-4.5 w-4.5 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{displayBrandName}</span>
                          <span className="text-[10px] font-semibold text-slate-400">Facebook Page</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPlatforms.includes("facebook") ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>
                        {selectedPlatforms.includes("facebook") && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>

                    {/* Instagram Option */}
                    <div 
                      onClick={() => togglePlatform("instagram")}
                      className="p-3.5 hover:bg-slate-50 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                          <Instagram className="h-4.5 w-4.5 text-pink-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800">{displayBrandName.toLowerCase().replace(/\s+/g, '')}</span>
                          <span className="text-[10px] font-semibold text-slate-400">Instagram Account</span>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedPlatforms.includes("instagram") ? 'border-pink-500 bg-pink-500' : 'border-slate-300 bg-white'}`}>
                        {selectedPlatforms.includes("instagram") && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Post Type Block (Post, Story, Reel) */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Post Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Post", "Story", "Reel"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setPostType(type)}
                      className={`py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest border transition-all ${
                        postType === type 
                          ? "bg-slate-900 border-slate-900 text-white shadow-md shadow-slate-900/10" 
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {type === "Reel" && <Play className="h-3 w-3 inline mr-1" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Media Section */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Media
                  </Label>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {postType === "Reel" ? "Video Recommended" : "Photo Recommended"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Custom Upload Clicker matching screenshots */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-slate-400 bg-white rounded-xl py-8 px-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <Upload className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold text-slate-800">Add photo/video</span>
                    <span className="text-[11px] text-slate-400">Drag & drop files or click to browse</span>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                  />

                  {/* AI Generation inside media wrapper */}
                  <div className="border-t border-slate-200 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-primary" /> AI Creative Generator
                      </Label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">Watermark Logo</span>
                        <button 
                          onClick={() => setAddLogo(!addLogo)}
                          className={`w-8 h-4 rounded-full transition-all relative ${addLogo ? 'bg-primary' : 'bg-slate-200'}`}
                        >
                          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${addLogo ? 'left-4.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={imagePrompt}
                        onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Type visual idea..."
                        className="rounded-lg border-slate-200 bg-white h-11 text-xs"
                      />
                      <Button
                        onClick={handleGenerateImage}
                        disabled={generatingImage}
                        className="btn-grad text-white text-xs font-bold px-4 h-11 shrink-0 rounded-lg"
                      >
                        {generatingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "GENERATE"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleGenerateMultiple}
                        disabled={generatingMulti}
                        className="border-slate-200 px-3 h-11 shrink-0 rounded-lg text-xs"
                        title="Generate 4 variations"
                      >
                        ×4
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Display variations if present */}
                {imageVariants.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 pt-2">
                    {imageVariants.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setImageUrl(url)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          imageUrl === url ? "border-primary" : "border-transparent"
                        }`}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {imageUrl === url && (
                          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Details (Caption & Tag optimization) */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Post details</Label>
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleGenerateOnlyCaption}
                    disabled={generatingCaption}
                    className="h-auto p-0 text-xs text-primary font-bold flex gap-1 items-center"
                  >
                    {generatingCaption ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    Auto-Generate
                  </Button>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col focus-within:border-slate-300">
                  <Textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write your post copy here..."
                    className="min-h-[140px] border-0 focus-visible:ring-0 rounded-none p-4 text-sm resize-none"
                  />
                  {/* Icon action bar at bottom of textarea, matching screenshot */}
                  <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <Smile className="h-4.5 w-4.5 cursor-pointer hover:text-slate-600" />
                      <MapPin className="h-4.5 w-4.5 cursor-pointer hover:text-slate-600" />
                      <MessageCircle className="h-4.5 w-4.5 cursor-pointer hover:text-slate-600" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{(caption?.length || 0)}/2200</span>
                  </div>
                </div>

                {/* Hashtag Management Area */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hashtags</span>
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={handleGenerateOnlyTags} 
                      disabled={generatingTags}
                      className="h-auto p-0 text-xs text-primary font-bold flex gap-1 items-center"
                    >
                      {generatingTags ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Add Tags
                    </Button>
                  </div>
                  
                  {hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-white border border-slate-200 min-h-[40px]">
                      {hashtags.map((h) => (
                        <Badge key={h} className="bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all border-0 px-2.5 py-1 rounded-md text-[11px] font-semibold gap-1.5 flex items-center">
                          #{h}
                          <button onClick={() => setHashtags(hashtags.filter((tag) => tag !== h))} className="opacity-50 hover:opacity-100">x</button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Input
                      value={newHashtag}
                      onChange={(e) => setNewHashtag(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addHashtag()}
                      placeholder="Type custom hashtag..."
                      className="h-10 text-xs"
                    />
                    <Button onClick={addHashtag} variant="outline" className="h-10 text-xs font-bold px-4 shrink-0 rounded-lg">
                      ADD
                    </Button>
                  </div>
                </div>
              </div>

              {/* Schedule / Set Date section */}
              <div className="border border-slate-200 rounded-xl p-5 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label className="text-sm font-bold text-slate-800">Set date and time</Label>
                    <span className="text-[11px] text-slate-400">Toggle on to schedule this post for the future.</span>
                  </div>
                  {/* Interactive toggle switch styled cleanly */}
                  <button 
                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                    className={`w-11 h-6 rounded-full transition-all relative ${scheduleEnabled ? 'bg-primary shadow-sm shadow-primary/30' : 'bg-slate-200'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all shadow-sm ${scheduleEnabled ? 'left-5.5' : 'left-0.5'}`} />
                  </button>
                </div>

                {scheduleEnabled && (
                  <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 animate-in fade-in duration-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Select schedule slot
                    </span>
                    <Input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="rounded-lg border-slate-200 bg-white h-11 text-sm font-bold w-full"
                    />
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>

          {/* Right Live Preview Area */}
          <div className="hidden lg:flex w-[480px] flex-col bg-slate-100 border-l border-slate-200 overflow-hidden">
            
            {/* Preview Controls Header */}
            <div className="bg-white p-4 border-b border-slate-200 flex items-center justify-between">
              
              {/* Preview Platform Dropdown */}
              <div className="relative">
                <div 
                  onClick={() => {}} // Keep static dropdown since we also provide platform switch toggles, but make it clean
                  className="flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 transition-colors"
                >
                  <span>{previewPlatform} Feed preview</span>
                  <ChevronDown className="h-3 w-3" />
                </div>
              </div>

              {/* Devices & Platforms Toggle Row */}
              <div className="flex items-center gap-3">
                {/* Facebook/Instagram Preview Quick Swapper */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setPreviewPlatform("Facebook")}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${previewPlatform === "Facebook" ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                  >
                    FB
                  </button>
                  <button 
                    onClick={() => setPreviewPlatform("Instagram")}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${previewPlatform === "Instagram" ? 'bg-white shadow-sm text-slate-800' : 'text-slate-400'}`}
                  >
                    IG
                  </button>
                </div>

                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button 
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded transition-all ${previewDevice === "desktop" ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
                    title="Desktop Preview"
                  >
                    <Laptop className="h-3.5 w-3.5" />
                  </button>
                  <button 
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded transition-all ${previewDevice === "mobile" ? 'bg-white text-slate-700 shadow-sm' : 'text-slate-400'}`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Preview Canvas Container */}
            <div className="flex-1 p-6 flex items-center justify-center overflow-auto">
              
              {/* Layout varies by Selected Device Mockup */}
              <div className={`bg-white border border-slate-200 rounded-xl overflow-hidden shadow-md ${previewDevice === "mobile" ? 'w-[310px]' : 'w-full max-w-[420px]'}`}>
                
                {/* RENDER FACEBOOK DESIGN */}
                {previewPlatform === "Facebook" && (
                  <div className="flex flex-col">
                    {/* FB Profile Row */}
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden text-sm">
                          {displayBrandName.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-900">{displayBrandName}</span>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <span>Just now</span>
                            <span>•</span>
                            <Globe className="h-3 w-3" />
                          </div>
                        </div>
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* FB Body Caption */}
                    {caption && (
                      <p className="px-4 pb-3 text-xs text-slate-800 leading-normal whitespace-pre-wrap">
                        {fullCaption}
                      </p>
                    )}

                    {/* FB Visual Media Holder */}
                    <div className="aspect-square bg-slate-100 border-y border-slate-100 flex items-center justify-center relative overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center space-y-2 opacity-30 p-4">
                          <ImageIcon className="h-8 w-8 mx-auto text-slate-500" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Media Slot</p>
                        </div>
                      )}
                      {generatingImage && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* FB Feed Interactivity Buttons */}
                    <div className="p-2 border-t border-slate-100 flex items-center justify-around text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                      <div className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-slate-50 rounded-lg flex-1 justify-center">
                        <ThumbsUp className="h-4 w-4 text-slate-400" />
                        Like
                      </div>
                      <div className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-slate-50 rounded-lg flex-1 justify-center">
                        <MessageSquare className="h-4 w-4 text-slate-400" />
                        Comment
                      </div>
                      <div className="flex items-center gap-1.5 py-1 cursor-pointer hover:bg-slate-50 rounded-lg flex-1 justify-center">
                        <Share2 className="h-4 w-4 text-slate-400" />
                        Share
                      </div>
                    </div>
                  </div>
                )}

                {/* RENDER INSTAGRAM DESIGN */}
                {previewPlatform === "Instagram" && (
                  <div className="flex flex-col">
                    {/* IG Profile Row */}
                    <div className="p-3.5 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[1.5px] overflow-hidden">
                          <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-[11px] font-bold text-slate-600">
                            {displayBrandName.charAt(0)}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-900">{displayBrandName.toLowerCase().replace(/\s+/g, '')}</span>
                      </div>
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </div>

                    {/* IG Square Photo Holder */}
                    <div className="aspect-square bg-slate-100 flex items-center justify-center relative overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center space-y-2 opacity-30 p-4">
                          <ImageIcon className="h-8 w-8 mx-auto text-slate-500" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Preview Media Slot</p>
                        </div>
                      )}
                      {generatingImage && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-primary animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* IG Interactivity & Caption block */}
                    <div className="p-4 space-y-2.5">
                      <div className="flex items-center gap-3 text-slate-800">
                        <Heart className="h-4.5 w-4.5 cursor-pointer hover:text-red-500 transition-colors" />
                        <InstagramComment className="h-4.5 w-4.5 cursor-pointer" />
                        <Send className="h-4.5 w-4.5 cursor-pointer" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">12 likes</p>
                        {caption && (
                          <p className="text-xs text-slate-800 leading-normal whitespace-pre-wrap">
                            <span className="font-bold mr-1.5">{displayBrandName.toLowerCase().replace(/\s+/g, '')}</span>
                            {fullCaption}
                          </p>
                        )}
                        <span className="text-[9px] text-slate-400 uppercase font-semibold">1 minute ago</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Quick System Limits banner */}
            <div className="bg-white p-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>Buffer Core Connected</span>
              </div>
              <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full text-[9px] uppercase font-bold tracking-widest">PRO TIER</span>
            </div>

          </div>

        </div>

        {/* Footer Fixed Actions - Cancel, Finish later, Publish/Schedule */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="rounded-lg h-11 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border-slate-200"
          >
            Cancel
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSave("draft")} 
            disabled={saving}
            className="rounded-lg h-11 px-5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors border-slate-200"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Finish later"}
          </Button>
          <Button 
            onClick={() => handleSave("scheduled")} 
            disabled={saving}
            className="rounded-lg h-11 px-7 text-xs font-bold btn-grad text-white shadow-md shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : scheduleEnabled ? (
              `Schedule for ${scheduledAt ? new Date(scheduledAt).toLocaleDateString() : 'selected slot'}`
            ) : (
              "Publish now"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
