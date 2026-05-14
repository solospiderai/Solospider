import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Briefcase, Building2, Rocket } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const UseCasesPage = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-[1240px]">
          <div className="text-center max-w-3xl mx-auto mb-20 reveal">
            <div className="mono text-primary mb-4">— Use Cases</div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Built for <span className="grad-text">Scale.</span>
            </h1>
            <p className="text-xl text-ink-2">
              See how different industries are using Solo Spider to replace headcount and scale infinitely.
            </p>
          </div>

          <div className="flex flex-col gap-12 max-w-5xl mx-auto">
            {/* Agencies */}
            <div className="grid md:grid-cols-2 gap-8 items-center reveal">
              <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 order-2 md:order-1 shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-primary font-bold mb-2 tracking-wide font-display">The Problem</h4>
                    <p className="text-ink-2 leading-relaxed text-[15px]">High client churn due to slow execution. Scaling means hiring more account managers, cutting into margins.</p>
                  </div>
                  <div>
                    <h4 className="text-pink font-bold mb-2 tracking-wide font-display">The Solution</h4>
                    <p className="text-ink-2 leading-relaxed text-[15px]">Deploy dedicated AI marketing functions for each client. Automate reporting, social posting, and ad optimizations.</p>
                  </div>
                  <div className="pt-4 border-t border-line">
                    <h4 className="text-[#10b981] font-bold mb-2 tracking-wide font-display">The Result</h4>
                    <p className="text-3xl font-black tracking-tight text-ink">85% Higher Margin</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 px-4 md:px-12">
                <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center mb-6">
                  <Briefcase className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">Marketing Agencies</h2>
                <p className="text-xl text-ink-2 leading-relaxed">Transform your agency into an AI-powered powerhouse. Take on 10x more clients without hiring a single new account manager.</p>
              </div>
            </div>

            {/* SaaS Startups */}
            <div className="grid md:grid-cols-2 gap-8 items-center reveal d1">
              <div className="px-4 md:px-12">
                <div className="w-16 h-16 bg-pink/10 rounded-2xl flex items-center justify-center mb-6">
                  <Rocket className="w-8 h-8 text-pink" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">SaaS Startups</h2>
                <p className="text-xl text-ink-2 leading-relaxed">Don't waste funding on massive marketing teams. Let our AI handle inbound and outbound content at a fraction of the cost.</p>
              </div>
              <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-primary font-bold mb-2 tracking-wide font-display">The Problem</h4>
                    <p className="text-ink-2 leading-relaxed text-[15px]">Burning runway on marketing hires that take 3 months to ramp up and quit after 6 months.</p>
                  </div>
                  <div>
                    <h4 className="text-pink font-bold mb-2 tracking-wide font-display">The Solution</h4>
                    <p className="text-ink-2 leading-relaxed text-[15px]">Instantly deploy AI marketing functions trained on your brand guidelines. They generate content 24/7 and drive traffic for your founders.</p>
                  </div>
                  <div className="pt-4 border-t border-line">
                    <h4 className="text-[#10b981] font-bold mb-2 tracking-wide font-display">The Result</h4>
                    <p className="text-3xl font-black tracking-tight text-ink">3x Traffic Velocity</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enterprise-lite */}
            <div className="grid md:grid-cols-2 gap-8 items-center reveal d2">
              <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 order-2 md:order-1 shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-primary font-bold mb-2 tracking-wide font-display">The Problem</h4>
                    <p className="text-ink-2 leading-relaxed text-[15px]">Siloed data across HubSpot, Google Analytics, ad platforms, and internal tools creating massive operational drag.</p>
                  </div>
                  <div>
                    <h4 className="text-pink font-bold mb-2 tracking-wide font-display">The Solution</h4>
                    <p className="text-ink-2 leading-relaxed text-[15px]">AI acts as the central nervous system, identifying discrepancies, optimizing ad spend, and alerting on anomalies.</p>
                  </div>
                  <div className="pt-4 border-t border-line">
                    <h4 className="text-[#10b981] font-bold mb-2 tracking-wide font-display">The Result</h4>
                    <p className="text-3xl font-black tracking-tight text-ink">Zero Data Drift</p>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 px-4 md:px-12">
                <div className="w-16 h-16 bg-[#b45309]/10 rounded-2xl flex items-center justify-center mb-6">
                  <Building2 className="w-8 h-8 text-[#b45309]" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tight">Enterprise-Lite</h2>
                <p className="text-xl text-ink-2 leading-relaxed">Connect the dots in your tech stack. Automated SEO and Analytics ensure your marketing data is perfect so leadership can make real decisions.</p>
              </div>
            </div>

          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default UseCasesPage;
