import { Zap, CheckCircle2, ArrowRight, PlayCircle, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const tasks = [
    { title: "Publish 'Top CRM 2026' guide to WordPress", type: "Content", impact: "High", effort: "Low", status: "pending", cta: "1-Click Publish" },
    { title: "Outreach to r/SaaS moderators", type: "PR", impact: "High", effort: "Medium", status: "pending", cta: "Auto-Send Message" },
    { title: "Fix FAQ Schema on Homepage", type: "Technical", impact: "Medium", effort: "Low", status: "completed", cta: "Verify" },
    { title: "Generate brief for 'How to automate marketing'", type: "Content", impact: "High", effort: "High", status: "pending", cta: "Generate Brief" },
];

export const ActionEngineTab = () => {
    return (
        <div className="space-y-8 mt-8 reveal in">
            <div className="glass bg-primary/5 border-primary/20 rounded-[2rem] p-8 relative overflow-hidden group">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] group-hover:scale-125 transition-transform duration-700"></div>
                <h3 className="text-2xl font-black flex items-center gap-3 mb-3 tracking-tight text-ink">
                    <Flame className="h-7 w-7 text-primary animate-pulse" />
                    Weekly <span className="grad-text">Action Protocol</span>
                </h3>
                <p className="text-ink-2 font-bold uppercase tracking-widest text-[11px] opacity-60 w-full md:w-2/3 leading-relaxed">
                    calculated high-impact execution vectors to dominate AI engine citations.
                </p>
            </div>

            <div className="glass rounded-[2.5rem] overflow-hidden reveal d1">
                <div className="p-8 border-b border-line bg-primary/5">
                    <h3 className="text-xl font-black text-ink tracking-tight flex items-center gap-3">
                        <Zap className="h-5 w-5 text-primary" /> Priority Execution Queue
                    </h3>
                    <p className="text-[10px] font-black text-ink-2 uppercase tracking-[0.2em] opacity-60 mt-1">
                        Dynamic tasks sorted by Neural Impact vs. Effort ratio.
                    </p>
                </div>
                <div className="p-8">
                    <div className="space-y-4">
                        {tasks.map((task, i) => (
                            <div key={i} className={cn(
                                "flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-[1.5rem] border transition-all gap-6",
                                task.status === 'completed' 
                                    ? "bg-bg/40 opacity-40 border-line" 
                                    : "bg-bg border-line hover:border-primary/40 hover:scale-[1.01] premium-shadow-sm"
                            )}>
                                <div className="flex items-start gap-6">
                                    <div className="mt-1">
                                        {task.status === 'completed' ? (
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        ) : (
                                            <div className="h-6 w-6 rounded-xl border-2 border-primary/30 bg-primary/5"></div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <p className={cn(
                                            "font-black text-lg tracking-tight",
                                            task.status === 'completed' ? "line-through text-ink-2" : "text-ink"
                                        )}>
                                            {task.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4">
                                            <Badge variant="outline" className="border-line text-ink-2 font-black px-2 py-0.5 rounded-md text-[8px] uppercase tracking-widest">{task.type}</Badge>
                                            <span className={cn(
                                                "text-[9px] font-black uppercase tracking-widest",
                                                task.impact === 'High' ? 'text-primary' : 'text-pink'
                                            )}>
                                                Impact: {task.impact}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-ink-2 opacity-60">
                                                Effort: {task.effort}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full md:w-auto">
                                    <Button 
                                        variant={task.status === 'completed' ? "outline" : "default"} 
                                        className={cn(
                                            "w-full md:w-44 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all",
                                            task.status !== 'completed' && "btn-grad text-white shadow-xl shadow-primary/20"
                                        )}
                                        disabled={task.status === 'completed'}
                                    >
                                        {task.status !== 'completed' && <PlayCircle className="h-4 w-4 mr-2" />}
                                        {task.cta}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-8 reveal d2">
                <Button className="h-16 text-[12px] font-black uppercase tracking-widest btn-grad text-white shadow-2xl shadow-primary/30 rounded-2xl" variant="default">
                    <Zap className="h-5 w-5 mr-3" /> Auto-Execute Full Protocol
                </Button>
                <Button className="h-16 text-[12px] font-black uppercase tracking-widest border-line bg-bg hover:bg-primary/5 text-ink rounded-2xl transition-all" variant="outline">
                    Regenerate Strategy
                </Button>
            </div>
        </div>
    );
};
