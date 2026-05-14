import { ReactNode } from "react";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "blue" | "purple" | "pink" | "green";
}

export const GlowCard = ({ children, className = "", glowColor = "blue" }: GlowCardProps) => {
  const glowVariants = {
    blue: "hover:shadow-[0_0_40px_-10px_rgba(0,240,255,0.3)] hover:border-neon-blue/40",
    purple: "hover:shadow-[0_0_40px_-10px_rgba(112,0,255,0.3)] hover:border-neon-purple/40",
    pink: "hover:shadow-[0_0_40px_-10px_rgba(255,0,229,0.3)] hover:border-neon-pink/40",
    green: "hover:shadow-[0_0_40px_-10px_rgba(0,255,102,0.3)] hover:border-[#00FF66]/40",
  };

  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-500 relative overflow-hidden group ${glowVariants[glowColor]} ${className}`}
    >
      {/* Subtle background glow effect on hover */}
      <div 
        className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none ${
          glowColor === "blue" ? "bg-neon-blue" :
          glowColor === "purple" ? "bg-neon-purple" :
          glowColor === "pink" ? "bg-neon-pink" :
          "bg-[#00FF66]"
        }`}
      />
      
      {/* Content wrapper to stay above the glow */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
