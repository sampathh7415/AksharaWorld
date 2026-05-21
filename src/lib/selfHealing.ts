import { sendTelegramAlert } from './telegram';
import { resilientFetch } from './resilience';

interface HealthCheckResult {
  service: string;
  status: 'ok' | 'degraded' | 'failed';
  error?: string;
}

export async function checkSystemHealth(): Promise<HealthCheckResult[]> {
  const results: HealthCheckResult[] = [];

  // Example check
  try {
    const res = await resilientFetch<any>('https://sam-ceo-brain.akshara-sam.workers.dev/health', { timeout: 5000, retries: 1 });
    results.push({ service: 'Sam_Brain', status: 'ok' });
  } catch (err: any) {
    results.push({ service: 'Sam_Brain', status: 'failed', error: err.message });
  }

  return results;
}

export async function rollbackCommit(owner: string, repo: string, commitSha: string) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN not configured');

  // Triggering a GitHub Action workflow to handle the rollback
  // Alternatively, we could create a revert PR
  const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/rollback.yml/dispatches`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: {
        commit_sha: commitSha
      }
    })
  });

  return res.ok;
}

export async function runSelfHealingLoop() {
  console.log("🛡️ Guardian_Ops: Starting self-healing loop");
  const healthResults = await checkSystemHealth();

  const failures = healthResults.filter(r => r.status === 'failed');

  if (failures.length > 0) {
    const msg = failures.map(f => `❌ ${f.service}: ${f.error}`).join('\n');
    await sendTelegramAlert(`🚨 <b>Guardian_Ops Alert</b>\n\nSystem degraded:\n${msg}\n\nInitiating self-healing protocols.`);

    // Auto-rollback logic placeholder
    // await rollbackCommit('owner', 'repo', 'HEAD');
  } else {
    console.log("✅ All systems nominal.");
  }
}
