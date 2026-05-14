import { Search, Activity, Sparkles, X, LayoutDashboard, Target, Crosshair, PenTool, Lightbulb, Zap, LineChart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Modular Tabs
import { DashboardTab } from "@/components/aeo/DashboardTab";
import { PromptsTrackingTab } from "@/components/aeo/PromptsTrackingTab";
import { CompetitorInsightsTab } from "@/components/aeo/CompetitorInsightsTab";
import { ContentEngineTab } from "@/components/aeo/ContentEngineTab";
import { OpportunitiesTab } from "@/components/aeo/OpportunitiesTab";
import { ActionEngineTab } from "@/components/aeo/ActionEngineTab";
import { AnalyticsTab } from "@/components/aeo/AnalyticsTab";

const AEOAnalyticsPage = () => {

    return (
        <div className="flex-1 space-y-6 p-8 bg-background relative overflow-y-auto h-[100vh] pb-24">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">AEO Intelligence</h1>
                    <p className="text-muted-foreground mt-1 text-sm md:text-base">
                        Track, analyze, and automate your brand's presence across all major AI search engines.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                        <Search className="h-4 w-4" /> Filter Project
                    </Button>
                    <Button className="gap-2">
                        <Activity className="h-4 w-4" /> Global Scan
                    </Button>
                </div>
            </div>

            {/* Huge 7-Tab Navigation Architecture */}
            <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 h-auto p-1 bg-muted/40">
                    <TabsTrigger value="dashboard" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2">
                        <LayoutDashboard className="h-4 w-4 hidden lg:block" /> Dashboard
                    </TabsTrigger>
                    <TabsTrigger value="prompts" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2">
                        <Target className="h-4 w-4 hidden lg:block" /> Prompts
                    </TabsTrigger>
                    <TabsTrigger value="competitors" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2">
                        <Crosshair className="h-4 w-4 hidden lg:block" /> Competitors
                    </TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2">
                        <PenTool className="h-4 w-4 hidden lg:block" /> Content Engine
                    </TabsTrigger>
                    <TabsTrigger value="opportunities" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2">
                        <Lightbulb className="h-4 w-4 hidden lg:block" /> Opportunities
                    </TabsTrigger>
                    <TabsTrigger value="action" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2 text-primary font-medium border border-primary/20">
                        <Zap className="h-4 w-4 hidden lg:block text-yellow-500" /> Action Engine
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="data-[state=active]:bg-background py-2.5 text-xs lg:text-sm shadow-sm gap-2">
                        <LineChart className="h-4 w-4 hidden lg:block" /> Analytics
                    </TabsTrigger>
                </TabsList>

                {/* Tab Contents */}
                <TabsContent value="dashboard" className="focus-visible:outline-none focus-visible:ring-0">
                    <DashboardTab />
                </TabsContent>
                
                <TabsContent value="prompts" className="focus-visible:outline-none focus-visible:ring-0">
                    <PromptsTrackingTab />
                </TabsContent>

                <TabsContent value="competitors" className="focus-visible:outline-none focus-visible:ring-0">
                    <CompetitorInsightsTab />
                </TabsContent>

                <TabsContent value="content" className="focus-visible:outline-none focus-visible:ring-0">
                    <ContentEngineTab />
                </TabsContent>

                <TabsContent value="opportunities" className="focus-visible:outline-none focus-visible:ring-0">
                    <OpportunitiesTab />
                </TabsContent>

                <TabsContent value="action" className="focus-visible:outline-none focus-visible:ring-0">
                    <ActionEngineTab />
                </TabsContent>

                <TabsContent value="analytics" className="focus-visible:outline-none focus-visible:ring-0">
                    <AnalyticsTab />
                </TabsContent>
            </Tabs>

        </div>
    );
};

export default AEOAnalyticsPage;
