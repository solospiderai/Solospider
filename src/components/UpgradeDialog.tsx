import { Link } from "react-router-dom";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UpgradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  featureTitle: string;
  featureDesc?: string;
}

export function UpgradeDialog({
  isOpen,
  onOpenChange,
  featureTitle,
  featureDesc = "Unlock enterprise-grade visibility tracking, automated competitive intelligence, and daily search engine optimizations.",
}: UpgradeDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md border-0 bg-slate-900 text-white overflow-hidden p-0 rounded-3xl shadow-2xl">
        {/* Glowing Top Radial Gradient */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary/30 to-transparent pointer-events-none" />

        <div className="relative p-8 flex flex-col items-center text-center space-y-6">
          {/* Animated Glowing Lock Circle */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary to-purple-500 rounded-full blur-lg opacity-50 animate-pulse" />
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-slate-800/80 border border-white/10 text-primary flex items-center justify-center shadow-lg">
              <Lock className="h-7 w-7 text-[#c5a3ff]" />
            </div>
          </div>

          <div className="space-y-2 relative z-10">
            <DialogTitle className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-bounce" />
              Pro Feature
            </DialogTitle>
            <DialogDescription className="text-slate-300 text-[15px] leading-relaxed">
              <span className="font-bold text-[#c5a3ff]">{featureTitle}</span> is available on our Pro & Enterprise plans.
            </DialogDescription>
          </div>

          {/* Value Prop Points */}
          <div className="w-full bg-slate-800/40 rounded-2xl p-4 border border-white/5 text-left space-y-3">
            <div className="flex items-start gap-2 text-sm text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>{featureDesc}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-slate-200">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Access to advanced SEO keywords & bulk-generation tools</span>
            </div>
          </div>

          <div className="w-full pt-2 flex flex-col gap-3 relative z-10">
            <Button asChild size="lg" className="w-full font-bold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-0">
              <Link to="/pricing" className="flex items-center justify-center gap-2">
                View Plans & Pricing
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-white hover:bg-white/5 font-semibold rounded-xl">
              Maybe Later
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
