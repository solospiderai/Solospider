import { Search, Plus, TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const mockPrompts = [
    { id: 1, prompt: "best CRM for small agencies", engine: "ChatGPT", rank: 1, prevRank: 3, change: "up", volume: "High" },
    { id: 2, prompt: "how to automate seo content", engine: "Perplexity", rank: 2, prevRank: 2, change: "flat", volume: "Medium" },
    { id: 3, prompt: "fupilot reviews 2026", engine: "Google AI", rank: 1, prevRank: 1, change: "flat", volume: "Low" },
    { id: 4, prompt: "alternatives to scalezix crm", engine: "ChatGPT", rank: 4, prevRank: 2, change: "down", volume: "Medium" },
    { id: 5, prompt: "what is answer engine optimization", engine: "Claude", rank: 1, prevRank: 5, change: "up", volume: "High" },
    { id: 6, prompt: "AI tools for programmatic seo", engine: "Perplexity", rank: 3, prevRank: 3, change: "flat", volume: "High" }
];

export const PromptsTrackingTab = () => {
    return (
        <div className="space-y-8 mt-8 reveal in">
            {/* Header / Add Prompt */}
            <div className="glass bg-primary/5 border-primary/20 rounded-[2.5rem] p-8 reveal d1">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-ink flex items-center gap-3 tracking-tight">
                            <Target className="h-6 w-6 text-primary shadow-[0_0_15px_rgba(144,37,242,0.4)]" />
                            Neural Prompt <span className="grad-text">Surveillance</span>
                        </h3>
                        <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60">
                            Real-time brand positioning across 500+ AI intent vectors.
                        </p>
                    </div>
                    <div className="flex w-full lg:w-auto items-center gap-3">
                        <Input placeholder="e.g. 'best seo tools'" className="h-12 bg-bg border-line rounded-xl font-bold text-ink lg:w-72" />
                        <Button className="btn-grad text-white font-black px-6 h-12 rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all">
                            <Plus className="h-4 w-4 mr-2" /> TRACK
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tracking Table */}
            <div className="glass rounded-[2.5rem] overflow-hidden reveal d2">
                <div className="p-8 border-b border-line bg-primary/5 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-3">
                            <TrendingUp className="h-5 w-5 text-primary" /> Active Rank Protocol
                        </h3>
                        <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 mt-1">
                            Current authority distribution within AI engine response layers.
                        </p>
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-2 opacity-40" />
                        <Input type="search" placeholder="Filter protocols..." className="pl-11 h-11 bg-bg border-line rounded-xl font-bold text-ink" />
                    </div>
                </div>
                    <div className="overflow-x-auto p-4">
                        <table className="w-full text-sm text-left border-separate border-spacing-y-2">
                            <thead className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60">
                                <tr>
                                    <th className="px-8 py-4 font-black">Target Intent</th>
                                    <th className="px-8 py-4 font-black">Neural Engine</th>
                                    <th className="px-8 py-4 font-black">Velocity</th>
                                    <th className="px-8 py-4 font-black">Position</th>
                                    <th className="px-8 py-4 font-black">7-Day Delta</th>
                                </tr>
                            </thead>
                            <tbody className="">
                                {mockPrompts.map((item) => (
                                    <tr key={item.id} className="group bg-bg/50 hover:bg-bg transition-all">
                                        <td className="px-8 py-6 rounded-l-2xl border-y border-l border-line font-bold text-ink">{item.prompt}</td>
                                        <td className="px-8 py-6 border-y border-line text-ink-2 font-bold">{item.engine}</td>
                                        <td className="px-8 py-6 border-y border-line">
                                            <Badge variant="outline" className={cn(
                                                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border-transparent",
                                                item.volume === 'High' ? 'text-primary bg-primary/10' :
                                                item.volume === 'Medium' ? 'text-[#22d3ee] bg-[#22d3ee]/10' :
                                                'text-ink-2 bg-bg border-line'
                                            )}>
                                                {item.volume}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6 border-y border-line">
                                            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/20">
                                                #{item.rank}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 rounded-r-2xl border-y border-r border-line font-black">
                                            {item.change === 'up' && <span className="text-emerald-500 flex items-center gap-2"><TrendingUp className="h-4 w-4" /> +{(item.prevRank - item.rank)}</span>}
                                            {item.change === 'down' && <span className="text-pink flex items-center gap-2"><TrendingDown className="h-4 w-4" /> -{(item.rank - item.prevRank)}</span>}
                                            {item.change === 'flat' && <span className="text-ink-2 opacity-40 flex items-center gap-2"><Minus className="h-4 w-4" /> 0</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
