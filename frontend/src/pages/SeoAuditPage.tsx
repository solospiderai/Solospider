import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MarketingNavbar } from "@/components/marketing/MarketingNavbar";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { useReveal } from "@/hooks/useReveal";

const SeoAuditPage = () => {
  useReveal();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl;
    }
    
    sessionStorage.setItem("pendingSeoAuditUrl", formattedUrl);
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-bg-2 text-ink">
      <MarketingNavbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-[1240px]">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <div className="mono text-primary mb-4">— SEO Audit</div>
            <h1 className="text-5xl md:text-6xl font-black mb-6 leading-tight">
              Analyze Your <span className="grad-text">Site.</span>
            </h1>
            <p className="text-xl text-ink-2 max-w-2xl mx-auto mb-10">
              Get a comprehensive AI-powered SEO audit to identify ranking opportunities and technical issues.
            </p>
            
            <div className="bg-white rounded-3xl p-8 max-w-2xl mx-auto border border-line shadow-sm">
              <h3 className="font-display text-[20px] font-bold tracking-tight text-ink mb-6">Enter Your URL to Start</h3>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://yourwebsite.com" 
                  className="w-full bg-bg-2 border border-line rounded-xl px-4 py-4 text-ink focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  required
                />
                <button type="submit" className="btn btn-grad w-full justify-center py-4 text-[15px]">
                  Run SEO Audit
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <MarketingFooter />
    </div>
  );
};

export default SeoAuditPage;
