import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, MessageSquare } from "lucide-react";

export const DemoSection = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-black">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-[#00FF66] font-bold tracking-widest text-sm uppercase">Personalized Walkthrough</h2>
              <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                Want a Personalized <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF66] to-blue-500">Walkthrough?</span>
              </h3>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                See how Solo Spider can fit your exact needs with a 1:1 live demo. No obligations, just results.
              </p>
            </div>

            <div className="space-y-4">
              {[
                "Tailored to your business goals",
                "Ask anything, see everything in action",
                "Leave with a ready-to-go action plan"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-[#00FF66]" />
                  <span className="text-lg font-medium text-gray-300">{item}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="h-20 px-12 text-2xl bg-[#00FF66] text-black hover:bg-[#00CC52] font-black rounded-[32px] shadow-2xl shadow-[#00FF66]/30 transition-all hover:scale-105 group">
              <Calendar className="mr-3 h-7 w-7" />
              Book A Free Demo
            </Button>
          </div>

          <div className="relative">
            {/* Fake Video/Demo Player */}
            <div className="relative rounded-[40px] border border-white/10 bg-white/5 backdrop-blur-3xl overflow-hidden aspect-video shadow-2xl group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#00FF66]/10 to-transparent opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#00FF66] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-black border-b-[10px] border-b-transparent ml-1" />
                </div>
              </div>
              
              {/* Fake UI Overlays */}
              <div className="absolute bottom-6 left-6 right-6 p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="h-3 w-32 bg-white/40 rounded-full mb-2" />
                    <div className="h-2 w-20 bg-white/20 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#00FF66]/20 blur-[80px] rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};
