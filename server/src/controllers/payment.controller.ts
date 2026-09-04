import { Request, Response } from 'express';
import { razorpayService } from '../services/razorpay.service.js';

export const createOrderHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { authorization, productId, quantity } = req.body;

    if (!authorization) {
      res.status(400).json({
        success: false,
        code: 'MISSING_AUTHORIZATION',
        error: 'Missing customer purchase authorization. Complete /confirm first.',
      });
      return;
    }

    const order = await razorpayService.createOrder({
      authorization,
      productId: productId || authorization.productId,
      quantity: quantity || 1,
    });

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create Razorpay order';
    console.warn('[PaymentController] Create Order Error:', message);

    const isAlreadyPaid = message.includes('already verified');
    res.status(isAlreadyPaid ? 409 : 400).json({
      success: false,
      code: isAlreadyPaid ? 'ALREADY_PAID' : 'ORDER_CREATION_FAILED',
      error: message,
    });
  }
};

export const verifyPaymentHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      res.status(400).json({
        success: false,
        verified: false,
        code: 'INCOMPLETE_PAYLOAD',
        error: 'Incomplete payment verification payload.',
      });
      return;
    }

    const verificationResult = razorpayService.verifyPayment({
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    });

    res.status(200).json({
      success: true,
      verified: true,
      payment: verificationResult,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Payment signature verification failed';
    console.warn('[PaymentController] Payment Verification Error:', message);
    res.status(400).json({
      success: false,
      verified: false,
      code: 'VERIFICATION_FAILED',
      error: message,
    });
  }
};

export const getOrderStatusHandler = (req: Request, res: Response): void => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      res.status(400).json({
        success: false,
        error: 'Order ID is required',
      });
      return;
    }

    const result = razorpayService.getOrderStatus(orderId);
    res.status(200).json({
      success: true,
      orderId,
      status: result.status,
      verified: result.verified,
      payment: result.payment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve order status';
    res.status(500).json({
      success: false,
      error: message,
    });
  }
};

export const getConfigHandler = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    keyId: razorpayService.getKeyId(),
    simulated: razorpayService.isSimulated(),
    network: 'Razorpay Test Network',
  });
};
