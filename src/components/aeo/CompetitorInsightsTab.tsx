import { AlertTriangle, Lightbulb, Link as LinkIcon, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const gaps = [
    { topic: "AI Automation Workflows", competitor: "zapier.com", relevance: "High", difficulty: "Medium" },
    { topic: "Cold Outreach Templates", competitor: "instantly.ai", relevance: "Critical", difficulty: "Low" },
    { topic: "Programmatic SEO Guide", competitor: "ahrefs.com", relevance: "High", difficulty: "High" }
];

export const CompetitorInsightsTab = () => {
    return (
        <div className="space-y-8 mt-8 reveal in">
            {/* Alerts */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="glass border-pink/30 bg-pink/5 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="h-6 w-6 text-pink shadow-[0_0_15px_rgba(236,72,153,0.4)]" />
                        <h3 className="text-lg font-black text-ink tracking-tight">Critical <span className="text-pink">Blindspot</span> Detected</h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] font-bold text-ink-2 leading-relaxed">
                            "best CRM for b2b saas" is generating 12k monthly AI queries. Competitor <span className="text-ink font-black">hubspot.com</span> occupies 84% of citations.
                        </p>
                        <Button className="w-full h-11 border-pink/40 bg-pink/10 text-pink font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-pink/20 transition-all">
                            HIJACK TRAFFIC FLOW
                        </Button>
                    </div>
                </div>
 
                <div className="glass border-[#22d3ee]/30 bg-[#22d3ee]/5 p-8 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-6 w-6 text-[#22d3ee] shadow-[0_0_15px_rgba(34,211,238,0.4)]" />
                        <h3 className="text-lg font-black text-ink tracking-tight">Authority <span className="text-[#22d3ee]">Infiltration</span></h3>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[11px] font-bold text-ink-2 leading-relaxed">
                            Competitor <span className="text-ink font-black">gohighlevel.com</span> is heavily cited by Perplexity for "marketing automation setup".
                        </p>
                        <Button className="w-full h-11 border-[#22d3ee]/40 bg-[#22d3ee]/10 text-[#22d3ee] font-black text-[10px] tracking-widest uppercase rounded-xl hover:bg-[#22d3ee]/20 transition-all">
                            DECONSTRUCT CITATIONS
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 reveal d1">
                {/* Topic Gap Detection */}
                <div className="glass rounded-[2.5rem] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-line bg-primary/5">
                        <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-primary" /> Topic Gap Protocol
                        </h3>
                        <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 mt-1">
                            Neural vacancies where competitors hold citation monopolies.
                        </p>
                    </div>
                    <div className="p-8 space-y-4">
                        {gaps.map((gap, i) => (
                            <div key={i} className="flex justify-between items-center p-6 rounded-2xl bg-bg border border-line hover:border-primary/40 transition-all group">
                                <div className="space-y-1">
                                    <p className="font-black text-base text-ink tracking-tight">{gap.topic}</p>
                                    <p className="text-[10px] font-bold text-ink-2 opacity-60 uppercase tracking-widest">Monopolized by: <span className="text-primary">{gap.competitor}</span></p>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <Badge variant="outline" className={cn(
                                        "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border-transparent",
                                        gap.relevance === 'Critical' ? 'bg-pink/10 text-pink' : 'bg-primary/10 text-primary'
                                    )}>
                                        {gap.relevance}
                                    </Badge>
                                    <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3 rounded-lg group-hover:translate-x-1 transition-transform">
                                        DRAFT BRIEF <ArrowRight className="h-3 w-3 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why are they ranking? */}
                {/* Why are they ranking? */}
                <div className="glass rounded-[2.5rem] overflow-hidden flex flex-col">
                    <div className="p-8 border-b border-line bg-emerald-500/5">
                        <h3 className="text-xl font-black text-emerald-500 tracking-tight flex items-center gap-3">
                            <LinkIcon className="h-5 w-5" /> Citation Deep-Dive
                        </h3>
                        <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 mt-1">
                            Deconstruction of AI engine preference logic for competitors.
                        </p>
                    </div>
                    <div className="p-8">
                        <div className="space-y-8">
                            <div className="relative border-l-2 border-primary/30 pl-8 py-1 space-y-3 group">
                                <div className="absolute w-4 h-4 bg-primary rounded-lg -left-[9px] top-2 shadow-[0_0_15px_rgba(var(--primary),0.6)] rotate-45 transition-transform group-hover:rotate-90"></div>
                                <div>
                                    <h4 className="font-black text-base text-ink tracking-tight uppercase tracking-widest text-[11px]">High Information Density</h4>
                                    <p className="text-[12px] font-bold text-ink-2 opacity-60 mt-2 leading-relaxed">Their page "CRM Automation 101" contains 14 distinct entities recognized by ChatGPT's knowledge graph.</p>
                                </div>
                            </div>
                            <div className="relative border-l-2 border-primary/30 pl-8 py-1 space-y-3 group">
                                <div className="absolute w-4 h-4 bg-primary rounded-lg -left-[9px] top-2 shadow-[0_0_15px_rgba(var(--primary),0.6)] rotate-45 transition-transform group-hover:rotate-90"></div>
                                <div>
                                    <h4 className="font-black text-base text-ink tracking-tight uppercase tracking-widest text-[11px]">Superior Schema Markup</h4>
                                    <p className="text-[12px] font-bold text-ink-2 opacity-60 mt-2 leading-relaxed">They utilize valid FAQPage schema which Claude extracts directly into the structured answer.</p>
                                </div>
                            </div>
                            <div className="relative border-l-2 border-primary/30 pl-8 py-1 space-y-3 group border-transparent">
                                <div className="absolute w-4 h-4 bg-primary rounded-lg -left-[9px] top-2 shadow-[0_0_15px_rgba(var(--primary),0.6)] rotate-45 transition-transform group-hover:rotate-90"></div>
                                <div>
                                    <h4 className="font-black text-base text-ink tracking-tight uppercase tracking-widest text-[11px]">Third-Party Verification</h4>
                                    <p className="text-[12px] font-bold text-ink-2 opacity-60 mt-2 leading-relaxed">Mentioned actively in 3 highly-ranked Reddit threads this month, boosting authority.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
