import { useProject } from "./ProjectLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Globe, Save } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ComingSoonPage } from "./ComingSoonPage";
import { Users } from "lucide-react";

export function BrandWorkspacePage() {
  const { project } = useProject();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    brand_name: project.brand_name || "",
    brand_tagline: project.brand_tagline || "",
    brand_description: project.brand_description || "",
    domain: project.domain || "",
  });

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("projects")
      .update({
        brand_name: form.brand_name,
        brand_tagline: form.brand_tagline,
        brand_description: form.brand_description,
        domain: form.domain,
        name: form.brand_name || project.name,
      })
      .eq("id", project.id);
    setSaving(false);
    if (error) toast.error("Failed to save");
    else {
      toast.success("Brand workspace saved!");
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 ">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-ink tracking-tight">Brand <span className="grad-text">Workspace</span></h1>
          <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60 pl-1">
            Engineered Identity for {form.brand_name || project.name}
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="btn-grad text-white font-black px-8 h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "SAVING..." : "SAVE CHANGES"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 ">
        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass rounded-[2rem] p-8 flex flex-col items-center text-center space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative h-24 w-24 rounded-3xl bg-primary text-white flex items-center justify-center text-4xl font-black shadow-2xl shadow-primary/30 border-4 border-bg">
                {(form.brand_name || project.name).charAt(0).toUpperCase()}
              </div>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-black text-ink">{form.brand_name || project.name}</h3>
              <p className="text-xs font-bold text-ink-2 opacity-60 uppercase tracking-widest">{form.domain}</p>
            </div>

            <div className="w-full pt-4 border-t border-line space-y-4">
               <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-ink-2">
                 <span>Status</span>
                 <span className="text-primary flex items-center gap-1.5">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                   Active
                 </span>
               </div>
            </div>
          </div>

          {project.og_image_url && (
            <div className="glass rounded-[2rem] p-4 group">
              <div className="aspect-video rounded-2xl overflow-hidden border border-line">
                <img src={project.og_image_url} alt="Brand OG" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
              </div>
              <p className="text-[10px] font-black text-ink uppercase tracking-widest opacity-40 text-center mt-3">Brand Visual Asset</p>
            </div>
          )}
        </div>

        {/* Form Area */}
        <div className="lg:col-span-8">
          <div className="glass rounded-[2.5rem] p-10 space-y-8">
            <div className="grid gap-8">
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" /> Brand Domain
                </Label>
                <Input 
                  value={form.domain} 
                  onChange={(e) => setForm({ ...form, domain: e.target.value })} 
                  className="h-14 rounded-xl border-line bg-bg/50 px-5 text-sm font-bold text-ink focus:bg-bg transition-all"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">Brand Identity Name</Label>
                <Input 
                  value={form.brand_name} 
                  onChange={(e) => setForm({ ...form, brand_name: e.target.value })} 
                  className="h-14 rounded-xl border-line bg-bg/50 px-5 text-sm font-bold text-ink focus:bg-bg transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">Strategic Tagline</Label>
                <Input 
                  value={form.brand_tagline} 
                  onChange={(e) => setForm({ ...form, brand_tagline: e.target.value })} 
                  placeholder="e.g. The AI Automation Agency of the Future" 
                  className="h-14 rounded-xl border-line bg-bg/50 px-5 text-sm font-bold text-ink focus:bg-bg transition-all"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60">Mission & Brand Directive</Label>
                <Textarea 
                  value={form.brand_description} 
                  onChange={(e) => setForm({ ...form, brand_description: e.target.value })} 
                  rows={6} 
                  placeholder="Describe your brand's core mission and target audience..." 
                  className="rounded-2xl border-line bg-bg/50 p-5 text-sm font-medium text-ink focus:bg-bg transition-all leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CompetitorsPage() {
  return <ComingSoonPage title="Competitors" icon={Users} description="Track and analyze your competitors to stay ahead in search, ads, and social." features={["Competitor SEO Analysis","Ad Spend Estimation","Content Gap Analysis","Social Media Benchmarking","Share of Voice Tracking"]} />;
}
