import { AlertCircle, Clock, Users, BarChart } from "lucide-react";

export const ProblemSection = () => {
    return (
        <section className="py-24 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <p className="text-[#00FF66] font-semibold tracking-widest text-sm uppercase mb-4">The Reality Check</p>
                    <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">
                        You’re Not Scaling. <br />
                        <span className="text-muted-foreground">You’re Just Managing Tools.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    <div className="glass-card p-10 rounded-2xl hover-glow transition-all duration-500 border-red-500/10">
                        <AlertCircle className="h-10 w-10 text-red-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Drowning in Dashboards</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            You have 15 tools, but 0 time to use them. Instead of growing, you spend your day logging in and out of software platforms.
                        </p>
                    </div>

                    <div className="glass-card p-10 rounded-2xl hover-glow transition-all duration-500 border-red-500/10">
                        <Clock className="h-10 w-10 text-orange-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Manual Bottlenecks</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Your execution shouldn't depend on your availability. Every manual click is a minute taken away from your vision.
                        </p>
                    </div>

                    <div className="glass-card p-10 rounded-2xl hover-glow transition-all duration-500 border-red-500/10">
                        <Users className="h-10 w-10 text-purple-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">The Talent Trap</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Agencies are slow and expensive. Hiring is a nightmare. You need outcomes, not a payroll full of helpers.
                        </p>
                    </div>

                    <div className="glass-card p-10 rounded-2xl hover-glow transition-all duration-500 border-red-500/10">
                        <BarChart className="h-10 w-10 text-blue-500 mb-6" />
                        <h3 className="text-2xl font-bold mb-4">Execution Gaps</h3>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Suggestions aren't results. Planning isn't doing. Generic AI gives you advice; you need agents that do the work.
                        </p>
                    </div>
                </div>

                <div className="text-center mt-16">
                    <p className="text-2xl font-bold italic text-white/80">
                        "Stop hiring helpers. Start deploying executors."
                    </p>
                </div>
            </div>
        </section>
    );
};
