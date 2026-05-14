import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Store } from "lucide-react";

const ShopifyIntegrationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Shopify Credentials State
    const [storeName, setStoreName] = useState("");
    const [shopDomain, setShopDomain] = useState("");
    const [clientId, setClientId] = useState("");
    const [clientSecret, setClientSecret] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const handleConnectShopify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!storeName || !shopDomain || !clientId || !clientSecret) {
            toast.error("Please fill all required fields.");
            return;
        }

        setIsSaving(true);
        try {
            // Clean the shop domain url
            let cleanDomain = shopDomain.trim().toLowerCase();
            if (cleanDomain.startsWith("http://")) cleanDomain = cleanDomain.replace("http://", "");
            if (cleanDomain.startsWith("https://")) cleanDomain = cleanDomain.replace("https://", "");
            if (cleanDomain.endsWith("/")) cleanDomain = cleanDomain.slice(0, -1);

            const { error } = await supabase
                .from("workspace_integrations" as any)
                .insert({
                    user_id: user!.id,
                    platform: "shopify",
                    credentials: {
                        store_name: storeName.trim(),
                        shop_domain: cleanDomain,
                        client_id: clientId.trim(),
                        client_secret: clientSecret.trim(),
                    },
                    is_active: true
                });

            if (error) throw error;

            toast.success("Shopify store connected successfully!");
            navigate("/integrations");
        } catch (err: any) {
            toast.error(err.message || "Failed to save Shopify integration");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/integrations">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <img src="https://cdn.simpleicons.org/shopify/95BF47" alt="Shopify" className="h-6 w-6 object-contain" />
                        Connect Shopify Store
                    </h1>
                    <p className="text-muted-foreground mt-1">Configure your Shopify integration to auto-publish articles.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">

                {/* Left Side: Setup Instructions */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-4">How to Connect</h2>

                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">

                            {/* Step 1 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    1
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Open Shopify Dev Dashboard</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Go to <a href="https://partners.shopify.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">partners.shopify.com</a> and log in with your store owner account.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    2
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Create a New App</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Click <strong>Apps → Create app</strong>. Name it something like "Solo Spider AI" and continue.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    3
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Set API Permissions</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Open your app → <strong>Configuration → Admin API access scopes</strong>. Enable <strong>Read & Write</strong> access for <strong>Content (Blogs & Articles)</strong>. Click Save.
                                    </p>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    4
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Install the App to Your Store</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Click <strong>Install app</strong>. Choose your Shopify store and approve access.
                                    </p>
                                </div>
                            </div>

                            {/* Step 5 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    5
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Copy App Credentials</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Go to <strong>Credentials / Settings</strong> inside the app and copy your <strong>Client ID</strong> and <strong>Client Secret</strong>.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Right Side: Connection Form */}
                <div className="sticky top-8">
                    <Card className="shadow-lg border-primary/20 bg-card/60 backdrop-blur-sm">
                        <CardContent className="p-6">
                            <form onSubmit={handleConnectShopify} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName" className="font-semibold">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        placeholder="My Shopify Store"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="shopDomain" className="font-semibold">Shop Domain</Label>
                                    <Input
                                        id="shopDomain"
                                        placeholder="https://your-store.myshopify.com"
                                        value={shopDomain}
                                        onChange={(e) => setShopDomain(e.target.value)}
                                        className="bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground">The `.myshopify.com` domain associated with your store.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientId" className="font-semibold">Client ID</Label>
                                    <Input
                                        id="clientId"
                                        placeholder="Shopify App Client ID"
                                        value={clientId}
                                        onChange={(e) => setClientId(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="clientSecret" className="font-semibold">Client Secret</Label>
                                    <Input
                                        id="clientSecret"
                                        type="password"
                                        placeholder="shpss_..."
                                        value={clientSecret}
                                        onChange={(e) => setClientSecret(e.target.value)}
                                        className="bg-background font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">Typically starts with `shpss_`</p>
                                </div>

                                <Button type="submit" className="w-full text-md font-medium h-11" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Connect Shopify"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default ShopifyIntegrationPage;
