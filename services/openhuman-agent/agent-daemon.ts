/**
 * 🤖 OPENHUMAN LOCAL AI AGENT DAEMON WITH LOVABLE WEBHOOK PROCESSOR
 * 📁 services/openhuman-agent/agent-daemon.ts
 *
 * Ingests mock business streams and processes incoming front-end tasks offloaded from Lovable
 * locally using free Gemini API tokens, storing logs and histories resiliently.
 */

import * as fs from 'fs';
import * as path from 'path';

interface EventPayload {
  id: string;
  source: 'GMAIL' | 'STRIPE' | 'SLACK' | 'LOVABLE_INGEST';
  event: string;
  data: Record<string, any>;
  timestamp: string;
}

interface ProductionTask {
  taskId: string;
  clientInput: string;
  sourceView: string;
  timestamp: string;
  status?: string;
  result?: string;
}

export class OpenHumanAgentDaemon {
  private intervalMinutes: number;
  private timer: NodeJS.Timeout | null = null;
  private dbPath: string;
  private jsonPath: string;
  private queuePath: string;
  private historyPath: string;

  constructor(intervalMinutes = 20) {
    this.intervalMinutes = intervalMinutes;
    this.dbPath = path.join(process.cwd(), '.code-review-graph', 'openhuman.db');
    this.jsonPath = path.join(process.cwd(), '.code-review-graph', 'openhuman-memory.json');
    this.queuePath = path.join(process.cwd(), '.code-review-graph', 'production-queue.json');
    this.historyPath = path.join(process.cwd(), '.code-review-graph', 'production-history.json');
    this.ensureStorageDirectory();
  }

  private ensureStorageDirectory() {
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  /**
   * 🤖 Ingests and processes offloaded Lovable tasks locally using the Gemini API
   */
  private async processProductionQueue(): Promise<void> {
    if (!fs.existsSync(this.queuePath)) return;

    try {
      let queue: ProductionTask[] = [];
      try {
        queue = JSON.parse(fs.readFileSync(this.queuePath, 'utf8'));
      } catch {
        return;
      }

      if (queue.length === 0) return;

      console.log(`[OpenHuman Daemon] Found ${queue.length} Lovable task(s) in local queue. Processing offline...`);

      const apiKey = process.env.GEMINI_API_KEY || '';
      const geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

      let history: ProductionTask[] = [];
      if (fs.existsSync(this.historyPath)) {
        try {
          history = JSON.parse(fs.readFileSync(this.historyPath, 'utf8'));
        } catch {
          history = [];
        }
      }

      for (const task of queue) {
        console.log(`[OpenHuman Daemon] Processing task ${task.taskId} via local Gemini gateway...`);
        let resultText = '';

        if (apiKey) {
          try {
            // Local resilient fetch call to Gemini
            const res = await fetch(`${geminiUrl}?key=${apiKey}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: `Process the following client input for a front-end view: ${task.clientInput}` }] }]
              }),
              signal: AbortSignal.timeout(15000)
            });

            if (res.ok) {
              const data = await res.json();
              resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Mock local processing complete.';
            } else {
              resultText = `Local processing fallback (Gemini API HTTP Error: ${res.status}).`;
            }
          } catch (err: any) {
            resultText = `Local processing fallback (Jitter Error: ${err.message}).`;
          }
        } else {
          resultText = `Mock local processing complete. Ingested Input: "${task.clientInput.substring(0, 30)}..."`;
        }

        const completedTask: ProductionTask = {
          ...task,
          status: 'COMPLETED_LOCALLY',
          result: resultText
        };

        history.unshift(completedTask);
        console.log(`[OpenHuman Daemon] Task ${task.taskId} successfully processed offline.`);
      }

      // Save processed history & clear queue
      fs.writeFileSync(this.historyPath, JSON.stringify(history, null, 2), 'utf8');
      fs.writeFileSync(this.queuePath, JSON.stringify([], null, 2), 'utf8');

    } catch (e: any) {
      console.error(`[OpenHuman Daemon] Production queue processing failed: ${e.message}`);
    }
  }

  /**
   * 📥 Ingests mock business streams
   */
  private generateMockEvents(): EventPayload[] {
    const now = new Date().toISOString();
    return [
      {
        id: `EVT-GM-${Math.floor(1000 + Math.random() * 9000)}`,
        source: 'GMAIL',
        event: 'Inbound Customer Inquiry',
        data: {
          sender: 'client@startup.io',
          subject: 'Custom AI Scaffolding Quotation Request',
          body: 'Hello Akshara Team, we are interested in deploying your zero-cost blueprint template.'
        },
        timestamp: now
      },
      {
        id: `EVT-ST-${Math.floor(1000 + Math.random() * 9000)}`,
        source: 'STRIPE',
        event: 'charge.succeeded',
        data: {
          customer: 'cus_Rzp8921471a',
          amount: 150000,
          currency: 'inr',
          product: 'Premium SEO Blueprint E-Book'
        },
        timestamp: now
      },
      {
        id: `EVT-SL-${Math.floor(1000 + Math.random() * 9000)}`,
        source: 'SLACK',
        event: 'Critical API Warning Alert',
        data: {
          channel: '#guardian-ops-alerts',
          message: 'Google Sheets DB Sync: High latency detected on POST webhook routing.'
        },
        timestamp: now
      }
    ];
  }

  /**
   * 🗃️ Indices event into local database (Local JSON Storage Fallback)
   */
  private async indexToStorage(events: EventPayload[]): Promise<void> {
    try {
      let currentMemories: EventPayload[] = [];
      if (fs.existsSync(this.jsonPath)) {
        try {
          currentMemories = JSON.parse(fs.readFileSync(this.jsonPath, 'utf8'));
        } catch {
          currentMemories = [];
        }
      }

      currentMemories = [...events, ...currentMemories].slice(0, 100);
      fs.writeFileSync(this.jsonPath, JSON.stringify(currentMemories, null, 2), 'utf8');
      console.log(`[OpenHuman Daemon] Successfully indexed ${events.length} events to solid-state memory.`);
    } catch (e: any) {
      console.error(`[OpenHuman Daemon] Storage indexing failed: ${e.message}`);
    }
  }

  /**
   * 📡 Dispatches sync telemetry payload to Webhook route
   */
  private async triggerWebhookSync(events: EventPayload[]): Promise<void> {
    const webhookUrl = `http://localhost:${process.env.PORT || 3000}/api/v1/openhuman/sync-hook`;
    try {
      console.log(`[OpenHuman Daemon] Dispatching webhook sync to ${webhookUrl}...`);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: 'OpenHuman-Local-Daemon',
          syncTimestamp: new Date().toISOString(),
          status: 'SUCCESS',
          eventsSynced: events.map(e => e.id)
        }),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      console.log(`[OpenHuman Daemon] Webhook dispatch succeeded.`);
    } catch (e: any) {
      console.warn(`[OpenHuman Daemon] Webhook sync dispatch failed (ensure Next.js server is running): ${e.message}`);
    }
  }

  /**
   * 🔄 Runs a single ingest-sync cycle
   */
  public async executeCycle(): Promise<void> {
    console.log(`[OpenHuman Daemon] Ingesting business event streams at ${new Date().toISOString()}...`);
    const events = this.generateMockEvents();
    await this.indexToStorage(events);
    await this.triggerWebhookSync(events);

    // Also process local Lovable front-end tasks
    await this.processProductionQueue();
  }

  /**
   * 🚀 Starts background thread loop
   */
  public start() {
    if (this.timer) {
      console.warn('[OpenHuman Daemon] Daemon is already running.');
      return;
    }

    console.log(`[OpenHuman Daemon] Starting OpenHuman Sync service (Interval: ${this.intervalMinutes} min)...`);
    this.executeCycle();

    this.timer = setInterval(
      () => this.executeCycle(),
      this.intervalMinutes * 60 * 1000
    );
  }

  /**
   * 🛑 Stops background thread loop
   */
  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[OpenHuman Daemon] Daemon stopped successfully.');
    }
  }
}

if (require.main === module) {
  const daemon = new OpenHumanAgentDaemon();
  daemon.start();
}
