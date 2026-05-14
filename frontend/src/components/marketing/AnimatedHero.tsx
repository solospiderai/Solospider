import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, Shield, Zap, Sparkles } from "lucide-react";

export const AnimatedHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-brand-dark overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-blue/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-pink/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 80%)'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-neon-blue/30 mb-8 animate-slide-in">
            <span className="flex h-2 w-2 rounded-full bg-neon-blue animate-pulse"></span>
            <span className="text-sm font-medium text-neon-blue uppercase tracking-wider">Introducing Co-Agents 2.0</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-8 leading-[1.1] animate-slide-in" style={{ animationDelay: '100ms' }}>
            Meet Your Digital Marketing <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink">
              Co-Agents.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-in" style={{ animationDelay: '200ms' }}>
            A full-stack, high-autonomy AI marketing team. From strategy and planning to flawless execution, let our agents help you achieve unprecedented growth with zero manual effort.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 animate-slide-in" style={{ animationDelay: '300ms' }}>
            <Link to="/auth" className="w-full sm:w-auto">
              <button className="w-full group relative px-8 py-4 bg-white text-black font-bold text-lg rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.5)]">
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink opacity-0 group-hover:opacity-20 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>
            
            <Link to="/contact" className="w-full sm:w-auto">
              <button className="w-full group px-8 py-4 glass-card text-white font-bold text-lg rounded-full border border-white/20 transition-all hover:bg-white/10 active:scale-95 flex items-center justify-center gap-2">
                <PlayCircle className="w-5 h-5 text-neon-blue group-hover:scale-110 transition-transform" />
                Book Demo
              </button>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 pt-8 border-t border-white/10 animate-slide-in" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-2 text-gray-400">
              <Shield className="w-5 h-5 text-neon-purple" />
              <span className="font-medium">Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Zap className="w-5 h-5 text-neon-blue" />
              <span className="font-medium">10x Faster Execution</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-5 h-5 text-neon-pink" />
              <span className="font-medium">Zero Manual Work</span>
            </div>
          </div>
          
        </div>
      </div>
      
      {/* Decorative Floating Element */}
      <div className="absolute top-1/4 right-[10%] hidden lg:block animate-float" style={{ animationDelay: '0s' }}>
        <div className="glass-card p-4 rounded-2xl border-neon-blue/30 flex items-center gap-4 shadow-[0_0_30px_-5px_rgba(0,240,255,0.2)]">
          <div className="w-10 h-10 rounded-full bg-neon-blue/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-neon-blue" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Campaign Deployed</p>
            <p className="text-neon-blue text-xs">Autonomous Execution</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-1/4 left-[10%] hidden lg:block animate-float" style={{ animationDelay: '2s' }}>
        <div className="glass-card p-4 rounded-2xl border-neon-purple/30 flex items-center gap-4 shadow-[0_0_30px_-5px_rgba(112,0,255,0.2)]">
          <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-neon-purple" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Content Generated</p>
            <p className="text-neon-purple text-xs">SEO Optimized</p>
          </div>
        </div>
      </div>

    </section>
  );
};
