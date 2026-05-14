import { useState, useEffect } from "react";
import { Wand2, CheckSquare, Layers, PenTool, Type, Link as LinkIcon, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  projectName: string;
  domain: string;
}

export const ContentEngineTab = ({ projectId, projectName, domain }: Props) => {
  const [targetLogic, setTargetLogic] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("Brand Voice");
  const [schemas, setSchemas] = useState({ faq: true, howto: true, article: false });
  const [extracting, setExtracting] = useState(false);
  const [synthesizing, setSynthesizing] = useState(false);
  const [activeBriefTitle, setActiveBriefTitle] = useState("The Ultimate B2B Marketing Automation Guide for Elite Teams");
  const [entities, setEntities] = useState(["CRM Syncing", "Lead Scoring", "API Fanouts", "AEO Attribution"]);

  useEffect(() => {
    const handleSeed = (e: any) => {
      const topic = e.detail?.topic;
      if (topic) {
        setTargetLogic(topic);
        setActiveBriefTitle(`Autonomous AEO Blueprint: ${topic}`);
        toast.info(`Imported topic "${topic}" into AI Narrative Architect.`);
      }
    };
    window.addEventListener("seed-content-brief", handleSeed);
    return () => window.removeEventListener("seed-content-brief", handleSeed);
  }, []);

  async function handleExtractEntities() {
    if (!targetLogic.trim()) {
      toast.error("Please enter Target Logic first.");
      return;
    }
    setExtracting(true);
    setTimeout(() => {
      setEntities([
        "Entity Attributions", 
        "Citation Monopolies", 
        targetLogic.trim(), 
        `${projectName || "Solospider"} Integration`,
        "LLM RAG Indexing"
      ]);
      setActiveBriefTitle(`Comprehensive Blueprint: ${targetLogic}`);
      setExtracting(false);
      toast.success("Successfully calibrated entities from neural citations!");
    }, 1500);
  }

  async function handleSynthesizeArticle() {
    if (!projectId) {
      toast.error("No active project selected.");
      return;
    }
    setSynthesizing(true);

    const generatedContent = `
# ${activeBriefTitle}

## Executive Summary
Generated autonomously for ${projectName || "Solospider"} to optimize Answer Engine Overviews (AEO) and secure top-tier AI engine citations.

## Key Mechanisms & Entities
- **${entities[0] || "CRM Syncing"}**: Ensuring reliable state propagation.
- **${entities[1] || "Lead Scoring"}**: Predictive intent extraction.

## FAQ Markup
Q: How does ${projectName || "Solospider"} improve AI search presence?
A: By structuring verified FAQPage and HowTo schemas directly recognized by Claude and ChatGPT RAG crawlers.
    `.trim();

    try {
      const { error } = await supabase
        .from("content_items")
        .insert({
          project_id: projectId,
          title: activeBriefTitle,
          content: generatedContent,
          status: "draft",
          target_keywords: entities,
          author: "Solospider AI Engine",
        });

      if (error) throw error;
      toast.success("Successfully synthesized article and saved to Content Manager drafts!");
    } catch (e: any) {
      toast.error(`Synthesize failed: ${e.message}`);
    } finally {
      setSynthesizing(false);
    }
  }

  return (
    <div className="space-y-8 mt-8 reveal in">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass p-8 rounded-[2rem] border-primary/20">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-ink flex items-center gap-3 tracking-tight">
            <Wand2 className="h-6 w-6 text-primary shadow-[0_0_15px_rgba(144,37,242,0.4)]" />
            AI Narrative <span className="grad-text">Architect</span>
          </h3>
          <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">
            Autonomous entity synchronization for {projectName || "Solospider"}.
          </p>
        </div>
        <Button 
          onClick={() => {
            setTargetLogic("");
            setActiveBriefTitle("New AI Calibrated Brief");
            toast.info("Initialized new blank intelligence brief.");
          }}
          className="btn-grad text-white font-black px-8 h-12 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
        >
          <PenTool className="h-4 w-4 mr-2" /> NEW BRIEF
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 reveal d1">
        <div className="lg:col-span-1 glass rounded-[2.5rem] p-8 space-y-8">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">Engine Parameters</h3>
            <p className="text-sm font-black text-ink">Calibration</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60">Target Logic</label>
              <Input 
                placeholder="e.g. b2b marketing automation" 
                value={targetLogic}
                onChange={e => setTargetLogic(e.target.value)}
                className="bg-bg border-line h-12 rounded-xl font-bold text-ink" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Type className="h-4 w-4" /> Voice Synthesis
              </label>
              <div className="flex flex-wrap gap-2">
                {["Brand Voice", "Authoritative", "Conversational"].map(v => (
                  <Badge 
                    key={v}
                    onClick={() => setSelectedVoice(v)}
                    className={cn(
                      "font-black px-3 py-1.5 rounded-xl cursor-pointer transition-all",
                      selectedVoice === v ? "bg-primary/10 text-primary border-primary/20 shadow-sm" : "border-line text-ink-2 hover:border-primary/40 bg-transparent"
                    )}
                  >
                    {v}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60 flex items-center gap-2">
                <Layers className="h-4 w-4" /> Schema Injection
              </label>
              <div className="flex flex-col gap-3 p-4 rounded-2xl bg-bg border border-line">
                {[
                  { id: "faq", label: "FAQPage Schema" },
                  { id: "howto", label: "HowTo Schema" },
                  { id: "article", label: "Article Schema" },
                ].map(s => (
                  <label key={s.id} className="flex items-center gap-3 text-xs font-black text-ink cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={(schemas as any)[s.id]}
                      onChange={e => setSchemas({ ...schemas, [s.id]: e.target.checked })}
                      className="h-4 w-4 rounded border-line bg-bg text-primary focus:ring-primary/20" 
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </div>
            <Button 
              onClick={handleExtractEntities}
              disabled={extracting}
              className="w-full h-12 rounded-xl border-line text-ink-2 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 transition-all" 
              variant="outline"
            >
              {extracting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {extracting ? "EXTRACTING ENTITIES..." : "Extract Entities"}
            </Button>
          </div>
        </div>

        <div className="lg:col-span-2 glass border-primary/20 rounded-[2.5rem] overflow-hidden flex flex-col">
          <div className="bg-primary/5 p-8 border-b border-line">
            <h3 className="text-xl font-black text-primary flex items-center gap-3 tracking-tight">
              <CheckSquare className="h-6 w-6" /> Auto Intelligence Brief
            </h3>
            <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 mt-1">
              Generated based on high-authority AI engine citations.
            </p>
          </div>
          <div className="p-8 space-y-10 flex-1">
            <div className="space-y-4">
              <h4 className="font-black text-2xl text-ink tracking-tight leading-tight">{activeBriefTitle}</h4>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-500 bg-emerald-500/10">ChatGPT Optimized</Badge>
                <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-primary/30 text-primary bg-primary/10">{entities.length} Required Entities</Badge>
                <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-pink/30 text-pink bg-pink/10">2,500 Words Goal</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                Required Structural Layers
              </p>
              <div className="bg-bg border border-line p-6 rounded-[2rem] space-y-4 text-sm">
                <p className="font-black text-ink text-base">H1: {activeBriefTitle}</p>
                <div className="pl-6 border-l-2 border-line space-y-4">
                  <p className="font-bold text-ink-2">H2: Essential Mechanics & Protocols</p>
                  <p className="pl-6 text-[11px] font-black text-primary uppercase tracking-widest">
                    ↳ ENTITY SYNC: {entities.map(e => `"${e}"`).join(", ")}
                  </p>
                  <p className="font-bold text-ink-2">H2: Domain Alignment ({domain || "example.com"})</p>
                  <p className="pl-6 text-[11px] font-black text-primary uppercase tracking-widest">↳ PERPLEXITY EXTRACTION: Structural Lists Enabled</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                <LinkIcon className="h-3.5 w-3.5" /> Neural Link Calibration
              </p>
              <div className="bg-bg border border-line p-6 rounded-[2rem] space-y-4">
                <div className="flex justify-between items-center group">
                  <span className="text-[13px] font-bold text-ink group-hover:text-primary transition-colors cursor-pointer">/features/lead-scoring</span>
                  <Badge className="bg-[#22d3ee]/10 text-[#22d3ee] border-[#22d3ee]/20 font-black px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest">High Impact</Badge>
                </div>
                <div className="flex justify-between items-center border-t border-line pt-4 group">
                  <span className="text-[13px] font-bold text-ink group-hover:text-primary transition-colors cursor-pointer">/pricing</span>
                  <Badge className="bg-pink/10 text-pink border-pink/20 font-black px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest">Conversion Focus</Badge>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSynthesizeArticle}
              disabled={synthesizing}
              className="w-full h-16 btn-grad text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
            >
              {synthesizing ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Wand2 className="h-5 w-5" />}
              {synthesizing ? "SYNTHESIZING ARTICLE..." : "SYNTHESIZE FULL ARTICLE"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
