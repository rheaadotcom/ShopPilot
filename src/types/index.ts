export interface MerchantOffer {
  code: string;
  discountAmount: number;
  description: string;
  badgeText: string;
  verified: boolean;
  terms?: string;
}

export interface ProductSpecs {
  weight: string;
  heelDrop: string;
  cushioning: string;
  terrain: string;
  fit: string;
  closure?: string;
  upperMaterial?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  brand: string;
  category: string;
  subtitle: string;
  originalPrice: number;
  finalPrice: number;
  matchScore: number; // e.g. 99.2
  rating: number; // e.g. 4.9
  reviewCount: number;
  description: string;
  agentRationale: string;
  images: string[];
  specs: ProductSpecs;
  merchantOffer?: MerchantOffer;
  availableSizes: number[];
  selectedSize?: number;
  colors: string[];
  inStock: boolean;
  stockCount: number;
  fulfillmentSla: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedSize: number;
  selectedColor: string;
  appliedOffer?: MerchantOffer;
}

export interface PriceLedger {
  basePrice: number;
  merchantDiscount: number;
  logisticsFee: number;
  gstAmount: number;
  totalSettlement: number;
  currency: string;
}

export type StepStatus = 'verified' | 'active' | 'pending' | 'failed' | 'aborted';

export interface AgentTraceStepData {
  stepNumber: number;
  name: string;
  category: string;
  timestamp: string;
  latencyMs: number;
  status: StepStatus;
  description: string;
  parameters?: Record<string, string | number | boolean | null>;
  verificationBadge?: string;
}

export interface TelemetryMetrics {
  policyEngine: string; // e.g. "Zero-Drift"
  retrievalLatency: string; // e.g. "18ms"
  authorizationHook: string; // e.g. "Explicit Customer Token"
  settlementIntegrity: string; // e.g. "Settled"
}

export interface AgentSession {
  sessionId: string; // e.g. "#SP-1024-AUTH"
  sessionUid: string; // e.g. "0x892B...C401"
  txId: string; // e.g. "9814-DF7B-AG"
  nodeId: string; // e.g. "NODE BLR-04"
  rail: string; // e.g. "RZP TEST-RAIL v2.4"
  tlsInfo: string; // e.g. "TLS 256-bit GCM (rzp-bom-edge-04)"
  ecdsaSignature: string; // e.g. "ECDSA SHA-256: 3a9f...81c2"
  customerIntent: string;
  metrics: TelemetryMetrics;
  steps: AgentTraceStepData[];
}

export interface ActivityStreamItem {
  id: string;
  customerName: string;
  prompt: string;
  recommendation: string;
  value: number;
  status: 'paid' | 'active_cart';
}

export interface ScenarioData {
  id: string;
  name: string;
  icon: string;
  query: string;
  reply: string;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    sku: string;
    reason: string;
  };
  trace: Record<string, unknown>;
}

export interface PurchaseAuthorization {
  status: 'authorized';
  amount: number;
  currency: string;
  productId: string;
  productName: string;
  offerCode: string;
  timestamp: string;
  signature: string;
  nodeId: string;
  txId: string;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  keyId: string;
  simulated: boolean;
}

export interface PaymentVerificationResult {
  verified: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  timestamp: string;
  signatureProof: string;
  signature?: string;
  message?: string;
}

export type PaymentState =
  | 'IDLE'
  | 'CREATING_ORDER'
  | 'CHECKOUT_OPEN'
  | 'PAYMENT_PROCESSING'
  | 'VERIFYING'
  | 'VERIFIED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMEOUT'
  | 'VERIFICATION_FAILED'
  | 'NETWORK_ERROR'
  | 'ALREADY_PAID';

export type PaymentErrorCode =
  | 'PAYMENT_FAILED'
  | 'PAYMENT_CANCELLED'
  | 'ORDER_CREATION_FAILED'
  | 'VERIFICATION_FAILED'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'ALREADY_PAID'
  | 'UNCONFIRMED_STATUS';

export interface RecoveryAuditStep {
  stepNumber: number;
  title: string;
  description: string;
  timestamp: string;
  status: 'verified' | 'failed' | 'active' | 'warning' | 'pending';
  code?: string;
}

export interface PaymentFailureDetails {
  reason: string;
  code: PaymentErrorCode;
  orderId?: string;
  paymentId?: string;
  step?: string;
  timestamp?: string;
  canRetry?: boolean;
  preservedAmount?: number;
  auditTrail?: RecoveryAuditStep[];
}

export interface PaymentStatusResponse {
  success: boolean;
  status: 'verified' | 'pending' | 'not_found' | 'failed';
  verified: boolean;
  orderId: string;
  payment?: PaymentVerificationResult;
  message?: string;
}

// =========================================================================
// PHASE 8: AGENT TRACE, AUDIT TRAIL & MERCHANT GUARDRAILS
// =========================================================================

export type AgentTraceEventType =
  | 'INTENT_RECEIVED'
  | 'INTENT_PARSED'
  | 'CATALOG_SEARCH'
  | 'PRODUCT_EVALUATED'
  | 'PRODUCT_SELECTED'
  | 'MERCHANT_RULE_APPLIED'
  | 'PRICE_CALCULATED'
  | 'AUTHORIZATION_REQUESTED'
  | 'CUSTOMER_AUTHORIZED'
  | 'ORDER_CREATED'
  | 'PAYMENT_INITIATED'
  | 'PAYMENT_VERIFICATION'
  | 'PAYMENT_FAILED'
  | 'PAYMENT_CANCELLED'
  | 'RECOVERY_STARTED'
  | 'PAYMENT_RETRIED'
  | 'PAYMENT_VERIFIED'
  | 'PURCHASE_SETTLED';

export type TraceEventStatus = 'completed' | 'verified' | 'failed' | 'blocked' | 'pending' | 'bypassed';
export type TraceActor = 'customer' | 'agent' | 'merchant' | 'gateway' | 'system';

export interface AgentTraceEvent {
  id: string;
  stepNumber?: number;
  timestamp: string;
  eventType: AgentTraceEventType;
  title: string;
  description: string;
  status: TraceEventStatus;
  actor: TraceActor;
  relevantMetadata?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  latencyMs?: number;
  verificationBadge?: string;
  explanation?: string;
}

export interface MerchantPolicyConfig {
  maxOrderValue: number;
  allowedCurrency: string;
  automaticDiscounts: boolean;
  maxDiscount: number;
  customerAuthorizationRequired: boolean;
  paymentMode: string;
  agentPurchaseAuthority: 'GATED' | 'AUTONOMOUS' | 'DISABLED';
}

export interface PolicyCheck {
  id: string;
  name: string;
  expected: string;
  actual: string;
  passed: boolean;
  explanation: string;
}

export interface PolicyEvaluationResult {
  amount: number;
  currency: string;
  checks: PolicyCheck[];
  allPassed: boolean;
  outcome: 'AUTHORIZED FOR CHECKOUT' | 'BLOCKED';
  blockedReason?: string;
}

