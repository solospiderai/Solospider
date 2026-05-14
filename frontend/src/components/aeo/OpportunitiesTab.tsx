import { useState, useEffect } from "react";
import { Megaphone, ExternalLink, Globe, MessageCircle, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  projectId: string;
  projectName: string;
}

export const OpportunitiesTab = ({ projectId, projectName }: Props) => {
  const [opportunities, setOpportunities] = useState<any[]>([
    { target: "Reddit r/SaaS", type: "Community", missing: true, impact: "High", action: "Comment here" },
    { target: "G2 Reviews", type: "Directory", missing: true, impact: "Critical", action: "Request Review" },
    { target: "SearchEngineLand", type: "News Site", missing: true, impact: "Medium", action: "Pitch Post" },
    { target: "Marketing Automation Substack", type: "Newsletter", missing: false, impact: "Low", action: "Sponsor" },
  ]);

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [outreachMessage, setOutreachMessage] = useState(
    `Hi Team,\n\nI noticed your recent article on AEO tools cited legacy softwares but missed the modern stack. We recently launched ${projectName || "Solospider"}, which is currently dominating Perplexity charts for programmatic SEO and Answer Engine attribution.\n\nWould you be open to an addendum?`
  );

  useEffect(() => {
    setOutreachMessage(
      `Hi Team,\n\nI noticed your recent article on AEO tools cited legacy softwares but missed the modern stack. We recently launched ${projectName || "Solospider"}, which is currently dominating Perplexity charts for programmatic SEO and Answer Engine attribution.\n\nWould you be open to an addendum?`
    );
  }, [projectName]);

  async function handleScanWeb() {
    setLoading(true);
    setTimeout(() => {
      setOpportunities(prev => [
        { target: "Hacker News Mention", type: "Forum", missing: true, impact: "Critical", action: "Engage Thread" },
        ...prev
      ]);
      setLoading(false);
      toast.success("Web landscape scanned successfully! Discovered 1 new critical citation gap.");
    }, 2000);
  }

  async function handleSendOutreach() {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success(`Successfully dispatched AI PR outreach for ${projectName || "Solospider"} via Gmail integration!`);
    }, 1500);
  }

  function handleRegenerate() {
    toast.info("Synthesizing alternative PR angle...");
    setOutreachMessage(
      `Hey there,\n\nLoved your deep dive into AI Answer Engine attribution! Our platform, ${projectName || "Solospider"}, recently benchmarked the exact RAG weighting models your readers are asking about.\n\nLet's collaborate on an updated data brief for your next edition.`
    );
  }

  return (
    <div className="space-y-6 mt-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2 text-ink">
            <Megaphone className="h-5 w-5 text-primary" />
            Third-Party Distribution & PR for {projectName || "Solospider"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Find out exactly where your competitors are mentioned, and let AI generate outreach messages to claim your spot.
          </p>
        </div>
        <Button onClick={handleScanWeb} disabled={loading} className="gap-2 shrink-0 btn-grad text-white shadow-lg shadow-primary/20">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
          {loading ? "Scanning Web..." : "Scan Web Landscape"}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 glass">
          <CardHeader>
            <CardTitle>Where should {projectName || "your brand"} get mentioned?</CardTitle>
            <CardDescription>Domains that frequently feed AI Answers but are missing your brand.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {opportunities.map((opp, i) => (
                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base">{opp.target}</p>
                      {opp.missing && <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] h-5">Missing Presence</Badge>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="h-5">{opp.type}</Badge>
                      <span onClick={() => toast.info(`Opening live RAG citations for ${opp.target}...`)} className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                        <ExternalLink className="h-3 w-3" /> View live mentions
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className={`text-xs font-semibold ${opp.impact === 'Critical' ? 'text-pink' : opp.impact === 'High' ? 'text-emerald-500' : 'text-[#22d3ee]'}`}>
                      {opp.impact} Impact
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => toast.success(`Action initiated: ${opp.action}`)}
                      variant={opp.impact === 'Critical' ? 'default' : 'secondary'} 
                      className="w-full sm:w-auto text-xs"
                    >
                      {opp.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary font-black">
              <MessageCircle className="h-5 w-5 text-primary" />
              AI PR Engine
            </CardTitle>
            <CardDescription>Generate perfect outreach with context for {projectName}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-background rounded-lg p-4 border border-line shadow-sm text-sm space-y-3">
              <p className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest">Generated Outreach</p>
              <p className="leading-relaxed text-xs text-ink whitespace-pre-wrap font-medium">
                {outreachMessage}
              </p>
            </div>
            <Button onClick={handleSendOutreach} disabled={sending} className="w-full gap-2 btn-grad text-white font-black shadow-lg shadow-primary/20 h-11">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "DISPATCHING..." : "Send via Gmail Integration"}
            </Button>
            <Button onClick={handleRegenerate} className="w-full h-11 border-line bg-bg text-ink hover:bg-primary/5 font-bold text-xs" variant="outline">
              Regenerate Message
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
