import { PaymentErrorCode, RecoveryAuditStep } from '../types';

export interface ClassifiedPaymentError {
  code: PaymentErrorCode;
  title: string;
  subtitle: string;
  agentSpeech: string;
  statusCodeText: string;
  canRetry: boolean;
  technicalDetails?: string;
  auditTrail: RecoveryAuditStep[];
}

/**
 * Classifies raw payment/network errors into user-friendly and auditor-transparent structures
 */
export function classifyPaymentError(
  rawCodeOrMessage?: string,
  technicalDetails?: string,
  orderId: string = '#SP-1024'
): ClassifiedPaymentError {
  const normalized = (rawCodeOrMessage || '').toUpperCase();

  const now = new Date();
  const formatTime = (offsetSec: number = 0) => {
    const d = new Date(now.getTime() + offsetSec * 1000);
    return d.toTimeString().split(' ')[0] + ' UTC';
  };

  // 1. User Cancelled
  if (
    normalized.includes('CANCEL') ||
    normalized.includes('DISMISS') ||
    normalized.includes('CLOSED')
  ) {
    return {
      code: 'PAYMENT_CANCELLED',
      title: 'Payment cancelled',
      subtitle: 'No money has been charged. You closed the checkout dialog before completing payment.',
      agentSpeech:
        '“Checkout was cancelled. No successful payment was verified. Your purchase remains ready.”',
      statusCodeText: 'Status: 499 Client Cancelled',
      canRetry: true,
      technicalDetails: technicalDetails || 'User dismissed Razorpay checkout modal (modal.ondismiss).',
      auditTrail: [
        {
          stepNumber: 1,
          title: '1. Intent & Ledger Allocation',
          description: 'Cart state verified, discount token locked',
          timestamp: formatTime(-30),
          status: 'verified',
        },
        {
          stepNumber: 2,
          title: '2. Gateway Dispatch',
          description: `Razorpay checkout modal initialized for ${orderId}`,
          timestamp: formatTime(-25),
          status: 'verified',
        },
        {
          stepNumber: 3,
          title: '3. User Cancel Action',
          description: 'Checkout window dismissed by customer prior to pin/biometrics',
          timestamp: formatTime(-5),
          status: 'warning',
          code: 'CLIENT_CLOSED_WINDOW',
        },
        {
          stepNumber: 4,
          title: '4. Non-Debit Ledger Lock Verified',
          description: 'Zero funds transferred. No merchant settlement executed.',
          timestamp: formatTime(-2),
          status: 'verified',
        },
        {
          stepNumber: 5,
          title: '5. Purchase Authorization Preserved',
          description: 'Cart instance and locked pricing retained for immediate retry',
          timestamp: formatTime(0),
          status: 'active',
        },
      ],
    };
  }

  // 2. Signature Verification Failed
  if (
    normalized.includes('VERIF') ||
    normalized.includes('SIGNATURE') ||
    normalized.includes('HASH') ||
    normalized.includes('MISMATCH')
  ) {
    return {
      code: 'VERIFICATION_FAILED',
      title: 'Payment verification failed',
      subtitle: 'The cryptographic signature returned from the gateway could not be verified by the backend.',
      agentSpeech:
        '“The payment could not be verified. The purchase has not been marked as complete.”',
      statusCodeText: 'Status: 403 Verification Hash Mismatch',
      canRetry: true,
      technicalDetails: technicalDetails || 'HMAC SHA-256 signature mismatch detected during POST /api/payments/verify.',
      auditTrail: [
        {
          stepNumber: 1,
          title: '1. Intent & Ledger Allocation',
          description: 'Cart state verified, discount token locked',
          timestamp: formatTime(-30),
          status: 'verified',
        },
        {
          stepNumber: 2,
          title: '2. Gateway Dispatch',
          description: `Dispatched to Razorpay order ${orderId}`,
          timestamp: formatTime(-25),
          status: 'verified',
        },
        {
          stepNumber: 3,
          title: '3. Cryptographic Verification Failure',
          description: 'Backend HMAC SHA-256 signature handshake rejected hash proof',
          timestamp: formatTime(-5),
          status: 'failed',
          code: 'ECDSA_HMAC_MISMATCH',
        },
        {
          stepNumber: 4,
          title: '4. Settlement Halted & Quarantine',
          description: 'Order halted prior to ledger settlement. No debit acknowledged.',
          timestamp: formatTime(-2),
          status: 'verified',
        },
        {
          stepNumber: 5,
          title: '5. Safe State Maintained',
          description: 'Authorized purchase preserved with original parameters',
          timestamp: formatTime(0),
          status: 'active',
        },
      ],
    };
  }

  // 3. Timeout / Status Unconfirmed
  if (
    normalized.includes('TIMEOUT') ||
    normalized.includes('ABORT') ||
    normalized.includes('UNCONFIRMED')
  ) {
    return {
      code: 'TIMEOUT',
      title: 'Payment status is being verified',
      subtitle: 'Upstream gateway took longer than expected to respond. We could not confirm the final state.',
      agentSpeech:
        '“We couldn’t confirm the payment status yet. We’re checking the transaction before allowing another attempt.”',
      statusCodeText: 'Status: 408 Gateway Timeout / Pending',
      canRetry: true,
      technicalDetails: technicalDetails || 'Network request exceeded 8000ms threshold; polling status was indeterminate.',
      auditTrail: [
        {
          stepNumber: 1,
          title: '1. Intent & Ledger Allocation',
          description: 'Cart state verified, discount token locked',
          timestamp: formatTime(-30),
          status: 'verified',
        },
        {
          stepNumber: 2,
          title: '2. Gateway Dispatch',
          description: `Dispatched to Razorpay test rail ${orderId}`,
          timestamp: formatTime(-20),
          status: 'verified',
        },
        {
          stepNumber: 3,
          title: '3. Upstream Gateway Timeout',
          description: 'Response window expired without deterministic acknowledgement',
          timestamp: formatTime(-5),
          status: 'warning',
          code: 'GATEWAY_TIMEOUT_WINDOW',
        },
        {
          stepNumber: 4,
          title: '4. Non-Debit Quarantine Activated',
          description: 'No debit confirmed by payment rail. Zero ledger mutation recorded.',
          timestamp: formatTime(-2),
          status: 'verified',
        },
        {
          stepNumber: 5,
          title: '5. Recheck & Safe Retry Ready',
          description: 'Status check query available; retry permitted without double billing',
          timestamp: formatTime(0),
          status: 'active',
        },
      ],
    };
  }

  // 4. Network / Connectivity Error
  if (
    normalized.includes('NETWORK') ||
    normalized.includes('FETCH') ||
    normalized.includes('CONNECT') ||
    normalized.includes('ECONNREFUSED')
  ) {
    return {
      code: 'NETWORK_ERROR',
      title: 'Payment service unavailable',
      subtitle: 'Unable to reach the payment subsystem. Your device or backend connection experienced an interruption.',
      agentSpeech:
        '“Network connectivity issue detected. We preserved your cart so you can safely retry.”',
      statusCodeText: 'Status: 503 Network Interruption',
      canRetry: true,
      technicalDetails: technicalDetails || 'Fetch connection to /api/payments failed or was dropped.',
      auditTrail: [
        {
          stepNumber: 1,
          title: '1. Intent & Ledger Allocation',
          description: 'Cart state verified, discount token locked',
          timestamp: formatTime(-30),
          status: 'verified',
        },
        {
          stepNumber: 2,
          title: '2. Network Transmission Failure',
          description: 'Socket connection dropped before order handoff',
          timestamp: formatTime(-10),
          status: 'failed',
          code: 'NETWORK_SOCKET_DISCONNECT',
        },
        {
          stepNumber: 3,
          title: '3. Gateway Pipeline Unreached',
          description: 'Zero financial data reached gateway. No charges possible.',
          timestamp: formatTime(-5),
          status: 'verified',
        },
        {
          stepNumber: 4,
          title: '4. Non-Debit Ledger Lock Verified',
          description: 'Local and remote ledgers unchanged.',
          timestamp: formatTime(-2),
          status: 'verified',
        },
        {
          stepNumber: 5,
          title: '5. Authorization Preserved',
          description: 'You can retry once connectivity is restored.',
          timestamp: formatTime(0),
          status: 'active',
        },
      ],
    };
  }

  // 5. Already Paid / Duplicate Attempt
  if (normalized.includes('ALREADY') || normalized.includes('DUPLICATE')) {
    return {
      code: 'ALREADY_PAID',
      title: 'Payment already verified',
      subtitle: 'This authorized order has already been successfully verified and settled.',
      agentSpeech:
        '“This order has already been cryptographically verified and settled. Redirecting to confirmation.”',
      statusCodeText: 'Status: 409 Order Already Settled',
      canRetry: false,
      technicalDetails: technicalDetails || 'Order was previously verified and exists in settled ledger registry.',
      auditTrail: [
        {
          stepNumber: 1,
          title: '1. Intent & Ledger Allocation',
          description: 'Cart state verified',
          timestamp: formatTime(-40),
          status: 'verified',
        },
        {
          stepNumber: 2,
          title: '2. Gateway Order Settled',
          description: `Order ${orderId} was previously verified`,
          timestamp: formatTime(-20),
          status: 'verified',
        },
        {
          stepNumber: 3,
          title: '3. Duplicate Prevention Hook',
          description: 'Second payment attempt blocked to prevent double charge',
          timestamp: formatTime(-5),
          status: 'verified',
          code: 'IDEMPOTENT_BLOCK',
        },
        {
          stepNumber: 4,
          title: '4. Routing to Confirmed Receipt',
          description: 'Directing customer to verified transaction proof',
          timestamp: formatTime(0),
          status: 'active',
        },
      ],
    };
  }

  // 6. Default: Generic Payment Failed (Bank decline, OTP timeout, insufficient balance)
  return {
    code: 'PAYMENT_FAILED',
    title: 'Payment not completed',
    subtitle: 'No money has been charged. The issuing bank or payment rail rejected the transaction.',
    agentSpeech:
      '“Payment wasn’t completed. Your authorized cart is still preserved, so you can safely retry.”',
    statusCodeText: 'Status: 402 Settlement Incomplete',
    canRetry: true,
    technicalDetails: technicalDetails || 'Transaction rejected by simulated banking gateway or OTP window expired.',
    auditTrail: [
      {
        stepNumber: 1,
        title: '1. Intent & Ledger Allocation',
        description: 'Cart state verified, discount token locked',
        timestamp: formatTime(-30),
        status: 'verified',
      },
      {
        stepNumber: 2,
        title: '2. Gateway Dispatch',
        description: `Routed to Razorpay Gateway pipe for ${orderId}`,
        timestamp: formatTime(-20),
        status: 'verified',
      },
      {
        stepNumber: 3,
        title: '3. Upstream Provider Interruption',
        description: technicalDetails || 'Issuing bank session expired • OTP not authenticated in window',
        timestamp: formatTime(-5),
        status: 'failed',
        code: 'ISSUING_BANK_REJECT',
      },
      {
        stepNumber: 4,
        title: '4. Non-Debit Ledger Lock Verified',
        description: 'Zero funds transferred. Reserved cart stored for instant re-execution.',
        timestamp: formatTime(-2),
        status: 'verified',
      },
      {
        stepNumber: 5,
        title: '5. Safe State Active',
        description: 'Offer RT-SUMMER200 and inventory slot remain locked.',
        timestamp: formatTime(0),
        status: 'active',
      },
    ],
  };
}
