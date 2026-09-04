import { Router } from 'express';
import {
  createOrderHandler,
  verifyPaymentHandler,
  getConfigHandler,
} from '../controllers/payment.controller.js';

const router = Router();

// POST /api/payments/create-order
router.post('/create-order', createOrderHandler);

// POST /api/payments/verify
router.post('/verify', verifyPaymentHandler);

// GET /api/payments/config
router.get('/config', getConfigHandler);

export default router;
