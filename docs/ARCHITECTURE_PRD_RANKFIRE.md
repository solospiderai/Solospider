# Architecture PRD — AI Search Visibility Platform
### Product Codename: **Rankfire**
**Version:** 1.0.0  
**Type:** System Architecture Document  
**Audience:** Engineering Team

---

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture Principles](#2-architecture-principles)
3. [Full System Architecture](#3-full-system-architecture)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Backend Architecture](#5-backend-architecture)
6. [Job Queue Architecture](#6-job-queue-architecture)
7. [Database Architecture](#7-database-architecture)
8. [Third-Party Integrations](#8-third-party-integrations)
9. [Security Architecture](#9-security-architecture)
10. [Deployment Architecture](#10-deployment-architecture)
11. [Monitoring & Observability](#11-monitoring--observability)
12. [API Contracts](#12-api-contracts)

---

## 1. System Overview

Rankfire is composed of four distinct subsystems that work together:

```
┌─────────────────────────────────────────────────────────────────┐
│                        RANKFIRE SYSTEM                          │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │   FRONTEND   │    │   BACKEND    │    │   JOB WORKERS    │  │
│  │  Next.js 14  │◄──►│  API Routes  │◄──►│  BullMQ + Redis  │  │
│  │  (Vercel)    │    │  (Vercel)    │    │  (Railway)       │  │
│  └──────────────┘    └──────┬───────┘    └────────┬─────────┘  │
│                             │                     │            │
│                    ┌────────▼─────────────────────▼──────────┐ │
│                    │              DATABASE                    │ │
│                    │        PostgreSQL (Neon)                 │ │
│                    │        Redis (Upstash)                   │ │
│                    └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Core Subsystems
1. **Frontend (Next.js)** — React dashboard, onboarding flow, settings
2. **Backend API (Next.js API Routes)** — REST endpoints, auth middleware, business logic
3. **Job Workers (BullMQ)** — Crawlers, AI prompt runners, content generators
4. **Data Layer (PostgreSQL + Redis)** — Persistent storage + caching + queues

---

## 2. Architecture Principles

### P1: Async-First
All heavy operations (crawling, AI calls, content generation) are async jobs — never blocking HTTP requests. Every expensive operation returns a job_id immediately.

### P2: Idempotent Jobs
All background jobs must be safe to retry. Job results are stored with job_id as key; re-running a job for the same input returns the cached result.

### P3: Provider Abstraction
All AI model calls go through a single `AIProvider` interface. Switching from OpenAI to a different model requires zero changes outside the provider module.

```typescript
interface AIProvider {
  runPrompt(prompt: string, options: PromptOptions): Promise<AIAnswer>
}

// Implementations:
class OpenAIProvider implements AIProvider { ... }
class GeminiProvider implements AIProvider { ... }
class PerplexityProvider implements AIProvider { ... }
class ClaudeProvider implements AIProvider { ... }
class GrokProvider implements AIProvider { ... }
```

### P4: Rate Limit Aware
All external API calls go through a rate limiter. Each provider has its own rate limit bucket tracked in Redis.

### P5: Usage-Gated
All features check the account's subscription tier and current usage before executing. Usage is tracked atomically in Redis with PostgreSQL as the source of truth.

---

## 3. Full System Architecture

### Data Flow: Onboarding
```
User submits domain
    │
    ▼
POST /api/sites (creates site record)
    │
    ▼
Queue: CRAWL_SITEMAP job
    │
    ├──► Fetches sitemap.xml
    ├──► Extracts all URLs
    ├──► Stores in `pages` table
    │
    ▼
Queue: CRAWL_PAGES job (per URL)
    │
    ├──► Fetches page HTML
    ├──► Extracts: title, H1, meta description, body text, schema markup
    └──► Stores in `page_contents` table

Queue: EXTRACT_TOPICS job
    │
    ├──► Sends all page content to LLM
    ├──► LLM returns: primary topics, tone, brand persona
    └──► Stores in `brand_context` table

Queue: GENERATE_PROMPTS job
    │
    ├──► Uses topics + GSC queries + competitor analysis
    ├──► LLM generates 50-300 prompts
    └──► Stores in `prompts` table

Queue: RUN_PROMPTS job (initial batch)
    │
    ├──► Fires each prompt against each enabled AI model
    ├──► Stores full answer + citations in `ai_answers` table
    └──► Triggers: ANALYZE_CITATIONS job

Queue: ANALYZE_CITATIONS job
    │
    ├──► Parses citation URLs from each answer
    ├──► Classifies: own_domain / competitor / third_party
    ├──► Calculates mention_rate, citation_rate, share_of_voice
    └──► Stores in `citations` + `visibility_metrics` tables
```

### Data Flow: Scheduled Monitoring
```
Cron: Every 24 hours (configurable)
    │
    ▼
Queue: SCHEDULED_PROMPT_RUN
    │
    ├──► Selects all active prompts for account
    ├──► Checks usage limits (prompts remaining this period)
    ├──► Fires prompts against AI models (parallel, rate-limited)
    ├──► Stores new answers
    └──► Recalculates metrics → triggers dashboard refresh via SSE
```

### Data Flow: Content Action
```
User clicks "Create Article" on gap topic
    │
    ▼
POST /api/actions/create-content
    │
    ├──► Checks subscription allows content generation
    ├──► Queues: GENERATE_CONTENT_BRIEF job
    │
Queue: GENERATE_CONTENT_BRIEF
    │
    ├──► Fetches top-cited articles for this topic (via Perplexity/search)
    ├──► Analyzes their structure, claims, citations
    ├──► LLM generates detailed brief: outline, key points, target citations
    └──► Stores brief in `content_briefs` table

User reviews brief → clicks "Generate Article"
    │
    ▼
Queue: GENERATE_ARTICLE
    │
    ├──► Loads brief + brand_context (tone, voice, topics)
    ├──► Multi-step LLM pipeline:
    │       Step 1: Research sub-queries
    │       Step 2: Generate outline
    │       Step 3: Write each section
    │       Step 4: Add statistics, citations
    │       Step 5: SEO optimization pass
    │       Step 6: AEO/GEO optimization pass
    └──► Stores article in `content_pieces` table

User reviews article → clicks "Publish to Webflow"
    │
    ▼
POST /api/cms/publish
    │
    └──► Calls Webflow CMS API → creates draft CMS item
         → Returns Webflow editor URL for final review
```

---

## 4. Frontend Architecture

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui components
- **State management:** Zustand (global) + React Query (server state)
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod validation
- **Auth:** Clerk (client-side components)

### Directory Structure
```
/app
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── (dashboard)/
│   ├── layout.tsx              # Sidebar + header shell
│   ├── overview/page.tsx       # KPI summary
│   ├── visibility/
│   │   ├── page.tsx            # All prompts view
│   │   ├── [model]/page.tsx    # Per-model drilldown
│   │   └── competitors/page.tsx
│   ├── content/
│   │   ├── pages/page.tsx
│   │   ├── citations/page.tsx
│   │   └── gaps/page.tsx
│   ├── actions/
│   │   ├── create/page.tsx
│   │   ├── improve/page.tsx
│   │   ├── earn-media/page.tsx
│   │   └── ugc/page.tsx
│   ├── analytics/
│   │   ├── ai-bots/page.tsx
│   │   ├── ai-referrals/page.tsx
│   │   └── combined/page.tsx
│   └── settings/
│       ├── prompts/page.tsx
│       ├── competitors/page.tsx
│       ├── integrations/page.tsx
│       └── billing/page.tsx
├── onboarding/
│   └── page.tsx                # 5-step onboarding wizard
├── api/                        # Backend API routes
│   ├── sites/route.ts
│   ├── prompts/route.ts
│   ├── actions/route.ts
│   ├── cms/route.ts
│   ├── analytics/route.ts
│   └── webhooks/route.ts       # Stripe webhooks
└── layout.tsx                  # Root layout (fonts, providers)

/components
├── ui/                         # shadcn base components
├── charts/                     # Recharts wrappers
│   ├── VisibilityTrendChart.tsx
│   ├── ShareOfVoiceChart.tsx
│   ├── CitationMapChart.tsx
│   └── BotTrafficChart.tsx
├── dashboard/
│   ├── KPICard.tsx
│   ├── PromptTable.tsx
│   ├── CitationList.tsx
│   └── GapCard.tsx
├── actions/
│   ├── BriefCard.tsx
│   ├── ArticleEditor.tsx
│   └── CMSPublishModal.tsx
└── onboarding/
    ├── OnboardingWizard.tsx
    └── steps/
        ├── DomainStep.tsx
        ├── GSCStep.tsx
        ├── GA4Step.tsx
        ├── CloudflareStep.tsx
        └── CompetitorsStep.tsx

/lib
├── api-client.ts               # Typed API client (fetch wrappers)
├── auth.ts                     # Clerk helpers
├── utils.ts                    # Common utilities
└── constants.ts                # App-wide constants

/hooks
├── useSite.ts
├── usePrompts.ts
├── useVisibility.ts
├── useActions.ts
└── useAnalytics.ts
```

### State Architecture
```typescript
// Global state (Zustand) — app-level session data
interface AppStore {
  currentSite: Site | null
  subscription: Subscription | null
  usageThisPeriod: UsageMetrics
  setCurrentSite: (site: Site) => void
}

// Server state (React Query) — cached API data with auto-refetch
const useVisibilityData = (siteId: string, dateRange: DateRange) => {
  return useQuery({
    queryKey: ['visibility', siteId, dateRange],
    queryFn: () => api.getVisibility(siteId, dateRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
```

### Real-Time Updates
Long-running jobs (crawling, prompt runs) push progress updates via Server-Sent Events:
```typescript
// Server: /api/jobs/[jobId]/stream/route.ts
export async function GET(req: Request, { params }) {
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(async () => {
        const job = await getJobStatus(params.jobId)
        controller.enqueue(`data: ${JSON.stringify(job)}\n\n`)
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval)
          controller.close()
        }
      }, 1000)
    }
  })
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' }
  })
}

// Client: useJobProgress hook
const useJobProgress = (jobId: string) => {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const es = new EventSource(`/api/jobs/${jobId}/stream`)
    es.onmessage = (e) => setProgress(JSON.parse(e.data).progress)
    return () => es.close()
  }, [jobId])
  return progress
}
```

---

## 5. Backend Architecture

### API Layer Structure
```
/api
├── sites/
│   ├── POST /api/sites              # Create site, trigger initial crawl
│   ├── GET  /api/sites              # List user's sites
│   ├── GET  /api/sites/:id          # Get site details
│   └── DELETE /api/sites/:id        # Delete site + all data
│
├── prompts/
│   ├── GET  /api/prompts            # List prompts for site
│   ├── POST /api/prompts            # Create custom prompt
│   ├── PUT  /api/prompts/:id        # Enable/disable/edit prompt
│   └── POST /api/prompts/run        # Manually trigger prompt run
│
├── visibility/
│   ├── GET  /api/visibility/summary     # KPI cards data
│   ├── GET  /api/visibility/trends      # Time-series data
│   ├── GET  /api/visibility/prompts     # Per-prompt breakdown
│   └── GET  /api/visibility/models      # Per-model comparison
│
├── citations/
│   ├── GET  /api/citations/top          # Top cited domains
│   ├── GET  /api/citations/pages        # Cited pages from own site
│   └── GET  /api/citations/competitors  # Competitor citation share
│
├── gaps/
│   └── GET  /api/gaps                   # Gap detection results
│
├── actions/
│   ├── POST /api/actions/brief          # Generate content brief
│   ├── POST /api/actions/article        # Generate full article
│   ├── GET  /api/actions               # List briefs/articles
│   └── PUT  /api/actions/:id           # Update/approve action
│
├── cms/
│   ├── POST /api/cms/connect/webflow    # Connect Webflow OAuth
│   ├── POST /api/cms/connect/framer     # Connect Framer
│   ├── POST /api/cms/publish            # Publish article to CMS
│   └── GET  /api/cms/status            # Check CMS connection status
│
├── analytics/
│   ├── GET  /api/analytics/bots        # Cloudflare bot data
│   ├── GET  /api/analytics/referrals   # GA4 AI referral data
│   └── GET  /api/analytics/combined    # Merged view
│
├── integrations/
│   ├── POST /api/integrations/gsc      # Connect GSC
│   ├── POST /api/integrations/ga4      # Connect GA4
│   └── POST /api/integrations/cf       # Connect Cloudflare
│
└── webhooks/
    ├── POST /api/webhooks/stripe        # Stripe subscription events
    └── POST /api/webhooks/clerk         # Clerk user events
```

### Middleware Stack
```typescript
// Every API route goes through:
1. ClerkMiddleware        → auth check, attach user to request
2. SubscriptionMiddleware → check plan, attach subscription
3. UsageLimitMiddleware   → check usage limits (prompts, articles)
4. RateLimitMiddleware    → per-user rate limiting (Redis sliding window)
5. SiteOwnerMiddleware    → verify user owns the siteId in params
6. Handler                → actual business logic
```

### Business Logic Layer
```typescript
// All business logic in /lib/services/

/lib/services/
├── sites.service.ts         # Site CRUD + crawl orchestration
├── crawler.service.ts       # Sitemap + page crawling
├── topics.service.ts        # Topic extraction via LLM
├── prompts.service.ts       # Prompt CRUD + auto-generation
├── prompt-runner.service.ts # Run prompts against AI models
├── citations.service.ts     # Citation extraction + analysis
├── gaps.service.ts          # Gap detection algorithm
├── actions.service.ts       # Brief + article generation
├── cms.service.ts           # CMS publishing orchestration
├── gsc.service.ts           # Google Search Console API
├── ga4.service.ts           # Google Analytics 4 API
├── cloudflare.service.ts    # Cloudflare GraphQL API
├── usage.service.ts         # Usage tracking + limits
└── notifications.service.ts # Email digests + alerts
```

---

## 6. Job Queue Architecture

### Queue Setup (BullMQ + Redis)
```typescript
// Queue definitions
const QUEUES = {
  CRAWL:     'crawl-queue',      // Sitemap + page crawling
  AI:        'ai-queue',         // Prompt runs against AI models
  ANALYSIS:  'analysis-queue',   // Citation analysis, gap detection
  CONTENT:   'content-queue',    // Brief + article generation
  CMS:       'cms-queue',        // CMS publishing
  ANALYTICS: 'analytics-queue',  // GA4 + Cloudflare data fetch
  EMAIL:     'email-queue',      // Digest emails
}

// Worker concurrency per queue
const CONCURRENCY = {
  CRAWL:     5,   // 5 parallel page fetches
  AI:        3,   // 3 parallel AI calls per account (rate limited)
  ANALYSIS:  10,  // Analysis is fast, can parallelize
  CONTENT:   2,   // Content generation is expensive
  CMS:       5,
  ANALYTICS: 5,
  EMAIL:     10,
}
```

### Job Types & Payloads
```typescript
// CRAWL_SITEMAP
interface CrawlSitemapJob {
  siteId: string
  domain: string
  accountId: string
}

// CRAWL_PAGE
interface CrawlPageJob {
  siteId: string
  pageId: string
  url: string
  retryCount?: number
}

// EXTRACT_TOPICS
interface ExtractTopicsJob {
  siteId: string
  accountId: string
}

// GENERATE_PROMPTS
interface GeneratePromptsJob {
  siteId: string
  accountId: string
  gscQueriesIncluded: boolean
}

// RUN_PROMPT
interface RunPromptJob {
  promptId: string
  siteId: string
  accountId: string
  model: 'chatgpt' | 'gemini' | 'perplexity' | 'claude' | 'grok'
  triggeredBy: 'scheduled' | 'manual' | 'initial'
}

// ANALYZE_CITATIONS
interface AnalyzeCitationsJob {
  answerId: string
  siteId: string
  accountId: string
}

// GENERATE_CONTENT_BRIEF
interface GenerateBriefJob {
  gapId: string
  siteId: string
  accountId: string
  topic: string
  targetPrompts: string[]
}

// GENERATE_ARTICLE
interface GenerateArticleJob {
  briefId: string
  siteId: string
  accountId: string
}
```

### Job Scheduling (Cron)
```typescript
// Upstash QStash for serverless crons
const CRON_SCHEDULES = {
  DAILY_PROMPT_RUN:    '0 6 * * *',     // 6am UTC daily
  WEEKLY_DIGEST:       '0 8 * * 1',     // 8am UTC Monday
  ANALYTICS_REFRESH:   '0 */4 * * *',  // Every 4 hours
  CLEANUP_OLD_JOBS:    '0 2 * * *',     // 2am UTC daily
}
```

### Rate Limiting Strategy
```typescript
// Per-provider rate limits (tracked in Redis)
const RATE_LIMITS = {
  openai:     { rpm: 60,  tpm: 90_000 },   // Requests per minute / tokens per minute
  gemini:     { rpm: 60,  tpm: 60_000 },
  perplexity: { rpm: 20,  tpm: 40_000 },
  claude:     { rpm: 50,  tpm: 100_000 },
  grok:       { rpm: 30,  tpm: 50_000 },
}

// Per-account limits (plan-based)
const ACCOUNT_LIMITS = {
  starter: { promptsPerDay: 10,  promptsPerMonth: 50  },
  growth:  { promptsPerDay: 50,  promptsPerMonth: 150 },
  pro:     { promptsPerDay: 100, promptsPerMonth: 300 },
}
```

---

## 7. Database Architecture

### Core Schema Overview
```
accounts              → Users/organizations
  └── sites           → Websites being tracked
       ├── pages       → All crawled URLs
       │    └── page_contents  → Extracted content per page
       ├── brand_context       → LLM-extracted brand topics/persona
       ├── prompts             → Tracked prompts
       │    └── ai_answers     → Answers per prompt per model
       │         └── citations → Extracted citations per answer
       ├── competitors         → Tracked competitor domains
       ├── visibility_metrics  → Aggregated daily metrics (for charts)
       ├── content_gaps        → Detected gap topics
       │    └── content_briefs → Generated briefs
       │         └── content_pieces → Generated articles
       └── integrations        → GSC, GA4, Cloudflare tokens
  └── subscriptions    → Stripe subscription data
  └── usage_records    → Daily usage tracking
```

Full SQL schema is in `04-SQL-MIGRATIONS.sql`.

---

## 8. Third-Party Integrations

### AI Model APIs

#### OpenAI (ChatGPT)
```typescript
// Use Responses API with web_search tool for citations
const response = await openai.responses.create({
  model: 'gpt-4o',
  tools: [{ type: 'web_search_preview' }],
  input: prompt,
})
// Extract: response.output_text, response.output (for citations)
```

#### Google Gemini
```typescript
const result = await gemini.generateContent({
  contents: [{ role: 'user', parts: [{ text: prompt }] }],
  tools: [{ googleSearch: {} }],
})
// Extract: result.response.text(), groundingMetadata.groundingChunks
```

#### Perplexity
```typescript
const response = await fetch('https://api.perplexity.ai/chat/completions', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${PERPLEXITY_API_KEY}` },
  body: JSON.stringify({
    model: 'llama-3.1-sonar-large-128k-online',
    messages: [{ role: 'user', content: prompt }],
    return_citations: true,
  })
})
// Extract: choices[0].message.content, citations array
```

#### Anthropic Claude
```typescript
const message = await anthropic.messages.create({
  model: 'claude-opus-4-6',
  max_tokens: 2000,
  messages: [{ role: 'user', content: prompt }],
  tools: [{ type: 'web_search_20250305', name: 'web_search' }],
})
```

### Google APIs

#### Search Console (GSC)
```typescript
// OAuth2 flow → store tokens encrypted
// Fetch: top queries per page
const response = await searchconsole.searchanalytics.query({
  siteUrl: `https://${domain}/`,
  requestBody: {
    startDate: '30daysAgo',
    endDate: 'today',
    dimensions: ['page', 'query'],
    rowLimit: 1000,
  }
})
```

#### GA4 Data API
```typescript
// Fetch AI referral sessions
const response = await analyticsData.runReport({
  property: `properties/${propertyId}`,
  dimensions: [
    { name: 'sessionSource' },
    { name: 'landingPage' },
  ],
  metrics: [
    { name: 'sessions' },
    { name: 'engagedSessions' },
    { name: 'keyEvents' },
  ],
  dimensionFilter: {
    orGroup: { filters: [
      { fieldName: 'sessionSource', stringFilter: { value: 'chatgpt.com' }},
      { fieldName: 'sessionSource', stringFilter: { value: 'perplexity.ai' }},
      { fieldName: 'sessionSource', stringFilter: { value: 'claude.ai' }},
    ]}
  },
  dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
})
```

### Cloudflare GraphQL API
```typescript
// Fetch AI bot traffic by user-agent
const query = `
  query {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        httpRequestsAdaptiveGroups(
          filter: { date_geq: $startDate, date_leq: $endDate }
          limit: 1000
          orderBy: [count_DESC]
        ) {
          count
          dimensions {
            userAgent
            clientRequestPath
            datetimeHour
            edgeResponseStatus
          }
        }
      }
    }
  }
`
// Filter for known AI bot user-agents post-query
const AI_BOT_PATTERNS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Googlebot', 'Google-Extended',
]
```

### CMS APIs

#### Webflow CMS
```typescript
// OAuth2 flow for user authorization
// Create CMS item (draft)
const response = await fetch(`https://api.webflow.com/v2/collections/${collectionId}/items`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    fieldData: {
      name: article.title,
      slug: slugify(article.title),
      'post-body': article.htmlContent,
      'meta-title': article.seoTitle,
      'meta-description': article.seoDescription,
      _draft: true,
    }
  })
})
```

### Stripe
```typescript
// Subscription management
// Plans: starter ($99), growth ($299), pro ($599)
// Usage-based add-ons: extra prompt packs, extra articles

// Webhook events to handle:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

---

## 9. Security Architecture

### Authentication Flow
```
User → Clerk (JWT issued)
     → Next.js Middleware (JWT verified)
     → API Route (user extracted from JWT)
     → Database query (always filtered by accountId)
```

### Data Isolation
Every database query is scoped to `account_id`. No cross-account data leakage possible because:
- All tables have `account_id` column
- All queries include `WHERE account_id = $accountId`
- `accountId` is always derived from verified JWT, never from user input
- Row-Level Security (RLS) enabled in PostgreSQL as defense-in-depth

### Secrets Management
```
Environment Variables (Vercel/Railway):
├── DATABASE_URL           (Neon PostgreSQL connection string)
├── REDIS_URL              (Upstash Redis URL)
├── CLERK_SECRET_KEY       (Clerk auth)
├── OPENAI_API_KEY
├── GEMINI_API_KEY
├── PERPLEXITY_API_KEY
├── ANTHROPIC_API_KEY
├── GROK_API_KEY
├── STRIPE_SECRET_KEY
└── STRIPE_WEBHOOK_SECRET

User-provided secrets (stored encrypted in DB):
├── gsc_refresh_token     → encrypted with AES-256-GCM
├── ga4_refresh_token     → encrypted with AES-256-GCM
├── cloudflare_api_token  → encrypted with AES-256-GCM
├── webflow_access_token  → encrypted with AES-256-GCM
└── framer_api_key        → encrypted with AES-256-GCM

Encryption key: derived from MASTER_ENCRYPTION_KEY env var (rotate quarterly)
```

---

## 10. Deployment Architecture

### Frontend + API (Vercel)
```yaml
# vercel.json
{
  "framework": "nextjs",
  "regions": ["sin1"],     # Singapore (closest to India/Asia user base)
  "functions": {
    "app/api/**": {
      "maxDuration": 60    # 60s max for long API calls
    }
  }
}
```

### Workers (Railway)
```yaml
# railway.toml
[build]
  builder = "NIXPACKS"

[deploy]
  startCommand = "node workers/index.js"
  numReplicas = 2          # 2 worker replicas for reliability
  restartPolicyType = "ON_FAILURE"
```

### Database (Neon PostgreSQL)
- Serverless PostgreSQL with auto-scaling
- Read replica for analytics queries
- Connection pooling via PgBouncer
- Daily automated backups

### Cache / Queue (Upstash Redis)
- Redis for: BullMQ queues, rate limiting, session caching
- Upstash QStash for: serverless cron scheduling

### Environment Strategy
```
production:  app.rankfire.io    → Vercel prod, Neon prod, Railway prod
staging:     staging.rankfire.io → Vercel preview, Neon dev
development: localhost:3000      → Local Next.js, Local Redis, Neon dev
```

---

## 11. Monitoring & Observability

### Error Tracking
- **Sentry** — Frontend + backend error capturing
- Alert rules: error rate > 1% → Slack notification

### Logging
- **Axiom / Logtail** — Structured JSON logs from all services
- Log levels: ERROR, WARN, INFO, DEBUG
- All job starts/completions logged with duration

### Metrics
- **Vercel Analytics** — Frontend performance
- **Custom metrics in PostgreSQL** — Business KPIs
- **Upstash Redis dashboard** — Queue depths, job throughput

### Uptime Monitoring
- **Better Uptime** — Ping every 60s, alert if down > 2 minutes
- Status page: status.rankfire.io

### Alerting
```
Alert: Failed payment webhook → Slack #alerts
Alert: Job failure rate > 5% → Slack #alerts + PagerDuty
Alert: API error rate > 2% → Slack #alerts
Alert: Database CPU > 80% → Slack #alerts
Alert: Redis memory > 80% → Slack #alerts
```

---

## 12. API Contracts

### Standard Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2026-05-14T10:00:00Z"
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "USAGE_LIMIT_EXCEEDED",
    "message": "You have used all 150 prompts in your monthly allowance.",
    "details": { "used": 150, "limit": 150, "resetsAt": "2026-06-01" }
  }
}
```

### Standard Error Codes
```
AUTH_REQUIRED           → 401 — No valid session
FORBIDDEN               → 403 — Not authorized for this resource
NOT_FOUND               → 404 — Resource not found
VALIDATION_ERROR        → 422 — Request body validation failed
USAGE_LIMIT_EXCEEDED    → 429 — Monthly usage limit reached
RATE_LIMIT_EXCEEDED     → 429 — Too messages
INTEGRATION_ERROR       → 502 — External API (GSC, Cloudflare) failed
INTERNAL_ERROR          → 500 — Unexpected server error
```

### Pagination
```typescript
// All list endpoints support cursor-based pagination
GET /api/prompts?cursor=eyJpZCI6MTIzfQ&limit=25

// Response includes:
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTQ4fQ",
    "hasMore": true,
    "total": 247
  }
}
```

---

*End of Architecture PRD v1.0*
