import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, RefreshCw, Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface BlogImage {
    id: string;
    content_id: string;
    user_id: string;
    image_url: string;
    prompt: string | null;
    image_type: string;
    section_heading: string | null;
    status: string;
    created_at: string;
}

interface ImageGalleryProps {
    contentId: string;
    userId: string;
}

const ImageGallery = ({ contentId, userId }: ImageGalleryProps) => {
    const [images, setImages] = useState<BlogImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [expanded, setExpanded] = useState(true);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const pollCountRef = useRef(0);

    const fetchImages = useCallback(async () => {
        const { data, error } = await (supabase
            .from("blog_images" as any)
            .select("*")
            .eq("content_id", contentId)
            .order("created_at", { ascending: true }) as any);

        if (!error && data) {
            setImages(data as BlogImage[]);
            return (data as BlogImage[]).length;
        }
        return 0;
    }, [contentId, userId]);

    // Stop polling helper
    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        pollCountRef.current = 0;
    }, []);

    // Start polling — checks every 4 seconds for up to 90 seconds
    const startPolling = useCallback(() => {
        stopPolling();
        pollCountRef.current = 0;

        pollRef.current = setInterval(async () => {
            pollCountRef.current++;
            const count = await fetchImages();

            // Stop polling if we got images or exceeded 90s (22 polls × 4s)
            if (count > 0 || pollCountRef.current >= 22) {
                stopPolling();
                setGenerating(false);
                if (count === 0) {
                    toast.error("Image generation timed out. Check Supabase function logs.");
                }
            }
        }, 4000);
    }, [fetchImages, stopPolling]);

    useEffect(() => {
        fetchImages().then(() => setLoading(false));

        // Try realtime, but polling is the primary mechanism
        const channel = supabase
            .channel(`blog-images-${contentId}`)
            .on("postgres_changes", {
                event: "*",
                schema: "public",
                table: "blog_images",
                filter: `content_id=eq.${contentId}`,
            }, () => {
                fetchImages();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            stopPolling();
        };
    }, [contentId, fetchImages, stopPolling]);

    const handleGenerateImages = async () => {
        setGenerating(true);
        try {
            // Use direct fetch instead of supabase.functions.invoke to avoid URL issues
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
            const { data: { session } } = await supabase.auth.getSession();

            const res = await fetch(`${supabaseUrl}/functions/v1/generate-images`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": supabaseKey,
                    "Authorization": `Bearer ${session?.access_token || supabaseKey}`,
                },
                body: JSON.stringify({ contentId, userId }),
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(`Function error ${res.status}: ${errText}`);
            }
            toast.success("Generating images... this may take 1-2 minutes.");
            startPolling();
        } catch (err: any) {
            toast.error(err.message || "Failed to start image generation");
            setGenerating(false);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error("Not authenticated. Please refresh the page and try again.");

            const { error } = await (supabase
                .from("blog_images" as any)
                .delete()
                .eq("id", imageId) as any);
            if (error) throw error;
            setImages(prev => prev.filter(img => img.id !== imageId));
            toast.success("Image deleted");
        } catch (err: any) {
            toast.error(err.message || "Failed to delete image");
        }
    };

    const handleRegenerateAll = async () => {
        try {
            await (supabase
                .from("blog_images" as any)
                .delete()
                .eq("content_id", contentId) as any);
            setImages([]);
        } catch (err) {
            console.error("Error clearing images:", err);
        }
        handleGenerateImages();
    };

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to delete all generated images for this post? This cannot be undone.")) return;

        try {
            setGenerating(true);
            const { error } = await (supabase
                .from("blog_images" as any)
                .delete()
                .eq("content_id", contentId) as any);

            if (error) throw error;

            setImages([]);
            toast.success("All images cleared successfully");
        } catch (err: any) {
            console.error("Error clearing images:", err);
            toast.error(err.message || "Failed to clear images");
        } finally {
            setGenerating(false);
        }
    };

    const handleManualRefresh = async () => {
        setLoading(true);
        await fetchImages();
        setLoading(false);
        toast.success("Refreshed");
    };

    const featuredImage = images.find(img => img.image_type === "featured");
    const sectionImages = images.filter(img => img.image_type === "section");

    return (
        <div className="mb-6 rounded-xl border bg-card overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between bg-muted/20 hover:bg-muted/30 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                            Blog Images
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                                {images.length} images
                            </Badge>
                        </h3>
                        <p className="text-[11px] text-muted-foreground">
                            Generate and preview images before publishing
                        </p>
                    </div>
                </div>
                {expanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {expanded && (
                <div className="p-4 space-y-4">
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap items-center">
                        {images.length === 0 ? (
                            <Button
                                onClick={handleGenerateImages}
                                disabled={generating}
                                size="sm"
                                className="shadow-sm"
                            >
                                {generating ? (
                                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Sparkles className="mr-2 h-3.5 w-3.5" />
                                )}
                                {generating ? "Generating... (takes 1-2 min)" : "Generate Images"}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    onClick={handleRegenerateAll}
                                    disabled={generating}
                                    variant="outline"
                                    size="sm"
                                >
                                    {generating ? (
                                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                        <RefreshCw className="mr-2 h-3.5 w-3.5" />
                                    )}
                                    {generating ? "Regenerating..." : "Regenerate All"}
                                </Button>
                                <Button
                                    onClick={handleClearAll}
                                    disabled={generating}
                                    variant="destructive"
                                    size="sm"
                                >
                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                    Clear All
                                </Button>
                            </>
                        )}
                        {/* Manual refresh — useful if realtime is down */}
                        {generating && (
                            <Button
                                onClick={handleManualRefresh}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted-foreground"
                            >
                                <RefreshCw className="mr-1 h-3 w-3" />
                                Check Now
                            </Button>
                        )}
                    </div>

                    {/* Generating hint */}
                    {generating && (
                        <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-3 flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                            AI is generating image prompts via OpenRouter and loading them from Pollinations AI. Auto-checking every 4 seconds — or click "Check Now" to refresh immediately.
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && !generating && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Empty State */}
                    {!loading && images.length === 0 && !generating && (
                        <div className="text-center py-8 bg-muted/10 rounded-lg border border-dashed">
                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                                No images yet. Click "Generate Images" to create AI images for each section.
                            </p>
                        </div>
                    )}

                    {/* Featured Image */}
                    {featuredImage && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-violet-600">
                                        Featured
                                    </Badge>
                                    Blog Header Image
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteImage(featuredImage.id)}
                                    className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                            <div className="relative group rounded-lg overflow-hidden border bg-muted/20">
                                <img
                                    src={featuredImage.image_url}
                                    alt="Featured blog image"
                                    className="w-full h-auto max-h-[300px] object-cover"
                                    loading="lazy"
                                />
                                {featuredImage.prompt && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[11px] p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="font-medium">Prompt:</span> {featuredImage.prompt}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section Images Grid */}
                    {sectionImages.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Section Images</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {sectionImages.map((img) => (
                                    <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-muted/20">
                                        <img
                                            src={img.image_url}
                                            alt={img.section_heading || "Section image"}
                                            className="w-full h-auto max-h-[200px] object-cover"
                                            loading="lazy"
                                        />
                                        <div className="p-2 flex items-center justify-between bg-card/80">
                                            <span className="text-[11px] font-medium truncate flex-1">
                                                {img.section_heading || "Section"}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500 shrink-0"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {img.prompt && (
                                            <div className="absolute top-0 left-0 right-0 bg-black/70 text-white text-[10px] p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {img.prompt}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageGallery;
