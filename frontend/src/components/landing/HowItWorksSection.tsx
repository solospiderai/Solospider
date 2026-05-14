import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export const HowItWorksSection = () => {
    const steps = [
        {
            number: "01",
            title: "Analyze",
            description: "Agents crawl your data, understand your market, and identify 100% of your growth opportunities."
        },
        {
            number: "02",
            title: "Plan",
            description: "They build sophisticated strategies and multi-channel workflows tailored to your specific goals."
        },
        {
            number: "03",
            title: "Execute",
            description: "They autonomously run campaigns, automate tasks, and optimize results in real-time."
        }
    ];

    return (
        <section id="how-it-works" className="py-24 bg-background border-t border-border/50">
            <div className="container mx-auto px-4 md:px-8">
                <div className="flex flex-col lg:flex-row gap-16 items-center">

                    <div className="lg:w-1/2">
                        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                            From Setup to <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-blue-500">
                                Autonomous Growth
                            </span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            Softwares used to be a tool you operated. Solo Spider is a workforce that operates itself. 
                        </p>

                        <div className="space-y-8 mt-12">
                            {steps.map((step, idx) => (
                                <div key={idx} className="flex gap-6 items-start group">
                                    <div className="flex-shrink-0 mt-1 h-12 w-12 rounded-full border-2 border-[#00FF66]/20 bg-[#00FF66]/5 flex items-center justify-center group-hover:bg-[#00FF66] group-hover:text-black group-hover:border-[#00FF66] transition-all duration-300">
                                        <span className="font-bold">{step.number}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#00FF66] transition-colors">{step.title}</h3>
                                        <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12">
                            <Link to="/auth">
                                <Button className="rounded-full bg-[#00FF66] text-black hover:bg-[#00CC52] font-bold shadow-lg shadow-[#00FF66]/20 hover:shadow-[#00FF66]/40 transition-all">
                                    Trial Your Agents
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <div className="lg:w-1/2 w-full relative">
                        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                        <div className="relative rounded-2xl border bg-background/50 backdrop-blur-xl shadow-2xl p-6 md:p-10 z-10">
                            {/* Abstract illustration of the core loop */}
                            <div className="space-y-6">
                                {/* Step 1 Mock */}
                                <div className="bg-background rounded-lg border p-4 flex gap-4 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                    <div className="h-10 w-10 rounded-md bg-purple-500/20 flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/3 bg-foreground/20 rounded"></div>
                                        <div className="h-2 w-1/2 bg-foreground/10 rounded"></div>
                                    </div>
                                </div>

                                {/* Connecting Line */}
                                <div className="h-8 border-l-2 border-dashed border-primary/40 ml-9"></div>

                                {/* Step 2 Mock */}
                                <div className="bg-background rounded-lg border p-4 flex gap-4 shadow-md scale-[1.02] border-primary/30">
                                    <div className="h-10 w-10 rounded-md bg-primary/20 flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/2 bg-foreground/30 rounded"></div>
                                        <div className="h-2 w-full bg-foreground/10 rounded"></div>
                                        <div className="h-2 w-3/4 bg-foreground/10 rounded"></div>
                                        <div className="h-2 w-5/6 bg-foreground/10 rounded"></div>
                                    </div>
                                </div>

                                {/* Connecting Line */}
                                <div className="h-8 border-l-2 border-dashed border-primary/40 ml-9"></div>

                                {/* Step 3 Mock */}
                                <div className="bg-background rounded-lg border p-4 flex gap-4 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
                                    <div className="h-10 w-10 rounded-md bg-green-500/20 flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-1/4 bg-foreground/20 rounded"></div>
                                        <div className="flex gap-2">
                                            <div className="h-6 w-16 bg-muted rounded-full"></div>
                                            <div className="h-6 w-16 bg-muted rounded-full"></div>
                                        </div>
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
