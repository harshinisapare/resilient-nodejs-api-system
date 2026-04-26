enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

interface CircuitBreakerOptions {
  failureThreshold: number;
  recoveryTimeout: number;
  successThreshold: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: number;
  private name: string;

  constructor(name: string, private options: CircuitBreakerOptions) {
    this.name = name;
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
      if (this.state === CircuitState.OPEN) {
  const timeSinceLastFailure = Date.now() - (this.lastFailureTime || 0);
  console.log(`[${this.name}] Time since failure: ${timeSinceLastFailure}ms / needed: ${this.options.recoveryTimeout}ms`);
  
  if (timeSinceLastFailure >= this.options.recoveryTimeout) {
        console.log(`[${this.name}] Testing recovery → HALF_OPEN`);
        this.state = CircuitState.HALF_OPEN;
      } else {
        throw new Error(`[${this.name}] Circuit is OPEN. Request blocked.`);
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.options.successThreshold) {
        console.log(`[${this.name}] Recovery confirmed → CLOSED`);
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      console.log(`[${this.name}] Recovery failed → OPEN again`);
      this.state = CircuitState.OPEN;
      this.successCount = 0;
      return;
    }

    if (this.failureCount >= this.options.failureThreshold) {
      console.log(`[${this.name}] Threshold reached → OPEN`);
      this.state = CircuitState.OPEN;
    }
  }

  getMetrics() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
        ? new Date(this.lastFailureTime).toISOString()
        : null
    };
  }
}