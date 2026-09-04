import {
  PurchaseAuthorization,
  RazorpayOrderResponse,
  PaymentVerificationResult,
} from '../types';

export interface CreateOrderPayload {
  authorization: PurchaseAuthorization;
  productId: string;
  quantity?: number;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentConfigResponse {
  success: boolean;
  keyId: string;
  simulated: boolean;
  network: string;
}

/**
 * Creates a Razorpay Test Order via the ShopPilot backend
 */
export async function createRazorpayOrder(
  payload: CreateOrderPayload
): Promise<RazorpayOrderResponse> {
  const response = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to create payment order.');
  }

  return data.order;
}

/**
 * Verifies Razorpay payment signature cryptographically on the backend
 */
export async function verifyPaymentSignature(
  payload: VerifyPaymentPayload
): Promise<PaymentVerificationResult> {
  const response = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success || !data.verified) {
    throw new Error(data.error || 'Payment signature verification failed.');
  }

  return data.payment;
}

/**
 * Fetches Razorpay public test config from backend
 */
export async function getPaymentConfig(): Promise<PaymentConfigResponse> {
  const response = await fetch('/api/payments/config');
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to fetch payment config.');
  }

  return data;
}
