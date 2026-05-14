# Master PRD — AI Search Visibility Platform
### Product Codename: **Rankfire**
**Version:** 1.0.0  
**Author:** Engineering Lead  
**Status:** Draft → Review  
**Last Updated:** May 2026

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Product Vision & Goals](#4-product-vision--goals)
5. [Competitive Landscape](#5-competitive-landscape)
6. [Full User Journey](#6-full-user-journey)
7. [Feature Inventory](#7-feature-inventory)
8. [KPIs & Success Metrics](#8-kpis--success-metrics)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Go-To-Market Strategy](#10-go-to-market-strategy)
11. [Risks & Mitigations](#11-risks--mitigations)
12. [Milestones & Timeline](#12-milestones--timeline)

---

## 1. Executive Summary

Rankfire is a B2B SaaS platform that helps marketing teams, SEO professionals, and growth leaders understand, measure, and improve how their brand appears in AI-generated answers across ChatGPT, Google Gemini, Perplexity, Claude, and Grok.

The platform operates in three interconnected layers:
- **Measure** — Track brand visibility across AI models through automated prompt monitoring
- **Diagnose** — Identify why the brand is missing from AI answers using content gap detection
- **Act** — Generate and publish optimized content that increases AI citation rates

Unlike traditional SEO tools that focus on Google's 10 blue links, Rankfire is built for the post-search world where AI systems synthesize answers and cite sources directly. The average AI-referred visitor converts at 3× the rate of standard search traffic (Microsoft Clarity, 2025), making AI visibility a high-leverage channel.

---

## 2. Problem Statement

### The Market Shift
AI-powered search engines (ChatGPT Search, Perplexity, Google AI Overviews, Claude) now answer queries directly, synthesizing content from multiple sources and citing the pages they trust. For the first time, a company can have excellent Google rankings but be completely invisible in AI answers — or vice versa.

### The Current Pain
Marketing and SEO teams have no reliable way to:
1. **Monitor** — Know if their brand appears in AI answers for relevant industry prompts
2. **Attribute** — Distinguish AI bot crawls from human visits in their analytics
3. **Compete** — See which competitors are being cited instead of them
4. **Fix** — Know exactly what content to create to get cited by AI models

### The Opportunity
- AI search is growing: ChatGPT now handles ~150M queries/day
- AI-referred traffic converts at 3× standard channels
- Only ~5% of businesses actively monitor their AI visibility
- No dominant tool has captured this market segment yet

---

## 3. Target Users & Personas

### Primary Persona: The SEO Lead
- **Name:** Priya, VP of SEO at a B2B SaaS company (50-500 employees)
- **Goal:** Prove that content investment drives measurable pipeline
- **Pain:** Google rankings are stagnating; boss is asking about AI search strategy
- **Behavior:** Uses Semrush daily, exports to GSC, reports weekly in Slack
- **Willingness to pay:** $299-$599/month with company card

### Secondary Persona: The Growth Marketer
- **Name:** Alex, Head of Growth at a DTC brand (Series A)
- **Goal:** Find new acquisition channels with high intent
- **Pain:** CAC is rising on paid channels; organic is unpredictable
- **Behavior:** Runs growth experiments, loves data dashboards
- **Willingness to pay:** $199-$399/month

### Tertiary Persona: The Founder/CEO
- **Name:** Rohan, CEO of a bootstrapped SaaS (~$2M ARR)
- **Goal:** Own category authority in his niche
- **Pain:** Feels like competitors keep getting mentioned in AI answers, not him
- **Behavior:** Reads newsletters, acts on specific insights, no time for dashboards
- **Willingness to pay:** $99-$249/month (value-driven, not feature-driven)

### Enterprise Persona: The Marketing Director
- **Name:** Sarah, Director of Digital Marketing at an enterprise (1000+ employees)
- **Goal:** Standardize AI visibility reporting across 3 brand websites
- **Pain:** No executive-level reporting on AI search performance
- **Behavior:** Needs SSO, team seats, custom reporting
- **Willingness to pay:** $1,500-$5,000/month (custom contract)

---

## 4. Product Vision & Goals

### Vision Statement
> "Be the command center that every marketing team uses to win in AI search — the same way they use Semrush to win in Google search."

### Year 1 Goals
| Goal | Target | Metric |
|---|---|---|
| ARR | $500K | Monthly recurring revenue |
| Paying customers | 150+ | Active subscriptions |
| Retention | >85% | Monthly net revenue retention |
| NPS | >50 | Quarterly NPS survey |
| Time to Value | <15 min | Signup → first insight |

### Product Principles
1. **Insights, not data** — Every screen answers "so what?" not just "what"
2. **Action-oriented** — Every insight has a next step the user can take
3. **Fast to value** — First meaningful output within 5 minutes of onboarding
4. **Transparent methodology** — Users understand exactly how scores are calculated
5. **Integrates, doesn't replace** — Works alongside GA4, GSC, Semrush — doesn't try to replace them

---

## 5. Competitive Landscape

| Competitor | Focus | Weakness | Our Advantage |
|---|---|---|---|
| Sitefire | GEO/AEO monitoring | Early stage, limited actions | More action modules, lower price |
| Authoritas | Traditional SEO | No AI visibility | Purpose-built for AI era |
| BrightEdge | Enterprise SEO | $$$, slow innovation | Faster, cheaper, AI-native |
| Semrush | Full SEO suite | No AI monitoring | Focused, purpose-built |
| Ahrefs | Backlinks/content | No AI features | Specialized for AI search |
| SE Ranking | SMB SEO | No AI features | Premium AI features at SMB price |
| Manual tracking | Spreadsheets | No scale, no automation | Automated, scalable, real-time |

**Our positioning:** "The first AI search visibility platform built for action, not just reporting."

---

## 6. Full User Journey

### Step 0: Discovery & Signup
```
Landing page → Pricing page → Start free trial
→ Enter work email → Verify email → Create password
→ Onboarding wizard (5 steps)
```

### Step 1: Onboarding Wizard
```
Step 1/5: Enter your website domain (e.g. acme.com)
Step 2/5: Connect Google Search Console (OAuth) [skippable]
Step 3/5: Connect GA4 (OAuth) [skippable]  
Step 4/5: Connect Cloudflare (API token) [skippable]
Step 5/5: Select your competitors (up to 3 domains)
→ "We're analyzing your site..." [background jobs fire]
→ Redirect to dashboard (shows partial data + "still loading" states)
```

### Step 2: Analysis Jobs (Background)
```
[Job 1] Sitemap crawl → extract all URLs → store pages table
[Job 2] Page content fetch → extract H1, meta, body → store content
[Job 3] Topic extraction → LLM → store brand_topics table
[Job 4] Prompt generation → combine topics + PAA → store prompts table
[Job 5] GSC data import → top queries per URL → store gsc_data table
[Job 6] Initial prompt run → fire all prompts against all AI models
[Job 7] Citation analysis → parse answers → store citations table
```

### Step 3: Dashboard (Main View)
```
Sidebar navigation:
├── Overview (KPI summary cards)
├── AI Visibility (prompt monitoring)
│   ├── All Prompts
│   ├── By AI Model
│   └── Competitor Comparison
├── Content (pages & citations)
│   ├── My Pages
│   ├── Citation Map
│   └── Gap Analysis
├── Actions
│   ├── Create Content [briefs]
│   ├── Improve Content [recommendations]
│   ├── Earn Media [outreach]
│   └── UGC Opportunities
├── Analytics
│   ├── AI Bot Traffic (Cloudflare)
│   ├── AI Referrals (GA4)
│   └── Combined View
└── Settings
    ├── Prompts
    ├── Competitors
    ├── Integrations
    └── Team & Billing
```

### Step 4: Ongoing Usage Loop
```
Weekly email digest → "Your AI visibility changed X% this week"
→ Login to dashboard → See what changed
→ Review recommended actions
→ Approve content → Published to CMS
→ Wait 2 weeks → Re-run prompts → See improvement
→ Report to team/stakeholders (shareable report URL)
```

### Step 5: Expansion & Retention
```
User sees value → Invites team member
→ Upgrades from Lite to Pro (hit prompt limit)
→ Enables additional CMS integrations
→ Requests Enterprise (multi-site, SSO, custom prompts)
```

---

## 7. Feature Inventory

### Tier 1: Core Features (MVP — must ship)
| # | Feature | Description | Priority |
|---|---|---|---|
| F01 | Domain onboarding | Enter domain, trigger all analysis jobs | P0 |
| F02 | Sitemap crawler | Parse sitemap.xml, extract all URLs | P0 |
| F03 | Prompt auto-generation | Generate relevant prompts from site content | P0 |
| F04 | AI prompt monitoring | Run prompts, capture answers, extract citations | P0 |
| F05 | Visibility dashboard | Mention rate, citation rate, share of voice | P0 |
| F06 | Citation analyzer | Which domains/pages cited, by which model | P0 |
| F07 | Gap detection | Topics where competitors cited, brand not | P0 |
| F08 | Content brief generator | LLM-powered brief for gap topics | P0 |
| F09 | GSC integration | Import top queries, impressions, CTR per page | P0 |
| F10 | Auth + billing | Clerk auth, Stripe subscriptions, usage limits | P0 |

### Tier 2: Growth Features (Post-MVP)
| # | Feature | Description | Priority |
|---|---|---|---|
| F11 | Article generator | Full article from brief, brand-aware | P1 |
| F12 | CMS push (Webflow) | Publish article drafts to Webflow CMS | P1 |
| F13 | CMS push (Framer) | Publish article drafts to Framer CMS | P1 |
| F14 | GA4 AI referral tracking | AI referral sessions, landing pages, conversions | P1 |
| F15 | Cloudflare bot analytics | AI crawler classification by URL & type | P1 |
| F16 | Competitor monitoring | Track competitor AI visibility over time | P1 |
| F17 | Weekly email digest | Automated weekly summary with key changes | P1 |
| F18 | Shareable reports | Public URL for stakeholder reporting | P1 |

### Tier 3: Scale Features (Enterprise)
| # | Feature | Description | Priority |
|---|---|---|---|
| F19 | Multi-site dashboard | Manage multiple domains in one account | P2 |
| F20 | MCP server (Spark agent) | Let Claude/ChatGPT access user's Rankfire data | P2 |
| F21 | Team seats & roles | Admin / Editor / Viewer roles | P2 |
| F22 | SSO (SAML/OIDC) | Enterprise SSO integration | P2 |
| F23 | Custom integrations | WordPress, Contentful, Sanity CMS | P2 |
| F24 | AWS CloudFront analytics | Bot analytics for AWS-hosted sites | P2 |
| F25 | Earn media module | Journalist finder, pitch angle generator | P2 |
| F26 | UGC engagement module | Reddit/forum thread finder & response briefs | P2 |
| F27 | API access | Public API for custom integrations | P2 |
| F28 | White-label | Agency white-label with custom branding | P3 |

---

## 8. KPIs & Success Metrics

### Business KPIs
- **MRR Growth:** 20% month-over-month (target $50K MRR by month 6)
- **Churn Rate:** <5% monthly
- **CAC:** <$500 (paid) / <$50 (organic SEO/content)
- **LTV:** >$3,600 (18 months average retention)
- **LTV:CAC ratio:** >7:1

### Product KPIs
- **Activation rate:** >60% of signups complete onboarding (5 steps)
- **Time to first insight:** <15 minutes from signup
- **Weekly active rate:** >50% of paying customers log in weekly
- **Feature adoption:** >70% of users run at least 1 content action/month
- **NPS:** >50

### Technical KPIs
- **Uptime:** 99.9% SLA
- **Prompt job latency:** <30s per prompt run
- **Dashboard load time:** <2s (P95)
- **Crawler success rate:** >95% of submitted URLs crawled successfully

---

## 9. Non-Functional Requirements

### Performance
- Dashboard initial load: < 2 seconds (P95)
- API response time: < 500ms (P95) for read endpoints
- Prompt job processing: < 30 seconds per prompt per model
- Batch job throughput: 500 prompts/hour per account (queue-managed)

### Security
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- API keys stored encrypted (not plaintext) in database
- OAuth tokens stored server-side only (no client-side exposure)
- GDPR compliant: data deletion within 30 days of account closure
- SOC2 Type II target within 12 months of launch

### Scalability
- System must handle 1,000 concurrent accounts without degradation
- Job queue must scale horizontally (BullMQ + Redis cluster)
- Database must handle 10M+ rows in prompts/answers tables (partition by account_id)
- CDN-cached dashboard assets; API responses cached in Redis where safe

### Reliability
- Zero-downtime deployments (rolling deploys on Vercel)
- Background jobs retry on failure (max 3 retries with exponential backoff)
- Dead-letter queue for failed jobs with alerting
- Database daily automated backups with 30-day retention

### Compliance
- GDPR: User data deletion, export on request
- CCPA: California resident rights
- Cookie consent (non-essential cookies opt-in)
- No selling of user data to third parties
- AI model API usage: comply with each provider's terms of service

---

## 10. Go-To-Market Strategy

### Phase 1: Founder-Led Sales (Months 1-3)
- Direct outreach to SEO leads and marketing directors
- LinkedIn content: "how to measure AI visibility" thought leadership
- ProductHunt launch
- SEO for "AI search visibility tool", "GEO monitoring", "ChatGPT ranking"
- Target: 30 paying customers at $249-$499/month

### Phase 2: Content-Led Growth (Months 4-6)
- Publish weekly blog on AEO/GEO topics (the irony: rank in AI search for AI search queries)
- Free AI visibility audit tool (lead magnet)
- Partnership with Webflow/Framer communities
- Agency partner program (resell to clients)
- Target: 100 paying customers

### Phase 3: Product-Led Growth (Months 7-12)
- Free tier (limited prompts, no actions)
- In-product viral loops (shareable reports with Rankfire branding)
- Integration marketplace listing (Webflow, Zapier)
- Target: 300+ paying customers, $150K MRR

### Pricing Strategy
| Plan | Price | Prompts | Articles | Seats |
|---|---|---|---|---|
| Starter | $99/mo | 50 prompts | 0 | 1 |
| Growth | $299/mo | 150 prompts | 4/mo | 3 |
| Pro | $599/mo | 300 prompts | 8/mo | 5 |
| Enterprise | Custom | Unlimited | Unlimited | Unlimited |

---

## 11. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI APIs block automated prompt testing | Medium | High | Use official APIs; comply with ToS; build fallbacks |
| AI model answer quality changes (less citations) | Medium | High | Diversify tracking across 5+ models |
| Large competitor (Semrush/Ahrefs) ships AI feature | High | High | Move fast; build deep action features they won't |
| High LLM API costs at scale | Medium | Medium | Cache answers; optimize prompt runs; batch APIs |
| Cloudflare API limits change | Low | Medium | Abstract analytics layer; add AWS/Nginx alternatives |
| GA4 breaks AI referral attribution | Low | Medium | Multi-source attribution; direct Cloudflare fallback |
| Regulatory action on AI APIs | Low | High | Monitor; multi-provider architecture |

---

## 12. Milestones & Timeline

| Milestone | Target Date | Exit Criteria |
|---|---|---|
| M1: MVP Foundation | Week 2 | Auth, onboarding, crawler working |
| M2: AI Monitoring Live | Week 4 | Prompts running on all 5 models |
| M3: Actions Working | Week 6 | Content briefs + article generation |
| M4: Tracking Layer | Week 8 | GA4 + Cloudflare integrations |
| M5: Beta Launch | Week 10 | 10 beta users, paying |
| M6: Public Launch | Week 14 | ProductHunt, 30 paying customers |
| M7: $10K MRR | Month 4 | Revenue milestone |
| M8: $50K MRR | Month 8 | Product-market fit confirmed |

---

*End of Master PRD v1.0*
