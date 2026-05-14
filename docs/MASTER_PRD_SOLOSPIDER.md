# SoloSpider: AI-Powered Brand Growth Operating System
## Master Product Requirements Document (PRD)

---

## 1. Product Positioning & Core Philosophy

**SoloSpider** is the **AI-Powered Brand Growth Operating System**.

### Core Product Philosophy
SoloSpider is a unified AI-native platform designed to eliminate the fragmentation of modern marketing tools. It is **NOT** just SEO software, AI writing software, a social scheduler, or an AEO tool. Instead, SoloSpider acts as a complete, integrated AI-powered growth operating system for brands, agencies, and SMB businesses.

### Unified Capabilities within One OS:
- AI Content Generation
- AI SEO Optimization
- AEO / GEO Optimization
- Social Media Generation
- Image & Video Creative Generation
- Autonomous Publishing
- Backlink Generation
- Technical SEO Fixing
- Brand Intelligence
- Ads Generation & Optimization

---

## 2. Target Users & Business Model

### Target Users
* **SEO Agencies**: Managing multiple client brand ecosystems.
* **Marketing Agencies**: Delivering full-stack digital growth and creative campaigns.
* **SMB Businesses**: Scaling direct brand authority and visibility autonomously.

### Business Model (Subscription SaaS)
* **Free Plan**: 1 Workspace / Brand Command Center + 1 AEO visibility scan.
* **Paid Plans**: Multiple Workspaces, higher AI query limits, programmatic blog generation limits, social accounts, and continuous scheduled AEO scans.

---

## 3. Workspace Architecture (Workspace = Project)

> [!IMPORTANT]
> **Workspace = Project / Brand**
> There is NO separate workspace vs project hierarchy. Each Workspace IS the Project/Brand (e.g., *Nike Workspace*, *Scalezix Workspace*, *Acme Workspace*). Every workspace contains its own dedicated SEO, Blogs, Social Media, AEO, Backlinks, Ads, Analytics, and Publishing modules all connected to the same brand identity.

```
┌────────────────────────────────────────────────────────┐
│             SOLOSPIDER BRAND WORKSPACE                 │
│         (Nike / Scalezix / Acme Command Center)        │
└───────────────────────────┬────────────────────────────┘
                            │
      ┌──────────────┬──────┴───────┬──────────────┐
      ▼              ▼              ▼              ▼
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ 1. AI BLOG │ │ 2. SOCIAL  │ │ 3. AEO/GEO │ │ 4. SEO &   │
│   ENGINE   │ │   ENGINE   │ │   ENGINE   │ │ BACKLINKS  │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

### Workspace Creation Flow

#### Step 1 — Create Workspace
User enters their initial target website URL.

#### Step 2 — AI Auto Fetch System
SoloSpider automatically crawls and extracts:
- Brand Name & Industry
- Competitors
- Logo & Favicon
- Brand Colors & Typography
- Social Media Handles
- Metadata & Schema definitions
- Products & Services catalog
- Team Information & Tone of Voice

#### Step 3 — AI Brand Intelligence Generation
AI automatically synthesizes the brand tone, target audience personas, writing style, design style, semantic entities, and industry positioning.

#### Step 4 — Manual Brand Editing
Users retain absolute control to manually tweak tone, audience directives, writing guidelines, and visual design parameters.

### Brand Memory System
The **Global Brand Memory** stores colors, fonts, logo, brand voice, target audience, products, and visual identity. 
* **Utilized In**: Blog generation, social media generation, ads generation, image generation, and publishing.
* **Excluded From**: AEO / GEO Visibility Engine (to maintain ungrounded, objective surveillance metrics).

---

## 4. Module 1 — AI Blog Engine

### Purpose
Autonomous SEO + AEO optimized blog generation and multi-channel publishing system.

### Supported Blog Types
Single article, bulk articles, programmatic SEO pages, AI content clusters, location pages, comparison pages.

### Blog Generation Workflow
```
[Topic Input] &rarr; [AI Research] &rarr; [Content Plan] &rarr; [Full Generation] &rarr; [Visual Assets] &rarr; [SEO Layer] &rarr; [Publishing]
```
1. **Topic Input**: Sources include manual keywords, SEO gaps, AEO gaps, Google Search Console, competitor analysis, and AI suggestions.
2. **AI Research**: AI performs live SERP analysis, entity extraction, competitor structure analysis, semantic mapping, question extraction, and citation analysis.
3. **Content Planning**: Generates SEO title, meta title, meta description, outline, heading structure, FAQs, schema, internal linking plan, and CTA blocks.
4. **Content Generation**: Creates semantic SEO optimized, AEO-friendly, entity-rich content with comparison tables, definition blocks, statistics, and FAQs.
5. **Visual Asset Generation**: Automatically generates featured images, infographics, charts, tables, and social thumbnails adhering to the Global Brand Memory.
6. **SEO Optimization Layer**: Automatically injects internal/external links, schema, semantic entities, AI citation structures, and clean heading hierarchy.
7. **AI Editor**: Interactive user approval for modifying headings, images, CTAs, and SEO metadata.
8. **Scheduling & Publishing**: Instant publish, draft, schedule, and bulk publishing across WordPress, Shopify, Webflow, Framer, Ghost, Next.js/React apps, and custom webhooks.
9. **Autonomous Distribution**: Post-publish trigger to instantly generate social media posts, creatives, and backlink submissions.

---

## 5. Module 2 — Social Media Engine

### Supported Platforms
Instagram, Facebook, LinkedIn, X/Twitter, Threads, Pinterest, TikTok, YouTube.

### Supported Content Types
Single image posts, carousels, threads, LinkedIn posts, reels scripts, YouTube scripts, short-form videos, stories, ads.

### Social Media Generation Workflow
1. **User Input**: Upload image, upload creative, enter text prompt, select blog post, or select campaign.
2. **AI Caption & Hashtag Generation**: If an image is uploaded, AI auto-generates platform-specific captions, hashtags, and CTAs based on image recognition and brand voice.
3. **Full Social Post Generation**: If requested, AI synthesizes complete posts, carousels, and formatting.
4. **AI Image Generation**: Prompt &rarr; Image Generation &rarr; Caption Generation &rarr; Hashtag Generation using brand colors, logo, and visual identity.
5. **Reel / Short Video Generation**: AI generates 20–30 second scripts, scene structure, hooks, CTAs, voiceovers, and caption overlays.
6. **Scheduling & Publishing**: Timezone queueing and autonomous multi-platform publishing.

---

## 6. Module 3 — AEO / GEO Engine

### Purpose
Monitor and improve AI Search Visibility across ChatGPT, Gemini, Claude, Perplexity, Grok, and Meta AI.
> [!NOTE]
> **Perplexity Grounding**: Perplexity is heavily prioritized because it is citation-heavy, source-driven, and research-oriented, making it highly valuable for authority tracking.

### AEO Workflow
1. **Website Crawling**: Extract pages, entities, topics, products, FAQs, and semantic clusters.
2. **Prompt Generation**: Generate commercial, comparison, brand, buyer intent, and industry prompts.
3. **AI Search Monitoring**: Execute prompts across LLM provider APIs.
4. **Citation & Mention Analysis**: Track brand mentions, competitor mentions, share of voice, and ranking positions.
5. **Visibility Heatmaps**: Generate prompt heatmaps, citation maps, topic dominance, and competitor overlap matrices.
6. **Gap Detection**: Identify missing pages, missing topics, weak semantic coverage, and low citation likelihood.
7. **Autonomous AEO Actions**: Automatically generate glossary pages, comparison pages, FAQ pages, and entity coverage expansions.

---

## 7. Module 4 — SEO Engine

### Technical SEO Audit
Continuous monitoring of meta tags, schema, headings, core web vitals, internal linking, sitemaps, robots.txt, canonicals, and semantic entity depth.

### Advanced SEO Detection & Auto-Fixing
Detects low content, duplicates, orphan pages, broken links, thin content, and missing alt text.
* **Autonomous Fixing**: Automatically deploys fixes for meta tags, schema, alt text, canonicals, and internal/external links across WordPress, Shopify, and Next.js without requiring manual intervention.

---

## 8. Module 5 — Backlink Engine

### Purpose
Automated authority-building system across profile backlinks, directory listings, social profiles, web 2.0 links, mentions, and citations.
* **Authority Tracking**: Live metrics for Domain Rating (DR), Domain Authority (DA), traffic, anchor text, link velocity, and toxicity.
* **Automated Submission**: Automatically creates listings, submits profiles, and publishes web 2.0 content.

---

## 9. Module 6 — Ads Engine

### Supported Platforms
Google Ads, Meta Ads.

### AI Ad Generation & Optimization
Generates headlines, descriptions, ad copies, creative assets, CTAs, target audiences, and buyer personas.
* **Autonomous Optimization**: Automatically adjusts budgets, pauses low performers, optimizes creatives, and improves targeting.

---

## 10. Admin Controls & Governance

### Admin Panel
Executive command center to manage AI API costs, BullMQ worker queues, provider keys, content moderation, billing, feature flags, system health, publishing webhooks, and SEO deployments.

### RBAC Hierarchy
1. `SUPER_ADMIN`: Absolute clearance over billing, user deletions, queue controls, and system secrets.
2. `ADMIN`: Operational management over users, projects, and job reruns.
3. `SUPPORT`: Customer support onboarding, viewing users/projects, rerunning crawls.
4. `ANALYST`: Read-only access to visibility and analytics dashboards.

---

## 11. Infrastructure Stack

* **Frontend**: React, Vite, Tailwind CSS, shadcn/ui.
* **Backend**: Supabase, PostgreSQL, Prisma.
* **Workers**: Node.js, BullMQ, Redis, Railway.
* **AI Mesh**: OpenAI, Gemini, Claude, Perplexity, Grok.
* **Architecture Style**: Event-driven, queue-based, worker-oriented AI orchestration.
