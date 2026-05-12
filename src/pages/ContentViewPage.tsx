import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useActiveProject } from "@/hooks/useActiveProject";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Copy, Check, Pencil, Eye, Globe, RefreshCw, BarChart3, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { marked } from "marked";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import ImageGallery from "@/components/ImageGallery";

interface ContentItem {
  id: string;
  main_keyword: string;
  h1: string;
  status: string;
  word_count_target: number;
  generated_title: string | null;
  meta_description: string | null;
  generated_content: string | null;
  current_section: string | null;
  sections_completed: number | null;
  total_sections: number | null;
  tone: string;
  target_country: string;
  secondary_keywords: string[] | null;
  h2_list: string[];
  h3_list: string[] | null;
  created_at: string;
}

// --- SEO SCORE LOGIC ---
function computeSEOScore(content: ContentItem) {
  const text = content.generated_content || "";
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const keyword = content.main_keyword.toLowerCase();
  const lowerText = text.toLowerCase();

  const checks: { label: string; pass: boolean; tip: string }[] = [];
  let totalScore = 0;
  const maxScore = 6;

  // 1. Title length
  const titleLen = (content.generated_title || content.h1 || "").length;
  const titleOk = titleLen >= 30 && titleLen <= 70;
  checks.push({ label: "Title Length", pass: titleOk, tip: titleOk ? `${titleLen} chars (good)` : `${titleLen} chars (aim 30-70)` });
  if (titleOk) totalScore++;

  // 2. Word count vs target
  const wcRatio = wordCount / content.word_count_target;
  const wcOk = wcRatio >= 0.75 && wcRatio <= 1.35;
  checks.push({ label: "Word Count", pass: wcOk, tip: `${wordCount} / ${content.word_count_target} target` });
  if (wcOk) totalScore++;

  // 3. Keyword in title
  const kwInTitle = (content.generated_title || "").toLowerCase().includes(keyword);
  checks.push({ label: "Keyword in Title", pass: kwInTitle, tip: kwInTitle ? "Present" : "Missing" });
  if (kwInTitle) totalScore++;

  // 4. Keyword density
  const kwCount = (lowerText.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")) || []).length;
  const density = wordCount > 0 ? (kwCount / wordCount) * 100 : 0;
  const densityOk = density >= 0.5 && density <= 3;
  checks.push({ label: "Keyword Density", pass: densityOk, tip: `${density.toFixed(1)}% (aim 0.5-3%)` });
  if (densityOk) totalScore++;

  // 5. Has H2 headings
  const h2Matches = text.match(/^## /gm) || [];
  const hasH2 = h2Matches.length >= 2;
  checks.push({ label: "H2 Headings", pass: hasH2, tip: `${h2Matches.length} found` });
  if (hasH2) totalScore++;

  // 6. Readability (avg sentence length)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const avgSentenceLen = sentences.length > 0 ? words.length / sentences.length : 0;
  const readabilityOk = avgSentenceLen >= 10 && avgSentenceLen <= 25;
  checks.push({ label: "Readability", pass: readabilityOk, tip: `~${avgSentenceLen.toFixed(0)} words/sentence` });
  if (readabilityOk) totalScore++;

  return { score: Math.round((totalScore / maxScore) * 100), checks, totalScore, maxScore };
}

const ContentViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { activeProjectId } = useActiveProject();
  const projectId = activeProjectId;
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editMetaTitle, setEditMetaTitle] = useState("");
  const [editMetaDesc, setEditMetaDesc] = useState("");
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [showSEO, setShowSEO] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [refining, setRefining] = useState(false);

  // New WP Publish Settings State
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [publishStatus, setPublishStatus] = useState("draft");
  const [wpCategories, setWpCategories] = useState<{ id: number, name: string }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("none");
  const [fetchingCategories, setFetchingCategories] = useState(false);
  const [wpIntegrations, setWpIntegrations] = useState<any[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("none");
  const [wpAuthors, setWpAuthors] = useState<{ id: number, name: string }[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("none");
  const [fetchingAuthors, setFetchingAuthors] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [canonicalUrl, setCanonicalUrl] = useState<string>("");

  // Helper to strictly enforce Title Case
  const toTitleCase = (str: string) => {
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  };

  const fetchContent = useCallback(async () => {
    if (!id || !user) return;
    let query = supabase
      .from("content_items")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id);
    if (projectId) {
      query = query.eq("project_id", projectId);
    }
    const { data, error } = await query.single();

    if (error) {
      toast.error("Failed to load content");
    } else {
      setContent(data as unknown as ContentItem);
      if (!editing) {
        setEditTitle(data?.generated_title ? toTitleCase(data.generated_title) : (data?.h1 ? toTitleCase(data.h1) : ""));
        setEditMetaDesc((data as any)?.meta_description || "");
        setEditContent(data?.generated_content || "");
      }
    }
    setLoading(false);
  }, [id, editing, user]);

  useEffect(() => {
    fetchContent();
    if (!id) return;
    const channel = supabase
      .channel(`content-${id}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "content_items",
        filter: `id=eq.${id}`,
      }, (payload) => {
        const updated = payload.new as unknown as ContentItem;
        setContent(updated);
        if (!editing) {
          setEditTitle(updated?.generated_title ? toTitleCase(updated.generated_title) : (updated?.h1 ? toTitleCase(updated.h1) : ""));
          setEditMetaDesc(updated.meta_description || "");
          setEditContent(updated.generated_content || "");
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, fetchContent, editing]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content?.generated_content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard");
  };

  const handleSave = async () => {
    setSaving(true);
    if (!content) {
      toast.error("Content not loaded.");
      setSaving(false);
      return;
    }
    let updateQuery = supabase
      .from("content_items")
      .update({
        generated_title: toTitleCase(editTitle),
        meta_description: editMetaDesc,
        generated_content: editContent
      })
      .eq("id", content.id)
      .eq("user_id", user?.id);
    if (projectId) updateQuery = updateQuery.eq("project_id", projectId);
    const { error } = await updateQuery;
    if (error) toast.error("Failed to save");
    else {
      toast.success("Saved");
      setEditing(false);
    }
    setSaving(false);
  };

  const openPublishDialog = async () => {
    setPublishDialogOpen(true);
    setFetchingCategories(true);
    setFetchingAuthors(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: integrations } = await (supabase
        .from("workspace_integrations" as any)
        .select("*")
        .eq("user_id", session.user.id)
        .eq("platform", "wordpress")
        .eq("is_active", true) as any);

      if (integrations && integrations.length > 0) {
        setWpIntegrations(integrations);
        setSelectedIntegration(integrations[0].id);

        // Fetch properties for the first integration
        await fetchWpProperties(integrations[0].credentials);
      } else {
        setFetchingCategories(false);
        setFetchingAuthors(false);
      }
    } catch (e) {
      console.error(e);
      setFetchingCategories(false);
      setFetchingAuthors(false);
    }
  };

  const fetchWpProperties = async (creds: any) => {
    setFetchingCategories(true);
    setFetchingAuthors(true);
    if (creds && creds.url && creds.username && creds.app_password) {
      let cleanUrl = creds.url.trim();
      if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);
      const authString = btoa(`${creds.username}:${creds.app_password}`);

      try {
        const [catRes, authRes] = await Promise.all([
          fetch(`${cleanUrl}/wp-json/wp/v2/categories?per_page=100`, { headers: { Authorization: `Basic ${authString}` } }),
          fetch(`${cleanUrl}/wp-json/wp/v2/users?per_page=100`, { headers: { Authorization: `Basic ${authString}` } })
        ]);

        if (catRes.ok) {
          const cats = await catRes.json();
          setWpCategories(cats);
        }
        if (authRes.ok) {
          const authors = await authRes.json();
          setWpAuthors(authors);
        }
      } catch (e) {
        console.error("Failed to fetch WP properties", e);
      }
    }
    setFetchingCategories(false);
    setFetchingAuthors(false);
  };

  useEffect(() => {
    if (publishDialogOpen && selectedIntegration !== "none" && wpIntegrations.length > 0) {
      const integration = wpIntegrations.find(int => int.id === selectedIntegration);
      if (integration) {
        fetchWpProperties(integration.credentials);
      }
    }
  }, [selectedIntegration]);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      if (!content || !content.id) throw new Error("No content to publish");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // 1. Fetch Integration
      // Use 'as any' to bypass the type error in the table schema
      const { data: integrations, error: intError } = await (supabase
        .from("workspace_integrations" as any)
        .select("*")
        .eq("user_id", session.user.id)
        .eq("platform", "wordpress")
        .eq("is_active", true) as any);

      if (intError) throw new Error("Failed to check WordPress integration: " + intError.message);
      if (!integrations || integrations.length === 0) {
        throw new Error("No active WordPress integration found. Please connect in Settings > Integrations.");
      }

      if (integrations && integrations.length > 0) {
        // We will use selectedIntegration instead of [0]
      }

      const integration = selectedIntegration === "none" ? integrations[0] : integrations.find((i: any) => i.id === selectedIntegration);
      if (!integration) {
        throw new Error("Selected integration not found or inactive.");
      }
      const creds = integration.credentials;
      if (!creds || !creds.url || !creds.username || !creds.app_password) {
        throw new Error("WordPress integration is missing credentials.");
      }

      // 2. Upload Feature Image if selected
      if (selectedImageFile) {
        const fileExt = selectedImageFile.name.split('.').pop();
        const fileName = `${content.id}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('blog_images')
          .upload(fileName, selectedImageFile, { upsert: true });

        if (uploadError) {
          // It's possible the bucket 'blog_images' doesn't exist yet, we catch this explicitly
          console.error("Storage upload error:", uploadError);
          throw new Error("Failed to upload image. Please ensure the 'blog_images' public storage bucket exists in Supabase.");
        }

        const { data: { publicUrl } } = supabase.storage
          .from('blog_images')
          .getPublicUrl(fileName);

        // Update the content item with the new image url
        let imageQuery = supabase
          .from("content_items")
          .update({ featured_image_url: publicUrl } as any)
          .eq("id", content.id)
          .eq("user_id", user?.id);
        if (projectId) imageQuery = imageQuery.eq("project_id", projectId);
        await imageQuery;
      }

      // 3. Publish to WP via Edge Function
      const categoriesArray = selectedCategory !== "none" ? [parseInt(selectedCategory)] : undefined;
      const authorId = selectedAuthor !== "none" ? parseInt(selectedAuthor) : undefined;

      console.log(`Sending publish request to edge function for ${integration.id}...`);
      const { data: wpData, error: invokeError } = await supabase.functions.invoke("publish-to-wordpress", {
        body: {
          contentId: content.id,
          integrationId: integration.id,
          publishStatus: publishStatus,
          categories: categoriesArray,
          authorId: authorId,
          canonicalUrl: canonicalUrl.trim() || undefined
        },
      });

      if (invokeError) throw invokeError;
      if (wpData && wpData.error) throw new Error(wpData.error);

      toast.success("Successfully sent to WordPress!");
      setPublishDialogOpen(false);
      fetchContent();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleRetry = async () => {
    if (!id) return;
    setRetrying(true);
    try {
      let retryQuery = supabase.from("content_items").update({
        status: "generating",
        sections_completed: 0,
        total_sections: null,
        current_section: null,
        generated_content: null,
        generated_title: null,
      })
        .eq("id", id)
        .eq("user_id", user?.id);
      if (projectId) retryQuery = retryQuery.eq("project_id", projectId);
      const { error: updateError } = await retryQuery;

      if (updateError) throw updateError;

      supabase.functions.invoke("generate-blog", {
        body: { contentId: id },
      }).catch((err: any) => console.error("Retry invoke error:", err));

      toast.success("Retrying generation...");
      fetchContent();
    } catch (err: any) {
      toast.error(err.message || "Failed to retry");
    } finally {
      setRetrying(false);
    }
  };

  const handleRegenerateSection = async (sectionHeading: string) => {
    if (!content) return;
    setRegeneratingSection(sectionHeading);
    try {
      const currentContent = content.generated_content || "";

      // Find the section boundaries in the markdown
      const h2Regex = /^## .+$/gm;
      const sections: { heading: string; start: number; end: number }[] = [];
      let match;
      while ((match = h2Regex.exec(currentContent)) !== null) {
        if (sections.length > 0) {
          sections[sections.length - 1].end = match.index;
        }
        sections.push({ heading: match[0].replace("## ", ""), start: match.index, end: currentContent.length });
      }

      const targetSection = sections.find(s => s.heading.trim() === sectionHeading.trim());
      if (!targetSection) {
        toast.error("Section not found");
        return;
      }

      // Call AI to regenerate just this section
      const { data, error } = await supabase.functions.invoke("generate-blog", {
        body: {
          contentId: content.id,
          step: "regenerate_section",
          sectionHeading: sectionHeading,
          currentMarkdown: currentContent,
        },
      });

      if (error) throw error;

      toast.success(`Regenerated "${sectionHeading}"`);
      fetchContent();
    } catch (e: any) {
      toast.error(e.message || "Failed to regenerate section");
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleRefineContent = async () => {
    if (!id || !refinePrompt.trim()) return;
    setRefining(true);
    try {
      const { data, error } = await supabase.functions.invoke("refine-content", {
        body: { contentId: id, prompt: refinePrompt.trim() },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);
      toast.success("Content updated!");
      setRefinePrompt("");
      fetchContent();
    } catch (e: any) {
      toast.error(e.message || "Failed to refine content");
    } finally {
      setRefining(false);
    }
  };

  const renderMarkdown = (md: string) => {
    return md
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^\s*-\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/^/, '<p class="mb-4 leading-relaxed">')
      .concat("</p>");
  };

  // Extract H2 headings for regeneration buttons
  const extractH2Headings = (md: string): string[] => {
    const matches = md.match(/^## (.+)$/gm);
    return matches ? matches.map(m => m.replace("## ", "")) : [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="p-8">
        <p>Content not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const isGenerating = content.status === "generating";
  const wordCount = (content.generated_content || "").split(/\s+/).filter(Boolean).length;
  const seoResult = content.status === "completed" || content.status === "published" ? computeSEOScore(content) : null;
  const h2Headings = extractH2Headings(content.generated_content || "");

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button asChild variant="ghost" size="icon">
          <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{content.generated_title || content.h1}</h1>
          <p className="text-sm text-muted-foreground">{content.main_keyword} · {wordCount} words</p>
        </div>
        <Badge
          variant="secondary"
          className={
            content.status === "completed"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : content.status === "generating"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : content.status === "published"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : content.status === "failed"
                    ? "bg-red-500/10 text-red-600 dark:text-red-400"
                    : ""
          }
        >
          {isGenerating
            ? `Generating ${content.sections_completed || 0}/${content.total_sections || "?"}`
            : content.status}
        </Badge>
      </div>

      {/* Generation progress */}
      {isGenerating && (
        <div className="mb-6 p-4 rounded-xl border bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm font-medium">Writing: {content.current_section || "..."}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
              {retrying ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
              Restart
            </Button>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all duration-500"
              style={{
                width: `${((content.sections_completed || 0) / (content.total_sections || 1)) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Failed state */}
      {content.status === "failed" && (
        <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">Generation failed</span>
            <Button variant="outline" size="sm" onClick={handleRetry} disabled={retrying}>
              {retrying ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <RefreshCw className="mr-1 h-3 w-3" />}
              Retry Generation
            </Button>
          </div>
        </div>
      )}

      {/* SEO Score Card */}
      {seoResult && (
        <div className="mb-6">
          <button
            onClick={() => setShowSEO(!showSEO)}
            className="flex items-center gap-2 w-full p-4 rounded-xl border bg-card hover:shadow-md transition-all"
          >
            <BarChart3 className="h-5 w-5 text-primary" />
            <span className="font-semibold">SEO Score</span>
            <div className="ml-auto flex items-center gap-3">
              {/* Score Circle */}
              <div className="relative h-12 w-12">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="hsl(var(--muted))"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke={seoResult.score >= 80 ? "#10b981" : seoResult.score >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="3"
                    strokeDasharray={`${seoResult.score}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                  {seoResult.score}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{showSEO ? "Hide" : "Show"} Details</span>
            </div>
          </button>

          {showSEO && (
            <div className="mt-2 p-4 rounded-xl border bg-card/50 space-y-2 animate-slide-in">
              {seoResult.checks.map((check, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${check.pass ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span>{check.label}</span>
                  </div>
                  <span className="text-muted-foreground text-xs">{check.tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Gallery */}
      {(content.status === "completed" || content.status === "published") && user && (
        <ImageGallery contentId={content.id} userId={user.id} />
      )}

      {/* Actions */}
      {(content.status === "completed" || content.status === "published") && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
            {copied ? "Copied" : "Copy Markdown"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(!editing)}
          >
            {editing ? <Eye className="mr-1 h-3 w-3" /> : <Pencil className="mr-1 h-3 w-3" />}
            {editing ? "Preview" : "Edit"}
          </Button>
          {editing && (
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              Save
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={openPublishDialog}
            disabled={content.status === "published"}
            className="ml-auto"
          >
            <Globe className="mr-1 h-3 w-3" />
            {content.status === "published" ? "Published" : "Publish to WP"}
          </Button>
        </div>
      )}

      {/* Regenerate Section Buttons */}
      {!editing && (content.status === "completed" || content.status === "published") && h2Headings.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border bg-card/50">
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Regenerate a Section
          </p>
          <div className="flex flex-wrap gap-2">
            {h2Headings.map((heading) => (
              <Button
                key={heading}
                variant="outline"
                size="sm"
                onClick={() => handleRegenerateSection(heading)}
                disabled={!!regeneratingSection}
                className="text-xs"
              >
                {regeneratingSection === heading ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="mr-1 h-3 w-3" />
                )}
                {heading}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* AI Prompt Box for content refinement */}
      {!editing && (content.status === "completed" || content.status === "published") && (
        <div className="mb-6 p-4 rounded-xl border bg-card/50">
          <p className="text-sm font-medium mb-2 flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            AI Quick Edit
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Type a prompt to edit content. E.g. "Replace CompanyX with CompanyY" or "Remove all mentions of XYZ"
          </p>
          <div className="flex gap-2">
            <Input
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              placeholder='e.g. "Replace BrandName with NewBrand everywhere"'
              className="flex-1 text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && refinePrompt.trim()) {
                  e.preventDefault();
                  handleRefineContent();
                }
              }}
              disabled={refining}
            />
            <Button
              size="sm"
              onClick={handleRefineContent}
              disabled={refining || !refinePrompt.trim()}
            >
              {refining ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <Send className="mr-1 h-3 w-3" />}
              {refining ? "Applying..." : "Apply"}
            </Button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="border rounded-xl bg-card p-8">
        {editing ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Blog Title (H1)</Label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(toTitleCase(e.target.value))}
                className="font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>SEO Meta Description <span className="text-muted-foreground text-xs font-normal">({editMetaDesc.length} chars)</span></Label>
              <Textarea
                value={editMetaDesc}
                onChange={(e) => setEditMetaDesc(e.target.value)}
                className="min-h-[80px] text-sm"
                placeholder="Enter SEO meta description (150-160 chars recommended)"
              />
            </div>
            <div className="space-y-2">
              <Label>Blog Content (Markdown)</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60vh] font-mono text-sm leading-relaxed"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setEditTitle(content?.generated_title ? toTitleCase(content.generated_title) : (content?.h1 ? toTitleCase(content.h1) : ""));
                setEditMetaDesc(content?.meta_description || "");
                setEditContent(content?.generated_content || "");
                setEditing(false);
              }}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        ) : (
          <article
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(content.generated_content || ""),
            }}
          />
        )}
      </div>

      <Dialog open={publishDialogOpen} onOpenChange={setPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to WordPress</DialogTitle>
            <DialogDescription>Configure how your post will appear on your WordPress site.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Post Status</Label>
              <Select value={publishStatus} onValueChange={setPublishStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Save as Draft (Review Later)</SelectItem>
                  <SelectItem value="publish">Publish Immediately (Live)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Website / Integration</Label>
              <Select value={selectedIntegration} onValueChange={setSelectedIntegration} disabled={wpIntegrations.length === 0}>
                <SelectTrigger><SelectValue placeholder="Select WordPress Site" /></SelectTrigger>
                <SelectContent>
                  {wpIntegrations.map(int => (
                    <SelectItem key={int.id} value={int.id}>{int.credentials?.url || int.id}</SelectItem>
                  ))}
                  {wpIntegrations.length === 0 && <SelectItem value="none">No Integrations Found</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category {fetchingCategories && <Loader2 className="inline h-3 w-3 animate-spin ml-2 text-primary" />}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={fetchingCategories || wpCategories.length === 0}>
                <SelectTrigger><SelectValue placeholder={fetchingCategories ? "Fetching Categories..." : "Select a Category (Optional)"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Default</SelectItem>
                  {wpCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Author {fetchingAuthors && <Loader2 className="inline h-3 w-3 animate-spin ml-2 text-primary" />}</Label>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor} disabled={fetchingAuthors || wpAuthors.length === 0}>
                <SelectTrigger><SelectValue placeholder={fetchingAuthors ? "Fetching Authors..." : "Select an Author (Optional)"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Default Author</SelectItem>
                  {wpAuthors.map(author => (
                    <SelectItem key={author.id} value={author.id.toString()}>{author.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Canonical URL <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input
                type="url"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="https://example.com/original-article"
              />
              <p className="text-[11px] text-muted-foreground mt-1">Leave blank unless this post was originally published elsewhere.</p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Custom Featured Image <span className="text-muted-foreground font-normal">(Optional)</span></Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImageFile(e.target.files?.[0] || null)}
                className="cursor-pointer"
              />
              <p className="text-[11px] text-muted-foreground mt-1">If selected, this image will replace the auto-generated one.</p>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center bg-muted/30 p-2 rounded-lg">
              Tags and advanced SEO meta functionality will be applied directly via your WordPress site after generation.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishDialogOpen(false)}>Cancel</Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send to WordPress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContentViewPage;
