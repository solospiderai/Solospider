import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowLeft, Loader2, BookOpen } from "lucide-react";

const WordPressIntegrationPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [url, setUrl] = useState("");
    const [username, setUsername] = useState("");
    const [appPassword, setAppPassword] = useState("");
    const [autoPublish, setAutoPublish] = useState(false);

    const [isSaving, setIsSaving] = useState(false);

    const handleConnectWordPress = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url || !username || !appPassword) {
            toast.error("Please fill all fields");
            return;
        }

        setIsSaving(true);
        try {
            // 1. Prepare clean URL
            let cleanUrl = url.trim();
            if (cleanUrl.endsWith("/")) cleanUrl = cleanUrl.slice(0, -1);

            // 2. Test WordPress Credentials
            const authString = btoa(`${username.trim()}:${appPassword.trim()}`);
            const testResponse = await fetch(`${cleanUrl}/wp-json/wp/v2/users/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Basic ${authString}`,
                    "Content-Type": "application/json"
                }
            });

            if (!testResponse.ok) {
                if (testResponse.status === 401) {
                    throw new Error("Invalid Username or Application Password.");
                } else if (testResponse.status === 404) {
                    throw new Error("WordPress REST API not found at this URL. Make sure it's a valid WordPress site.");
                } else {
                    throw new Error(`WordPress returned an error: ${testResponse.status} ${testResponse.statusText}`);
                }
            }

            // 3. If validation successful, save to Supabase
            const { error } = await supabase
                .from("workspace_integrations" as any)
                .insert({
                    user_id: user!.id,
                    platform: "wordpress",
                    credentials: { url: cleanUrl, username: username.trim(), app_password: appPassword.trim(), auto_publish: autoPublish },
                    is_active: true
                });

            if (error) throw error;

            toast.success("WordPress connected successfully!");
            navigate("/integrations");
        } catch (err: any) {
            toast.error(err.message || "Failed to add WordPress integration");
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
                        <img src="https://cdn.simpleicons.org/wordpress/21759B" alt="WordPress" className="h-6 w-6 object-contain" />
                        WordPress Plugin Integration
                    </h1>
                </div>
            </div>

            {/* Video Tutorial Placeholder */}
            <Card className="mb-12 overflow-hidden border-primary/10 shadow-sm bg-card/60">
                <div className="p-6 border-b bg-muted/30">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Video Tutorial
                    </h2>
                    <p className="text-muted-foreground text-sm mt-1">Watch this step-by-step guide to set up the WordPress integration.</p>
                </div>
                <div className="w-full aspect-video bg-black/90 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-black/80 flex items-center justify-center">
                        <div className="text-center group cursor-pointer transition-transform hover:scale-105">
                            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/10 group-hover:ring-red-600/30 transition-all">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play ml-1"><polygon points="6 3 20 12 6 21 6 3" /></svg>
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-widest drop-shadow-md">PLAY TUTORIAL</h3>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid lg:grid-cols-2 gap-8 items-start">

                {/* Left Side: Setup Instructions */}
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-6">How to Connect</h2>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">

                            {/* Step 1 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    1
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Create Application Password</p>
                                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                                        Log into your WordPress Admin Dashboard. Navigate to <strong>Users &gt; Profile</strong>.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    2
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Generate the Password</p>
                                    <p className="text-sm text-muted-foreground mt-1 mb-3">
                                        Scroll down to the <strong>Application Passwords</strong> section. Enter a name (e.g. "Solo Spider") and click "Add New Application Password".
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="relative flex items-start gap-4">
                                <span className="relative flex items-center justify-center shrink-0 w-8 h-8 font-medium text-sm rounded-full bg-primary/10 text-primary z-10 ring-4 ring-background">
                                    3
                                </span>
                                <div className="pt-1">
                                    <p className="font-semibold text-foreground">Configure Settings</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Copy the generated password (it looks like <code>xxxx xxxx xxxx xxxx</code>) and paste it into the form on the right, along with your admin Username and Site URL.
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
                            <form onSubmit={handleConnectWordPress} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="url" className="font-semibold">Site URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://mysite.com"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="bg-background"
                                    />
                                    <p className="text-xs text-muted-foreground">The full URL of your WordPress installation.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="username" className="font-semibold">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="admin"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-background"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="appPassword" className="font-semibold">Application Password</Label>
                                    <Input
                                        id="appPassword"
                                        type="password"
                                        placeholder="xxxx xxxx xxxx xxxx"
                                        value={appPassword}
                                        onChange={(e) => setAppPassword(e.target.value)}
                                        className="bg-background font-mono text-sm"
                                    />
                                </div>

                                <div className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-background/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Auto-Publish</Label>
                                        <p className="text-xs text-muted-foreground pr-4">Automatically push generated content live to this WordPress site.</p>
                                    </div>
                                    <Switch checked={autoPublish} onCheckedChange={setAutoPublish} />
                                </div>

                                <Button type="submit" className="w-full text-md font-medium h-11" disabled={isSaving}>
                                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Connect WordPress"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default WordPressIntegrationPage;
