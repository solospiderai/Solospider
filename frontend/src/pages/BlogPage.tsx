import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useReveal } from "@/hooks/useReveal";

const BlogPage = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-[1240px]">
          <div className="text-center mb-16 max-w-3xl mx-auto reveal">
            <div className="mono text-primary mb-4">— Blog</div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              The <span className="grad-text">Agentic</span> Future
            </h1>
            <p className="text-xl text-ink-2 max-w-2xl mx-auto">
              Insights, strategies, and thought leadership on replacing software with autonomous agents.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Featured Post */}
            <div className="md:col-span-2 lg:col-span-3 reveal">
              <div className="bg-white border border-line rounded-3xl overflow-hidden group hover:shadow-[0_24px_60px_-24px_rgba(14,12,26,0.1)] transition-all duration-300">
                <div className="grid md:grid-cols-2">
                  <div className="h-64 md:h-auto bg-gradient-to-br from-primary/10 to-pink/5 relative overflow-hidden border-b md:border-b-0 md:border-r border-line">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-primary/20 flex items-center justify-center relative bg-white shadow-sm">
                        <div className="absolute inset-0 rounded-full border border-primary/30 scale-110 animate-pulse-gentle" />
                        <span className="text-4xl">🤖</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-primary-soft text-primary rounded-full text-[11px] font-black uppercase tracking-widest">Featured</span>
                      <span className="text-ink-2 text-sm font-medium">October 24, 2026</span>
                    </div>
                    <h2 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight font-display text-ink">The Death of the Dashboard: Why UI is Becoming Obsolete</h2>
                    <p className="text-ink-2 mb-8 leading-relaxed text-[15px]">
                      For 20 years, SaaS companies have competed on who can build the prettiest dashboard. But what happens when agents do the work for you? You don't need a dashboard if you don't need to log in.
                    </p>
                    <Link to="#" className="flex items-center gap-2 text-ink font-bold group-hover:gap-3 group-hover:text-primary transition-all">
                      Read Article <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Standard Posts */}
            {[
              {
                title: "How an Agency Scaled from 10 to 100 Clients with Zero New Hires",
                category: "Case Study",
                color: "text-primary",
                bg: "bg-primary-soft",
                date: "October 18, 2026"
              },
              {
                title: "Prompt Engineering vs. Agentic Orchestration",
                category: "Engineering",
                color: "text-pink",
                bg: "bg-pink/10",
                date: "October 12, 2026"
              },
              {
                title: "The Economics of AI Labor: Calculating ROI on Co-Agents",
                category: "Strategy",
                color: "text-[#10b981]",
                bg: "bg-[#10b981]/10",
                date: "October 5, 2026"
              }
            ].map((post, i) => (
              <div key={i} className={`bg-white flex flex-col border border-line rounded-3xl p-6 group cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 reveal ${i === 0 ? 'd1' : i === 1 ? 'd2' : 'd3'}`}>
                <div className="h-48 rounded-2xl bg-bg-2 mb-6 relative overflow-hidden flex items-center justify-center border border-line group-hover:border-primary/20 transition-colors">
                   <span className="font-display font-black text-3xl text-ink/20 relative z-10 tracking-tighter">Solo Spider</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`px-2.5 py-1 ${post.bg} ${post.color} rounded-full text-[10px] font-black uppercase tracking-widest`}>{post.category}</span>
                  <span className="text-ink-2 text-xs font-medium">{post.date}</span>
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-primary text-ink transition-colors flex-grow leading-snug tracking-tight">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-ink-2 font-semibold group-hover:text-primary group-hover:gap-3 transition-all text-sm">
                  Read More <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default BlogPage;
