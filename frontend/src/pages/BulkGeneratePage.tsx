import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Sparkles, Image as ImageIcon, CheckCircle2, Layers, Fingerprint, Trash2 } from "lucide-react";
import { useActiveProject } from "@/hooks/useActiveProject";

interface BulkTopic {
    id: string;
    keyword: string;
    title: string;
    language: string;
}

const BulkGeneratePage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { activeProjectId } = useActiveProject();
    const projectId = activeProjectId;
    const [loading, setLoading] = useState(false);
    const [generatingTitleFor, setGeneratingTitleFor] = useState<string | null>(null);
    const [integrations, setIntegrations] = useState<any[]>([]);

    // Topics State
    const [topics, setTopics] = useState<BulkTopic[]>([
        { id: "1", keyword: "", title: "", language: "English (US)" }
    ]);

    // Core Settings
    const [globalLanguage, setGlobalLanguage] = useState("English (US)");
    const [articleType, setArticleType] = useState("Standard Blog Post");
    const [articleSize, setArticleSize] = useState("Medium (1000-1500 words)");
    const [researchLevel, setResearchLevel] = useState("Standard AI Search");
    const [tone, setTone] = useState("None");
    const [pointOfView, setPointOfView] = useState("None");
    const [textReadability, setTextReadability] = useState("None");
    const [targetCountry, setTargetCountry] = useState("United States");

    // Other Settings
    const [icp, setIcp] = useState("");
    const [brandVoice, setBrandVoice] = useState("none");
    const [details, setDetails] = useState("");
    const [secondaryKeywords, setSecondaryKeywords] = useState("");
    const [internalLinks, setInternalLinks] = useState("");
    const [externalLinks, setExternalLinks] = useState("");
    const [generateImage, setGenerateImage] = useState(false);
    const [autoPublishTarget, setAutoPublishTarget] = useState("");

    // Structure Settings
    const [structConclusion, setStructConclusion] = useState(true);
    const [structTables, setStructTables] = useState(true);
    const [structH3, setStructH3] = useState(true);
    const [structLists, setStructLists] = useState(true);
    const [structItalics, setStructItalics] = useState(true);
    const [structQuotes, setStructQuotes] = useState(true);
    const [structKeyTakeaways, setStructKeyTakeaways] = useState(true);
    const [structFaq, setStructFaq] = useState(true);
    const [structBold, setStructBold] = useState(true);

    useEffect(() => {
        const fetchIntegrations = async () => {
            if (!user) return;
            const { data } = await (supabase
                .from("workspace_integrations" as any)
                .select("*")
                .eq("user_id", user.id)
                .eq("is_active", true) as any);
            if (data) setIntegrations(data);
        };
        fetchIntegrations();
    }, [user]);

    const addTopic = () => {
        setTopics([...topics, { id: Date.now().toString(), keyword: "", title: "", language: globalLanguage }]);
    };

    const removeTopic = (id: string) => {
        if (topics.length > 1) {
            setTopics(topics.filter(t => t.id !== id));
        } else {
            toast.error("You need at least one topic");
        }
    };

    const updateTopic = (id: string, field: keyof BulkTopic, value: string) => {
        setTopics(topics.map(t => t.id === id ? { ...t, [field]: value } : t));
    };

    const handleGenerateTitle = async (id: string, keyword: string) => {
        if (!keyword.trim()) {
            toast.error("Please enter a Main Keyword first");
            return;
        }
        setGeneratingTitleFor(id);
        try {
            const { data, error } = await supabase.functions.invoke("generate-title", {
                body: { keyword: keyword.trim() }
            });
            if (error) throw error;
            if (data.error) throw new Error(data.error);
            if (data.title) {
                updateTopic(id, 'title', data.title);
                toast.success("Title generated successfully");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to generate title");
        } finally {
            setGeneratingTitleFor(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validTopics = topics.filter(t => t.keyword.trim() && t.title.trim());
        if (validTopics.length === 0) {
            toast.error("Please provide a keyword and title for at least one topic");
            return;
        }

        setLoading(true);
        try {
            const effectiveProjectId = projectId || activeProjectId;
            if (!effectiveProjectId) {
                toast.error("Please select a project first.");
                setLoading(false);
                return;
            }
            let wc = 1200;
            if (articleSize.includes("Small")) wc = 800;
            if (articleSize.includes("Medium")) wc = 1300;
            if (articleSize.includes("Large")) wc = 2200;

            // Create multiple content items
            const insertPromises = validTopics.map(topic => {
                return supabase.from("content_items").insert({
                    user_id: user!.id,
                    project_id: effectiveProjectId,
                    main_keyword: topic.keyword.trim(),
                    secondary_keywords: secondaryKeywords ? secondaryKeywords.split(",").map(k => k.trim()) : [],
                    word_count_target: wc,
                    tone: tone !== "None" ? tone : "Professional",
                    target_country: targetCountry,
                    h1: topic.title.trim(),
                    h2_list: [], // Auto-generated
                    h3_list: [],
                    internal_links: internalLinks ? internalLinks.split(",").map(k => k.trim()) : [],
                    generate_image: generateImage,
                    status: "generating",
                }).select("id").single();
            });

            const results = await Promise.all(insertPromises);
            const ids = results.map(r => r.data?.id).filter(Boolean);

            if (ids.length === 0) throw new Error("Failed to insert records");

            // Fire generations
            ids.forEach(id => {
                supabase.functions.invoke("generate-blog", {
                    body: { contentId: id },
                }).catch((err: any) => console.error("Generation invoke error:", err));
            });

            toast.success(`${validTopics.length} posts queued for generation!`);
            navigate(`/app/en/content/manage-posts`);
        } catch (err: any) {
            toast.error(err.message || "Bulk generation failed");
        } finally {
            setLoading(false);
        }
    };

    const activeWpCount = integrations.filter(i => i.platform === "wordpress").length;
    const totalCreditsRequired = topics.filter(t => t.keyword.trim() && t.title.trim()).length;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black flex items-center gap-2 text-ink">
                        <span className="bg-primary/10 text-primary p-2 rounded-xl">
                            <Layers className="h-5 w-5" />
                        </span>
                        Bulk Article Generation
                    </h1>
                    <p className="text-ink-2 text-sm mt-1 ml-12 font-medium">Generate multiple high-quality articles at once.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold bg-pink/10 text-pink px-4 py-2 rounded-full flex items-center gap-1.5 border border-pink/20 uppercase tracking-wider">
                        Cost: {totalCreditsRequired || 1} Credits
                    </span>
                    <span className="text-xs font-bold bg-primary/10 text-primary px-4 py-2 rounded-full flex items-center gap-1.5 border border-primary/20 uppercase tracking-wider">
                        <Sparkles className="h-4 w-4" /> 50 Credits Available
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Create Multiple Posts Table */}
                <div className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm shadow-slate-100">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-black text-slate-900 text-base">Create Multiple Posts</h3>
                            <p className="text-xs text-slate-800 font-semibold">Add topics to generate articles in bulk</p>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs">
                            <span className="text-slate-700 font-bold whitespace-nowrap">Translate all keywords to:</span>
                            <Select value={globalLanguage} onValueChange={(val) => {
                                setGlobalLanguage(val);
                                setTopics(topics.map(t => ({ ...t, language: val })));
                            }}>
                                <SelectTrigger className="w-[140px] h-9 text-xs bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English (US)">English (US)</SelectItem>
                                    <SelectItem value="English (UK)">English (UK)</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                    <SelectItem value="French">French</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-5">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-3 mb-3 px-2 text-xs font-black text-slate-700 uppercase tracking-wider">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-4">Main Keyword</div>
                            <div className="col-span-7">Title & Actions</div>
                        </div>

                        {/* Rows */}
                        <div className="space-y-3">
                            {topics.map((topic, index) => (
                                <div key={topic.id} className="grid grid-cols-12 gap-3 items-center">
                                    <div className="col-span-1 text-center text-sm font-bold text-slate-800">
                                        {index + 1}
                                    </div>
                                    <div className="col-span-4">
                                        <Input
                                            placeholder="Your keyword"
                                            value={topic.keyword}
                                            onChange={(e) => updateTopic(topic.id, 'keyword', e.target.value)}
                                            className="bg-white border-slate-300 h-10 font-semibold text-slate-900"
                                        />
                                    </div>
                                    <div className="col-span-7 flex gap-2 items-center">
                                        <Input
                                            placeholder="Title will auto-generate if empty, or type here"
                                            value={topic.title}
                                            onChange={(e) => updateTopic(topic.id, 'title', e.target.value)}
                                            className="bg-white h-10 flex-1 border-slate-300 font-semibold text-slate-900 focus:border-primary/40"
                                        />
                                        <Button
                                            type="button"
                                            onClick={() => handleGenerateTitle(topic.id, topic.keyword)}
                                            disabled={generatingTitleFor === topic.id || !topic.keyword.trim()}
                                            className="h-10 btn-grad text-white px-4 font-black text-[10px] uppercase tracking-widest transition-all rounded-xl shrink-0"
                                        >
                                            {generatingTitleFor === topic.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                            {generatingTitleFor === topic.id ? "..." : "Generate"}
                                        </Button>
                                        {topics.length > 1 && (
                                            <button type="button" onClick={() => removeTopic(topic.id)} className="text-slate-800 hover:text-red-500 p-2 transition-colors">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Record Line */}
                        <button type="button" onClick={addTopic} className="mt-4 flex items-center gap-2 text-xs text-primary font-black uppercase tracking-widest hover:bg-primary/10 p-3 w-full justify-center border border-dashed border-primary/30 rounded-xl bg-primary/5 transition-all">
                            <Plus className="h-4 w-4" /> Add Record
                        </button>
                    </div>
                </div>

                {/* Core Settings */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 space-y-5">
                    <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">Core Settings <span className="text-xs text-slate-600 font-semibold ml-2 tracking-normal">(applies to all generated posts)</span></h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Article Type</Label>
                            <Select value={articleType} onValueChange={setArticleType}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Standard Blog Post">Standard Blog Post</SelectItem>
                                    <SelectItem value="How-to Guide">How-to Guide</SelectItem>
                                    <SelectItem value="Listicle">Listicle</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Article Size</Label>
                            <Select value={articleSize} onValueChange={setArticleSize}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Small (500-1000 words)">Small (500-1000 words)</SelectItem>
                                    <SelectItem value="Medium (1000-1500 words)">Medium (1000-1500 words)</SelectItem>
                                    <SelectItem value="Large (1500-2500 words)">Large (1500-2500 words)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Research Level</Label>
                            <Select value={researchLevel} onValueChange={setResearchLevel}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Standard AI Search">Standard AI Search</SelectItem>
                                    <SelectItem value="In-Depth Search">In-Depth Search</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Target Country</Label>
                            <Select value={targetCountry} onValueChange={setTargetCountry}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="United States">United States</SelectItem>
                                    <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                                    <SelectItem value="India">India</SelectItem>
                                    <SelectItem value="Australia">Australia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Tone of Voice</Label>
                            <Select value={tone} onValueChange={setTone}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="Professional">Professional</SelectItem>
                                    <SelectItem value="Conversational">Conversational</SelectItem>
                                    <SelectItem value="Authoritative">Authoritative</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Point of View</Label>
                            <Select value={pointOfView} onValueChange={setPointOfView}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="First Person (I/We)">First Person (I/We)</SelectItem>
                                    <SelectItem value="Second Person (You)">Second Person (You)</SelectItem>
                                    <SelectItem value="Third Person (They/It)">Third Person (They/It)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Text Readability</Label>
                            <Select value={textReadability} onValueChange={setTextReadability}>
                                <SelectTrigger className="bg-white border-slate-300 font-semibold"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="None">None</SelectItem>
                                    <SelectItem value="7th Grade">7th Grade (Simple)</SelectItem>
                                    <SelectItem value="High School">High School</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>


                {/* Structure Settings */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 space-y-5">
                    <h3 className="font-black text-lg text-slate-900">Structure Settings</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Conclusion</Label>
                            <button type="button" onClick={() => setStructConclusion(!structConclusion)} className="flex items-center gap-2 text-sm font-bold w-full text-left text-slate-800 mt-1">
                                <CheckCircle2 className={`h-4 w-4 rounded-full ${structConclusion ? "text-primary bg-primary/10" : "text-slate-400"}`} /> {structConclusion ? "Yes" : "No"}
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Tables</Label>
                            <button type="button" onClick={() => setStructTables(!structTables)} className="flex items-center gap-2 text-sm font-bold w-full text-left text-slate-800 mt-1">
                                <CheckCircle2 className={`h-4 w-4 rounded-full ${structTables ? "text-primary bg-primary/10" : "text-slate-400"}`} /> {structTables ? "Yes" : "No"}
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">H3 Headings</Label>
                            <button type="button" onClick={() => setStructH3(!structH3)} className="flex items-center gap-2 text-sm font-bold w-full text-left text-slate-800 mt-1">
                                <CheckCircle2 className={`h-4 w-4 rounded-full ${structH3 ? "text-primary bg-primary/10" : "text-slate-400"}`} /> {structH3 ? "Yes" : "No"}
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Lists</Label>
                            <button type="button" onClick={() => setStructLists(!structLists)} className="flex items-center gap-2 text-sm font-bold w-full text-left text-slate-800 mt-1">
                                <CheckCircle2 className={`h-4 w-4 rounded-full ${structLists ? "text-primary bg-primary/10" : "text-slate-400"}`} /> {structLists ? "Yes" : "No"}
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Italics</Label>
                            <button type="button" onClick={() => setStructItalics(!structItalics)} className="flex items-center gap-2 text-sm font-bold w-full text-left text-slate-800 mt-1">
                                <CheckCircle2 className={`h-4 w-4 rounded-full ${structItalics ? "text-primary bg-primary/10" : "text-slate-400"}`} /> {structItalics ? "Yes" : "No"}
                            </button>
                        </div>
                        <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">Quotes</Label>
                            <button type="button" onClick={() => setStructQuotes(!structQuotes)} className="flex items-center gap-2 text-sm font-bold w-full text-left text-slate-800 mt-1">
                                <CheckCircle2 className={`h-4 w-4 rounded-full ${structQuotes ? "text-primary bg-primary/10" : "text-slate-400"}`} /> {structQuotes ? "Yes" : "No"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Global Links */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100 space-y-5">
                    <h3 className="font-black text-lg text-slate-900 flex items-center gap-2">Global Links <span className="text-xs text-slate-600 font-semibold ml-2 tracking-normal">(applies to all generated posts)</span></h3>
                    <div className="space-y-2 mt-2">
                        <Label className="font-black flex items-center gap-2 text-slate-900">Internal Links <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 border border-slate-200 font-bold text-slate-800">Optional</Badge></Label>
                        <p className="text-xs text-slate-600 font-semibold">Provide comma-separated URLs or topics. The AI will weave these into all articles.</p>
                        <Textarea
                            value={internalLinks}
                            onChange={(e) => setInternalLinks(e.target.value)}
                            placeholder="https://mysite.com/about, /pricing, https://mysite.com/blog/seo"
                            className="bg-white border-slate-300 min-h-[60px] font-semibold text-slate-900"
                        />
                    </div>
                </div>

                {/* Global Featured Image */}
                <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-100">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base font-black text-slate-900 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-primary" /> Generate Featured Images <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-slate-100 border border-slate-200 font-bold text-slate-800">Optional</Badge>
                            </Label>
                            <p className="text-xs text-slate-600 font-semibold">Automatically fetch and attach a relevant Unsplash image to all WordPress posts.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setGenerateImage(!generateImage)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${generateImage ? 'bg-primary' : 'bg-input'}`}
                        >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-background shadow ring-0 transition duration-200 ease-in-out ${generateImage ? 'translate-x-4' : 'translate-x-0'}`} />
                        </button>
                    </div>
                </div>

                {/* Auto-Publish to Website */}
                <div className="space-y-2 pb-6">
                    <Label className="font-black flex items-center gap-2 text-slate-900">Auto-Publish to Website</Label>
                    <div className="border border-slate-200 bg-white rounded-2xl p-5 shadow-sm mt-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">Select Target Website(s)</Label>
                        {activeWpCount === 0 ? (
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 font-semibold">
                                No verified integrations available. Please setup integrations in <span className="font-bold text-primary cursor-pointer hover:underline" onClick={() => navigate('/integrations')}>integrations here</span>.
                            </div>
                        ) : (
                            <Select value={autoPublishTarget} onValueChange={setAutoPublishTarget}>
                                <SelectTrigger className="w-full sm:w-[350px] bg-white border-slate-300 font-semibold"><SelectValue placeholder="Select WordPress Integration" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Do not auto-publish</SelectItem>
                                    {integrations.filter(i => i.platform === "wordpress").map(i => (
                                        <SelectItem key={i.id} value={i.id}>{i.credentials.url || "WordPress Site"}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-6 border-t flex flex-col items-center gap-2">
                    <Button type="submit" className="w-[300px] btn-grad h-14 text-lg" disabled={loading}>
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Generate All Blog Posts
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default BulkGeneratePage;
