import crypto from 'crypto';
import Razorpay from 'razorpay';

export interface CreateOrderParams {
  authorization: {
    status: string;
    amount: number;
    currency: string;
    productId: string;
    offerCode?: string;
    signature?: string;
    txId?: string;
  };
  productId: string;
  quantity?: number;
}

export interface VerifyPaymentParams {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// Strictly bounded product rules for MVP
export const BOUNDED_COMMERCE_RULES = {
  productId: 'aerorun-x',
  name: 'AeroRun X Daily Road',
  basePrice: 2999,
  merchantOffer: 'RT-SUMMER200',
  discountAmount: 200,
  shippingFee: 0,
  taxAmount: 0,
  expectedFinalAmount: 2799,
  currency: 'INR',
  amountInPaise: 279900, // 2799 * 100 paise
};

export class RazorpayService {
  private keyId: string;
  private keySecret: string;
  private razorpayInstance: Razorpay | null = null;
  private isSimulatedMode: boolean = false;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_sandbox_shoppilot';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_sandbox_shoppilot';

    // Check if we have active test credentials vs fallback sandbox simulation
    const isPlaceholder =
      !this.keySecret ||
      this.keySecret.includes('placeholder') ||
      this.keySecret.includes('sandbox') ||
      this.keySecret.includes('your_test_key');

    if (!isPlaceholder && this.keyId.startsWith('rzp_test_')) {
      try {
        this.razorpayInstance = new Razorpay({
          key_id: this.keyId,
          key_secret: this.keySecret,
        });
        this.isSimulatedMode = false;
      } catch (e) {
        console.warn('Razorpay SDK initialization failed, falling back to simulated test mode:', e);
        this.isSimulatedMode = true;
      }
    } else {
      this.isSimulatedMode = true;
    }
  }

  public getKeyId(): string {
    return this.keyId;
  }

  public isSimulated(): boolean {
    return this.isSimulatedMode;
  }

  /**
   * Validates the authorized purchase request against strict bounded limits
   */
  public validatePurchase(params: CreateOrderParams): void {
    const { authorization, productId } = params;

    if (!authorization) {
      throw new Error('Authorization boundary violated: Missing customer purchase authorization.');
    }

    if (authorization.status !== 'authorized') {
      throw new Error(`Invalid authorization state: Expected 'authorized', got '${authorization.status}'.`);
    }

    if (productId !== BOUNDED_COMMERCE_RULES.productId) {
      throw new Error(`Bounded check failed: Unexpected product ID '${productId}'. Expected '${BOUNDED_COMMERCE_RULES.productId}'.`);
    }

    if (authorization.currency !== BOUNDED_COMMERCE_RULES.currency) {
      throw new Error(`Bounded check failed: Currency mismatch '${authorization.currency}'. Expected '${BOUNDED_COMMERCE_RULES.currency}'.`);
    }

    if (authorization.amount !== BOUNDED_COMMERCE_RULES.expectedFinalAmount) {
      throw new Error(
        `Bounded check failed: Price tampering detected. Requested: ₹${authorization.amount}, Expected: ₹${BOUNDED_COMMERCE_RULES.expectedFinalAmount}.`
      );
    }

    if (authorization.offerCode && authorization.offerCode !== BOUNDED_COMMERCE_RULES.merchantOffer) {
      throw new Error(`Bounded check failed: Unauthorized offer code '${authorization.offerCode}'.`);
    }
  }

  /**
   * Creates a Razorpay order for the exact locked amount (₹2,799 = 279900 paise)
   */
  public async createOrder(params: CreateOrderParams) {
    // 1. Enforce bounded validation
    this.validatePurchase(params);

    const receipt = `rcpt_sp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const amountInPaise = BOUNDED_COMMERCE_RULES.amountInPaise;
    const currency = BOUNDED_COMMERCE_RULES.currency;

    // 2. If real Razorpay credentials exist, create order via Razorpay API
    if (!this.isSimulatedMode && this.razorpayInstance) {
      try {
        const order = await this.razorpayInstance.orders.create({
          amount: amountInPaise,
          currency,
          receipt,
          notes: {
            productId: BOUNDED_COMMERCE_RULES.productId,
            productName: BOUNDED_COMMERCE_RULES.name,
            offerCode: BOUNDED_COMMERCE_RULES.merchantOffer,
            shoppilotTxId: params.authorization.txId || '9814-DF7B-AG',
            boundaryCheck: 'RFC-008-COMPLIANT',
          },
        });

        return {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          keyId: this.keyId,
          simulated: false,
        };
      } catch (err: unknown) {
        console.error('Razorpay Orders API error:', err);
        throw new Error('Failed to create order on Razorpay test network.');
      }
    }

    // 3. Simulated Sandbox Order for local test mode
    const mockOrderId = `order_test_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      id: mockOrderId,
      amount: amountInPaise,
      currency,
      receipt,
      keyId: this.keyId,
      simulated: true,
    };
  }

  /**
   * Verifies Razorpay payment signature using HMAC SHA256
   */
  public verifyPayment(params: VerifyPaymentParams): {
    verified: boolean;
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    timestamp: string;
    signatureProof: string;
  } {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = params;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new Error('Missing payment verification payload parameters.');
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payload)
      .digest('hex');

    // In real mode, enforce strict cryptographic match
    const isCryptoMatch = razorpay_signature === expectedSignature;

    // In sandbox simulation, allow simulated test tokens
    const isSimulatedMatch =
      this.isSimulatedMode &&
      (isCryptoMatch ||
        razorpay_signature.startsWith('sig_test_') ||
        razorpay_signature.startsWith('simulated_') ||
        razorpay_signature === 'sandbox_verified_signature');

    const isValid = isCryptoMatch || isSimulatedMatch;

    if (!isValid) {
      throw new Error('Cryptographic signature verification failed: Hash mismatch.');
    }

    return {
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: BOUNDED_COMMERCE_RULES.expectedFinalAmount,
      currency: BOUNDED_COMMERCE_RULES.currency,
      timestamp: new Date().toISOString(),
      signatureProof: `ECDSA_HMAC_SHA256:${expectedSignature.substring(0, 16)}...`,
    };
  }
}

export const razorpayService = new RazorpayService();
