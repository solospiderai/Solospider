// ── Worker API Client ───────────────────────────────────────────────────────
// Typed client for the Railway worker REST API.
// Falls back to Supabase Edge Functions if VITE_WORKER_URL is not set.

const WORKER_URL   = import.meta.env.VITE_WORKER_URL as string | undefined;
const WORKER_SECRET= import.meta.env.VITE_WORKER_SECRET as string | undefined;

function workerAvailable(): boolean {
  return Boolean(WORKER_URL && WORKER_SECRET);
}

async function workerPost<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${WORKER_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-worker-secret": WORKER_SECRET ?? "",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? `Worker error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Job payloads ────────────────────────────────────────────────────────────

export interface CrawlJobResult {
  ok: boolean;
  job_id: string;
  queue: string;
}

export interface PromptScanJobResult {
  ok: boolean;
  job_id: string;
  queue: string;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Submit a crawl job to the Railway worker.
 * Returns job_id so the frontend can poll Supabase for live progress.
 */
export async function submitCrawlJob(params: {
  project_id: string;
  website: string;
  max_pages?: number;
}): Promise<CrawlJobResult> {
  if (!workerAvailable()) {
    throw new Error("WORKER_NOT_CONFIGURED");
  }
  return workerPost<CrawlJobResult>("/api/jobs/crawl", params);
}

/**
 * Submit a prompt-scan job to the Railway worker.
 */
export async function submitPromptScanJob(params: {
  project_id: string;
  brand_name: string;
  models: string[];
  competitors?: string[];
  prompt_ids?: string[] | null;
}): Promise<PromptScanJobResult> {
  if (!workerAvailable()) {
    throw new Error("WORKER_NOT_CONFIGURED");
  }
  return workerPost<PromptScanJobResult>("/api/jobs/prompt-scan", params);
}

/** Check if the Railway worker is configured and reachable */
export async function checkWorkerHealth(): Promise<boolean> {
  if (!workerAvailable()) return false;
  try {
    const res = await fetch(`${WORKER_URL}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Admin Telemetry API ─────────────────────────────────────────────────────

export async function fetchAdminUsers(): Promise<{ users: any[] }> {
  if (!workerAvailable()) throw new Error("WORKER_NOT_CONFIGURED");
  const res = await fetch(`${WORKER_URL}/api/admin/users`, { headers: { "x-worker-secret": WORKER_SECRET ?? "" } });
  if (!res.ok) throw new Error("Failed to fetch admin users");
  return res.json();
}

export async function fetchAdminQueues(): Promise<{ queues: any[] }> {
  if (!workerAvailable()) throw new Error("WORKER_NOT_CONFIGURED");
  const res = await fetch(`${WORKER_URL}/api/admin/queues`, { headers: { "x-worker-secret": WORKER_SECRET ?? "" } });
  if (!res.ok) throw new Error("Failed to fetch admin queues");
  return res.json();
}

export async function flushAdminQueue(queueName: string): Promise<any> {
  return workerPost("/api/admin/queues/flush", { queueName });
}

export async function restartAdminWorker(queueName: string): Promise<any> {
  return workerPost("/api/admin/queues/restart", { queueName });
}

export async function fetchAdminAuditLogs(): Promise<{ logs: any[] }> {
  if (!workerAvailable()) throw new Error("WORKER_NOT_CONFIGURED");
  const res = await fetch(`${WORKER_URL}/api/admin/audit`, { headers: { "x-worker-secret": WORKER_SECRET ?? "" } });
  if (!res.ok) throw new Error("Failed to fetch audit logs");
  return res.json();
}

export { workerAvailable };
