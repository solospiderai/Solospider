import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/components/DashboardLayout";

// Marketing pages
import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import PricingPage from "@/pages/PricingPage";
import AgentsPage from "@/pages/AgentsPage";
import FeaturesPage from "@/pages/FeaturesPage";
import UseCasesPage from "@/pages/UseCasesPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import BlogPage from "@/pages/BlogPage";
import SeoAuditPage from "@/pages/SeoAuditPage";
import NotFound from "./pages/NotFound";

// Legacy dashboard pages
import DashboardPage from "@/pages/DashboardPage";
import GeneratePage from "@/pages/GeneratePage";
import BulkGeneratePage from "@/pages/BulkGeneratePage";
import ContentViewPage from "@/pages/ContentViewPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import ShopifyIntegrationPage from "@/pages/ShopifyIntegrationPage";
import WordPressIntegrationPage from "@/pages/WordPressIntegrationPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import CalendarPage from "@/pages/CalendarPage";
import { ManagePostsPage, BrandIdentityPage } from "@/pages/Placeholders";

// Project-scoped layout & pages
import { ProjectLayout } from "@/pages/project/ProjectLayout";
import { ProjectOverviewPage } from "@/pages/project/ProjectOverviewPage";
import { KeywordResearchPage } from "@/pages/project/KeywordResearchPage";
import { SocialPostsPage } from "@/pages/project/SocialPages";
import { SocialCalendarPage } from "@/pages/project/SocialCalendarPage";
import { SocialImageGenerationPage } from "@/pages/project/SocialImageGenerationPage";
import { SocialAccountsPage } from "@/pages/project/SocialAccountsPage";
import { ComingSoonPage } from "@/pages/project/ComingSoonPage";
import { MetaAdsPage, MetaAdsAnalyticsPage, GoogleAdsPage, GoogleAdsAnalyticsPage } from "@/pages/project/AdsPages";
import { SeoKeywordsPage, BacklinksPage } from "@/pages/project/SeoPages";
import { AeoWorkspacePage } from "@/pages/project/AeoWorkspacePage";
import { BrandWorkspacePage, CompetitorsPage } from "@/pages/project/BrandWorkspacePage";
import { ProjectSettingsPage, ProjectIntegrationsPage } from "@/pages/project/ProjectSettingsPages";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false} disableTransitionOnChange>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* Public marketing */}
              <Route path="/" element={<Index />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/use-cases" element={<UseCasesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/seo-audit" element={<SeoAuditPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/agents" element={<AgentsPage />} />
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected dashboard */}
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                {/* Legacy global routes (kept for backwards compat) */}
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/generate" element={<GeneratePage />} />
                <Route path="/bulk-generate" element={<BulkGeneratePage />} />
                <Route path="/content/:id" element={<ContentViewPage />} />
                <Route path="/manage-posts" element={<ManagePostsPage />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/brand-identity" element={<BrandIdentityPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/integrations/shopify" element={<ShopifyIntegrationPage />} />
                <Route path="/integrations/wordpress" element={<WordPressIntegrationPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />

                {/* Feature-First Routes */}
                <Route path="/app/en/dashboard" element={<ProjectLayout><ProjectOverviewPage /></ProjectLayout>} />

                {/* Content Creation */}
                <Route path="/app/en/content/keyword-research" element={<ProjectLayout><KeywordResearchPage /></ProjectLayout>} />
                <Route path="/app/en/content/generate" element={<ProjectLayout><GeneratePage /></ProjectLayout>} />
                <Route path="/app/en/content/bulk-generate" element={<ProjectLayout><BulkGeneratePage /></ProjectLayout>} />
                <Route path="/app/en/content/manage-posts" element={<ProjectLayout><ManagePostsPage /></ProjectLayout>} />
                <Route path="/app/en/content/calendar" element={<ProjectLayout><CalendarPage /></ProjectLayout>} />
                <Route path="/app/en/content/:id" element={<ProjectLayout><ContentViewPage /></ProjectLayout>} />

                {/* Social Media */}
                <Route path="/app/en/social/posts" element={<ProjectLayout><SocialPostsPage /></ProjectLayout>} />
                <Route path="/app/en/social/image-generation" element={<ProjectLayout><SocialImageGenerationPage /></ProjectLayout>} />
                <Route path="/app/en/social/calendar" element={<ProjectLayout><SocialCalendarPage /></ProjectLayout>} />
                <Route path="/app/en/social/reels" element={<ProjectLayout><ComingSoonPage title="Video / Reel Generation" description="Generate short-form video scripts and reels from your blog content." features={["AI Video Script", "Reel Storyboard", "Auto-captioning"]} /></ProjectLayout>} />
                <Route path="/app/en/social/accounts" element={<ProjectLayout><SocialAccountsPage /></ProjectLayout>} />

                {/* Performance Ads */}
                <Route path="/app/en/ads/meta" element={<ProjectLayout><MetaAdsPage /></ProjectLayout>} />
                <Route path="/app/en/ads/meta-analytics" element={<ProjectLayout><MetaAdsAnalyticsPage /></ProjectLayout>} />
                <Route path="/app/en/ads/google" element={<ProjectLayout><GoogleAdsPage /></ProjectLayout>} />
                <Route path="/app/en/ads/google-analytics" element={<ProjectLayout><GoogleAdsAnalyticsPage /></ProjectLayout>} />

                {/* SEO */}
                <Route path="/app/en/seo/keywords" element={<ProjectLayout><SeoKeywordsPage /></ProjectLayout>} />
                <Route path="/app/en/seo/backlinks" element={<ProjectLayout><BacklinksPage /></ProjectLayout>} />

                {/* AEO */}
                <Route path="/app/en/aeo/prompt-generation" element={<ProjectLayout><AeoWorkspacePage pathKey="prompt-generation" /></ProjectLayout>} />
                <Route path="/app/en/aeo/analytics" element={<ProjectLayout><AeoWorkspacePage pathKey="analytics" /></ProjectLayout>} />
                <Route path="/app/en/aeo/visibility-score" element={<ProjectLayout><AeoWorkspacePage pathKey="visibility-score" /></ProjectLayout>} />
                <Route path="/app/en/aeo/opportunities" element={<ProjectLayout><AeoWorkspacePage pathKey="opportunities" /></ProjectLayout>} />

                {/* Brand */}
                <Route path="/app/en/brand" element={<ProjectLayout><BrandWorkspacePage /></ProjectLayout>} />
                <Route path="/app/en/competitors" element={<ProjectLayout><CompetitorsPage /></ProjectLayout>} />

                {/* Settings */}
                <Route path="/app/en/settings/integrations" element={<ProjectLayout><ProjectIntegrationsPage /></ProjectLayout>} />
                <Route path="/app/en/settings/project" element={<ProjectLayout><ProjectSettingsPage /></ProjectLayout>} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
