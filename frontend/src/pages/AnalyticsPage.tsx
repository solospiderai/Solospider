import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2, FileText, TrendingUp, Zap, Hash } from "lucide-react";

interface ContentItem {
    id: string;
    main_keyword: string;
    status: string;
    word_count_target: number;
    created_at: string;
    generated_content: string | null;
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

const AnalyticsPage = () => {
    const { user } = useAuth();
    const [items, setItems] = useState<ContentItem[]>([]);
    const [credits, setCredits] = useState<{ total: number; used: number; remaining: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: contentData } = await supabase
                .from("content_items")
                .select("id, main_keyword, status, word_count_target, created_at, generated_content")
                .eq("user_id", user?.id)
                .order("created_at", { ascending: true });

            setItems(contentData || []);

            if (user) {
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
            }
            setLoading(false);
        };
        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    // Compute analytics
    const totalBlogs = items.length;
    const completed = items.filter(i => i.status === "completed" || i.status === "published").length;
    const totalWordsWritten = items.reduce((sum, i) => {
        const content = i.generated_content || "";
        return sum + content.split(/\s+/).filter(Boolean).length;
    }, 0);

    // Status distribution
    const statusCounts: Record<string, number> = {};
    items.forEach(i => {
        statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Monthly blog generation
    const monthlyData: Record<string, number> = {};
    items.forEach(i => {
        const month = new Date(i.created_at).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    const chartData = Object.entries(monthlyData).map(([month, count]) => ({ month, blogs: count }));

    // Word count distribution
    const wordBuckets = [
        { range: "< 800", min: 0, max: 799 },
        { range: "800-1200", min: 800, max: 1200 },
        { range: "1200-2000", min: 1201, max: 2000 },
        { range: "2000+", min: 2001, max: Infinity },
    ];
    const wordDistribution = wordBuckets.map(b => ({
        range: b.range,
        count: items.filter(i => i.word_count_target >= b.min && i.word_count_target <= b.max).length,
    }));

    // Top keywords
    const keywordCounts: Record<string, number> = {};
    items.forEach(i => {
        const kw = i.main_keyword.toLowerCase().trim();
        keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
    });
    const topKeywords = Object.entries(keywordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return (
        <div className="p-8 max-w-6xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-muted-foreground text-sm mt-1">Insights into your content generation</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard icon={FileText} label="Total Posts" value={totalBlogs} color="text-primary" bg="bg-primary/10" />
                <StatCard icon={TrendingUp} label="Completed" value={completed} color="text-emerald-500" bg="bg-emerald-500/10" />
                <StatCard icon={Hash} label="Words Written" value={totalWordsWritten.toLocaleString()} color="text-blue-500" bg="bg-blue-500/10" />
                <StatCard icon={Zap} label="Credits Used" value={credits?.used ?? 0} color="text-amber-500" bg="bg-amber-500/10" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Monthly Generation */}
                <div className="border rounded-xl bg-card p-6">
                    <h3 className="font-semibold mb-4">Blogs Generated Over Time</h3>
                    {chartData.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                    ) : (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderColor: 'hsl(var(--border))',
                                        borderRadius: '0.75rem',
                                        color: 'hsl(var(--foreground))',
                                    }}
                                />
                                <Bar dataKey="blogs" fill="hsl(160, 84%, 39%)" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Status Distribution */}
                <div className="border rounded-xl bg-card p-6">
                    <h3 className="font-semibold mb-4">Content Status</h3>
                    {statusData.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                    ) : (
                        <div className="flex items-center gap-6">
                            <ResponsiveContainer width="50%" height={200}>
                                <PieChart>
                                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {statusData.map((_, index) => (
                                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            borderColor: 'hsl(var(--border))',
                                            borderRadius: '0.75rem',
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-2">
                                {statusData.map((item, i) => (
                                    <div key={item.name} className="flex items-center gap-2 text-sm">
                                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="capitalize text-muted-foreground">{item.name}</span>
                                        <span className="font-semibold ml-auto">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Word Count Distribution */}
                <div className="border rounded-xl bg-card p-6">
                    <h3 className="font-semibold mb-4">Word Count Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={wordDistribution}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="range" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <YAxis allowDecimals={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'hsl(var(--card))',
                                    borderColor: 'hsl(var(--border))',
                                    borderRadius: '0.75rem',
                                    color: 'hsl(var(--foreground))',
                                }}
                            />
                            <Bar dataKey="count" fill="hsl(220, 70%, 55%)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Top Keywords */}
                <div className="border rounded-xl bg-card p-6">
                    <h3 className="font-semibold mb-4">Top Keywords</h3>
                    {topKeywords.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
                    ) : (
                        <div className="space-y-3">
                            {topKeywords.map(([keyword, count], i) => {
                                const maxCount = topKeywords[0][1] as number;
                                const pct = (count / maxCount) * 100;
                                return (
                                    <div key={keyword}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="truncate mr-4">{keyword}</span>
                                            <span className="text-muted-foreground font-medium">{count}</span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Credit Usage */}
            {credits && (
                <div className="mt-6 border rounded-xl bg-card p-6">
                    <h3 className="font-semibold mb-4">Credit Usage</h3>
                    <div className="flex items-center gap-6">
                        <div className="flex-1">
                            <div className="h-4 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full gradient-primary rounded-full transition-all duration-700"
                                    style={{ width: `${(credits.used / credits.total) * 100}%` }}
                                />
                            </div>
                            <div className="flex justify-between text-sm mt-2 text-muted-foreground">
                                <span>{credits.used} used</span>
                                <span>{credits.remaining} remaining</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold">{credits.remaining}</p>
                            <p className="text-xs text-muted-foreground">of {credits.total} credits</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color, bg }: {
    icon: any;
    label: string;
    value: string | number;
    color: string;
    bg: string;
}) => (
    <div className="p-4 rounded-xl border bg-card hover:shadow-md transition-all duration-300 group">
        <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg ${bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
            </div>
        </div>
    </div>
);

export default AnalyticsPage;
