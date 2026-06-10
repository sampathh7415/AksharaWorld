import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('[Supabase] Missing credentials - database features will be unavailable');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 📦 DATABASE SCHEMA INITIALIZATION
 * Creates all required tables on first connection
 */
export async function initializeDatabase() {
  try {
    console.log('[Database] Initializing schema...');

    // 1. Approvals table
    await Promise.resolve(supabase.rpc('create_approvals_table', {})).catch(() => {
      console.log('[Database] Approvals table may already exist');
    });

    // 2. Transactions cache table
    await Promise.resolve(supabase.rpc('create_transactions_table', {})).catch(() => {
      console.log('[Database] Transactions table may already exist');
    });

    // 3. Metrics history table
    await Promise.resolve(supabase.rpc('create_metrics_table', {})).catch(() => {
      console.log('[Database] Metrics table may already exist');
    });

    // 4. Chat history table
    await Promise.resolve(supabase.rpc('create_chat_table', {})).catch(() => {
      console.log('[Database] Chat table may already exist');
    });

    // 5. System events/audit log table
    await Promise.resolve(supabase.rpc('create_events_table', {})).catch(() => {
      console.log('[Database] Events table may already exist');
    });

    console.log('[Database] ✅ Schema initialized successfully');
  } catch (err: any) {
    console.error('[Database] Initialization failed:', err.message);
  }
}

/**
 * 💾 SAVE APPROVAL DECISION
 */
export async function saveApproval(id: string, action: 'approve' | 'reject', userId: string) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[Database] Skipping save - credentials not configured');
    return { status: 'skipped' };
  }

  try {
    const { data, error } = await supabase.from('approvals').insert([
      {
        id,
        action,
        approved_by: userId,
        approved_at: new Date().toISOString(),
      },
    ]);

    if (error) throw error;
    return { status: 'success', data };
  } catch (err: any) {
    console.error('[Database] Save approval failed:', err.message);
    return { status: 'error', error: err.message };
  }
}

/**
 * 📊 CACHE TRANSACTION
 */
export async function cacheTransaction(txn: any) {
  if (!supabaseUrl || !supabaseKey) return { status: 'skipped' };

  try {
    const { data, error } = await supabase.from('transactions_cache').insert([txn]);
    if (error) throw error;
    return { status: 'success' };
  } catch (err: any) {
    console.error('[Database] Cache transaction failed:', err.message);
    return { status: 'error' };
  }
}

/**
 * 📈 LOG METRICS HISTORY
 */
export async function logMetrics(metrics: any) {
  if (!supabaseUrl || !supabaseKey) return { status: 'skipped' };

  try {
    const { data, error } = await supabase.from('metrics_history').insert([
      {
        revenue_total: metrics.revenue?.total,
        revenue_today: metrics.revenue?.today,
        active_visitors: metrics.traffic?.activeVisitors,
        conversion_rate: metrics.traffic?.conversionRate,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return { status: 'success' };
  } catch (err: any) {
    console.error('[Database] Log metrics failed:', err.message);
    return { status: 'error' };
  }
}

/**
 * 💬 SAVE CHAT MESSAGE
 */
export async function saveChatMessage(role: string, text: string, confidence?: number) {
  if (!supabaseUrl || !supabaseKey) return { status: 'skipped' };

  try {
    const { data, error } = await supabase.from('chat_history').insert([
      {
        role,
        text,
        confidence: confidence || 0,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return { status: 'success' };
  } catch (err: any) {
    console.error('[Database] Save chat failed:', err.message);
    return { status: 'error' };
  }
}

/**
 * 📝 LOG SYSTEM EVENT
 */
export async function logEvent(eventType: string, details: any, severity: 'info' | 'warn' | 'error' = 'info') {
  if (!supabaseUrl || !supabaseKey) return { status: 'skipped' };

  try {
    const { data, error } = await supabase.from('system_events').insert([
      {
        event_type: eventType,
        details: JSON.stringify(details),
        severity,
        timestamp: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return { status: 'success' };
  } catch (err: any) {
    console.error('[Database] Log event failed:', err.message);
    return { status: 'error' };
  }
}
