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
  ArrowRight, Share2, Download, Zap, Layout
} from "lucide-react";
import { generatePollinationsImageUrl } from "@/lib/social";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SocialImageGenerationPage() {
  const { project } = useProject();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please provide a visual directive");
      return;
    }

    setGenerating(true);
    try {
      const url = await generatePollinationsImageUrl(prompt);
      setImageUrl(url);
      setHistory([url, ...history.slice(0, 5)]);
      toast.success("Elite visual asset synthesized");
    } catch (e) {
      toast.error("Vision synthesis failed. Retrying fallback engine...");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 reveal in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 reveal d1">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-ink tracking-tight">AI <span className="grad-text">Vision</span> Studio</h1>
          <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60 pl-1">
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
        <div className="lg:col-span-4 space-y-8 reveal d2">
          <div className="glass rounded-[2.5rem] p-8 space-y-8 shadow-2xl shadow-primary/5">
            <div className="space-y-4">
              <Label className="text-[10px] font-black text-ink uppercase tracking-[0.2em] flex items-center gap-3 opacity-60">
                <Wand2 className="h-4 w-4 text-primary" /> Visual Directive
              </Label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Engineer a high-end visual concept..."
                className="w-full min-h-[180px] rounded-[2rem] border-line bg-white/50 p-8 text-[15px] font-bold text-ink leading-relaxed resize-none focus:bg-white focus:border-primary/40 transition-all premium-shadow-sm"
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
 
            <div className="pt-4 space-y-4">
                <h4 className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">Neural Presets</h4>
                <div className="flex flex-wrap gap-2">
                    {["Minimalist", "Hyper-Realistic", "Cinematic", "Cyber-B2B"].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setPrompt(prev => (prev ? prev + ", " : "") + s)}
                        className="px-4 py-2 rounded-xl bg-white border border-line text-[10px] font-black text-ink uppercase tracking-widest hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                </div>
            </div>
          </div>

          {/* History Snapshot */}
          <div className="rounded-[2.5rem] bg-panel border border-line p-8 space-y-6">
            <h3 className="text-[10px] font-black text-ink uppercase tracking-[0.2em] flex items-center gap-2 opacity-70">
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
        </div>

        {/* Right: Vision Preview */}
        <div className="lg:col-span-8 reveal d3">
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
                                <Button className="h-12 flex-1 rounded-xl bg-bg text-ink font-black hover:bg-bg/80 border border-line">
                                    <Download className="h-4 w-4 mr-2" /> DOWNLOAD
                                </Button>
                                <Button className="h-12 flex-1 rounded-xl btn-grad text-white font-black" onClick={() => setEditorOpen(true)}>
                                    <Layout className="h-4 w-4 mr-2" /> CREATE CAMPAIGN
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center space-y-6 opacity-20 group-hover:opacity-30 transition-opacity">
                        <div className="h-32 w-32 rounded-[2.5rem] border-2 border-dashed border-ink flex items-center justify-center mx-auto">
                            <ImageIcon className="h-12 w-12" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-[0.3em]">Neural Canvas Waiting</p>
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
                    <p className="text-[10px] font-black text-ink uppercase tracking-widest opacity-60">
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

      <SocialPostEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        projectId={project?.id || ""}
        idea={null}
        existingPost={{ image_prompt: prompt, image_url: imageUrl, platform: "instagram" }}
        onSaved={() => toast.success("Asset integrated into campaign schedule!")}
      />
    </div>
  );
}
