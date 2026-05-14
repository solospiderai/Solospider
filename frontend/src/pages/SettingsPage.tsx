import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, User, CreditCard, Settings2, Save, ShieldCheck } from "lucide-react";

interface CreditTransaction {
    id: string;
    type: string;
    amount: number;
    status: string;
    created_at: string;
    content_id: string | null;
}

const SettingsPage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [credits, setCredits] = useState<{ total: number; used: number; remaining: number } | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

    // Security
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    // Preferences (stored in localStorage for now)
    const [defaultTone, setDefaultTone] = useState(() => localStorage.getItem("bf_default_tone") || "Professional");
    const [defaultCountry, setDefaultCountry] = useState(() => localStorage.getItem("bf_default_country") || "India");
    const [defaultWordCount, setDefaultWordCount] = useState(() => localStorage.getItem("bf_default_word_count") || "1200");

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            setLoading(true);

            // Fetch credits
            const { data: creditData } = await (supabase
                .from("workspace_credits" as any)
                .select("total_credits, used_credits, locked_credits")
                .eq("user_id", user.id)
                .single() as any);

            if (creditData) {
                setCredits({
                    total: creditData.total_credits,
                    used: creditData.used_credits,
                    remaining: creditData.total_credits - creditData.used_credits - creditData.locked_credits,
                });
            } else {
                // Auto-provision 50 credits for new users fallback
                const { error: insertError } = await supabase
                    .from("workspace_credits" as any)
                    .insert({
                        user_id: user.id,
                        total_credits: 50,
                        used_credits: 0,
                        locked_credits: 0
                    } as any);

                if (!insertError) {
                    setCredits({ total: 50, used: 0, remaining: 50 });
                }
            }

            // Fetch transactions
            const { data: txData } = await (supabase
                .from("credit_transactions" as any)
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(20) as any);

            setTransactions((txData as CreditTransaction[]) || []);
            setLoading(false);
        };
        fetchData();
    }, [user]);

    const handleSavePreferences = () => {
        setSaving(true);
        localStorage.setItem("bf_default_tone", defaultTone);
        localStorage.setItem("bf_default_country", defaultCountry);
        localStorage.setItem("bf_default_word_count", defaultWordCount);
        setTimeout(() => {
            setSaving(false);
            toast.success("Preferences saved");
        }, 300);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setIsChangingPassword(true);
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        setIsChangingPassword(false);

        if (error) {
            toast.error(error.message || "Failed to change password");
        } else {
            toast.success("Password changed successfully!");
            setNewPassword("");
            setConfirmPassword("");
        }
    };

    const txTypeConfig: Record<string, { label: string; color: string }> = {
        usage: { label: "Usage", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
        refund: { label: "Refund", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
        manual_adjustment: { label: "Adjustment", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
        reset: { label: "Reset", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    };

    const txStatusConfig: Record<string, string> = {
        locked: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        refunded: "bg-muted text-muted-foreground",
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Profile Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-primary" />
                            Profile
                        </CardTitle>
                        <CardDescription>Your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground text-xs">Email</Label>
                                <p className="font-medium">{user?.email || "—"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">User ID</Label>
                                <p className="font-mono text-sm text-muted-foreground truncate">{user?.id || "—"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Member Since</Label>
                                <p className="font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground text-xs">Auth Provider</Label>
                                <p className="font-medium capitalize">{user?.app_metadata?.provider || "email"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security Card */}
                {user?.app_metadata?.provider === "email" && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ShieldCheck className="h-5 w-5 text-primary" />
                                Security
                            </CardTitle>
                            <CardDescription>Update your password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!showPasswordForm ? (
                                <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
                                    Change Password
                                </Button>
                            ) : (
                                <form onSubmit={handlePasswordChange} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="new-password">New Password</Label>
                                            <Input
                                                id="new-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                minLength={6}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                                            <Input
                                                id="confirm-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                minLength={6}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="submit" disabled={isChangingPassword || !newPassword || !confirmPassword} size="sm">
                                            {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                            Update Password
                                        </Button>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => {
                                            setShowPasswordForm(false);
                                            setNewPassword("");
                                            setConfirmPassword("");
                                        }}>
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Default Preferences */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Settings2 className="h-5 w-5 text-primary" />
                            Default Preferences
                        </CardTitle>
                        <CardDescription>These will pre-fill when creating new blogs</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label>Default Tone</Label>
                                <Select value={defaultTone} onValueChange={setDefaultTone}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Professional">Professional</SelectItem>
                                        <SelectItem value="Conversational">Conversational</SelectItem>
                                        <SelectItem value="Formal">Formal</SelectItem>
                                        <SelectItem value="Friendly">Friendly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Default Country</Label>
                                <Select value={defaultCountry} onValueChange={setDefaultCountry}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="India">India</SelectItem>
                                        <SelectItem value="USA">USA</SelectItem>
                                        <SelectItem value="UK">UK</SelectItem>
                                        <SelectItem value="Global">Global</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Default Word Count</Label>
                                <Input
                                    type="number"
                                    min={500}
                                    max={3000}
                                    step={100}
                                    value={defaultWordCount}
                                    onChange={(e) => setDefaultWordCount(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button onClick={handleSavePreferences} disabled={saving} size="sm">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Preferences
                        </Button>
                    </CardContent>
                </Card>

                {/* Credit Usage */}
                {credits && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Credits
                            </CardTitle>
                            <CardDescription>Your credit balance and transaction history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Credit Bar */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="font-medium">{credits.used} / {credits.total} used</span>
                                    <span className="text-muted-foreground">{credits.remaining} remaining</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full gradient-primary rounded-full transition-all duration-700"
                                        style={{ width: `${(credits.used / credits.total) * 100}%` }}
                                    />
                                </div>
                            </div>

                            {/* Transaction History */}
                            <h4 className="font-semibold text-sm mb-3">Recent Transactions</h4>
                            {transactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No transactions yet</p>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {transactions.map((tx) => {
                                        const typeConf = txTypeConfig[tx.type] || txTypeConfig.usage;
                                        const statusClass = txStatusConfig[tx.status] || "";
                                        return (
                                            <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg border bg-card/50 text-sm">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className={typeConf.color}>{typeConf.label}</Badge>
                                                    <span className="text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{tx.type === "refund" ? "+" : "-"}{Math.abs(tx.amount)}</span>
                                                    <Badge variant="secondary" className={`text-xs ${statusClass}`}>{tx.status}</Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;
