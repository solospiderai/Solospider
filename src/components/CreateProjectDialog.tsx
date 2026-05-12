import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Globe, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { runAeoAnalysis } from "@/lib/aeo";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface BrandData {
  brand_name: string;
  brand_tagline: string;
  brand_description: string;
  og_image_url: string;
  favicon_url: string;
}

async function fetchSiteMetadata(url: string): Promise<Partial<BrandData>> {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const res = await fetch(proxyUrl);
    const data = await res.json();
    const html: string = data.contents;

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const getMeta = (name: string) =>
      doc.querySelector(`meta[name="${name}"]`)?.getAttribute("content") ||
      doc.querySelector(`meta[property="${name}"]`)?.getAttribute("content") ||
      "";

    const title =
      getMeta("og:site_name") ||
      getMeta("og:title") ||
      doc.querySelector("title")?.textContent ||
      "";
    const description =
      getMeta("og:description") || getMeta("description") || "";
    const tagline = getMeta("og:title") || "";
    const image = getMeta("og:image") || "";
    const faviconHref =
      doc.querySelector('link[rel="icon"]')?.getAttribute("href") ||
      doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") ||
      doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href") ||
      "/favicon.ico";
    const favicon = new URL(faviconHref, url).toString();

    return {
      brand_name: title.trim(),
      brand_tagline: tagline.trim(),
      brand_description: description.trim(),
      og_image_url: image.trim(),
      favicon_url: favicon.trim(),
    };
  } catch {
    return {};
  }
}

export function CreateProjectDialog({ open, onOpenChange }: CreateProjectDialogProps) {
  const { user } = useAuth();
  const { canAddProject, currentPlan, projectLimit, addProject } = useProjects();
  const [step, setStep] = useState<1 | 2>(1);
  const [domain, setDomain] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [brand, setBrand] = useState<BrandData>({
    brand_name: "",
    brand_tagline: "",
    brand_description: "",
    og_image_url: "",
    favicon_url: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerInitialAeoScan = async (project: {
    id: string;
    domain: string;
    brand_name?: string | null;
    name: string;
    brand_description?: string | null;
  }) => {
    const website = project.domain;
    const resolvedBrandName = project.brand_name || project.name;
    const topics = ["brand visibility", "ai search", "seo optimization"];

    try {
      const { data: record, error: insertError } = await supabase
        .from("aeo_analyses" as any)
        .insert([{
          project_id: project.id,
          website,
          brand_name: resolvedBrandName,
          topics,
          status: "running",
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const result = await runAeoAnalysis({
        website,
        brandName: resolvedBrandName,
        topics,
        brandDescription: project.brand_description || "",
      });

      await supabase
        .from("aeo_analyses" as any)
        .update({
          status: "completed",
          overall_score: result.overallScore,
          ai_insights: result.providers,
          category_scores: result.categoryScores,
          recommendations: result.recommendations,
          prompt_suggestions: result.promptSuggestions,
        })
        .eq("id", record.id);
    } catch (scanError) {
      console.error("Initial AEO scan failed:", scanError);
    }
  };

  const normalizeUrl = (raw: string) => {
    if (!raw.startsWith("http://") && !raw.startsWith("https://")) {
      return `https://${raw}`;
    }
    return raw;
  };

  const handleFetch = async () => {
    if (!domain) return;
    setIsFetching(true);
    const url = normalizeUrl(domain);
    const meta = await fetchSiteMetadata(url);
    setBrand({
      brand_name: meta.brand_name || domain,
      brand_tagline: meta.brand_tagline || "",
      brand_description: meta.brand_description || "",
      og_image_url: meta.og_image_url || meta.favicon_url || "",
      favicon_url: meta.favicon_url || "",
    });
    setFetched(true);
    setIsFetching(false);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!canAddProject) {
      toast.error(`Your ${currentPlan} plan is limited to ${projectLimit} project(s). Upgrade to add more.`);
      return;
    }
    setIsSubmitting(true);
    try {
      // Insert project with brand data
      const payload = {
        user_id: user.id,
        name: brand.brand_name || domain,
        domain: normalizeUrl(domain),
        brand_name: brand.brand_name,
        brand_tagline: brand.brand_tagline,
        brand_description: brand.brand_description,
        og_image_url: brand.og_image_url || brand.favicon_url,
        favicon_url: brand.favicon_url || null,
      };
      const { data: createdProject, error } = await supabase
        .from("projects")
        .insert([payload] as any)
        .select("id, domain, name, brand_name, brand_description")
        .single();

      if (error || !createdProject) throw error || new Error("Failed to create project");
      toast.success("Project created! Running initial AEO scan...");
      void triggerInitialAeoScan(createdProject as any);
      handleClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to create project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setStep(1);
    setDomain("");
    setFetched(false);
    setBrand({ brand_name: "", brand_tagline: "", brand_description: "", og_image_url: "", favicon_url: "" });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {step === 1 ? "Add Your Website" : "Brand Workspace Setup"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Enter your website URL and we'll automatically fetch your brand details."
              : "Review and edit your brand information before creating the project."}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="domain">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  onKeyDown={(e) => e.key === "Enter" && handleFetch()}
                />
                <Button onClick={handleFetch} disabled={!domain || isFetching}>
                  {isFetching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>Fetch <ArrowRight className="ml-1 h-4 w-4" /></>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We'll scan your website for the brand name, tagline, and description.
              </p>
            </div>
            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => { setStep(2); }}>
              Skip — Enter manually
            </Button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="py-2 space-y-4">
            {(brand.og_image_url || brand.favicon_url) && (
              <div className="w-full h-28 rounded-lg overflow-hidden border bg-background">
                <img
                  src={brand.og_image_url || brand.favicon_url}
                  alt="Brand preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={brand.brand_name}
                onChange={(e) => setBrand({ ...brand, brand_name: e.target.value })}
                placeholder="My Brand"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_tagline">Brand Tagline</Label>
              <Input
                id="brand_tagline"
                value={brand.brand_tagline}
                onChange={(e) => setBrand({ ...brand, brand_tagline: e.target.value })}
                placeholder="AI-Powered Marketing Automation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_description">Brand Description</Label>
              <Textarea
                id="brand_description"
                value={brand.brand_description}
                onChange={(e) => setBrand({ ...brand, brand_description: e.target.value })}
                placeholder="Describe your brand..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain_display">Website Domain</Label>
              <Input
                id="domain_display"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                required
              />
            </div>
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting || !brand.brand_name || !domain}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Create Project</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
