import "dotenv/config";
import express from "express";
import cors from "cors";
import cron from "node-cron";
import { env } from "./config.js";
import { router } from "./router.js";
import { startCrawlWorker } from "./workers/crawl.worker.js";
import { startPromptScanWorker } from "./workers/prompt-scan.worker.js";
import { startScoringWorker } from "./workers/scoring.worker.js";
import { scoringQueue } from "./queues.js";
import { supabase } from "./lib/supabase.js";

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();

app.use(cors({
  origin: env.CORS_ORIGINS.split(",").map(s => s.trim()),
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(router);

// ── Start workers ────────────────────────────────────────────────────────────
const crawlWorker      = startCrawlWorker();
const promptScanWorker = startPromptScanWorker();
const scoringWorker    = startScoringWorker();

// ── Cron: auto-recompute GEO scores every 6 hours ───────────────────────────
cron.schedule("0 */6 * * *", async () => {
  console.log("[Cron] Triggering GEO score recompute for all projects…");
  try {
    const { data: projects } = await supabase
      .from("projects")
      .select("id, name")
      .limit(100);

    for (const project of projects ?? []) {
      await scoringQueue.add("score", {
        project_id: project.id,
        brand_name: project.name,
      }, { jobId: `score-cron-${project.id}-${Date.now()}` });
    }
    console.log(`[Cron] Queued scoring for ${projects?.length ?? 0} projects`);
  } catch (e) {
    console.error("[Cron] Score cron error:", e);
  }
});

// ── Start server ─────────────────────────────────────────────────────────────
const port = Number(env.PORT);
app.listen(port, () => {
  console.log(`\n🚀 SoloSpider Worker ready on http://localhost:${port}`);
  console.log(`   ENV: ${env.NODE_ENV}`);
  console.log(`   Workers: CrawlWorker | PromptScanWorker | ScoringWorker`);
  console.log(`   Cron: GEO score recompute every 6h\n`);
});

// ── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`\n[Worker] ${signal} received, shutting down gracefully…`);
  await Promise.all([
    crawlWorker.close(),
    promptScanWorker.close(),
    scoringWorker.close(),
  ]);
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
