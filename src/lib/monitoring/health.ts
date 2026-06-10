/**
 * 💚 COMPREHENSIVE SYSTEM HEALTH MONITORING
 * Tracks all component statuses and performance metrics
 */

import { executeWithCircuitBreaker, getCircuitStatus } from '../resilience/circuitBreaker';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  timestamp: string;
  components: Record<string, any>;
  uptime: string;
  metrics: {
    responseTime: number;
    errorRate: number;
    requestsPerMinute: number;
  };
}

let startTime = Date.now();
let requestCount = 0;
let errorCount = 0;
let lastMinuteRequests = 0;

/**
 * Get comprehensive health status
 */
export async function getHealthStatus(): Promise<HealthStatus> {
  const now = Date.now();
  const uptime = formatUptime(now - startTime);

  // Calculate metrics
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  const avgResponseTime = 125; // TODO: Track actual response times
  const rpm = Math.floor((lastMinuteRequests * 60000) / 60000);

  // Determine overall status
  let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
  if (errorRate > 5 || errorCount > 100) status = 'critical';
  else if (errorRate > 1) status = 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    components: getCircuitStatus(),
    uptime,
    metrics: {
      responseTime: avgResponseTime,
      errorRate: parseFloat(errorRate.toFixed(2)),
      requestsPerMinute: rpm,
    },
  };
}

/**
 * Record a request
 */
export function recordRequest(error = false) {
  requestCount++;
  lastMinuteRequests++;
  if (error) errorCount++;

  // Reset minute counter every 60 seconds
  setTimeout(() => {
    lastMinuteRequests = 0;
  }, 60000);
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

export { recordRequest as trackRequest };
