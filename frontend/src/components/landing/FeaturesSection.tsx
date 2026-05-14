import { TrendingUp, Search, Zap, BarChart3 } from "lucide-react";

export const FeaturesSection = () => {
    const features = [
        {
            icon: <TrendingUp className="h-6 w-6 text-[#00FF66]" />,
            title: "Lyra",
            description: "Role: Organic Social Growth. Outcome: Grows your audience and engagement autonomously across all major social platforms 24/7."
        },
        {
            icon: <Zap className="h-6 w-6 text-blue-500" />,
            title: "Kash",
            description: "Role: Performance Marketing. Outcome: Executes high-impact paid campaigns with real-time ROI optimization and creative rotation."
        },
        {
            icon: <Search className="h-6 w-6 text-purple-500" />,
            title: "Aris",
            description: "Role: Content & SEO/AEO. Outcome: Boosts your visibility with deep semantic search optimization and automated content execution."
        },
        {
            icon: <BarChart3 className="h-6 w-6 text-amber-500" />,
            title: "Veda",
            description: "Role: Brand Analytics & Market Research. Outcome: Tracks competitors, brand sentiment, and identifies market shifts before they happen."
        }
    ];

    return (
        <section id="features" className="py-24 bg-muted/30">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
                        Meet Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-blue-500">New Best Employees</span>
                    </h2>
                    <p className="text-lg text-muted-foreground">
                        Stop hiring helpers. Start deploying executors. Our autonomous workforce operates 24/7 to scale your vision.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group glass-card p-8 rounded-2xl hover-glow transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 text-foreground pointer-events-none">
                                {feature.icon}
                            </div>

                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
