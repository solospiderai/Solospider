import { useState } from "react";
import { GlowCard } from "./GlowCard";
import { BarChart3, MessageSquare, Target, Zap, CheckCircle2 } from "lucide-react";

type AgentType = "content" | "social" | "ads" | "seo";

export const AgentShowcase = () => {
  const [activeAgent, setActiveAgent] = useState<AgentType>("content");

  const agents = {
    content: {
      title: "Content Generation",
      icon: <Target className="w-6 h-6 text-neon-pink" />,
      color: "pink",
      description: "Autonomously researches, writes, and deploys high-converting content across all your channels.",
      capabilities: [
        "SEO-optimized blog posts",
        "Landing page copy generation",
        "Email newsletter sequences",
        "Competitor content analysis"
      ],
      stats: { metric: "+340%", label: "Content Output" }
    },
    social: {
      title: "Social Media Management",
      icon: <Zap className="w-6 h-6 text-neon-blue" />,
      color: "blue",
      description: "Manages your social presence 24/7, handles engagement, and schedules posts for maximum reach.",
      capabilities: [
        "Multi-platform post scheduling",
        "Automated engagement replies",
        "Trend monitoring & newsjacking",
        "Audience sentiment analysis"
      ],
      stats: { metric: "5x", label: "Engagement Rate" }
    },
    ads: {
      title: "Performance Ads",
      icon: <MessageSquare className="w-6 h-6 text-neon-purple" />,
      color: "purple",
      description: "Optimizes your ad spend continuously. Creates variations, tests copy, and allocates budget to winning campaigns.",
      capabilities: [
        "Automated A/B testing",
        "Dynamic bid adjustments",
        "Ad creative generation",
        "ROAS tracking & reporting"
      ],
      stats: { metric: "-40%", label: "Cost Per Acquisition" }
    },
    seo: {
      title: "SEO Optimization",
      icon: <BarChart3 className="w-6 h-6 text-[#00FF66]" />,
      color: "green",
      description: "Connects the dots in your search strategy. Monitors rankings, fixes technical issues, and builds internal links.",
      capabilities: [
        "Keyword gap analysis",
        "Automated internal linking",
        "Technical SEO auditing",
        "Search intent mapping"
      ],
      stats: { metric: "100%", label: "Technical Health" }
    }
  };

  const currentInfo = agents[activeAgent];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-30 pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">
            Meet Your New <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple">A-Team</span>
          </h2>
          <p className="text-lg text-gray-400">
            They don't take vacations, they don't get tired, and they execute faster than any human team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Agent Selection List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {(Object.entries(agents) as [AgentType, typeof agents[AgentType]][]).map(([key, agent]) => (
              <button
                key={key}
                onClick={() => setActiveAgent(key)}
                className={`text-left w-full transition-all duration-300 ${
                  activeAgent === key ? "scale-105" : "opacity-60 hover:opacity-100"
                }`}
              >
                <GlowCard 
                  glowColor={agent.color as any} 
                  className={`p-5 flex items-center gap-4 ${activeAgent === key ? `border-neon-${agent.color}/50 bg-white/10` : 'bg-transparent border-transparent'}`}
                >
                  <div className={`p-3 rounded-xl bg-white/5`}>
                    {agent.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{agent.title}</h3>
                  </div>
                </GlowCard>
              </button>
            ))}
          </div>

          {/* Active Agent Details */}
          <div className="lg:col-span-7">
            <GlowCard glowColor={currentInfo.color as any} className="min-h-[400px] flex flex-col justify-between border-white/20 p-8 md:p-10">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    {currentInfo.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white">{currentInfo.title}</h3>
                </div>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  {currentInfo.description}
                </p>

                <div className="grid sm:grid-cols-2 gap-4 mb-10">
                  {currentInfo.capabilities.map((cap, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-neon-blue shrink-0 mt-0.5" />
                      <span className="text-gray-300 text-sm md:text-base">{cap}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center gap-6">
                <div className="flex flex-col">
                  <span className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-${currentInfo.color} to-white`}>
                    {currentInfo.stats.metric}
                  </span>
                  <span className="text-sm text-gray-400 mt-1 uppercase tracking-wider font-semibold">
                    {currentInfo.stats.label}
                  </span>
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </div>
    </section>
  );
};
