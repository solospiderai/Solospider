import { ComingSoonPage } from "./ComingSoonPage";
import { TrendingUp } from "lucide-react";
export function MetaAdsPage() {
  return <ComingSoonPage title="Meta Ads Improvement" icon={TrendingUp} description="AI-powered recommendations to improve your Facebook and Instagram ad performance." features={["Ad Copy Optimization","Audience Targeting Suggestions","Creative A/B Test Ideas","Budget Allocation Recommendations"]} />;
}
export function MetaAdsAnalyticsPage() {
  return <ComingSoonPage title="Meta Ads Analytics" icon={TrendingUp} description="Deep performance analytics for your Meta advertising campaigns." features={["Campaign Performance Dashboard","ROAS & CPA Tracking","Funnel Drop-off Analysis","Competitor Ad Benchmarking"]} />;
}
export function GoogleAdsPage() {
  return <ComingSoonPage title="Google Ads Improvement" icon={TrendingUp} description="AI-powered insights to maximize your Google Ads performance and Quality Score." features={["Keyword Bid Optimization","Ad Copy Suggestions","Quality Score Improvement","Search Term Analysis"]} />;
}
export function GoogleAdsAnalyticsPage() {
  return <ComingSoonPage title="Google Ads Analytics" icon={TrendingUp} description="Comprehensive analytics for your Google Ads campaigns." features={["Impression Share Tracking","Click-Through Rate Analysis","Conversion Path Analysis","Cost Per Conversion Reporting"]} />;
}
