/**
 * 🗃️ GOOGLE SHEETS ZERO-COST DATABASE ADAPTER
 * Mapped to G:\My Drive\Akshara World\05_Revenue_Vault\01_Sheets_Database\
 */
import { resilientFetch } from '../resilience';

export interface Transaction {
  id: string;
  paymentId: string;
  amount: number;
  status: 'captured' | 'failed' | 'refunded';
  notes: string;
  createdAt: string;
}

export interface SystemLog {
  timestamp: string;
  department: string;
  message: string;
  status: 'info' | 'warn' | 'error';
}

export interface QueueJob {
  id: string;
  department: string;
  action: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
}

// Simulated zero-cost Google Sheets DB state for local testing & fallbacks
let localTransactions: Transaction[] = [
  { id: 'TXN-901', paymentId: 'pay_Rzp123456789', amount: 1500.00, status: 'captured', notes: 'Premium SEO Blueprint E-Book', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 'TXN-902', paymentId: 'pay_Rzp987654321', amount: 3500.00, status: 'captured', notes: 'Niche Automation Scaffolding Bundle', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 'TXN-903', paymentId: 'pay_Rzp555444333', amount: 120.00, status: 'failed', notes: 'AdSense Test Payment Checkout', createdAt: new Date(Date.now() - 14400000).toISOString() }
];

let localLogs: SystemLog[] = [
  { timestamp: new Date(Date.now() - 600000).toISOString(), department: 'Innovation_Scout', message: 'Daily scout complete. Discovered 3 zero-cost niches.', status: 'info' },
  { timestamp: new Date(Date.now() - 1200000).toISOString(), department: 'Content_Forge', message: 'SEO Optimization completed on 5 main articles.', status: 'info' },
  { timestamp: new Date(Date.now() - 1800000).toISOString(), department: 'Guardian_Ops', message: 'Hourly sync backup: Repository successfully synced to Google Drive.', status: 'info' }
];

let localQueue: QueueJob[] = [
  { id: 'APR-003', department: 'Tech_Core', action: 'Deploy Dashboard updates to Cloudflare Pages', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'APR-004', department: 'Revenue_Vault', action: 'Link Razorpay Live APIs to Sheets Db Ledger', status: 'pending', createdAt: new Date().toISOString() },
  { id: 'APR-005', department: 'Growth_Engine', action: 'Activate Telegram approval notifier webhook', status: 'pending', createdAt: new Date().toISOString() }
];

export class SheetsDb {
  private static webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL || process.env.APPS_SCRIPT_WEBHOOK_URL || '';

  public static async getTransactions(): Promise<Transaction[]> {
    if (!this.webhookUrl) {
      return localTransactions;
    }

    try {
      const data = await resilientFetch<any>(
        `${this.webhookUrl}?action=getTransactions`,
        { method: 'GET', timeout: 5000 },
        { success: true, items: localTransactions }
      );
      return data.items || localTransactions;
    } catch {
      console.warn('[SheetsDb] Webhook fetch failed. Serving local transactional ledger.');
      return localTransactions;
    }
  }

  public static async addTransaction(txn: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
      ...txn
    };

    localTransactions.unshift(newTxn);

    if (!this.webhookUrl) {
      return newTxn;
    }

    try {
      await resilientFetch<any>(
        this.webhookUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addTransaction', data: newTxn })
        },
        { success: true }
      );
    } catch (e: any) {
      console.error(`[SheetsDb] Failed to post transaction to Google Sheets: ${e.message}`);
    }

    return newTxn;
  }

  public static async getSystemLogs(): Promise<SystemLog[]> {
    if (!this.webhookUrl) {
      return localLogs;
    }

    try {
      const data = await resilientFetch<any>(
        `${this.webhookUrl}?action=getLogs`,
        { method: 'GET', timeout: 5000 },
        { success: true, items: localLogs }
      );
      return data.items || localLogs;
    } catch {
      return localLogs;
    }
  }

  public static async addSystemLog(log: Omit<SystemLog, 'timestamp'>): Promise<SystemLog> {
    const newLog: SystemLog = {
      timestamp: new Date().toISOString(),
      ...log
    };

    localLogs.unshift(newLog);

    if (!this.webhookUrl) {
      return newLog;
    }

    try {
      await resilientFetch<any>(
        this.webhookUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'addLog', data: newLog })
        },
        { success: true }
      );
    } catch {}

    return newLog;
  }

  public static async getQueue(): Promise<QueueJob[]> {
    if (!this.webhookUrl) {
      return localQueue;
    }

    try {
      const data = await resilientFetch<any>(
        `${this.webhookUrl}?action=getQueue`,
        { method: 'GET', timeout: 5000 },
        { success: true, items: localQueue }
      );
      return data.items || localQueue;
    } catch {
      return localQueue;
    }
  }

  public static async updateQueueStatus(id: string, status: 'approved' | 'rejected' | 'completed'): Promise<boolean> {
    localQueue = localQueue.map(job => job.id === id ? { ...job, status } : job);

    if (!this.webhookUrl) {
      return true;
    }

    try {
      await resilientFetch<any>(
        this.webhookUrl,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'updateQueue', id, status })
        },
        { success: true }
      );
      return true;
    } catch {
      return false;
    }
  }
}
