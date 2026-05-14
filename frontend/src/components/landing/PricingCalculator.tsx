import { useState, useEffect } from "react";
import { Check, Info, Calculator, TrendingUp, DollarSign } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

const TOOLS = [
    { id: "seo", name: "SEO & Keyword Tools", cost: 139 },
    { id: "design", name: "Design & Content Visuals", cost: 13 },
    { id: "social_sched", name: "Social Scheduling", cost: 149 },
    { id: "social_listen", name: "Social Listening & Consumer Insights", cost: 3000 },
    { id: "influencer", name: "Influencer Marketing Platform", cost: 3550 },
    { id: "media", name: "Media & Market Intelligence", cost: 1600 },
    { id: "content", name: "Content Generation", cost: 20 },
    { id: "agency", name: "Agency Fees", cost: 4000 },
];

const AGENTS = [
    { id: "lyra", name: "Lyra (Social)", cost: 600 },
    { id: "aris", name: "Aris (SEO/AEO)", cost: 600 },
    { id: "kash", name: "Kash (Performance)", cost: 600 },
    { id: "veda", name: "Veda (Analytics)", cost: 600 },
];

export const PricingCalculator = () => {
    const [adSpend, setAdSpend] = useState(5000);
    const [roi, setRoi] = useState(150);
    const [selectedTools, setSelectedTools] = useState<string[]>(["seo", "design", "content"]);
    const [selectedAgents, setSelectedAgents] = useState<string[]>(["aris"]);
    const [otherCost, setOtherCost] = useState(0);

    const toggleTool = (id: string) => {
        setSelectedTools(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const toggleAgent = (id: string) => {
        setSelectedAgents(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const currentToolCost = TOOLS.filter(t => selectedTools.includes(t.id)).reduce((acc, t) => acc + t.cost, 0) + otherCost;
    const totalCurrentCost = adSpend + currentToolCost;
    
    const fupilotCost = selectedAgents.length * 600;
    const monthlySavings = totalCurrentCost - (adSpend + fupilotCost);
    const annualSavings = monthlySavings * 12;

    const roiImprovement = (roi * 0.3) + roi; // Simplification based on "at least 30%"

    return (
        <section className="py-24 bg-mesh relative overflow-hidden">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <p className="text-[#00FF66] font-semibold tracking-widest text-sm uppercase mb-4">ROI Calculator</p>
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Calculate <span className="text-[#00FF66]">Your Savings</span></h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {/* INPUTS COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card p-8 rounded-3xl space-y-8">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Calculator className="h-6 w-6 text-[#00FF66]" />
                                Your Current Marketing Operations
                            </h3>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-400 uppercase tracking-widest">Monthly Ad Spend ($)</label>
                                        <span className="text-[#00FF66] font-bold text-xl">${adSpend.toLocaleString()}</span>
                                    </div>
                                    <Slider 
                                        defaultValue={[5000]} 
                                        max={50000} 
                                        step={500} 
                                        onValueChange={(val) => setAdSpend(val[0])}
                                        className="py-4"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-medium text-gray-400 uppercase tracking-widest">Current ROI (%)</label>
                                        <span className="text-[#00FF66] font-bold text-xl">{roi}%</span>
                                    </div>
                                    <Slider 
                                        defaultValue={[150]} 
                                        max={500} 
                                        step={10} 
                                        onValueChange={(val) => setRoi(val[0])}
                                        className="py-4"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Your Current Resources</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {TOOLS.map((tool) => (
                                        <button 
                                            key={tool.id}
                                            onClick={() => toggleTool(tool.id)}
                                            className={`p-4 rounded-xl text-left transition-all duration-300 border ${selectedTools.includes(tool.id) ? 'bg-[#00FF66]/10 border-[#00FF66] text-white' : 'glass-card border-white/5 text-gray-400'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold">{tool.name}</span>
                                                <span className="text-xs font-bold">${tool.cost}/mo</span>
                                            </div>
                                        </button>
                                    ))}
                                    <div className="glass-card p-4 rounded-xl border border-white/5">
                                        <div className="flex justify-between items-center h-full">
                                            <span className="text-xs font-semibold text-gray-400">Other Costs</span>
                                            <input 
                                                type="number" 
                                                className="bg-transparent text-right w-20 outline-none text-xs font-bold text-[#00FF66]"
                                                placeholder="$0"
                                                onChange={(e) => setOtherCost(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 space-y-4">
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Your Agents</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {AGENTS.map((agent) => (
                                        <button 
                                            key={agent.id}
                                            onClick={() => toggleAgent(agent.id)}
                                            className={`p-4 rounded-xl text-left transition-all duration-300 border ${selectedAgents.includes(agent.id) ? 'bg-[#00FF66]/10 border-[#00FF66] text-white' : 'glass-card border-white/5 text-gray-400'}`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-semibold">{agent.name}</span>
                                                <span className="text-xs font-bold">$600/mo</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RESULTS COLUMN */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-8 rounded-3xl border-[#00FF66]/30 h-full flex flex-col justify-between">
                            <div className="space-y-8">
                                <h3 className="text-2xl font-bold text-white">Your Savings</h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Monthly Savings</p>
                                        <p className="text-3xl font-extrabold text-[#00FF66]">${monthlySavings.toLocaleString()}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Annual Savings</p>
                                        <p className="text-3xl font-extrabold text-blue-500">${annualSavings.toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Cost Breakdown</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Current Marketing Spend</span>
                                            <span className="text-white">${adSpend.toLocaleString()}/mo</span>
                                        </div>
                                        <div className="flex justify-between text-gray-400">
                                            <span>Current Tool Stack</span>
                                            <span className="text-white">${currentToolCost.toLocaleString()}/mo</span>
                                        </div>
                                        <div className="flex justify-between font-bold pt-2 border-t border-white/5 text-gray-300">
                                            <span>Total Current Cost</span>
                                            <span className="text-[#00FF66]">${totalCurrentCost.toLocaleString()}/mo</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-gray-300">
                                            <span>Solo Spider ({selectedAgents.length} Agents)</span>
                                            <span className="text-blue-500">${fupilotCost}/mo</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-white/10">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Performance Impact</p>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            Our AI agents reduce CAC and increase conversions by at least <span className="text-[#00FF66] font-bold">30%</span>.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">ROI Impact</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg font-bold text-gray-400 line-through">{roi}%</span>
                                                <TrendingUp className="h-4 w-4 text-[#00FF66]" />
                                                <span className="text-2xl font-black text-[#00FF66]">{roiImprovement.toFixed(1)}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8">
                                <Button className="w-full h-14 bg-[#00FF66] text-black hover:bg-[#00CC52] font-bold rounded-2xl shadow-xl shadow-[#00FF66]/20">
                                    Lock in Your Savings
                                </Button>
                                <p className="text-[10px] text-center text-gray-500 mt-4 uppercase tracking-widest">No credit card required to start</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
