import { Router } from 'express';
import { orderService } from '../services/ResilientOrderService';

const router = Router();

router.post('/order', async (req, res) => {
  try {
    const { userId, productId, amount } = req.body;
    if (!userId || !productId || !amount) {
      res.status(400).json({ success: false, error: 'userId, productId and amount are required' });
      return;
    }
    const result = await orderService.placeOrder(userId, productId, amount);
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(503).json({ success: false, error: error.message });
  }
});

export default router;