import {
  PurchaseAuthorization,
  RazorpayOrderResponse,
  PaymentVerificationResult,
  PaymentStatusResponse,
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

export class PaymentApiError extends Error {
  public code?: string;
  public status?: number;

  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'PaymentApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Helper to perform fetch with timeout
 */
async function fetchWithTimeout(
  resource: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = 8000, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(resource, {
      ...rest,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (err: unknown) {
    clearTimeout(id);
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new PaymentApiError(
        'Payment gateway request timed out. Status could not be confirmed.',
        'TIMEOUT'
      );
    }
    throw err;
  }
}

/**
 * Creates a Razorpay Test Order via the ShopPilot backend
 */
export async function createRazorpayOrder(
  payload: CreateOrderPayload
): Promise<RazorpayOrderResponse> {
  try {
    const response = await fetchWithTimeout('/api/payments/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new PaymentApiError(
        data.error || 'Failed to create payment order.',
        data.code || 'ORDER_CREATION_FAILED',
        response.status
      );
    }

    return data.order;
  } catch (err: unknown) {
    if (err instanceof PaymentApiError) throw err;
    const isNetwork = err instanceof TypeError || (err instanceof Error && err.message.includes('fetch'));
    throw new PaymentApiError(
      err instanceof Error ? err.message : 'Network error communicating with payment backend',
      isNetwork ? 'NETWORK_ERROR' : 'UNKNOWN'
    );
  }
}

/**
 * Verifies Razorpay payment signature cryptographically on the backend
 */
export async function verifyPaymentSignature(
  payload: VerifyPaymentPayload
): Promise<PaymentVerificationResult> {
  try {
    const response = await fetchWithTimeout('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeoutMs: 8000,
    });

    const data = await response.json();

    if (!response.ok || !data.success || !data.verified) {
      throw new PaymentApiError(
        data.error || 'Payment signature verification failed.',
        data.code || 'VERIFICATION_FAILED',
        response.status
      );
    }

    return data.payment;
  } catch (err: unknown) {
    if (err instanceof PaymentApiError) throw err;
    const isNetwork = err instanceof TypeError || (err instanceof Error && err.message.includes('fetch'));
    throw new PaymentApiError(
      err instanceof Error ? err.message : 'Network error verifying signature',
      isNetwork ? 'NETWORK_ERROR' : 'VERIFICATION_FAILED'
    );
  }
}

/**
 * Queries payment status for timeout handling and status verification
 */
export async function checkPaymentStatus(
  orderId: string
): Promise<PaymentStatusResponse> {
  try {
    const response = await fetchWithTimeout(`/api/payments/status/${encodeURIComponent(orderId)}`, {
      method: 'GET',
      timeoutMs: 5000,
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new PaymentApiError(
        data.error || 'Failed to query payment status.',
        'STATUS_QUERY_FAILED',
        response.status
      );
    }

    return data;
  } catch (err: unknown) {
    if (err instanceof PaymentApiError) throw err;
    return {
      success: false,
      status: 'pending',
      verified: false,
      orderId,
      message: err instanceof Error ? err.message : 'Network error while checking status',
    };
  }
}

/**
 * Fetches Razorpay public test config from backend
 */
export async function getPaymentConfig(): Promise<PaymentConfigResponse> {
  const response = await fetchWithTimeout('/api/payments/config', { timeoutMs: 5000 });
  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new PaymentApiError(data.error || 'Failed to fetch payment config.', 'CONFIG_FAILED');
  }

  return data;
}
