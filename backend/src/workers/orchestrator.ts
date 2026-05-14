import type { Worker } from "bullmq";
import { promptScanQueue, scoringQueue } from "../queues.js";
import { supabase } from "../lib/supabase.js";
import type { CrawlJobData, PromptScanJobData } from "../queues.js";

/**
 * Initializes autonomous workflow chaining across BullMQ workers.
 *
 * Execution Chain:
 * 1. CrawlWorker [Completed] &rarr; Dispatches PromptScanWorker
 * 2. PromptScanWorker [Completed] &rarr; Dispatches ScoringWorker
 */
export function startPipelineOrchestrator(crawlWorker: Worker<CrawlJobData>, promptScanWorker: Worker<PromptScanJobData>) {
  console.log("🔗 PipelineOrchestrator initialized — listening for worker lifecycle events");

  // ── 1. Crawl Complete &rarr; Trigger Prompt Scan ──────────────────────────────
  crawlWorker.on("completed", async (job) => {
    try {
      const { project_id, website } = job.data;
      console.log(`[Orchestrator] 🕷️ Crawl job ${job.id} completed for project ${project_id}. Fetching brand DNA…`);

      // Resolve brand name from project metadata
      const { data: project, error } = await supabase
        .from("projects")
        .select("name")
        .eq("id", project_id)
        .single();

      const brandName = project?.name || website.replace(/^https?:\/\//, "").split("/")[0];

      // Dispatch PromptScanJob across active models
      const scanJob = await promptScanQueue.add("prompt-scan", {
        project_id,
        brand_name: brandName,
        models: ["chatgpt", "gemini", "perplexity", "claude"],
      }, { jobId: `scan-auto-${project_id}-${Date.now()}` });

      console.log(`[Orchestrator] 🤖 Chained PromptScanJob ${scanJob.id} for brand: ${brandName}`);
    } catch (err) {
      console.error("[Orchestrator] Error chaining Crawl &rarr; PromptScan:", err);
    }
  });

  // ── 2. Prompt Scan Complete &rarr; Trigger Scoring ────────────────────────────
  promptScanWorker.on("completed", async (job) => {
    try {
      const { project_id, brand_name } = job.data;
      console.log(`[Orchestrator] 🤖 PromptScan job ${job.id} completed. Dispatches Visibility Scoring…`);

      // Dispatch ScoringJob
      const scoreJob = await scoringQueue.add("score", {
        project_id,
        brand_name,
      }, { jobId: `score-auto-${project_id}-${Date.now()}` });

      console.log(`[Orchestrator] 📊 Chained ScoringJob ${scoreJob.id} for brand: ${brand_name}`);
    } catch (err) {
      console.error("[Orchestrator] Error chaining PromptScan &rarr; Scoring:", err);
    }
  });
}
