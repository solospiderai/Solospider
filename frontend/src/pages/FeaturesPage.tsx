import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Bot, Network, Workflow, Zap, Database, MessageSquare } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const FeaturesPage = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-[1240px]">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal">
            <div className="mono text-primary mb-4">— Features</div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Features that <span className="grad-text">execute.</span>
            </h1>
            <p className="text-xl text-ink-2">
              Stop looking for software that makes your team 10% more efficient. Look for tools that replace the work entirely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-line rounded-3xl p-8 flex flex-col transition-all duration-250 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(144,37,242,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal">
              <Database className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Autonomous CRM</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">
                Your CRM updates itself. Agents listen to calls, read emails, and automatically log notes, update deal stages, and score leads.
              </p>
            </div>

            <div className="bg-white border border-line rounded-3xl p-8 flex flex-col transition-all duration-250 hover:border-pink/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(236,72,153,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal d1">
              <MessageSquare className="w-10 h-10 text-pink mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Omnichannel Outreach</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">
                Email, LinkedIn, WhatsApp, and SMS—handled simultaneously. Agents nurture leads across platforms with context-aware responses.
              </p>
            </div>

            <div className="bg-white border border-line rounded-3xl p-8 flex flex-col transition-all duration-250 hover:border-[#b45309]/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(180,83,9,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal d2">
              <Workflow className="w-10 h-10 text-[#b45309] mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Self-Healing Workflows</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">
                If an integration breaks, it's a nightmare. If our workflow hits an error, it problem-solves and finds an alternative route.
              </p>
            </div>

            <div className="bg-white border border-line rounded-3xl p-8 flex flex-col transition-all duration-250 hover:border-[#10b981]/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(16,185,129,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal">
              <Zap className="w-10 h-10 text-[#10b981] mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Real-time Execution</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">
                Inbound lead hits the form? Within 30 seconds, they've been researched, scored, and texted by our system to book a call.
              </p>
            </div>

            <div className="bg-white border border-line rounded-3xl p-8 flex flex-col transition-all duration-250 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(144,37,242,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal d1">
              <Network className="w-10 h-10 text-primary mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Cross-Channel Memory</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">
                The Marketing pipeline learns what messaging works and instantly updates the outbound playbook. A unified intelligence.
              </p>
            </div>

            <div className="bg-white border border-line rounded-3xl p-8 flex flex-col transition-all duration-250 hover:border-pink/30 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(236,72,153,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal d2">
              <Bot className="w-10 h-10 text-pink mb-6" />
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink mb-3">Custom Builders</h3>
              <p className="text-[14.5px] text-ink-2 leading-relaxed">
                Need a setup specifically for managing your unique supply chain? Train a new assistant in hours using natural language.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default FeaturesPage;
