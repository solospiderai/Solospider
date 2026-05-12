import { useState } from "react";
import { useProject } from "./ProjectLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SocialPostEditor } from "@/components/SocialPostEditor";
import { 
  Sparkles, ImageIcon, Loader2, Wand2, History, 
  ArrowRight, Share2, Download, Zap, Layout, Lightbulb
} from "lucide-react";
import { generatePollinationsImageUrl, generateHighQualityImage } from "@/lib/social";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SocialImageGenerationPage() {
  const { project } = useProject();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [addLogo, setAddLogo] = useState(true);
  const [platform, setPlatform] = useState("instagram");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please provide a visual directive");
      return;
    }

    setGenerating(true);
    try {
      const url = await generateHighQualityImage(prompt, project?.id, platform, addLogo);
      setImageUrl(url);
      setHistory([url, ...history.slice(0, 5)]);
      toast.success("Elite visual asset synthesized");
    } catch (e) {
      toast.error("Vision synthesis failed. Retrying fallback engine...");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!imageUrl) {
      toast.error("Generate an image first");
      return;
    }

    try {
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error("Unable to fetch generated image");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const safeName = (project?.brand_name || project?.name || "solospider")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      link.href = objectUrl;
      link.download = `${safeName}-social-asset-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      toast.success("Image downloaded");
    } catch {
      // Fallback for CORS/remote restrictions: open image in new tab so user can save manually.
      window.open(imageUrl, "_blank", "noopener,noreferrer");
      toast.success("Opened image in new tab");
    }
  };

  if (editorOpen) {
    return (
      <SocialPostEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        projectId={project?.id || ""}
        idea={null}
        existingPost={{ image_prompt: prompt, image_url: imageUrl, platform: "instagram" } as any}
        onSaved={() => toast.success("Asset integrated into campaign schedule!")}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-ink tracking-tight">AI <span className="grad-text">Vision</span> Studio</h1>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] pl-1">
            Engineered Visual Assets for <span className="text-primary">{project?.brand_name || project?.name || "Your Brand"}</span>
          </p>
        </div>
        <div className="flex gap-3">
            <div className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-3 shadow-lg shadow-primary/5">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">v3 Neural Engine Active</span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Generation Control */}
        <div className="lg:col-span-4 space-y-8">
          <div className="glass rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-primary/5">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-1">
                <Label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-3">
                  <Wand2 className="h-4 w-4 text-primary" /> Visual Directive
                </Label>
                <div className="flex items-center gap-2">
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest mr-1">Brand Logo</span>
                   <button 
                      onClick={() => setAddLogo(!addLogo)}
                      className={`w-8 h-4 rounded-full transition-all relative ${addLogo ? 'bg-primary shadow-lg shadow-primary/30' : 'bg-slate-200'}`}
                   >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${addLogo ? 'left-4.5' : 'left-0.5'}`} />
                   </button>
                </div>
              </div>

              {/* Platform Selector */}
              <div className="flex flex-wrap gap-2">
                {["instagram", "x", "linkedin", "facebook"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                      platform === p 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-white border-line text-slate-400 hover:border-line/80"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Engineer a high-end visual concept..."
                className="w-full min-h-[160px] rounded-[2rem] border-line bg-white/70 p-6 text-[14px] font-bold text-ink placeholder:text-slate-400 leading-relaxed resize-none focus:bg-white focus:border-primary/40 transition-all premium-shadow-sm"
              />
            </div>
 
            <Button
              className="w-full h-16 btn-grad text-white font-black text-lg rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all tracking-widest"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-3" /> SYNTHESIZE VISION
                </>
              )}
            </Button>
 
            <div className="pt-2 space-y-4">
                <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Neural Presets</h4>
                <div className="flex flex-wrap gap-2">
                    {["Minimalist", "Hyper-Realistic", "Cinematic", "Cyber-B2B"].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setPrompt(prev => (prev ? prev + ", " : "") + s)}
                        className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-700 uppercase tracking-widest hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all shadow-sm"
                      >
                        {s}
                      </button>
                    ))}
                </div>
            </div>
          </div>

          {/* History Snapshot */}
          <div className="rounded-[2.5rem] bg-panel border border-line p-8 space-y-6">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <History className="h-4 w-4" /> Session History
            </h3>
            {history.length === 0 ? (
                <p className="text-[11px] text-ink font-bold uppercase tracking-widest text-center py-4 opacity-30">No assets generated yet</p>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {history.map((url, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-line cursor-pointer hover:border-primary/50 transition-all" onClick={() => setImageUrl(url)}>
                            <img src={url} alt="" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Creative Spark */}
          <div className="rounded-[2.5rem] bg-panel border border-line p-8 space-y-6">
            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" /> Creative Spark
            </h3>
            <div className="space-y-4">
              {[
                { title: "Dynamic Product", desc: "A product shot in mid-air with liquid metal splashes." },
                { title: "Minimalist Brand", desc: "Monochrome aesthetic with deep shadows and sharp lines." },
                { title: "Elite Office", desc: "Cinematic shot of a modern office at sunset." }
              ].map((spark, i) => (
                <div 
                  key={i} 
                  className="p-4 rounded-2xl bg-slate-50 border border-line cursor-pointer hover:border-primary/40 transition-all group"
                  onClick={() => setPrompt(spark.desc)}
                >
                  <p className="text-[11px] font-black text-ink uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">{spark.title}</p>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed">{spark.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Vision Preview */}
        <div className="lg:col-span-8">
          <div className="rounded-[3rem] bg-panel border border-line premium-shadow overflow-hidden min-h-[600px] flex flex-col relative group">
            <div className="absolute top-8 left-8 z-10">
                <Badge className="bg-panel/90 backdrop-blur-md text-ink border-line px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">
                    Ultra-HD Output
                </Badge>
            </div>

            <div className="flex-1 bg-bg flex items-center justify-center p-12 relative">
                {imageUrl ? (
                    <div className="relative w-full max-w-2xl aspect-square rounded-[2.5rem] overflow-hidden premium-shadow group">
                        <img src={imageUrl} alt="Generated" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                            <div className="flex gap-3">
                                <Button className="h-12 flex-1 rounded-xl bg-bg text-ink font-black hover:bg-bg/80 border border-line" onClick={handleDownloadImage}>
                                    <Download className="h-4 w-4 mr-2" /> DOWNLOAD
                                </Button>
                                <Button className="h-12 flex-1 rounded-xl btn-grad text-white font-black" onClick={() => setEditorOpen(true)}>
                                    <Layout className="h-4 w-4 mr-2" /> CREATE CAMPAIGN
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-6 opacity-40 group-hover:opacity-60 transition-opacity">
                        <div className="h-32 w-32 rounded-[2.5rem] border-2 border-dashed border-slate-400 flex items-center justify-center mx-auto bg-slate-50">
                            <ImageIcon className="h-12 w-12 text-slate-400" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-600">Neural Canvas Waiting</p>
                    </div>
                )}

                {generating && (
                    <div className="absolute inset-0 bg-bg/90 backdrop-blur-2xl z-20 flex items-center justify-center p-12">
                        <div className="flex flex-col items-center gap-10 text-center max-w-md">
                            <div className="relative h-28 w-28">
                                <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
                                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin shadow-[0_0_30px_rgba(144,37,242,0.6)]" />
                                <Sparkles className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-ink tracking-tight uppercase tracking-widest">Neural Synthesis</h3>
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-relaxed animate-pulse">
                                    Calibrating Multi-Layer Brand Intelligence Assets...
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-10 border-t border-line flex items-center justify-between bg-panel/30">
                <div className="flex items-center gap-6">
                    <div className="flex -space-x-3">
                        {[1,2,3].map(i => (
                            <div key={i} className="h-10 w-10 rounded-xl border-4 border-bg bg-panel flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-primary/20" />
                            </div>
                        ))}
                    </div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        Neural Synthesis Active
                    </p>
                </div>
                {imageUrl && (
                    <Button variant="ghost" className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/5" onClick={() => setEditorOpen(true)}>
                        Deploy to Command Center <ArrowRight className="h-3 w-3 ml-2" />
                    </Button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
