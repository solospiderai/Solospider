import { Star } from "lucide-react";

export const SocialProof = () => {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-[#00FF66] font-semibold tracking-widest text-sm uppercase mb-4">Social Proof</p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
                        Real Results from <span className="text-[#00FF66]">Real Founders</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {[
                        {
                            name: "Marcus K.",
                            role: "SaaS Founder",
                            text: "I completely fired my expensive content agency out of nowhere. Solo Spider is outputting 30 articles a month that genuinely sound like I wrote them. Traffic is up 240% since last quarter.",
                            stars: 5
                        },
                        {
                            name: "Sarah P.",
                            role: "Niche Site Investor",
                            text: "The auto-publish to WordPress feature is insane. I just map out the keywords, come back an hour later, and my niche site is populated with fully formatted, perfectly internal-linked drafts.",
                            stars: 5
                        },
                        {
                            name: "David L.",
                            role: "Agency Director",
                            text: "Managing 15 clients used to be a nightmare. Now I deploy the Solo Spider Analytics and Marketing agents, and they handle the heavy lifting for me. Our margins have tripled.",
                            stars: 5
                        }
                    ].map((item, idx) => (
                        <div key={idx} className="glass-card p-8 rounded-2xl hover-glow transition-all duration-500 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex text-[#00FF66]">
                                    {[...Array(item.stars)].map((_, i) => (
                                        <Star key={i} className="h-4 w-4 fill-current" />
                                    ))}
                                </div>
                                <p className="text-muted-foreground italic leading-relaxed">"{item.text}"</p>
                            </div>
                            <div className="pt-8 flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white/40">
                                    {item.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-white">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Growth Stats Block */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
                    <div>
                        <p className="text-4xl md:text-5xl font-extrabold text-[#00FF66] mb-2">240%</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Traffic increase</p>
                    </div>
                    <div>
                        <p className="text-4xl md:text-5xl font-extrabold text-[#00FF66] mb-2">120h</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Time saved / mo</p>
                    </div>
                    <div>
                        <p className="text-4xl md:text-5xl font-extrabold text-[#00FF66] mb-2">10x</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Execution Velocity</p>
                    </div>
                    <div>
                        <p className="text-4xl md:text-5xl font-extrabold text-[#00FF66] mb-2">100%</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Autonomous Deployment</p>
                    </div>
                </div>
            </div>
        </section>
    );
};
