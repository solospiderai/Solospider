import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { crawlQueue, promptScanQueue, scoringQueue } from "./queues.js";
import { env } from "./config.js";

export const router = Router();

// ── Auth middleware ──────────────────────────────────────────────────────────
function requireSecret(req: Request, res: Response, next: () => void) {
  const secret = req.headers["x-worker-secret"] ?? req.query.secret;
  if (secret !== env.WORKER_SECRET) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}

// ── Health check (public) ────────────────────────────────────────────────────
router.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString(), env: env.NODE_ENV });
});

// ── Queue stats (public) ─────────────────────────────────────────────────────
router.get("/stats", async (_req, res) => {
  try {
    const [crawl, scan, score] = await Promise.all([
      crawlQueue.getJobCounts(),
      promptScanQueue.getJobCounts(),
      scoringQueue.getJobCounts(),
    ]);
    res.json({ crawl, scan, score });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// ── POST /api/jobs/crawl ─────────────────────────────────────────────────────
const CrawlSchema = z.object({
  project_id: z.string().uuid(),
  website:    z.string().url(),
  max_pages:  z.number().int().min(1).max(200).optional().default(50),
});

router.post("/api/jobs/crawl", requireSecret, async (req, res) => {
  const parsed = CrawlSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const job = await crawlQueue.add("crawl", parsed.data, {
    jobId: `crawl-${parsed.data.project_id}-${Date.now()}`,
  });

  console.log(`[Router] Queued crawl job ${job.id} for ${parsed.data.website}`);
  res.json({ ok: true, job_id: job.id, queue: "crawl" });
});

// ── POST /api/jobs/prompt-scan ───────────────────────────────────────────────
const PromptScanSchema = z.object({
  project_id:   z.string().uuid(),
  brand_name:   z.string().min(1),
  models:       z.array(z.string()).min(1).default(["chatgpt", "gemini", "perplexity", "claude"]),
  competitors:  z.array(z.string()).optional().default([]),
  prompt_ids:   z.array(z.string().uuid()).optional(),
});

router.post("/api/jobs/prompt-scan", requireSecret, async (req, res) => {
  const parsed = PromptScanSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const job = await promptScanQueue.add("prompt-scan", parsed.data, {
    jobId: `scan-${parsed.data.project_id}-${Date.now()}`,
  });

  console.log(`[Router] Queued prompt-scan job ${job.id} for ${parsed.data.brand_name}`);
  res.json({ ok: true, job_id: job.id, queue: "prompt-scan" });
});

// ── POST /api/jobs/score ─────────────────────────────────────────────────────
const ScoringSchema = z.object({
  project_id: z.string().uuid(),
  brand_name: z.string().min(1),
});

router.post("/api/jobs/score", requireSecret, async (req, res) => {
  const parsed = ScoringSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const job = await scoringQueue.add("score", parsed.data, {
    jobId: `score-${parsed.data.project_id}-${Date.now()}`,
  });

  res.json({ ok: true, job_id: job.id, queue: "scoring" });
});

// ── GET /api/jobs/:jobId ─────────────────────────────────────────────────────
router.get("/api/jobs/:jobId", requireSecret, async (req, res) => {
  const { jobId } = req.params;
  // Search across queues
  const queues = [crawlQueue, promptScanQueue, scoringQueue];
  for (const q of queues) {
    const job = await q.getJob(jobId);
    if (job) {
      const state = await job.getState();
      const progress = job.progress;
      res.json({
        job_id: job.id,
        queue: q.name,
        state,
        progress,
        result: job.returnvalue,
        failed_reason: job.failedReason,
        created_at: new Date(job.timestamp).toISOString(),
      });
      return;
    }
  }
  res.status(404).json({ error: "Job not found" });
});
