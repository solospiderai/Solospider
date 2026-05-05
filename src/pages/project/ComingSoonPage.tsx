import { LucideIcon, Clock } from "lucide-react";

interface ComingSoonPageProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

export function ComingSoonPage({ title, description, icon: Icon, features }: ComingSoonPageProps) {
  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[500px] text-center">
      <div className="h-20 w-20 rounded-[24px] bg-primary/10 flex items-center justify-center mb-6 premium-shadow border border-primary/20">
        {Icon ? <Icon className="h-10 w-10 text-primary" /> : <Clock className="h-10 w-10 text-primary" />}
      </div>
      <span className="px-4 py-1.5 rounded-full bg-pink/10 text-pink text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-pink/20">
        Coming Soon
      </span>
      <h1 className="text-3xl font-bold mb-3">{title}</h1>
      <p className="text-muted-foreground text-base leading-relaxed mb-8">{description}</p>
      {features && features.length > 0 && (
        <div className="w-full glass rounded-3xl p-8 text-left space-y-4">
          <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] mb-4 opacity-70">Planned Features</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm font-medium text-ink">
                <span className="h-2 w-2 rounded-full bg-primary" />
                {f}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
