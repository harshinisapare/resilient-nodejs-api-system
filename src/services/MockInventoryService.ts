export class MockInventoryService {
  private failureRate = 0;
  private latencyMs = 80;

  setFailureRate(rate: number) { this.failureRate = rate; }
  setLatency(ms: number) { this.latencyMs = ms; }

  async checkStock(productId: string) {
    await this.sleep(this.latencyMs + Math.random() * 30);

    if (Math.random() < this.failureRate) {
      throw new Error('503: Inventory service unavailable');
    }

    return {
      productId,
      available: true,
      quantity: Math.floor(Math.random() * 100) + 1
    };
  }

  private sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }
}

export const inventoryService = new MockInventoryService();