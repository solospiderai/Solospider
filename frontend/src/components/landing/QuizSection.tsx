import { Button } from "@/components/ui/button";
import { Timer, ArrowRight, HelpCircle } from "lucide-react";

export const QuizSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="max-w-5xl mx-auto rounded-[40px] border border-white/5 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden group">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#00FF66]/10 blur-[120px] rounded-full group-hover:bg-[#00FF66]/20 transition-all duration-1000" />
          
          <div className="flex-1 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-[#00FF66]">
              <Timer className="h-4 w-4" />
              90-Second Assessment
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              Not Sure If AI Is Right for Your Business?
            </h2>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Take our quick quiz to see if Solo Spider fits your goals, your workflow, and your team structure — no matter the size or industry.
            </p>

            <Button size="lg" className="h-16 px-10 text-xl bg-[#00FF66] text-black hover:bg-[#00CC52] font-black rounded-2xl shadow-xl shadow-[#00FF66]/20 transition-all hover:scale-105 active:scale-95 group">
              Take our quiz
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="w-full md:w-1/3 relative z-10 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#00FF66] blur-[60px] opacity-20 animate-pulse" />
              <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-[#00FF66]/30 flex items-center justify-center bg-black/40 backdrop-blur-xl">
                <HelpCircle className="h-24 w-24 md:h-32 md:h-32 text-[#00FF66] opacity-80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
