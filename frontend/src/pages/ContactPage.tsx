import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Mail, MessageSquare, Phone } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const ContactPage = () => {
  useReveal();
  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink/5 blur-[150px] rounded-full pointer-events-none -translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 max-w-[1240px] relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 reveal">
              <div className="mono text-primary mb-4">— Contact</div>
              <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
                Let's talk <span className="grad-text">Execution.</span>
              </h1>
              <p className="text-xl text-ink-2 max-w-2xl mx-auto">
                Ready to replace manual workflows with autonomous agents? Book a demo or reach out to our team.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
              {/* Contact Info */}
              <div className="space-y-6 reveal d1">
                <div className="bg-white border border-line rounded-3xl p-6 flex items-start gap-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-[20px] font-bold tracking-tight text-ink mb-2">Sales Demo</h3>
                    <p className="text-[14.5px] text-ink-2 leading-relaxed mb-3">See how Co-Agents can specifically solve your operational bottlenecks.</p>
                    <a href="mailto:sales@coagent.ai" className="text-primary hover:text-ink transition-colors font-semibold">sales@coagent.ai</a>
                  </div>
                </div>

                <div className="bg-white border border-line rounded-3xl p-6 flex items-start gap-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-[20px] font-bold tracking-tight text-ink mb-2">Support</h3>
                    <p className="text-[14.5px] text-ink-2 leading-relaxed mb-3">Already a customer? Our dedicated success team is here to help you scale.</p>
                    <a href="mailto:support@coagent.ai" className="text-primary hover:text-ink transition-colors font-semibold">support@coagent.ai</a>
                  </div>
                </div>

                <div className="bg-white border border-line rounded-3xl p-6 flex items-start gap-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-pink/10 flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-pink" />
                  </div>
                  <div>
                    <h3 className="font-display text-[20px] font-bold tracking-tight text-ink mb-2">Enterprise Inquiries</h3>
                    <p className="text-[14.5px] text-ink-2 leading-relaxed mb-3">Looking for custom deployments, on-prem solutions, or high-volume execution?</p>
                    <a href="#" className="text-pink hover:text-ink transition-colors font-semibold">Book Enterprise Consultation &rarr;</a>
                  </div>
                </div>
              </div>

              {/* Contact Form / Calendly Placeholder */}
              <div className="bg-white rounded-3xl p-8 lg:p-10 border border-line shadow-[0_24px_60px_-24px_rgba(14,12,26,0.1)] relative reveal d2">
                <h3 className="font-display text-[24px] font-bold tracking-tight text-ink mb-8">Send us a message</h3>
                
                <form className="relative z-10 space-y-5">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">First Name</label>
                      <input type="text" className="w-full bg-bg-2 border border-line rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="John" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">Last Name</label>
                      <input type="text" className="w-full bg-bg-2 border border-line rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">Work Email</label>
                    <input type="email" className="w-full bg-bg-2 border border-line rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="john@company.com" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-ink-2 uppercase tracking-wide">How can we help?</label>
                    <textarea rows={4} className="w-full bg-bg-2 border border-line rounded-xl px-4 py-3.5 text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none" placeholder="Tell us about your current workflow..." />
                  </div>

                  <button type="button" className="btn btn-grad w-full justify-center mt-2 text-[15px] py-4">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default ContactPage;
