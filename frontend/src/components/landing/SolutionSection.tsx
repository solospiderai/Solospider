import { CheckCircle2, Zap, Rocket, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const SolutionSection = () => {
    return (
        <section className="py-24 bg-mesh relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row items-center gap-20">
                    <div className="lg:w-1/2 space-y-8">
                        <p className="text-[#00FF66] font-semibold tracking-widest text-sm uppercase">The Solution</p>
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
                            Tools Require Effort. <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-blue-500">Agents Deliver Results.</span>
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Software used to be a tool you operated. Solo Spider is a workforce that operates itself. 
                            Our agents don't suggest improvements—they execute them. They don't assist your team—they replace the manual workflows that hold you back.
                        </p>

                        <div className="space-y-4 pt-4">
                            {[
                                "Autonomous execution, not manual input.",
                                "Outcome-driven workflows that finish the job.",
                                "A workforce that scales without hiring costs.",
                                "Real-time optimization based on results."
                            ].map((text, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <CheckCircle2 className="h-6 w-6 text-[#00FF66]" />
                                    <span className="text-lg font-medium">{text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Link to="/auth">
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-[#00FF66] text-black hover:bg-[#00CC52] font-bold shadow-xl shadow-[#00FF66]/20 hover:shadow-[#00FF66]/40 transition-all">
                                    Deploy Your Workforce
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#00FF66]/20 to-blue-500/20 rounded-3xl blur-3xl opacity-30"></div>
                        <div className="relative glass-card p-8 rounded-3xl border border-[#00FF66]/20 animate-float">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-[#00FF66]/20 flex items-center justify-center">
                                            <Zap className="h-6 w-6 text-[#00FF66]" />
                                        </div>
                                        <div>
                                            <p className="font-bold">Execution Agent #4</p>
                                            <p className="text-xs text-muted-foreground">Status: Autonomous</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-[#00FF66]/10 text-[#00FF66] rounded-full text-xs font-bold">ACTIVE</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white/5 p-4 rounded-xl space-y-2">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Current Task</p>
                                        <p className="text-sm font-medium">Scaling multi-channel ad copy execution for Q4 goals.</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl space-y-2">
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">Progress</p>
                                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-[85%] bg-[#00FF66] shadow-[0_0_10px_#00FF66]"></div>
                                        </div>
                                        <p className="text-[10px] text-right text-[#00FF66]">85% Complete</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="glass-card p-3 rounded-lg text-center">
                                        <p className="text-xl font-bold text-[#00FF66]">14.2%</p>
                                        <p className="text-[10px] text-muted-foreground">ROI Uplift</p>
                                    </div>
                                    <div className="glass-card p-3 rounded-lg text-center">
                                        <p className="text-xl font-bold text-blue-400">0ms</p>
                                        <p className="text-[10px] text-muted-foreground">Latency</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
