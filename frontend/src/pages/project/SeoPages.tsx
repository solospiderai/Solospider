import { ComingSoonPage } from "./ComingSoonPage";
import { Search, Link } from "lucide-react";
export function SeoKeywordsPage() {
  return <ComingSoonPage title="SEO Keywords" icon={Search} description="Discover, analyze and target the right keywords to boost your organic search rankings." features={["Long-tail Keyword Discovery","Search Intent Classification","Keyword Difficulty Analysis","Competitor Keyword Gap Analysis","Keyword Clustering"]} />;
}
export function BacklinksPage() {
  return <ComingSoonPage title="Backlinks" icon={Link} description="Build and analyze your backlink profile to strengthen your domain authority." features={["Backlink Profile Analysis","Link Building Opportunities","Broken Link Detection","Competitor Backlink Research","Disavow Tool Integration"]} />;
}
