import { Search, PenTool, Share2, BarChart3 } from "lucide-react";

export const ProcessSection = () => {
  const steps = [
    {
      id: "01",
      title: "Identify",
      description: "which content drives your AI visibility. Identify the top-cited content by domain type and URL.",
      icon: <Search className="h-6 w-6 text-[#00FF66]" />,
      gradient: "from-[#00FF66]/20 to-transparent",
    },
    {
      id: "02",
      title: "Create",
      description: "on-brand articles optimized for AI. Based on research of top-cited pages and grounding.",
      icon: <PenTool className="h-6 w-6 text-blue-500" />,
      gradient: "from-blue-500/20 to-transparent",
    },
    {
      id: "03",
      title: "Deploy",
      description: "into the outlets that matter. Automated CMS integrations for Webflow, Framer and WordPress.",
      icon: <Share2 className="h-6 w-6 text-purple-500" />,
      gradient: "from-purple-500/20 to-transparent",
    },
    {
      id: "04",
      title: "Track",
      description: "your visibility and citations over time. See how your brand positioning evolves in AI search.",
      icon: <BarChart3 className="h-6 w-6 text-orange-500" />,
      gradient: "from-orange-500/20 to-transparent",
    },
  ];

  return (
    <section id="process" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-[#00FF66] font-bold tracking-widest text-sm uppercase">Strategic Partnership</h2>
          <h3 className="text-4xl md:text-5xl font-black tracking-tight">
            How <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-blue-500">Solo Spider</span> Works
          </h3>
          <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
            Solo Spider is more than a tool; it’s your strategic partner. Powered by a proprietary marketing LLM and autonomous AI agents, it integrates seamlessly into your workflow to boost precision, efficiency, and impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <div 
              key={i} 
              className="group relative p-8 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-black/50 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                    {step.icon}
                  </div>
                  <span className="text-4xl font-black text-white/5 group-hover:text-[#00FF66]/20 transition-colors duration-500">
                    {step.id}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-white group-hover:text-[#00FF66] transition-colors">
                    {step.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
