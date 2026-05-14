import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export const MarketingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-bg/85 backdrop-blur-md border-b border-line shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/" className="flex items-center gap-2.5 font-display font-extrabold text-[20px] tracking-tight">
            <img src="/assets/solospider-logo.png" alt="Solo Spider" className="h-[34px] w-auto block" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-[14px] text-ink font-semibold">
            <Link to="/#features" className="hover:text-primary transition-colors">
              Features
            </Link>
            <Link to="/#audience" className="hover:text-primary transition-colors">
              Who It's For
            </Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link to="/blog" className="hover:text-primary transition-colors">
              Blog
            </Link>
            <Link to="/seo-audit" className="hover:text-primary transition-colors">
              SEO Audit
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-[14px]">
            <Link to="/auth" className="text-[14px] text-ink font-extrabold hover:text-primary transition-colors">
              Log in
            </Link>
            <Link to="/auth" className="btn btn-grad px-6 py-2.5 h-auto text-xs">
              Start Free →
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-ink-2 hover:text-primary p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-bg border-b border-line py-6 px-4 flex flex-col gap-4 shadow-2xl animate-in slide-in-from-top-2">
            <Link to="/#features" className="text-lg text-ink-2 py-2 border-b border-line" onClick={() => setMobileMenuOpen(false)}>
              Features
            </Link>
            <Link to="/#audience" className="text-lg text-ink-2 py-2 border-b border-line" onClick={() => setMobileMenuOpen(false)}>
              Who It's For
            </Link>
            <Link to="/pricing" className="text-lg text-ink-2 py-2 border-b border-line" onClick={() => setMobileMenuOpen(false)}>
              Pricing
            </Link>
            <Link to="/blog" className="text-lg text-ink-2 py-2 border-b border-line" onClick={() => setMobileMenuOpen(false)}>
              Blog
            </Link>
            <Link to="/seo-audit" className="text-lg text-ink-2 py-2 border-b border-line" onClick={() => setMobileMenuOpen(false)}>
              SEO Audit
            </Link>
            <div className="flex flex-col gap-3 mt-4">

              <Link to="/auth" className="w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full py-3 rounded-xl border border-line text-ink-2 font-medium hover:bg-bg-2">
                  Log in
                </button>
              </Link>
              <Link to="/auth" className="w-full text-center" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full btn btn-grad justify-center">
                  Start Free →
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
