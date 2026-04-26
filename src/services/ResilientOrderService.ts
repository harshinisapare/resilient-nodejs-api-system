import { CircuitBreaker } from '../patterns/CircuitBreaker';
import { RetryManager } from '../patterns/RetryManager';
import { Bulkhead } from '../patterns/Bulkhead';
import { paymentService } from './MockPaymentService';
import { inventoryService } from './MockInventoryService';

export class ResilientOrderService {
  private paymentCB = new CircuitBreaker('PaymentCB', {
    failureThreshold: 3,
    recoveryTimeout: 30000,
    successThreshold: 2
  });

  private inventoryCB = new CircuitBreaker('InventoryCB', {
    failureThreshold: 5,
    recoveryTimeout: 10000,
    successThreshold: 3
  });

  private retryManager = new RetryManager({
    maxAttempts: 3,
    baseDelay: 500,
    maxDelay: 5000,
    multiplier: 2,
    useJitter: true
  });

  private paymentBulkhead = new Bulkhead('PaymentBulkhead', 3);
  private inventoryBulkhead = new Bulkhead('InventoryBulkhead', 8);

  async placeOrder(userId: string, productId: string, amount: number) {
    const stock = await this.inventoryBulkhead.execute(() =>
      this.retryManager.execute(
        () => this.inventoryCB.execute(
          () => inventoryService.checkStock(productId)
        ),
        'inventory-check'
      )
    );

    if (!stock.available) {
      throw new Error('404: Product out of stock');
    }

    const payment = await this.paymentBulkhead.execute(() =>
      this.retryManager.execute(
        () => this.paymentCB.execute(
          () => paymentService.processPayment(amount, userId)
        ),
        'payment-processing'
      )
    );

    return {
      orderId: `ORD-${Date.now()}`,
      userId,
      productId,
      amount,
      paymentId: payment.transactionId,
      status: 'confirmed'
    };
  }

  getAllMetrics() {
    return {
      circuitBreakers: [
        this.paymentCB.getMetrics(),
        this.inventoryCB.getMetrics()
      ],
      bulkheads: [
        this.paymentBulkhead.getMetrics(),
        this.inventoryBulkhead.getMetrics()
      ]
    };
  }
}

export const orderService = new ResilientOrderService();