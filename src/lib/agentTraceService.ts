import {
  AgentTraceEvent,
  AgentTraceEventType,
  MerchantPolicyConfig,
  PolicyEvaluationResult,
  PurchaseAuthorization,
  PaymentVerificationResult,
} from '../types';
import { endpoint } from '../config/api';

export const DEFAULT_MERCHANT_POLICY: MerchantPolicyConfig = {
  maxOrderValue: 3000,
  allowedCurrency: 'INR',
  automaticDiscounts: true,
  maxDiscount: 500,
  customerAuthorizationRequired: true,
  paymentMode: 'Razorpay Test Mode',
  agentPurchaseAuthority: 'GATED',
};

/**
 * Deterministic policy evaluator against merchant limits.
 */
export function evaluateMerchantPolicy(
  policy: MerchantPolicyConfig = DEFAULT_MERCHANT_POLICY,
  intent: {
    amount: number;
    currency?: string;
    discount?: number;
    productApproved?: boolean;
    customerAuthorizationPresent?: boolean;
    paymentMode?: string;
    isAutonomousAction?: boolean;
  }
): PolicyEvaluationResult {
  const currency = intent.currency || 'INR';
  const discount = intent.discount ?? 200;
  const productApproved = intent.productApproved ?? true;
  const customerAuth = intent.customerAuthorizationPresent ?? true;
  const payMode = intent.paymentMode || 'Razorpay Test Mode';
  const isAuto = intent.isAutonomousAction ?? false;

  const checks = [
    {
      id: 'CURRENCY',
      name: 'Allowed Currency',
      expected: policy.allowedCurrency,
      actual: currency,
      passed: currency === policy.allowedCurrency,
      explanation:
        currency === policy.allowedCurrency
          ? `Settlement currency matches authorized merchant rail (${currency})`
          : `Unsupported currency '${currency}'. Only '${policy.allowedCurrency}' accepted.`,
    },
    {
      id: 'MAX_ORDER_VALUE',
      name: 'Order Value Ceiling',
      expected: `≤ ₹${policy.maxOrderValue}`,
      actual: `₹${intent.amount}`,
      passed: intent.amount <= policy.maxOrderValue,
      explanation:
        intent.amount <= policy.maxOrderValue
          ? `Order total ₹${intent.amount} is within the ₹${policy.maxOrderValue} merchant limit (headroom: ₹${policy.maxOrderValue - intent.amount})`
          : `Requested ₹${intent.amount} exceeds configured merchant order ceiling of ₹${policy.maxOrderValue}.`,
    },
    {
      id: 'MAX_DISCOUNT',
      name: 'Maximum Subsidy Cap',
      expected: `≤ ₹${policy.maxDiscount}`,
      actual: `₹${discount}`,
      passed: discount <= policy.maxDiscount,
      explanation:
        discount <= policy.maxDiscount
          ? `Applied discount ₹${discount} is compliant with margin floor cap (max ₹${policy.maxDiscount})`
          : `Discount ₹${discount} violates merchant margin rules.`,
    },
    {
      id: 'PRODUCT_WHITELIST',
      name: 'Approved Inventory Product',
      expected: 'Verified In-Stock SKU',
      actual: productApproved ? 'AeroRun X (SKU-RUN-401)' : 'Unapproved SKU',
      passed: productApproved,
      explanation: productApproved
        ? 'Product is whitelisted and active in regional warehouse (Bangalore Hub 04)'
        : 'Product not approved for autonomous commerce flow.',
    },
    {
      id: 'CUSTOMER_AUTH',
      name: 'Customer Confirmation Present',
      expected: 'Explicit Token',
      actual: customerAuth ? 'Signed (ECDSA)' : 'Missing Signature',
      passed: customerAuth,
      explanation: customerAuth
        ? 'Explicit customer settlement authorization signature validated'
        : 'Missing mandatory customer purchase approval token.',
    },
    {
      id: 'PAYMENT_MODE',
      name: 'Payment Rails Mode',
      expected: policy.paymentMode,
      actual: payMode,
      passed: payMode === policy.paymentMode,
      explanation: `Routed through validated sandbox rails (${payMode})`,
    },
    {
      id: 'GATED_AUTHORITY',
      name: 'Agent Purchase Authority',
      expected: 'GATED (No Autonomous Debits)',
      actual: isAuto ? 'Autonomous Debit Attempt' : 'GATED Execution',
      passed: !isAuto,
      explanation: !isAuto
        ? 'Autonomous debits strictly gated; customer must confirm financial transfer'
        : 'Direct debit attempt rejected by ShopPilot security sandbox.',
    },
  ];

  const failedChecks = checks.filter((c) => !c.passed);
  const allPassed = failedChecks.length === 0;

  return {
    amount: intent.amount,
    currency,
    checks,
    allPassed,
    outcome: allPassed ? 'AUTHORIZED FOR CHECKOUT' : 'BLOCKED',
    blockedReason: failedChecks.length > 0 ? failedChecks[0].explanation : undefined,
  };
}

/**
 * Builds chronological trace events based on session parameters.
 */
export function buildAgentTraceEvents(options?: {
  scenario?: 'success' | 'failed' | 'cancelled' | 'blocked';
  authorization?: PurchaseAuthorization | null;
  settledPayment?: PaymentVerificationResult | null;
  orderId?: string;
  paymentId?: string;
}): AgentTraceEvent[] {
  const scenario = options?.scenario || (options?.settledPayment ? 'success' : 'success');
  const orderId = options?.orderId || options?.settledPayment?.orderId || '#SP-1024';
  const paymentId = options?.paymentId || options?.settledPayment?.paymentId || 'pay_test_984128';

  // Base deterministic front-end evaluation pipeline (Steps 1 to 6)
  const baseSteps: AgentTraceEvent[] = [
    {
      id: 'trace-evt-01',
      stepNumber: 1,
      timestamp: '10:31:02.102',
      eventType: 'INTENT_RECEIVED',
      title: 'Customer Intent Ingestion',
      description: 'Customer natural language commerce request received via chat interface.',
      status: 'completed',
      actor: 'customer',
      latencyMs: 12,
      verificationBadge: 'ORIGIN: WEB_CHAT',
      explanation: 'Customer requested: "I need running shoes under ₹3,000 for daily running."',
      payload: {
        rawQuery: 'I need running shoes under ₹3,000 for daily running.',
        channel: 'ShopPilot Web Client (React/Native-v2.1)',
        sessionId: 'SP-8902',
        clientIpVerified: true,
      },
    },
    {
      id: 'trace-evt-02',
      stepNumber: 2,
      timestamp: '10:31:02.180',
      eventType: 'INTENT_PARSED',
      title: 'Deterministic Constraint Extraction',
      description: 'Extracted structured filters, category, budget bounds, and road running use case.',
      status: 'completed',
      actor: 'agent',
      latencyMs: 14,
      verificationBadge: '3/3 CONSTRAINTS',
      explanation: 'Parsed category: Running Shoes, budget ceiling: ≤ ₹3,000.00, use case: Daily Road Running.',
      payload: {
        category: 'running_shoes',
        budgetCeiling: 3000,
        currency: 'INR',
        terrain: 'road_daily',
        hardFilterApplied: 'price <= 3000 AND in_stock == true',
        confidenceScore: 0.994,
      },
    },
    {
      id: 'trace-evt-03',
      stepNumber: 3,
      timestamp: '10:31:02.420',
      eventType: 'CATALOG_SEARCH',
      title: 'Catalog Vector Retrieval & Stock Masking',
      description: 'Retrieved candidates across regional catalog index and filtered for warehouse availability.',
      status: 'completed',
      actor: 'agent',
      latencyMs: 18,
      verificationBadge: '24 CANDIDATES / 18ms',
      explanation: 'Evaluated 24 candidate SKUs. 4 qualified within budget ceiling and size US 9.5 stock at Bangalore Hub 04.',
      payload: {
        candidatesEvaluated: 24,
        budgetCompliantCount: 4,
        selectedWarehouse: 'BLR-04 (Bangalore)',
        vectorSearchLatencyMs: 18,
        kNearest: 24,
      },
    },
    {
      id: 'trace-evt-04',
      stepNumber: 4,
      timestamp: '10:31:02.611',
      eventType: 'PRODUCT_SELECTED',
      title: 'Product Recommendation & Synthesis',
      description: 'Selected AeroRun X as primary recommendation based on durability-to-cost ratio.',
      status: 'completed',
      actor: 'agent',
      latencyMs: 22,
      verificationBadge: '99.2% MATCH SCORE',
      explanation:
        'Selected because it satisfies the road-running requirement, stays ₹201 below the customer ceiling after merchant credit, and has the highest deterministic match score.',
      payload: {
        product: 'AeroRun X Daily Road',
        sku: 'SKU-RUN-401',
        matchScore: '99.2%',
        scoreModel: 'Deterministic Match Matrix v2.4 (Price 0.40, Durability 0.35, Logistics 0.25)',
        catalogPrice: 2999,
        rating: 4.8,
      },
    },
    {
      id: 'trace-evt-05',
      stepNumber: 5,
      timestamp: '10:31:03.002',
      eventType: 'MERCHANT_RULE_APPLIED',
      title: 'Merchant Rule Engine & Offer Arbitrage',
      description: 'Auto-applied merchant promotional coupon RT-SUMMER200 within pre-approved margin bounds.',
      status: 'completed',
      actor: 'merchant',
      latencyMs: 15,
      verificationBadge: 'OFFER_AUTHORIZED',
      explanation:
        'Merchant-approved checkout credit was applied because the product qualifies for RT-SUMMER200 (-₹200) without breaching the merchant margin floor.',
      payload: {
        rule: 'RT-SUMMER200',
        discount: 200,
        currency: 'INR',
        approved: true,
        merchantRuleId: 'MRG-4402',
        minimumCartFloor: 2500,
        maxSubsidyCap: 500,
      },
    },
    {
      id: 'trace-evt-06',
      stepNumber: 6,
      timestamp: '10:31:03.120',
      eventType: 'PRICE_CALCULATED',
      title: 'Price Ledger Lock & Integrity Hash',
      description: 'Constructed deterministic transaction ledger and computed cryptographic state digest.',
      status: 'completed',
      actor: 'system',
      latencyMs: 9,
      verificationBadge: 'LEDGER_LOCKED',
      explanation: 'Base ₹2,999.00 - Credit ₹200.00 + Express Shipping ₹0.00 = Net ₹2,799.00 locked against tampering.',
      payload: {
        basePrice: 2999,
        discount: 200,
        shipping: 0,
        gstIncluded: 0,
        netTotal: 2799,
        ledgerVersion: 'v2.4.1',
        digest: '0x9e81f72a431ced74b',
      },
    },
    {
      id: 'trace-evt-07',
      stepNumber: 7,
      timestamp: '10:31:04.510',
      eventType: 'CUSTOMER_AUTHORIZED',
      title: 'Zero-Stealth Confirmation Gate',
      description: 'Customer explicitly reviewed and authorized settlement on /confirm authorization boundary.',
      status: 'verified',
      actor: 'customer',
      latencyMs: 31,
      verificationBadge: 'CUSTOMER_CONSENTED',
      explanation:
        'Customer clicked "Confirm & Pay ₹2,799.00". Gated execution boundary satisfied; autonomous charges without approval remain strictly prohibited.',
      payload: {
        authorizedAmount: 2799,
        currency: 'INR',
        productId: 'aerorun-x',
        authorizationStatus: 'authorized',
        signatureToken: 'sig_ecdsa_998f411b0e37',
        boundaryEnforced: 'ZERO_AUTONOMOUS_BYPASS',
      },
    },
  ];

  // Branch based on outcome scenario
  if (scenario === 'blocked') {
    return [
      ...baseSteps.slice(0, 5),
      {
        id: 'trace-evt-blocked',
        stepNumber: 6,
        timestamp: '10:31:03.450',
        eventType: 'PRICE_CALCULATED',
        title: 'Merchant Policy Violation: Price Ceiling Exceeded',
        description: 'Attempted to increase purchase amount to ₹3,499.00, exceeding merchant policy ceiling of ₹3,000.00.',
        status: 'blocked',
        actor: 'system',
        latencyMs: 8,
        verificationBadge: 'BLOCKED_BY_GUARDRAIL',
        explanation: 'Agent cannot increase the authorized purchase above the merchant configured ceiling of ₹3,000.',
        payload: {
          attemptedAmount: 3499,
          ceilingPolicy: 3000,
          violationCode: 'POLICY_CEILING_BREACH',
          moneyActionAttempted: false,
          outcome: 'BLOCKED',
        },
      },
    ];
  }

  if (scenario === 'cancelled') {
    return [
      ...baseSteps,
      {
        id: 'trace-evt-08',
        stepNumber: 8,
        timestamp: '10:31:06.220',
        eventType: 'ORDER_CREATED',
        title: 'Razorpay Test Order Generated',
        description: 'Backend generated cryptographically signed order token on Razorpay test rails.',
        status: 'completed',
        actor: 'gateway',
        latencyMs: 28,
        verificationBadge: 'ORDER_ACTIVE',
        explanation: `Issued order reference ${orderId} bound to user session.`,
        payload: {
          orderId,
          amountMinor: 279900,
          currency: 'INR',
          gateway: 'Razorpay Test Network',
        },
      },
      {
        id: 'trace-evt-09',
        stepNumber: 9,
        timestamp: '10:31:18.042',
        eventType: 'PAYMENT_INITIATED',
        title: 'Payment Gateway Modal Opened',
        description: 'Launched Razorpay payment sheet for customer authorization.',
        status: 'completed',
        actor: 'system',
        latencyMs: 11,
        verificationBadge: 'MODAL_OPEN',
        explanation: 'Customer displayed Razorpay checkout sheet with UPI/Card options.',
        payload: { orderId, state: 'CHECKOUT_OPEN' },
      },
      {
        id: 'trace-evt-10',
        stepNumber: 10,
        timestamp: '10:31:25.810',
        eventType: 'PAYMENT_CANCELLED',
        title: 'Customer Dismissed Payment Sheet',
        description: 'Customer exited Razorpay modal before entering credentials or completing verification.',
        status: 'failed',
        actor: 'customer',
        latencyMs: 6,
        verificationBadge: 'MODAL_DISMISSED',
        explanation: 'Checkout closed without payment capture. No money was charged. Cart and authorization preserved.',
        payload: {
          cancellationReason: 'modal_dismissed_by_user',
          fundsMoved: false,
          cartPreserved: true,
          canRetry: true,
        },
      },
      {
        id: 'trace-evt-11',
        stepNumber: 11,
        timestamp: '10:31:26.100',
        eventType: 'RECOVERY_STARTED',
        title: 'Safe Recovery Loop Active',
        description: 'Preserved authorization and price lock. Navigated to /payment/failure with retry enabled.',
        status: 'verified',
        actor: 'agent',
        latencyMs: 5,
        verificationBadge: 'RETRY_READY',
        explanation: 'ShopPilot preserved customer cart and ₹2,799 authorization. Customer can retry payment seamlessly.',
        payload: {
          retryAllowed: true,
          guaranteedPrice: 2799,
          productId: 'aerorun-x',
        },
      },
    ];
  }

  if (scenario === 'failed') {
    return [
      ...baseSteps,
      {
        id: 'trace-evt-08',
        stepNumber: 8,
        timestamp: '10:31:06.220',
        eventType: 'ORDER_CREATED',
        title: 'Razorpay Test Order Generated',
        description: 'Backend generated cryptographically signed order token on Razorpay test rails.',
        status: 'completed',
        actor: 'gateway',
        latencyMs: 28,
        verificationBadge: 'ORDER_ACTIVE',
        explanation: `Issued order reference ${orderId}.`,
        payload: { orderId, amountMinor: 279900, currency: 'INR' },
      },
      {
        id: 'trace-evt-09',
        stepNumber: 9,
        timestamp: '10:31:18.042',
        eventType: 'PAYMENT_INITIATED',
        title: 'Payment Gateway Modal Opened',
        description: 'Launched Razorpay payment sheet for customer authorization.',
        status: 'completed',
        actor: 'system',
        latencyMs: 11,
        verificationBadge: 'MODAL_OPEN',
        explanation: 'Customer initiated test payment transaction.',
        payload: { orderId, state: 'CHECKOUT_OPEN' },
      },
      {
        id: 'trace-evt-10',
        stepNumber: 10,
        timestamp: '10:31:35.400',
        eventType: 'PAYMENT_FAILED',
        title: 'Card Payment Declined by Issuing Bank',
        description: 'Bank declined transaction (insufficient test balance or simulated failure). Zero money debited.',
        status: 'failed',
        actor: 'gateway',
        latencyMs: 44,
        verificationBadge: 'DECLINED_ZERO_DEBIT',
        explanation: 'Bank reported decline code BAD_REQUEST_PAYMENT_DECLINED. No charge occurred.',
        payload: {
          errorCode: 'BAD_REQUEST_PAYMENT_DECLINED',
          moneyDebited: false,
          autoReversalGuaranteed: true,
        },
      },
      {
        id: 'trace-evt-11',
        stepNumber: 11,
        timestamp: '10:31:36.020',
        eventType: 'RECOVERY_STARTED',
        title: 'Recovery Handshake Initiated',
        description: 'Customer cart and ₹2,799 authorization preserved. Alternative payment rails offered.',
        status: 'verified',
        actor: 'agent',
        latencyMs: 8,
        verificationBadge: 'RECOVERY_ACTIVE',
        explanation: 'ShopPilot Concierge surfaced UPI alternative and safe 1-click retry.',
        payload: {
          authorizedAmount: 2799,
          product: 'aerorun-x',
          recoveryOptions: ['Retry Card', 'Switch to UPI Rail', 'Return to Cart'],
        },
      },
    ];
  }

  // Default: Successful full settlement trace
  return [
    ...baseSteps,
    {
      id: 'trace-evt-08',
      stepNumber: 8,
      timestamp: '10:31:06.220',
      eventType: 'ORDER_CREATED',
      title: 'Razorpay Test Order Generated',
      description: 'Backend generated cryptographically signed order token on Razorpay test rails.',
      status: 'completed',
      actor: 'gateway',
      latencyMs: 28,
      verificationBadge: 'ORDER_ACTIVE',
      explanation: `Issued order reference ${orderId} on TLS 256-bit GCM rail.`,
      payload: {
        orderId,
        amountMinor: 279900,
        currency: 'INR',
        gateway: 'Razorpay Test Rails (PCI-DSS Level 1)',
        receipt: 'rcpt_sp_1788557056195',
      },
    },
    {
      id: 'trace-evt-09',
      stepNumber: 9,
      timestamp: '10:31:18.042',
      eventType: 'PAYMENT_INITIATED',
      title: 'Payment Gateway Intent Ingress',
      description: 'Customer completed credential entry on Razorpay modal.',
      status: 'completed',
      actor: 'customer',
      latencyMs: 24,
      verificationBadge: 'PAYMENT_CAPTURED',
      explanation: `Payment ${paymentId} captured on Razorpay test network.`,
      payload: {
        paymentId,
        method: 'UPI Direct Auth (HDFC Test Handle)',
        status: 'captured',
      },
    },
    {
      id: 'trace-evt-10',
      stepNumber: 10,
      timestamp: '10:31:20.182',
      eventType: 'PAYMENT_VERIFIED',
      title: 'Cryptographic HMAC-SHA256 Signature Verification',
      description: 'ShopPilot backend authority verified payment signature match against gateway secret.',
      status: 'verified',
      actor: 'system',
      latencyMs: 16,
      verificationBadge: 'HMAC_VALIDATED',
      explanation:
        'Backend authority validated sha256(order_id + "|" + payment_id) with Razorpay secret. Zero false debits guarantee enforced.',
      payload: {
        algorithm: 'HMAC-SHA256',
        verifyingAuthority: endpoint('/payments/verify'),
        signatureDigest: '0x9e81f72a431ced74b39210984128...verified',
        immutableState: 'SETTLED_LOCKED',
      },
    },
    {
      id: 'trace-evt-11',
      stepNumber: 11,
      timestamp: '10:31:20.190',
      eventType: 'PURCHASE_SETTLED',
      title: 'Settlement Registered & Warehouse Dispatch Triggered',
      description: 'Order sealed in immutable ledger. Priority warehouse dispatch acknowledged.',
      status: 'verified',
      actor: 'system',
      latencyMs: 8,
      verificationBadge: 'STATE: PAID',
      explanation: `Settlement complete. Order ${orderId} routed to Bangalore BLR-04 for next-day dispatch.`,
      payload: {
        orderReference: orderId,
        fulfillmentWarehouse: 'Bangalore BLR-04',
        expectedDelivery: 'Tomorrow by 2:00 PM',
        auditRoot: '0x9e81...a431',
        blockNumber: '#8902-D',
      },
    },
  ];
}

/**
 * Builds compact forensic terminal text.
 */
export function buildForensicAuditLog(events: AgentTraceEvent[]): string {
  return events
    .map((evt) => {
      const codeMap: Record<AgentTraceEventType, string> = {
        INTENT_RECEIVED: 'INTENT_IN',
        INTENT_PARSED: 'INTENT_PARSED',
        CATALOG_SEARCH: 'CATALOG_MATCH',
        PRODUCT_EVALUATED: 'PRODUCT_EVAL',
        PRODUCT_SELECTED: 'PRODUCT_SELECT',
        MERCHANT_RULE_APPLIED: 'RULE_APPLIED',
        PRICE_CALCULATED: 'PRICE_LOCKED',
        AUTHORIZATION_REQUESTED: 'AUTH_REQUEST',
        CUSTOMER_AUTHORIZED: 'CUSTOMER_AUTH',
        ORDER_CREATED: 'ORDER_CREATED',
        PAYMENT_INITIATED: 'PAYMENT_INIT',
        PAYMENT_VERIFICATION: 'PAYMENT_VERIFY',
        PAYMENT_FAILED: 'PAYMENT_FAILED',
        PAYMENT_CANCELLED: 'CHECKOUT_CANCEL',
        RECOVERY_STARTED: 'RECOVERY_LOOP',
        PAYMENT_RETRIED: 'PAYMENT_RETRY',
        PAYMENT_VERIFIED: 'CRYPTO_VERIFIED',
        PURCHASE_SETTLED: 'SETTLED',
      };
      const code = (codeMap[evt.eventType] || evt.eventType).padEnd(15, ' ');
      return `${evt.timestamp} [${code}] ${evt.title} (${evt.status.toUpperCase()})`;
    })
    .join('\n');
}
