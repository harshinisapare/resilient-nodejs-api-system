export class Bulkhead {
  private active = 0;
  private rejected = 0;

  constructor(private name: string, private maxConcurrent: number) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      this.rejected++;
      throw new Error(
        `[${this.name}] Bulkhead full (${this.active}/${this.maxConcurrent}). Request rejected.`
      );
    }

    this.active++;
    console.log(`[${this.name}] Bulkhead: ${this.active}/${this.maxConcurrent} slots used`);

    try {
      return await operation();
    } finally {
      this.active--;
    }
  }

  getMetrics() {
    return {
      name: this.name,
      active: this.active,
      maxConcurrent: this.maxConcurrent,
      utilization: `${this.active}/${this.maxConcurrent}`,
      totalRejected: this.rejected
    };
  }
}