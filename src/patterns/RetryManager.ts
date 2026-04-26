interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  multiplier: number;
  useJitter: boolean;
}

export class RetryManager {
  constructor(private options: RetryOptions) {}

  async execute<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: Error = new Error('Unknown error');

    for (let attempt = 1; attempt <= this.options.maxAttempts; attempt++) {
      try {
        const result = await operation();
        if (attempt > 1) {
          console.log(`[Retry] ${operationName} succeeded on attempt ${attempt}`);
        }
        return result;
      } catch (error: any) {
        lastError = error;

        if (!this.isRetryable(error)) {
          console.log(`[Retry] ${operationName} - non-retryable error, stopping`);
          throw error;
        }

        if (attempt === this.options.maxAttempts) break;

        const delay = this.getDelay(attempt);
        console.log(`[Retry] ${operationName} attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private isRetryable(error: any): boolean {
  const msg = error.message || '';
  
  // Never retry circuit breaker blocks
  if (msg.includes('Circuit is OPEN')) return false;
  
  if (msg.includes('400') || msg.includes('404') || msg.includes('401')) {
    return false;
  }
  return (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('timeout') ||
    msg.includes('ECONNRESET') ||
    msg.includes('unavailable')
  );
}

  private getDelay(attempt: number): number {
    let delay = this.options.baseDelay * Math.pow(this.options.multiplier, attempt - 1);
    delay = Math.min(delay, this.options.maxDelay);
    if (this.options.useJitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    return Math.floor(delay);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}