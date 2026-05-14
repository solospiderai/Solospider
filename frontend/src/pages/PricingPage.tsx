import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";

const PricingPage = () => {
  const [annual, setAnnual] = useState(true);
  useReveal();

  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-[1240px]">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <div className="mono text-primary mb-4">— Pricing</div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Hire <span className="grad-text">Autonomy.</span> Not a team.
            </h1>
            <p className="text-xl text-ink-2 mb-8">
              A fraction of the cost of a human employee. 10x the output. Zero onboarding time.
            </p>

            <div className="inline-flex items-center gap-2 p-1.5 bg-white border border-line rounded-full shadow-sm">
              <button 
                onClick={() => setAnnual(false)}
                className={`px-6 py-2 rounded-full font-medium transition-all ${!annual ? 'bg-primary text-white shadow-md' : 'text-ink-2 hover:text-ink'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setAnnual(true)}
                className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${annual ? 'bg-primary text-white shadow-md' : 'text-ink-2 hover:text-ink'}`}
              >
                Annually <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${annual ? 'bg-white/20 text-white' : 'bg-primary-soft text-primary'}`}>Save 20%</span>
              </button>
            </div>
          </div>          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Lite */}
            <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 flex flex-col gap-5 transition-all duration-250 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_26px_50px_-22px_rgba(144,37,242,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal relative">
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink">Lite Plan</h3>
              <p className="text-[14px] text-ink-2 mb-6 min-h-[48px]">For small brands wanting to get started with monitoring and content.</p>
              <div className="mb-4 flex items-baseline gap-2">
                <span className="font-display font-black text-[54px] leading-none tracking-tight text-ink">
                  {annual ? "$199" : "$249"}
                </span>
                <span className="text-[14px] font-medium text-muted tracking-normal font-sans">/mo</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-grow text-[14px] text-ink-2 border-t border-line pt-5">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>Track 150 prompts</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>ChatGPT, Gemini & Perplexity</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>8 action briefs / month</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>3 generated articles / month</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>Google Search Console (GSC) integration</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span className="font-medium text-primary">7-day free trial · cancel anytime</span></li>
              </ul>
              <Link to="/auth" className="btn btn-ghost w-full justify-center">Start Free Trial</Link>
            </div>

            {/* Pro (Highlighted) */}
            <div className="bg-gradient-to-b from-white to-primary-tint rounded-3xl p-8 lg:p-9 flex flex-col gap-5 transition-all duration-250 hover:-translate-y-1 shadow-[0_30px_60px_-22px_rgba(144,37,242,0.3)] reveal d1 relative md:-translate-y-4">
              <div className="absolute inset-0 rounded-3xl p-[1.5px] bg-grad [mask-image:linear-gradient(#fff_0_0)] [mask-composite:exclude] pointer-events-none"></div>
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white font-display font-extrabold text-[11px] tracking-widest uppercase px-3.5 py-1.5 rounded-lg z-10">Most Popular</span>
              
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink relative z-10">Pro Plan</h3>
              <p className="text-[14px] text-ink-2 mb-6 min-h-[48px] relative z-10">For growing brands that want to monitor and create optimized content.</p>
              <div className="mb-4 relative z-10 flex items-baseline gap-2">
                <span className="font-display font-black text-[54px] leading-none tracking-tight text-primary">
                  {annual ? "$399" : "$499"}
                </span>
                <span className="text-[14px] font-medium text-muted tracking-normal font-sans">/mo</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-grow text-[14px] text-ink-2 border-t border-line pt-5 relative z-10">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span className="font-semibold text-ink">Everything in Lite Plan</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>Track 300 prompts</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>18 action briefs / month</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>8 generated articles / month</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>Webflow & Framer CMS integration</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-primary shrink-0 mt-0.5" /><span>Personal onboarding call</span></li>
              </ul>
              <Link to="/auth" className="btn btn-grad w-full justify-center relative z-10">Start for Free</Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white border border-line rounded-3xl p-8 lg:p-9 flex flex-col gap-5 transition-all duration-250 hover:border-primary/30 hover:-translate-y-1 hover:shadow-[0_26px_50px_-22px_rgba(144,37,242,0.18)] shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)] reveal d2 relative">
              <h3 className="font-display text-[22px] font-bold tracking-tight text-ink">Enterprise</h3>
              <p className="text-[14px] text-ink-2 mb-6 min-h-[48px]">Full-service AI search optimization and content creation, done for you.</p>
              <div className="mb-4">
                <span className="font-display font-black text-[54px] leading-none tracking-tight text-ink">Custom</span>
              </div>
              <ul className="flex flex-col gap-3 mb-8 flex-grow text-[14px] text-ink-2 border-t border-line pt-5">
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-pink shrink-0 mt-0.5" /><span className="font-semibold text-ink">Everything in Pro Plan</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-pink shrink-0 mt-0.5" /><span>Human in the loop review</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-pink shrink-0 mt-0.5" /><span>Custom brand context & positioning</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-pink shrink-0 mt-0.5" /><span>AI Crawl & referral analytics dashboard</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-pink shrink-0 mt-0.5" /><span>Custom headless CMS integrations</span></li>
                <li className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] text-pink shrink-0 mt-0.5" /><span>Dedicated Slack support channel</span></li>
              </ul>
              <Link to="/contact" className="btn btn-ghost w-full justify-center flex items-center gap-2">Talk to Us <ArrowRight className="w-4 h-4" /></Link>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-32 max-w-5xl mx-auto reveal">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Features</h2>
              <p className="text-ink-2">A detailed breakdown of what's included in each plan.</p>
            </div>
            
            <div className="bg-white border border-line rounded-3xl overflow-hidden shadow-[0_14px_40px_-28px_rgba(14,12,26,0.1)]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-bg-2 border-b border-line">
                    <th className="py-5 px-6 text-ink-2 font-medium">Features</th>
                    <th className="py-5 px-6 text-ink font-bold text-center border-l border-line">Starter Free</th>
                    <th className="py-5 px-6 text-primary font-bold text-center border-l border-line bg-primary-tint">Pro Plan</th>
                    <th className="py-5 px-6 text-pink font-bold text-center border-l border-line">Enterprise Custom</th>
                  </tr>
                </thead>
                <tbody className="text-[14.5px] text-ink-2">
                  <tr className="border-b border-line">
                    <td className="py-4 px-6 font-medium text-ink">Projects</td>
                    <td className="py-4 px-6 text-center border-l border-line">1 Project</td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint font-bold text-primary">5 Projects</td>
                    <td className="py-4 px-6 text-center border-l border-line font-bold text-pink">Unlimited</td>
                  </tr>
                  <tr className="border-b border-line bg-bg-2">
                    <td className="py-4 px-6 font-medium text-ink">AI Blog Generation</td>
                    <td className="py-4 px-6 text-center border-l border-line">5 / month</td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint font-bold text-primary">Unlimited</td>
                    <td className="py-4 px-6 text-center border-l border-line font-bold text-pink">Unlimited</td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-4 px-6 font-medium text-ink">Social Media Posts</td>
                    <td className="py-4 px-6 text-center border-l border-line">5 / month</td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint font-bold text-primary">Unlimited</td>
                    <td className="py-4 px-6 text-center border-l border-line font-bold text-pink">Unlimited</td>
                  </tr>
                  <tr className="border-b border-line bg-bg-2">
                    <td className="py-4 px-6 font-medium text-ink">Site Audit & Scheduling</td>
                    <td className="py-4 px-6 text-center border-l border-line"><span className="text-primary font-bold">✓</span></td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint"><span className="text-primary font-bold">✓</span></td>
                    <td className="py-4 px-6 text-center border-l border-line"><span className="text-pink font-bold">✓</span></td>
                  </tr>
                  <tr className="border-b border-line">
                    <td className="py-4 px-6 font-medium text-ink">AEO & GEO Optimization</td>
                    <td className="py-4 px-6 text-center border-l border-line text-muted">—</td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint"><span className="text-primary font-bold">✓</span></td>
                    <td className="py-4 px-6 text-center border-l border-line"><span className="text-pink font-bold">✓</span></td>
                  </tr>
                  <tr className="border-b border-line bg-bg-2">
                    <td className="py-4 px-6 font-medium text-ink">Meta & Google Ads Optimization</td>
                    <td className="py-4 px-6 text-center border-l border-line text-muted">—</td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint text-muted">—</td>
                    <td className="py-4 px-6 text-center border-l border-line"><span className="text-pink font-bold">✓</span></td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 font-medium text-ink">Brand Analytics & Competitor Tracking</td>
                    <td className="py-4 px-6 text-center border-l border-line text-muted">—</td>
                    <td className="py-4 px-6 text-center border-l border-line bg-primary-tint text-muted">—</td>
                    <td className="py-4 px-6 text-center border-l border-line"><span className="text-pink font-bold">✓</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQs */}
          <div className="mt-32 max-w-3xl mx-auto reveal">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-ink-2">Everything you need to know about our billing and plans.</p>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">Which prompts should I monitor?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">You should monitor queries that your target audience asks when they are looking to buy or learn. For example: <em>"What is the best software for [niche]?"</em>, <em>"How do I solve [problem]?"</em>, or comparisons like <em>"Brand A vs Brand B"</em>. Solo Spider automatically scans search intent and recommends high-leverage prompts to track.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">How many prompts should I monitor?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">For small to medium businesses, starting with 50-150 prompts provides comprehensive coverage of your core products and solutions. Larger enterprises or sites with diverse product lines typically track 300+ prompts to capture competitor brand mentions and industry-wide topics.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">Will GEO content hurt my existing SEO?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">No, it does the opposite. Generative Engine Optimization is built on the same foundations as modern, high-quality SEO: helpfulness, clear information architecture, original research, and semantic richness. Optimizing for AI search engines naturally leads to higher rankings in traditional Google searches.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">What about third-party content and Reddit?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">AI models don't just read your website; they crawl Reddit, forums, and online media to form opinions. Solo Spider scans these platforms for discussions relevant to your business, highlights high-value opportunities, and helps you formulate community placements and media outreach pitches.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">How long until we see results?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">While traditional SEO can take 6+ months, AEO and GEO results often manifest much faster. Some search models update their knowledge base or crawl web sources in real-time. Most customers begin to see active AI search citations and referrals within 2 to 4 weeks of optimization.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">How can I track my changes and measure ROI?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">Solo Spider includes real-time brand citations tracking, detailed prompt fan-outs, and traffic integration (GSC and GA4). You can see exactly which page optimization led to a citation, and view the subsequent uptick in AI referral traffic over time.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white border border-line shadow-sm">
                <h4 className="text-lg font-bold mb-2 text-ink">What is the minimum contract duration?</h4>
                <p className="text-ink-2 leading-relaxed text-[15px]">Our monthly plans are entirely pay-as-you-go with no commitment; you can cancel or change plans at any time. Our annual plans require a 12-month commitment but offer an immediate 20% discount on your subscription.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default PricingPage;
