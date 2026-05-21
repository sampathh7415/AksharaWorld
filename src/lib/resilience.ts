/**
 * 🛡️ AKSHARA WORLD — SOLID-STATE RESILIENCE ENGINE
 * Implementing Enterprise-Grade Self-Healing Network Operations
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  backoffDelay?: number;
  skipCache?: boolean;
}

interface CircuitState {
  failures: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  nextAttemptTime: number;
}

// In-memory registry of circuit breakers and caches
const circuitRegistry: Record<string, CircuitState> = {};
const responseCache: Record<string, { data: any; timestamp: number }> = {};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL
const FAILURE_THRESHOLD = 5;      // Consecutive failures to open circuit
const COOLDOWN_PERIOD = 30000;    // Cooldown in ms before half-open attempt

function getHost(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.host;
  } catch {
    return 'local';
  }
}

function getCircuit(host: string): CircuitState {
  if (!circuitRegistry[host]) {
    circuitRegistry[host] = {
      failures: 0,
      state: 'CLOSED',
      nextAttemptTime: 0
    };
  }
  return circuitRegistry[host];
}

export async function resilientFetch<T>(
  url: string,
  options: FetchOptions = {},
  fallbackData?: T
): Promise<T> {
  const host = getHost(url);
  const circuit = getCircuit(host);
  const method = options.method || 'GET';
  const retries = options.retries ?? 3;
  const timeoutMs = options.timeout ?? 8000;
  const backoffDelay = options.backoffDelay ?? 1000;

  // 1. Check Circuit Breaker Status
  const now = Date.now();
  if (circuit.state === 'OPEN') {
    if (now >= circuit.nextAttemptTime) {
      console.warn(`[Resilience] Circuit breaker for ${host} entering HALF_OPEN state. Attempting recovery...`);
      circuit.state = 'HALF_OPEN';
    } else {
      console.warn(`[Resilience] Circuit breaker for ${host} is OPEN. Bypassing network call to prevent resource lock.`);
      
      // Serve cached response if available
      if (method === 'GET' && responseCache[url]) {
        console.info(`[Resilience] [Self-Healed] Serving cached data for ${url}`);
        return responseCache[url].data as T;
      }
      if (fallbackData !== undefined) {
        return fallbackData;
      }
      throw new Error(`Circuit breaker is OPEN for host: ${host}`);
    }
  }

  // 2. Network Call Execution with Timeout and Retries
  let attempt = 0;
  let lastError: any = null;

  while (attempt < retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchResponse = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(id);

      if (!fetchResponse.ok) {
        throw new Error(`HTTP Error Status: ${fetchResponse.status}`);
      }

      const json = await fetchResponse.json();

      // SUCCESS PATH:
      // Reset circuit breaker upon successful request
      circuit.failures = 0;
      circuit.state = 'CLOSED';

      // Cache successful GET requests
      if (method === 'GET' && !options.skipCache) {
        responseCache[url] = {
          data: json,
          timestamp: Date.now()
        };
      }

      return json as T;

    } catch (err: any) {
      clearTimeout(id);
      attempt++;
      lastError = err;
      console.error(`[Resilience] Attempt ${attempt} failed for ${url}. Error: ${err.message}`);

      if (attempt < retries) {
        const delay = backoffDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // FAILURE PATH (Exhausted all retries):
  // Update Circuit Breaker metrics
  circuit.failures++;
  if (circuit.failures >= FAILURE_THRESHOLD) {
    console.error(`[Resilience] Host ${host} exceeded failure threshold (${FAILURE_THRESHOLD}). Opening circuit breaker!`);
    circuit.state = 'OPEN';
    circuit.nextAttemptTime = Date.now() + COOLDOWN_PERIOD;
  }

  // Self-Healing Recovery: Serve last-known good data or fallback payload
  if (method === 'GET' && responseCache[url]) {
    console.warn(`[Resilience] [Self-Healed] Network call failed. Serving cached data for ${url}`);
    return responseCache[url].data as T;
  }

  if (fallbackData !== undefined) {
    console.warn(`[Resilience] [Self-Healed] Serving provided fallback data for ${url}`);
    return fallbackData;
  }

  throw lastError || new Error(`Failed to complete resilient fetch request to ${url}`);
}
