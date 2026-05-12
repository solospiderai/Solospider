/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useProject } from "./ProjectLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Instagram, Facebook, Linkedin, Twitter, Plus, Trash2,
  CheckCircle2, XCircle, Loader2, ExternalLink, ChevronDown, ChevronUp, Link2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Platform Config ────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "instagram",
    name: "Instagram",
    Icon: Instagram,
    color: "from-pink-500 to-purple-600",
    bg: "bg-gradient-to-br from-pink-500/10 to-purple-600/10",
    border: "border-pink-500/20",
    textColor: "text-pink-500",
    fields: [
      { key: "handle", label: "Instagram Handle", placeholder: "@yourbrand", hint: "Your Instagram username (without @)" },
      { key: "access_token", label: "Page Access Token", placeholder: "EAAxxxxx...", hint: "From Meta Business > Settings > System Users > Generate Token", secret: true },
      { key: "meta_ig_user_id", label: "Instagram Business Account ID", placeholder: "17841xxxxxxx", hint: "Found in Instagram > Edit Profile > Professional Account Info" },
      { key: "meta_page_id", label: "Facebook Page ID", placeholder: "123456789", hint: "Found in Facebook Page > About > Page ID" },
    ],
    docsUrl: "https://developers.facebook.com/docs/instagram-api/getting-started",
    description: "Connect your Instagram Business account to publish posts, stories, and reels automatically.",
  },
  {
    id: "facebook",
    name: "Facebook",
    Icon: Facebook,
    color: "from-blue-600 to-blue-700",
    bg: "bg-gradient-to-br from-blue-600/10 to-blue-700/10",
    border: "border-blue-500/20",
    textColor: "text-blue-500",
    fields: [
      { key: "handle", label: "Page Name / Handle", placeholder: "YourBrandPage", hint: "Your Facebook Page username" },
      { key: "access_token", label: "Page Access Token", placeholder: "EAAxxxxx...", hint: "From Meta Business Suite > Settings > Page Access Token", secret: true },
      { key: "meta_page_id", label: "Facebook Page ID", placeholder: "123456789", hint: "Found in Facebook Page > About > Page Transparency > Page ID" },
    ],
    docsUrl: "https://developers.facebook.com/docs/pages/getting-started",
    description: "Publish posts and images to your Facebook Business Page and track engagement metrics.",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    Icon: Linkedin,
    color: "from-sky-600 to-sky-700",
    bg: "bg-gradient-to-br from-sky-600/10 to-sky-700/10",
    border: "border-sky-500/20",
    textColor: "text-sky-500",
    fields: [
      { key: "handle", label: "LinkedIn Page / Profile Name", placeholder: "your-company", hint: "Your LinkedIn Company Page URL slug" },
      { key: "access_token", label: "Access Token", placeholder: "AQVJxx...", hint: "From LinkedIn Developer Apps > Auth > Access Token", secret: true },
      { key: "platform_account_id", label: "Organization ID", placeholder: "urn:li:organization:12345", hint: "Found in LinkedIn Page Admin > Info > Organization URN" },
    ],
    docsUrl: "https://learn.microsoft.com/en-us/linkedin/marketing/getting-started",
    description: "Share thought leadership content and company updates directly to your LinkedIn Page.",
  },
  {
    id: "twitter",
    name: "Twitter / X",
    Icon: Twitter,
    color: "from-gray-800 to-black",
    bg: "bg-gradient-to-br from-gray-800/10 to-black/10",
    border: "border-gray-500/20",
    textColor: "text-gray-700 dark:text-gray-300",
    fields: [
      { key: "handle", label: "Twitter Handle", placeholder: "@yourbrand", hint: "Your Twitter/X username (without @)" },
      { key: "access_token", label: "Access Token", placeholder: "xxxxx-xxxx...", hint: "From Twitter Developer Portal > Your App > Keys & Tokens", secret: true },
      { key: "refresh_token", label: "Access Token Secret", placeholder: "xxxxxx...", hint: "Access Token Secret (not the API key secret)", secret: true },
      { key: "platform_account_id", label: "API Key", placeholder: "xxxxxxxxxxxxxxxx", hint: "From Developer Portal > App > Keys & Tokens > Consumer Key" },
    ],
    docsUrl: "https://developer.twitter.com/en/portal/dashboard",
    description: "Auto-post tweets and threads to your Twitter/X account with AI-generated content.",
  },
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────

type SocialAccount = {
  id: string;
  platform: string;
  handle: string;
  account_label: string | null;
  connection_status: string;
  access_token: string | null;
  refresh_token: string | null;
  meta_page_id: string | null;
  meta_ig_user_id: string | null;
  platform_account_id: string | null;
  followers_count: string | null;
  profile_pic_url: string | null;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export function SocialAccountsPage() {
  const { project } = useProject();
  const queryClient = useQueryClient();
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["social_accounts_all", project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_accounts" as any)
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as SocialAccount[];
    },
  });

  const handleConnectOpen = (platformId: string) => {
    setConnectingPlatform(platformId);
    setExpandedPlatform(platformId);
    setFormData({});
  };

  const handleSave = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId)!;
    const handle = formData["handle"]?.trim();
    if (!handle) {
      toast.error("Handle / Page name is required");
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        project_id: project.id,
        platform: platformId,
        handle: handle.replace(/^@/, ""),
        account_label: formData["account_label"] || handle,
        access_token: formData["access_token"] || null,
        refresh_token: formData["refresh_token"] || null,
        meta_page_id: formData["meta_page_id"] || null,
        meta_ig_user_id: formData["meta_ig_user_id"] || null,
        platform_account_id: formData["platform_account_id"] || null,
        auth_type: platformId === "instagram" || platformId === "facebook" ? "meta_oauth" : "manual_token",
        connection_status: "connected",
      };

      const { error } = await supabase.from("social_accounts" as any).insert(payload);
      if (error) throw error;

      toast.success(`${platform.name} account connected!`);
      setConnectingPlatform(null);
      setExpandedPlatform(null);
      setFormData({});
      queryClient.invalidateQueries({ queryKey: ["social_accounts_all", project.id] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to save account");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (accountId: string) => {
    setRemovingId(accountId);
    try {
      const { error } = await supabase.from("social_accounts" as any).delete().eq("id", accountId);
      if (error) throw error;
      toast.success("Account removed");
      queryClient.invalidateQueries({ queryKey: ["social_accounts_all", project.id] });
    } catch (err: any) {
      toast.error(err?.message || "Failed to remove account");
    } finally {
      setRemovingId(null);
    }
  };

  const totalConnected = accounts.length;
  const platformCount = new Set(accounts.map(a => a.platform)).size;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-ink tracking-tight">
            Connected <span className="grad-text">Accounts</span>
          </h1>
          <p className="text-[10px] font-black text-ink uppercase tracking-[0.2em] opacity-60 pl-1">
            {totalConnected} ACCOUNT{totalConnected !== 1 ? "S" : ""} · {platformCount} PLATFORM{platformCount !== 1 ? "S" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>

      {/* Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PLATFORMS.map((platform) => {
          const Icon = platform.Icon;
          const platformAccounts = accounts.filter(a => a.platform === platform.id);
          const isExpanded = expandedPlatform === platform.id;
          const isConnecting = connectingPlatform === platform.id;

          return (
            <div
              key={platform.id}
              className={cn(
                "glass rounded-[2rem] overflow-hidden border transition-all duration-300",
                isExpanded ? platform.border : "border-line"
              )}
            >
              {/* Card Header */}
              <div className={cn("p-6 flex items-start gap-4", isExpanded && platform.bg)}>
                <div className={cn("w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg shrink-0", platform.color)}>
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-black text-ink">{platform.name}</h3>
                    {platformAccounts.length > 0 && (
                      <span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full border", platform.bg, platform.border, platform.textColor)}>
                        {platformAccounts.length} CONNECTED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-2 opacity-70 leading-relaxed line-clamp-2">{platform.description}</p>
                </div>
                <a
                  href={platform.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-2 rounded-xl hover:bg-bg/50 transition-colors"
                  title="View API docs"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>

              {/* Connected Accounts List */}
              {platformAccounts.length > 0 && (
                <div className="border-t border-line divide-y divide-line/50">
                  {platformAccounts.map((account) => (
                    <div key={account.id} className="px-6 py-3 flex items-center gap-3">
                      {account.profile_pic_url ? (
                        <img src={account.profile_pic_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className={cn("w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-black", platform.color)}>
                          {account.handle.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black text-ink truncate">@{account.handle}</p>
                        {account.followers_count && (
                          <p className="text-[10px] text-muted-foreground">{account.followers_count} followers</p>
                        )}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full",
                        account.connection_status === "connected"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-500 border border-red-500/20"
                      )}>
                        {account.connection_status === "connected"
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <XCircle className="h-3 w-3" />}
                        {account.connection_status}
                      </div>
                      <button
                        onClick={() => handleRemove(account.id)}
                        disabled={removingId === account.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        {removingId === account.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Trash2 className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Account Button */}
              <div className="p-4 border-t border-line/50">
                {!isConnecting ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2",
                      "border-line hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => handleConnectOpen(platform.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add {platform.name} Account
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                    onClick={() => { setConnectingPlatform(null); setExpandedPlatform(null); }}
                  >
                    <ChevronUp className="h-3.5 w-3.5 mr-1" /> Cancel
                  </Button>
                )}
              </div>

              {/* Connect Form */}
              {isConnecting && (
                <div className={cn("border-t p-6 space-y-4 animate-in slide-in-from-top-2 duration-200", platform.border, platform.bg)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Link2 className={cn("h-4 w-4", platform.textColor)} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-ink">Connect {platform.name} Account</p>
                  </div>

                  {/* Optional account label */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest">Account Label (optional)</label>
                    <Input
                      placeholder="e.g. Main Brand, Ads Account..."
                      className="h-10 rounded-xl border-line text-[12px]"
                      value={formData["account_label"] || ""}
                      onChange={e => setFormData(prev => ({ ...prev, account_label: e.target.value }))}
                    />
                  </div>

                  {platform.fields.map((field) => (
                    <div key={field.key} className="space-y-1">
                      <label className="text-[10px] font-black text-ink-2 uppercase tracking-widest">{field.label}</label>
                      <Input
                        placeholder={field.placeholder}
                        type={field.secret ? "password" : "text"}
                        className="h-10 rounded-xl border-line text-[12px] font-mono"
                        value={formData[field.key] || ""}
                        onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                      <p className="text-[9px] text-muted-foreground pl-1">{field.hint}</p>
                    </div>
                  ))}

                  <div className="flex items-center gap-3 pt-2">
                    <Button
                      className="flex-1 h-10 btn-grad text-white rounded-xl text-[10px] font-black uppercase tracking-widest gap-2"
                      onClick={() => handleSave(platform.id)}
                      disabled={saving}
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {saving ? "Connecting..." : "Connect Account"}
                    </Button>
                  </div>

                  <a
                    href={platform.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn("flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest hover:underline", platform.textColor)}
                  >
                    <ExternalLink className="h-3 w-3" />
                    How to get {platform.name} credentials
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {!isLoading && accounts.length === 0 && (
        <div className="text-center py-16 space-y-4">
          <div className="flex items-center justify-center gap-3 text-4xl">
            <span>📱</span><span>🔗</span><span>🚀</span>
          </div>
          <p className="text-lg font-black text-ink">Connect your social accounts to start publishing</p>
          <p className="text-[11px] text-muted-foreground max-w-md mx-auto leading-relaxed">
            Connect Instagram, Facebook, LinkedIn, and Twitter/X to schedule and publish AI-generated content automatically.
          </p>
        </div>
      )}
    </div>
  );
}
