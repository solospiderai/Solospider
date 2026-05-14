import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Sparkles, Brain, Cpu, Globe2 } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const AboutPage = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-[1240px]">
          <div className="text-center max-w-4xl mx-auto mb-24 reveal">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-line shadow-sm mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
              <span className="text-[13px] font-bold text-primary uppercase tracking-wider font-display">Our Mission</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              We are replacing the <span className="grad-text">software</span> with the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink to-[#b45309]">worker.</span>
            </h1>
            <p className="text-xl md:text-2xl text-ink-2 leading-relaxed">
              Software used to make human workers faster. Now, software is the worker. Our vision is to build an autonomous execution layer for every business on earth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-32 max-w-5xl mx-auto reveal d1">
            <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 flex flex-col transition-all duration-250 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(144,37,242,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
              <Brain className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Intelligence First</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">We don't build dumb if/then workflows. We build intelligent agents that can reason, solve problems, and adapt to edge cases.</p>
            </div>
            
            <div className="bg-gradient-to-b from-white to-primary-tint border border-line rounded-3xl p-8 lg:p-9 flex flex-col transition-all duration-250 hover:-translate-y-1 shadow-[0_30px_60px_-22px_rgba(144,37,242,0.3)] md:-translate-y-6">
              <Cpu className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Autonomous Execution</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">Assistants wait for your command. Co-Agents proactively identify work, execute it, and report back the results.</p>
            </div>

            <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 flex flex-col transition-all duration-250 hover:border-pink/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(236,72,153,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
              <Globe2 className="w-10 h-10 text-pink mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Infinite Scale</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">By removing the human bottleneck in operations, we enable companies of any size to operate with the throughput of an enterprise.</p>
            </div>
          </div>

          <div className="max-w-4xl mx-auto p-[1.5px] rounded-[2.5rem] bg-grad relative reveal d2">
            <div className="absolute top-0 right-10 w-32 h-32 bg-primary/20 blur-[50px] rounded-full pointer-events-none" />
            <div className="p-10 md:p-16 rounded-[2.4rem] bg-white text-center shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-8" />
              <h2 className="font-display text-4xl font-black mb-6 tracking-tight text-ink">The Future is Autonomous</h2>
              <p className="text-xl text-ink-2 mb-10 max-w-2xl mx-auto leading-relaxed">
                "In 5 years, the most successful companies won't be the ones with the largest headcount. They will be the ones with the smartest orchestration of AI agents."
              </p>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default AboutPage;
