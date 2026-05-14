export type EffectivePlan = "free" | "pro";

export type FeatureKey =
  | "content_generation"
  | "content_calendar"
  | "manage_posts"
  | "social_posts"
  | "social_images"
  | "social_calendar"
  | "site_audit"
  | "keyword_research"
  | "seo_suite"
  | "aeo_geo"
  | "ads_suite"
  | "competitors";

const FREE_FEATURES = new Set<FeatureKey>([
  "content_generation",
  "content_calendar",
  "manage_posts",
  "social_posts",
  "social_images",
  "social_calendar",
  "site_audit",
]);

export function getEffectivePlan(rawPlan?: string | null): EffectivePlan {
  if (rawPlan === "pro" || rawPlan === "enterprise") return "pro";
  return "free";
}

export function hasFeatureAccess(plan: EffectivePlan, feature: FeatureKey): boolean {
  if (plan === "pro") return true;
  return FREE_FEATURES.has(feature);
}
