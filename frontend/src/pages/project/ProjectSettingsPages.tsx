import { useProject } from "./ProjectLayout";
import { ComingSoonPage } from "./ComingSoonPage";
import { Settings, Plug } from "lucide-react";

export function ProjectSettingsPage() {
  const { project } = useProject();
  return (
    <ComingSoonPage
      title="Project Settings"
      icon={Settings}
      description={`Manage settings, team access, and configuration for ${project.brand_name || project.name}.`}
      features={[
        "Team Member Access Control",
        "Notification Preferences",
        "API Key Management",
        "Data Retention Settings",
        "Delete Project",
      ]}
    />
  );
}

export function ProjectIntegrationsPage() {
  return (
    <ComingSoonPage
      title="Integrations"
      icon={Plug}
      description="Connect your publishing platforms, CRMs, and marketing tools directly to this project."
      features={[
        "WordPress Auto-Publishing",
        "Shopify Blog Sync",
        "Google Search Console",
        "Google Analytics 4",
        "Meta Business Suite",
      ]}
    />
  );
}
