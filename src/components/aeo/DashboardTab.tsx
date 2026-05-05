import { Activity, Search, TrendingUp, Cpu, Globe, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// Mock Data
const visibilityData = [
  { name: 'Mon', visibility: 45 },
  { name: 'Tue', visibility: 52 },
  { name: 'Wed', visibility: 68 },
  { name: 'Thu', visibility: 74 },
  { name: 'Fri', visibility: 85 },
  { name: 'Sat', visibility: 78 },
  { name: 'Sun', visibility: 88 },
];

const sourceData = [
  { name: 'ChatGPT Search', value: 45, color: '#10a37f' },
  { name: 'Perplexity AI', value: 35, color: '#262626' },
  { name: 'Google AI Overviews', value: 20, color: '#4285f4' },
];

const topQueries = [
  { query: 'best seo tools for 2026', engine: 'ChatGPT', sentiment: 'Positive', position: 1 },
  { query: 'how to do AEO effectively', engine: 'Perplexity', sentiment: 'Neutral', position: 2 },
  { query: 'fupilot vs competitors', engine: 'Google AI', sentiment: 'Positive', position: 1 },
  { query: 'automated blog writing software', engine: 'ChatGPT', sentiment: 'Positive', position: 3 },
];

export const DashboardTab = () => {
    return (
        <div className="space-y-6 mt-6 animate-fade-in">
            {/* Quick Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black text-ink uppercase tracking-widest opacity-70">AEO Visibility Score</CardTitle>
                        <Activity className="h-4 w-4 text-primary shadow-[0_0_10px_rgba(144,37,242,0.4)]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">84/100</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-emerald-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3" /> +12%
                            </span>
                             from last week
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black text-ink uppercase tracking-widest opacity-70">Top Position Mentions</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#22d3ee]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">143</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-emerald-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3" /> +24
                            </span>
                             new mentions
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black text-ink uppercase tracking-widest opacity-70">Primary Engine</CardTitle>
                        <Cpu className="h-4 w-4 text-pink" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">ChatGPT</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Accounting for 45% of traffic
                        </p>
                    </CardContent>
                </Card>
                <Card className="glass">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-[10px] font-black text-ink uppercase tracking-widest opacity-70">Brand Sentiment</CardTitle>
                        <Globe className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">92% Positive</div>
                        <Progress value={92} className="h-2 mt-3" />
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                {/* Main Chart */}
                <Card className="md:col-span-5 glass">
                    <CardHeader>
                        <CardTitle className="text-xl font-black text-ink tracking-tight">AI Visibility Over Time</CardTitle>
                        <CardDescription className="text-xs font-medium text-ink-2">
                            Your brand's appearance rate in generated AI answers over the last 7 days.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={visibilityData}>
                                <defs>
                                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#9025F2" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#9025F2" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'var(--ink-2)' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: 'var(--ink-2)' }} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--panel)', borderRadius: '16px', border: '1px solid var(--line)', boxShadow: '0 20px 40px -20px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: 'var(--ink)', fontWeight: 'black', fontSize: '12px' }}
                                />
                                <Area type="monotone" dataKey="visibility" stroke="#9025F2" strokeWidth={4} fillOpacity={1} fill="url(#colorVis)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart */}
                <Card className="md:col-span-2 glass">
                    <CardHeader>
                        <CardTitle className="text-xl font-black text-ink tracking-tight">Mentions by Engine</CardTitle>
                        <CardDescription className="text-xs font-medium text-ink-2">Where you appear most</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[250px] flex flex-col items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={sourceData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {sourceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'var(--panel)', borderRadius: '16px', border: '1px solid var(--line)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-full mt-4 space-y-2">
                            {sourceData.map((item) => (
                                <div key={item.name} className="flex items-center justify-between text-[11px] font-bold text-ink-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span>{item.name}</span>
                                    </div>
                                    <span className="font-black text-ink">{item.value}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Queries Table */}
            <Card className="glass">
                <CardHeader>
                    <CardTitle className="text-xl font-black text-ink tracking-tight">Top AI Queries Driving Visibility</CardTitle>
                    <CardDescription className="text-xs font-medium text-ink-2">The actual questions users asked where your brand was recommended.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                                <tr>
                                    <th className="px-6 py-4 rounded-tl-lg font-medium">User Prompt / Query</th>
                                    <th className="px-6 py-4 font-medium">AI Engine</th>
                                    <th className="px-6 py-4 font-medium">Sentiment</th>
                                    <th className="px-6 py-4 rounded-tr-lg font-medium">Citation Position</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {topQueries.map((item, i) => (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{item.query}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{item.engine}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={item.sentiment === 'Positive' ? 'default' : 'secondary'} 
                                                className={item.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>
                                                {item.sentiment}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs">
                                                #{item.position}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
