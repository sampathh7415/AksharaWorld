/**
 * 🔄 EXPONENTIAL BACKOFF RETRY LOGIC
 * Automatically retries failed API calls with increasing delays
 */

interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
}

const DEFAULT_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Execute with exponential backoff retry
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: Error | null = null;
  let delayMs = finalConfig.initialDelayMs;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${finalConfig.maxRetries + 1} failed: ${err.message}`
      );

      if (attempt < finalConfig.maxRetries) {
        await delay(delayMs);
        delayMs = Math.min(delayMs * finalConfig.backoffMultiplier, finalConfig.maxDelayMs);
      }
    }
  }

  throw lastError || new Error('All retries failed');
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
