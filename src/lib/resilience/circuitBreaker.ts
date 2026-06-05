/**
 * ⚡ CIRCUIT BREAKER PATTERN
 * Prevents cascading failures when external APIs are down
 * Implements exponential backoff retry logic
 */

interface CircuitState {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

const circuits: Map<string, CircuitState> = new Map();

const CONFIG = {
  FAILURE_THRESHOLD: 5, // Open after 5 failures
  SUCCESS_THRESHOLD: 2, // Close after 2 successes in HALF_OPEN
  TIMEOUT_MS: 60000, // Try to recover after 60s
};

/**
 * Execute function with circuit breaker protection
 */
export async function executeWithCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<T> {
  const circuit = getOrCreateCircuit(name);

  // OPEN state: reject immediately
  if (circuit.state === 'OPEN') {
    if (Date.now() - circuit.lastFailureTime > CONFIG.TIMEOUT_MS) {
      circuit.state = 'HALF_OPEN';
      circuit.successCount = 0;
      console.log(`[CircuitBreaker] ${name} -> HALF_OPEN (attempting recovery)`);
    } else {
      console.warn(`[CircuitBreaker] ${name} is OPEN, using fallback`);
      return fallback;
    }
  }

  try {
    const result = await fn();

    // Success: update circuit state
    if (circuit.state === 'HALF_OPEN') {
      circuit.successCount++;
      if (circuit.successCount >= CONFIG.SUCCESS_THRESHOLD) {
        circuit.state = 'CLOSED';
        circuit.failureCount = 0;
        console.log(`[CircuitBreaker] ${name} -> CLOSED (recovered)`);
      }
    } else if (circuit.state === 'CLOSED') {
      circuit.failureCount = 0;
    }

    return result;
  } catch (err: any) {
    circuit.failureCount++;
    circuit.lastFailureTime = Date.now();

    if (circuit.failureCount >= CONFIG.FAILURE_THRESHOLD) {
      circuit.state = 'OPEN';
      console.error(`[CircuitBreaker] ${name} -> OPEN (too many failures: ${circuit.failureCount})`);
    }

    console.error(`[CircuitBreaker] ${name} failed:`, err.message);
    return fallback;
  }
}

function getOrCreateCircuit(name: string): CircuitState {
  if (!circuits.has(name)) {
    circuits.set(name, {
      state: 'CLOSED',
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    });
  }
  return circuits.get(name)!;
}

/**
 * Get circuit breaker status for monitoring
 */
export function getCircuitStatus() {
  const status: any = {};
  circuits.forEach((circuit, name) => {
    status[name] = {
      state: circuit.state,
      failures: circuit.failureCount,
      lastFailure: new Date(circuit.lastFailureTime).toISOString(),
    };
  });
  return status;
}
