import { Link } from "react-router-dom";

export const MarketingFooter = () => {
  return (
    <footer className="bg-[#0e0c1a] border-t border-white/10 pt-20 pb-8 text-white/70 mt-auto">
      <div className="max-w-[1240px] mx-auto px-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-8 lg:gap-12 mb-16">
          <div className="flex flex-col gap-4">
            <Link to="/" className="mb-2">
              <img src="/assets/solospider-logo.png" alt="Solo Spider" className="h-[34px] w-auto block filter brightness-0 invert" />
            </Link>
            <p className="text-[14px] text-white/65 max-w-[320px] leading-[1.6]">
              Solo Spider — Replace Your Entire Digital Marketing Team With One Tool.
            </p>
          </div>

          <div>
            <h6 className="font-display text-[13px] font-bold text-white mb-[18px] tracking-[.02em] uppercase">Product</h6>
            <div className="flex flex-col gap-[11px] text-[14px]">
              <Link to="/features" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Features</Link>
              <Link to="/pricing" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Pricing</Link>
              <Link to="/changelog" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Changelog</Link>
              <Link to="/roadmap" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Roadmap</Link>
              <Link to="/seo-audit" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Free SEO Audit Tool</Link>
            </div>
          </div>

          <div>
            <h6 className="font-display text-[13px] font-bold text-white mb-[18px] tracking-[.02em] uppercase">Use Cases</h6>
            <div className="flex flex-col gap-[11px] text-[14px]">
              <Link to="/use-cases/agencies" className="text-white/65 hover:text-[#c5a3ff] transition-colors">For Digital Agencies</Link>
              <Link to="/use-cases/solo" className="text-white/65 hover:text-[#c5a3ff] transition-colors">For Solo Creators</Link>
              <Link to="/use-cases/freelancers" className="text-white/65 hover:text-[#c5a3ff] transition-colors">For Freelancers</Link>
              <Link to="/use-cases/d2c" className="text-white/65 hover:text-[#c5a3ff] transition-colors">For D2C Brands</Link>
              <Link to="/use-cases/saas" className="text-white/65 hover:text-[#c5a3ff] transition-colors">For SaaS Startups</Link>
            </div>
          </div>

          <div>
            <h6 className="font-display text-[13px] font-bold text-white mb-[18px] tracking-[.02em] uppercase">Resources</h6>
            <div className="flex flex-col gap-[11px] text-[14px]">
              <Link to="/blog" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Blog</Link>
              <Link to="/help" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Help Center</Link>
              <Link to="/docs" className="text-white/65 hover:text-[#c5a3ff] transition-colors">API Docs</Link>
              <Link to="/case-studies" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Case Studies</Link>
              <Link to="/glossary" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Glossary (AEO, GRO, SEO)</Link>
            </div>
          </div>

          <div>
            <h6 className="font-display text-[13px] font-bold text-white mb-[18px] tracking-[.02em] uppercase">Company</h6>
            <div className="flex flex-col gap-[11px] text-[14px]">
              <Link to="/about" className="text-white/65 hover:text-[#c5a3ff] transition-colors">About Us</Link>
              <Link to="/contact" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Contact</Link>
              <Link to="/privacy" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Terms of Service</Link>
              <Link to="/careers" className="text-white/65 hover:text-[#c5a3ff] transition-colors">Careers</Link>
            </div>
          </div>
        </div>

        <div className="flex justify-between flex-wrap gap-[14px] pt-[30px] border-t border-white/10 text-[13px] text-white/55">
          <span>© 2025 Solo Spider. All rights reserved.</span>
          <span>Made for marketers who'd rather be growing than managing tools.</span>
        </div>
      </div>
    </footer>
  );
};
