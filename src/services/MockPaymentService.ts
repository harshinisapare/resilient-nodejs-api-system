export class MockPaymentService {
  private failureRate = 0;
  private latencyMs = 100;

  setFailureRate(rate: number) { this.failureRate = rate; }
  setLatency(ms: number) { this.latencyMs = ms; }

  async processPayment(amount: number, userId: string) {
    await this.sleep(this.latencyMs + Math.random() * 50);

    if (Math.random() < this.failureRate) {
      throw new Error('503: Payment service unavailable');
    }

    return {
      transactionId: `TXN-${Date.now()}`,
      amount,
      userId,
      status: 'success'
    };
  }

  private sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }
}

export const paymentService = new MockPaymentService();