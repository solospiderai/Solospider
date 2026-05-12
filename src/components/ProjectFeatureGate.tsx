import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjects } from "@/hooks/useProjects";
import { FeatureKey, getEffectivePlan, hasFeatureAccess } from "@/lib/featureAccess";

export function ProjectFeatureGate({
  feature,
  title,
  children,
}: {
  feature: FeatureKey;
  title: string;
  children: ReactNode;
}) {
  const { currentPlan } = useProjects();
  const effectivePlan = getEffectivePlan(currentPlan);

  if (hasFeatureAccess(effectivePlan, feature)) return <>{children}</>;

  return (
    <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl border border-line bg-card/30">
      {/* Blurred Preview of the content */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none blur-[6px] opacity-40 transition-all duration-300">
        <div className="pointer-events-none select-none">{children}</div>
      </div>
      
      {/* Premium Upgrade Card */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-background/40 backdrop-blur-sm">
        <div className="max-w-md w-full relative group">
          {/* Glowing background effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative border border-primary/20 rounded-2xl p-8 bg-background shadow-2xl text-center space-y-6 overflow-hidden">
            {/* Top right decoration */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary flex items-center justify-center shadow-inner border border-primary/20">
              <Lock className="h-7 w-7" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h2 className="text-3xl font-black tracking-tight text-ink">
                Upgrade Required
              </h2>
              <p className="text-ink-2 text-[15px] leading-relaxed">
                <span className="font-bold text-primary">{title}</span> is available on the Pro plan. 
                Upgrade your workspace to unlock this module.
              </p>
            </div>
            
            <div className="pt-2 relative z-10">
              <Button asChild size="lg" className="w-full font-semibold rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-primary/25 border-0">
                <Link to="/pricing" className="flex items-center gap-2">
                  View Pricing
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
