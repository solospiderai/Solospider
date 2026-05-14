import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star, Binary, Database, Layout, Search, Megaphone, Target, Workflow } from "lucide-react";
import { Link } from "react-router-dom";

const AGENTS = [
    {
        name: "Aris",
        role: "Content Marketing, SEO & AEO",
        image: "/aris.png",
        icon: <Layout className="h-10 w-10 text-[#00FF66]" />,
        skills: [
            "Topic & Keyword research",
            "Resource search & Brand voice framing",
            "Links implementation & Schema markup",
            "SERP optimized writing",
            "Text & Image Generation",
            "Website CMS publishing",
            "Measurement & Optimization"
        ],
        description: "Aris is your search dominance engine. He doesn't just write; he architects content that outranks competitors and survives future AI search shifts."
    },
    {
        name: "Lyra",
        role: "Social Media Marketing",
        image: "/lyra.png",
        icon: <Megaphone className="h-10 w-10 text-blue-500" />,
        skills: [
            "Brand voice framing & Persona mapping",
            "Omnichannel planning & Post ideation",
            "Optimized post Copy & Image Generation",
            "Multi-platform Publishing (Meta, LinkedIn, X, Pinterest)",
            "Audience engagement monitoring",
            "Measurement & Optimization"
        ],
        description: "Lyra is your social growth engine. She manages your entire brand persona across platforms, ensuring consistent, high-engagement execution while you sleep."
    },
    {
        name: "Veda",
        role: "Brand Marketing & Intelligence",
        image: "/veda.png",
        icon: <Search className="h-10 w-10 text-purple-500" />,
        skills: [
            "Competitor tracking & Sentiment analysis",
            "Trends & News real-time alerts",
            "Content Gap & Opportunity Analysis",
            "Insights & Strategic Recommendations",
            "Contextual ideation hooks",
            "Fueling other Action Agents' creativity"
        ],
        description: "Veda is your intelligence hub. She monitors the market pulse 24/7, finding the opportunities your humans miss and preparing the field for the execution agents."
    },
    {
        name: "Kash",
        role: "Digital & Performance Marketing",
        image: "/kash.png",
        icon: <Target className="h-10 w-10 text-amber-500" />,
        skills: [
            "Category & Keyword research",
            "Budget Allocation insights",
            "Ad Group Composition & Structure",
            "Optimized Ad Copy & Image Generation",
            "Multi-channel Campaign Publishing",
            "Real-time bid management",
            "Measurement & ROAS Optimization"
        ],
        description: "Kash is your revenue accelerator. He manages your paid spend with cold, mathematical precision, rotating creatives and adjusting bids to maintain peak ROI."
    },
    {
        name: "Atlas",
        role: "Strategic Planning & Coordination",
        image: "/atlas.png",
        icon: <Workflow className="h-10 w-10 text-emerald-500" />,
        skills: [
            "Cross-agent collaboration management",
            "Workflow synchronization & bottleneck removal",
            "High-level strategic forecasting",
            "Team-wide resource allocation",
            "Integration health monitoring"
        ],
        description: "Atlas is the Chief of Staff. He ensures your digital workforce is perfectly synchronized, moving Veda's insights to Aris's execution and Kash's budget."
    }
];

const AgentsPage = () => {
    return (
        <div className="min-h-screen bg-mesh text-white font-sans selection:bg-[#00FF66]/30 selection:text-[#00FF66] overflow-x-hidden">
            <LandingNavbar />

            <main className="py-20 px-4 md:px-8 max-w-7xl mx-auto space-y-32">
                {/* === HERO === */}
                <section className="text-center space-y-8">
                    <div className="space-y-4 max-w-4xl mx-auto">
                        <p className="text-[#00FF66] font-semibold tracking-widest text-sm uppercase">The Digital Workforce</p>
                        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-tight">
                            A Powerhouse of Talent <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-blue-500">At Your Fingertips</span>
                        </h1>
                        <p className="text-gray-400 text-xl max-w-3xl mx-auto">
                            Welcome to the heart of Solo Spider – your personal team of AI marketing experts. Each member is a fusion of cutting-edge AI and deep industry knowledge, tailored to autonomously revolutionize your brand's presence.
                        </p>
                    </div>
                </section>

                {/* === AGENT GRID === */}
                <section className="space-y-20">
                    {AGENTS.map((agent, idx) => (
                        <div key={idx} className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}>
                            <div className="lg:w-1/2 space-y-8">
                                <div className="space-y-4">
                                    <div className="h-20 w-20 rounded-2xl glass-card flex items-center justify-center border border-white/10">
                                        {agent.icon}
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight uppercase italic">{agent.name}</h2>
                                    <p className="text-[#00FF66] font-bold tracking-widest text-sm uppercase">{agent.role}</p>
                                </div>
                                <p className="text-lg text-gray-400 leading-relaxed font-medium italic">"{agent.description}"</p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    {agent.skills.map((skill, sIdx) => (
                                        <div key={sIdx} className="flex items-center gap-3 glass-card p-4 rounded-xl border border-white/5">
                                            <div className="h-2 w-2 rounded-full bg-[#00FF66] shadow-[0_0_10px_#00FF66]"></div>
                                            <span className="text-xs font-bold text-gray-300">{skill}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8">
                                    <Button className="h-14 px-10 bg-white/5 text-white hover:bg-white/10 font-bold rounded-2xl border border-white/10 group">
                                        Get to Know {agent.name}
                                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>
                            </div>

                            <div className="lg:w-1/2 relative group">
                                <div className="absolute -inset-10 bg-gradient-to-r from-[#00FF66]/20 to-blue-500/20 rounded-full blur-[120px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <div className="relative glass-card aspect-square max-w-md mx-auto rounded-[60px] border border-white/10 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent z-10"></div>
                                    <img 
                                        src={agent.image} 
                                        alt={agent.name} 
                                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <div className="text-center space-y-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Binary className="h-12 w-12 text-white/40 animate-pulse mx-auto" />
                                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.5em]">Neural Link Established</p>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-10 left-10 p-6 glass-card border border-white/10 rounded-2xl w-2/3 z-20">
                                        <p className="text-[8px] text-[#00FF66] font-black uppercase tracking-widest mb-1">Authorization: Level 5</p>
                                        <p className="text-sm font-bold">{agent.name} v2.0</p>
                                        <p className="text-[10px] text-gray-500">Autonomous Deployment Ready</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* === TEAM PHILOSOPHY === */}
                <section className="glass-card p-16 rounded-[60px] text-center space-y-12 max-w-5xl mx-auto border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00FF66] to-transparent opacity-20"></div>
                    <div className="space-y-6 relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight">One Ecosystem. <br /> <span className="text-[#00FF66]">Zero Management.</span></h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Our agents don't work in silos. They share intelligence in real-time. When Maya finds a trend, Ted coordinates Jane to write the content and Daniel to scale the ad spend instantly.
                        </p>
                    </div>
                    <div className="flex justify-center relative z-10">
                        <Link to="/auth">
                            <Button className="bg-[#00FF66] text-black hover:bg-[#00CC52] font-black h-16 px-12 text-xl rounded-2xl shadow-xl shadow-[#00FF66]/20">
                                Deploy Your Team Today
                            </Button>
                        </Link>
                    </div>
                </section>

                {/* === CTA === */}
                <section className="text-center py-20">
                    <p className="text-gray-500 font-black uppercase tracking-[0.4em] text-xs">The Digital Workforce Platform</p>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default AgentsPage;
