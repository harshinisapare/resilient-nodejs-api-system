import { Router } from 'express';
import { paymentService } from '../services/MockPaymentService';
import { inventoryService } from '../services/MockInventoryService';

const router = Router();

router.post('/payment/failure-rate', (req, res) => {
  const { rate } = req.body;
  paymentService.setFailureRate(rate);
  res.json({ message: `Payment failure rate set to ${rate * 100}%` });
});

router.post('/inventory/failure-rate', (req, res) => {
  const { rate } = req.body;
  inventoryService.setFailureRate(rate);
  res.json({ message: `Inventory failure rate set to ${rate * 100}%` });
});

router.post('/payment/latency', (req, res) => {
  const { ms } = req.body;
  paymentService.setLatency(ms);
  res.json({ message: `Payment latency set to ${ms}ms` });
});

router.post('/reset', (req, res) => {
  paymentService.setFailureRate(0);
  paymentService.setLatency(100);
  inventoryService.setFailureRate(0);
  inventoryService.setLatency(80);
  res.json({ message: 'All services restored to full health' });
});

export default router;