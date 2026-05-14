import { LucideIcon, Clock } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

export function ComingSoonPage({ title, description, icon: Icon, features }: ComingSoonPageProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[600px] text-center space-y-10">
      <div className="relative">
        <div className="h-32 w-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center premium-shadow border border-primary/20 animate-pulse">
            {Icon ? <Icon className="h-12 w-12 text-primary" /> : <Clock className="h-12 w-12 text-primary" />}
        </div>
        <div className="absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-bg border border-line flex items-center justify-center shadow-xl">
            <Sparkles className="h-6 w-6 text-primary" />
        </div>
      </div>

      <div className="space-y-4">
        <span className="px-6 py-2 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] border border-primary/20">
            Neural Roadmap Active
        </span>
        <h1 className="text-5xl font-black text-ink tracking-tighter">{title}</h1>
        <p className="text-slate-600 text-sm font-bold uppercase tracking-widest max-w-md mx-auto leading-relaxed">
            {description}
        </p>
      </div>

      {features && features.length > 0 && (
        <div className="w-full glass rounded-[3rem] p-10 text-left space-y-8 shadow-2xl shadow-primary/5">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] opacity-70">Neural Architecture Pipeline</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-4 text-xs font-black text-ink uppercase tracking-widest">
                <div className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(144,37,242,0.6)]" />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <Loader2 className="h-4 w-4 animate-spin text-primary" /> Calibrating Production Environment
      </div>
    </div>
  );
}
