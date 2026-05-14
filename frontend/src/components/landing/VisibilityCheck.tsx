import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight } from "lucide-react";

export const VisibilityCheck = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-black/50">
      <div className="absolute inset-0 bg-[#00FF66]/5 blur-[120px] -z-10" />
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-4xl mx-auto glass-card p-12 rounded-[40px] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Sparkles className="h-24 w-24 text-[#00FF66]" />
          </div>
          
          <div className="relative z-10 space-y-8 text-center md:text-left">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                Check your brand's <br />
                <span className="text-[#00FF66]">AI Visibility</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Enter your domain to see how often your brand is cited in ChatGPT, Gemini, and Perplexity search results.
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
              <div className="flex-1 relative">
                <Input 
                  placeholder="yourcompany.com" 
                  className="h-16 px-6 bg-white/5 border-white/10 rounded-2xl text-lg focus:ring-[#00FF66]/50 focus:border-[#00FF66]/50"
                />
              </div>
              <Button className="h-16 px-10 bg-[#00FF66] text-black hover:bg-[#00CC52] font-black text-lg rounded-2xl shadow-xl shadow-[#00FF66]/20 transition-all hover:scale-105">
                Run AI Audit
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">
              Trusted by marketing teams at Jerry.ai, Wemolo, and more.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
