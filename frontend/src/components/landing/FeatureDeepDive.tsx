import { Workflow, Play, BarChart, HardDrive, Cpu, Settings } from "lucide-react";

export const FeatureDeepDive = () => {
    const features = [
        {
            icon: <Workflow className="h-8 w-8 text-[#00FF66]" />,
            title: "Workflow Automation",
            benefit: "Eliminate manual data entry forever.",
            description: "Agents connect your entire tech stack, building complex operational loops that move data and take actions without you touching a keyboard.",
            result: "Saved 20+ hours of admin work weekly."
        },
        {
            icon: <Play className="h-8 w-8 text-blue-500" />,
            title: "Campaign Execution",
            benefit: "Scale your revenue while you sleep.",
            description: "Our agents don't just plan multi-channel campaigns; they execute them across social, email, and web platforms autonomously.",
            result: "3x increase in campaign velocity."
        },
        {
            icon: <BarChart className="h-8 w-8 text-purple-500" />,
            title: "Smart Analytics & Insights",
            benefit: "Identify growth levers instantly.",
            description: "Agents track every metric across your accounts, identifying anomalies and re-allocating resources to the highest performing channels.",
            result: "Re-allocated ₹2.5L+ to high-ROI channels."
        },
        {
            icon: <HardDrive className="h-8 w-8 text-emerald-500" />,
            title: "Native Integrations",
            benefit: "Connect your current stack in seconds.",
            description: "Direct agents into your WordPress, Shopify, Slack, and CRM environments with secure, one-click authorization.",
            result: "Seamless sync across 50+ platforms."
        },
        {
            icon: <Cpu className="h-8 w-8 text-amber-500" />,
            title: "Real-Time Optimization",
            benefit: "Stay ahead of market shifts.",
            description: "Agents monitor market trends and competitor moves 24/7, adjusting your strategies in milliseconds to maintain your edge.",
            result: "Maintained #1 rank for 200+ keywords."
        }
    ];

    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <p className="text-[#00FF66] font-semibold tracking-widest text-sm uppercase mb-4">Deep Dive</p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
                        The Capabilities of Your <span className="text-[#00FF66]">Autonomous workforce</span>
                    </h2>
                </div>

                <div className="space-y-12">
                    {features.map((feature, idx) => (
                        <div key={idx} className="glass-card p-10 rounded-2xl flex flex-col md:flex-row gap-10 items-center hover-glow transition-all duration-500 max-w-5xl mx-auto">
                            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                                {feature.icon}
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[#00FF66] font-bold text-sm">{feature.benefit}</p>
                                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                                </div>
                                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                                <div className="pt-2 flex items-center gap-2">
                                    <Settings className="h-4 w-4 text-[#00FF66]" />
                                    <p className="text-sm font-semibold text-white/80">Result: <span className="text-[#00FF66]">{feature.result}</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
