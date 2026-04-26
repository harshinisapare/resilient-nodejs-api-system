import { Router } from 'express';
import { orderService } from '../services/ResilientOrderService';

const router = Router();

router.get('/health', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    metrics: orderService.getAllMetrics()
  });
});

export default router;