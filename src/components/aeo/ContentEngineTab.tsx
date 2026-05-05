import { Wand2, CheckSquare, Layers, PenTool, Type, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const ContentEngineTab = () => {
    return (
        <div className="space-y-8 mt-8 reveal in">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 glass p-8 rounded-[2rem] border-primary/20">
                <div className="space-y-1">
                    <h3 className="text-xl font-black text-ink flex items-center gap-3 tracking-tight">
                        <Wand2 className="h-6 w-6 text-primary shadow-[0_0_15px_rgba(144,37,242,0.4)]" />
                        AI Narrative <span className="grad-text">Architect</span>
                    </h3>
                    <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">
                        Autonomous entity synchronization with top-tier AI citations.
                    </p>
                </div>
                <Button className="btn-grad text-white font-black px-8 h-12 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all">
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
                            <Input placeholder="e.g. b2b marketing automation" className="bg-bg border-line h-12 rounded-xl font-bold text-ink" />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60 flex items-center gap-2"><Type className="h-4 w-4" /> Voice Synthesis</label>
                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-primary/10 text-primary border-primary/20 font-black px-3 py-1.5 rounded-xl cursor-pointer">Brand Voice</Badge>
                                <Badge variant="outline" className="border-line text-ink-2 font-black px-3 py-1.5 rounded-xl cursor-pointer hover:border-primary/40">Authoritative</Badge>
                                <Badge variant="outline" className="border-line text-ink-2 font-black px-3 py-1.5 rounded-xl cursor-pointer hover:border-primary/40">Conversational</Badge>
                            </div>
                        </div>
                        <div className="space-y-3 pt-2">
                            <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest opacity-60 flex items-center gap-2"><Layers className="h-4 w-4" /> Schema Injection</label>
                            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-bg border border-line">
                                <label className="flex items-center gap-3 text-xs font-black text-ink cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line bg-bg text-primary focus:ring-primary/20" />
                                    FAQPage Schema
                                </label>
                                <label className="flex items-center gap-3 text-xs font-black text-ink cursor-pointer group">
                                    <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line bg-bg text-primary focus:ring-primary/20" />
                                    HowTo Schema
                                </label>
                                <label className="flex items-center gap-3 text-xs font-black text-ink cursor-pointer group">
                                    <input type="checkbox" className="h-4 w-4 rounded border-line bg-bg text-primary focus:ring-primary/20" />
                                    Article Schema
                                </label>
                            </div>
                        </div>
                        <Button className="w-full h-12 rounded-xl border-line text-ink-2 font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 transition-all" variant="outline">Extract Entities</Button>
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
                            <h4 className="font-black text-2xl text-ink tracking-tight leading-tight">The Ultimate B2B Marketing Automation Guide for Elite Teams</h4>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-emerald-500/30 text-emerald-500 bg-emerald-500/10">ChatGPT Optimized</Badge>
                                <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-primary/30 text-primary bg-primary/10">14 Required Entities</Badge>
                                <Badge variant="outline" className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border-pink/30 text-pink bg-pink/10">2,500 Words Goal</Badge>
                            </div>
                        </div>
 
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                                Required Structural Layers
                            </p>
                            <div className="bg-bg border border-line p-6 rounded-[2rem] space-y-4 text-sm">
                                <p className="font-black text-ink text-base">H1: The Ultimate Guide to B2B Marketing Automation in 2026</p>
                                <div className="pl-6 border-l-2 border-line space-y-4">
                                    <p className="font-bold text-ink-2">H2: What is Marketing Automation?</p>
                                    <p className="pl-6 text-[11px] font-black text-primary uppercase tracking-widest">↳ ENTITY SYNC: "CRM Syncing", "Lead Scoring"</p>
                                    <p className="font-bold text-ink-2">H2: Top 5 Tools Comparison</p>
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
 
                        <Button className="w-full h-16 btn-grad text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3">
                            <Wand2 className="h-5 w-5" /> SYNTHESIZE FULL ARTICLE
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
