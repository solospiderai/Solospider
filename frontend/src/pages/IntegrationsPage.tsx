import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Trash2, CheckCircle, Store, BookOpen } from "lucide-react";

interface Integration {
    id: string;
    platform: string;
    credentials: {
        url?: string;
        username?: string;
        app_password?: string;
        auto_publish?: boolean;
        store_name?: string;
        shop_domain?: string;
        client_id?: string;
        client_secret?: string;
    };
    is_active: boolean;
    created_at: string;
}

const IntegrationsPage = () => {
    const { user } = useAuth();
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchIntegrations = async () => {
        if (!user) return;
        setLoading(true);
        const { data, error } = await (supabase
            .from("workspace_integrations" as any)
            .select("*")
            .eq("user_id", user.id)
            .in("platform", ["wordpress", "shopify"]) as any);

        if (error) {
            toast.error("Failed to load integrations");
        } else {
            setIntegrations((data as Integration[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchIntegrations();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to disconnect this integration?")) return;
        const { error } = await supabase
            .from("workspace_integrations" as any)
            .delete()
            .eq("id", id);

        if (error) {
            toast.error("Failed to disconnect");
        } else {
            toast.success("Disconnected successfully");
            fetchIntegrations();
        }
    };

    const getIntegrationStatus = (platform: string) => {
        return integrations.find(i => i.platform === platform);
    };

    const AppCard = ({
        title,
        description,
        icon: Icon,
        platformId,
        comingSoon = false,
        linkUrl
    }: {
        title: string,
        description: string,
        icon: any,
        platformId: string,
        comingSoon?: boolean,
        linkUrl?: string
    }) => {
        const existingIntegration = getIntegrationStatus(platformId);

        return (
            <Card className="flex flex-col h-full bg-card/60 border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {platformId === 'wordpress' ? (
                            <img src="https://cdn.simpleicons.org/wordpress/21759B" alt="WordPress" className="h-7 w-7 object-contain" />
                        ) : platformId === 'shopify' ? (
                            <img src="https://cdn.simpleicons.org/shopify/95BF47" alt="Shopify" className="h-7 w-7 object-contain" />
                        ) : (
                            <Icon className="h-6 w-6 text-primary" />
                        )}
                    </div>
                    <div className="flex-1">
                        <CardTitle className="text-xl flex items-center justify-between">
                            {title}
                            {existingIntegration && <CheckCircle className="h-5 w-5 text-green-500" />}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 pt-2">
                    <p className="text-sm text-muted-foreground">{description}</p>
                    {existingIntegration && (
                        <div className="mt-4 p-3 bg-muted rounded-md border text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">Connected: </span>
                            {new Date(existingIntegration.created_at).toLocaleDateString()}
                            <div className="mt-1 font-medium truncate text-foreground flex items-center gap-1">
                                {platformId === 'wordpress' ? existingIntegration.credentials.url : existingIntegration.credentials.shop_domain}
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="pt-0 justify-between items-center gap-4">
                    {comingSoon ? (
                        <div className="w-full text-center py-2.5 text-sm font-medium text-muted-foreground border rounded-md bg-muted/50 cursor-not-allowed">
                            Coming Soon
                        </div>
                    ) : (
                        <>
                            {existingIntegration ? (
                                <Button variant="destructive" className="w-full text-sm font-semibold rounded-md shadow-sm" onClick={() => handleDelete(existingIntegration.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Disconnect
                                </Button>
                            ) : (
                                <Button asChild className="w-full text-sm font-semibold rounded-md shadow-sm">
                                    <Link to={linkUrl || "#"}>
                                        Add New
                                    </Link>
                                </Button>
                            )}
                        </>
                    )}
                </CardFooter>
            </Card>
        );
    };

    return (
        <div className="p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Content Management & Website Builders</h1>
                <p className="text-muted-foreground mt-1">Build, manage, and optimize your digital presence with powerful CMS and website building tools</p>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">

                    <AppCard
                        title="WordPress Plugin"
                        description="Automatically publish your generated blog posts directly to your WordPress site with one click."
                        icon={BookOpen}
                        platformId="wordpress"
                        linkUrl="/integrations/wordpress"
                    />

                    <AppCard
                        title="Shopify"
                        description="Publish generated blog content directly to your Shopify store blog to boost SEO and engagement."
                        icon={Store}
                        platformId="shopify"
                        linkUrl="/integrations/shopify"
                    />

                    <AppCard
                        title="Webflow"
                        description="Direct integration with Webflow CMS to publish AI-optimized content automatically."
                        icon={BookOpen}
                        platformId="webflow"
                        comingSoon={true}
                    />

                    <AppCard
                        title="Framer"
                        description="Sync your Framer CMS with Solo Spider to maintain AI visibility on your site."
                        icon={BookOpen}
                        platformId="framer"
                        comingSoon={true}
                    />

                </div>
            )}
        </div>
    );
};

export default IntegrationsPage;
