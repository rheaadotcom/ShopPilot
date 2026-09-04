import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { primaryProduct, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import { useCart } from '../../features/cart';
import { PaymentState, PaymentErrorCode } from '../../types';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentConfig,
  checkPaymentStatus,
  PaymentApiError,
} from '../../services/paymentApi';

type PaymentMethod = 'upi' | 'cards' | 'netbanking';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    authorization,
    items,
    total,
    subtotal,
    discount,
    appliedOffer,
    settledPayment,
    markPaymentSettled,
  } = useCart();

  const session = defaultAgentSession;
  const primaryItem = items.length > 0 ? items[0] : null;
  const product = primaryItem?.product || primaryProduct;

  // Selected payment tab
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');

  // VPA Address input
  const [vpaAddress, setVpaAddress] = useState<string>('success@razorpay');

  // Typed Payment State Model (Phase 7 Requirement)
  const [paymentState, setPaymentState] = useState<PaymentState>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [statusCheckMessage, setStatusCheckMessage] = useState<string | null>(null);

  // Countdown timer: 14m 28s = 868s
  const [secondsLeft, setSecondsLeft] = useState<number>(868);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // =========================================================================
  // DUPLICATE PAYMENT PROTECTION: IF ALREADY SETTLED
  // =========================================================================
  if (settledPayment && settledPayment.verified) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-space-48">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-32 text-center shadow-L1">
            <div className="w-16 h-16 mx-auto mb-space-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center border border-emerald-300">
              <span className="material-symbols-outlined text-[32px]">verified</span>
            </div>

            <span className="font-mono text-label-sm uppercase px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
              Duplicate Protection: Order Already Settled
            </span>

            <h1 className="font-headline text-headline-md font-bold text-on-surface mt-space-12 mb-space-8">
              Payment already verified
            </h1>

            <p className="font-body text-body-md text-on-surface-variant max-w-md mx-auto mb-space-24 leading-relaxed">
              This purchase authorization ({settledPayment.orderId}) has already been cryptographically verified and settled for{' '}
              <strong className="font-mono font-bold text-on-surface">
                {formatCurrency(settledPayment.amount)}
              </strong>
              . Duplicate debits are permanently blocked.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-12">
              <button
                type="button"
                onClick={() =>
                  navigate('/payment/success', {
                    state: {
                      payment: settledPayment,
                      product,
                      orderId: settledPayment.orderId,
                    },
                  })
                }
                className="w-full sm:w-auto px-space-24 py-space-12 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-body-md font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                View Verified Order Proof
              </button>

              <Link
                to="/"
                className="w-full sm:w-auto px-space-20 py-space-12 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-body-md font-medium transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // =========================================================================
  // BOUNDED CHECK: MISSING AUTHORIZATION GUARD
  // =========================================================================
  if (!authorization || authorization.status !== 'authorized') {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-space-48">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-32 text-center shadow-L1">
            <div className="w-16 h-16 mx-auto mb-space-20 rounded-full bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">gavel</span>
            </div>

            <span className="font-mono text-label-sm uppercase px-2.5 py-1 rounded bg-error/10 text-error font-semibold">
              Boundary Check: Authorization Missing
            </span>

            <h1 className="font-headline text-headline-md font-bold text-on-surface mt-space-12 mb-space-8">
              Explicit Approval Required
            </h1>

            <p className="font-body text-body-md text-on-surface-variant max-w-md mx-auto mb-space-24 leading-relaxed">
              ShopPilot requires an explicit customer authorization signature before initiating any Razorpay payment order. Autonomous AI agents cannot charge without human confirmation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-12">
              <Link
                to="/confirm"
                className="w-full sm:w-auto px-space-24 py-space-12 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-body-md font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                Go to Purchase Confirmation
              </Link>

              <Link
                to="/"
                className="w-full sm:w-auto px-space-20 py-space-12 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-body-md font-medium transition-colors"
              >
                Return to Shop
              </Link>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // =========================================================================
  // SAFE ROUTING HELPER FOR FAILURES (Preserving Authorization & Cart)
  // =========================================================================
  const routeToFailure = (
    code: PaymentErrorCode,
    reason: string,
    orderId?: string,
    technicalDetails?: string
  ) => {
    // Crucial Guarantee (Step 2): We NEVER clear authorization here.
    // The user's cart and authorized purchase remain intact for safe retry.
    navigate('/payment/failure', {
      state: {
        code,
        reason,
        orderId: orderId || activeOrderId || session.sessionId,
        paymentId: undefined,
        timestamp: new Date().toISOString(),
        canRetry: code !== 'ALREADY_PAID',
        preservedAmount: total,
        technicalDetails,
      },
    });
  };

  // =========================================================================
  // EXECUTE PAYMENT FLOW
  // =========================================================================
  const handleExecutePayment = async (simulationMode?: PaymentErrorCode) => {
    // Idempotency: Prevent duplicate submissions while in flight
    if (
      paymentState === 'CREATING_ORDER' ||
      paymentState === 'CHECKOUT_OPEN' ||
      paymentState === 'PAYMENT_PROCESSING' ||
      paymentState === 'VERIFYING'
    ) {
      return;
    }

    setPaymentState('CREATING_ORDER');
    setErrorMessage(null);
    setStatusCheckMessage(null);

    // Explicit developer simulation branch if triggered
    if (simulationMode === 'PAYMENT_CANCELLED') {
      setTimeout(() => {
        routeToFailure(
          'PAYMENT_CANCELLED',
          'Checkout was cancelled. No successful payment was verified.',
          activeOrderId || 'order_sim_cancel'
        );
      }, 500);
      return;
    }

    if (simulationMode === 'PAYMENT_FAILED' || vpaAddress === 'failure@razorpay') {
      setTimeout(() => {
        routeToFailure(
          'PAYMENT_FAILED',
          'Issuing bank session expired • OTP not authenticated in window',
          activeOrderId || 'order_sim_fail'
        );
      }, 600);
      return;
    }

    if (simulationMode === 'TIMEOUT') {
      setPaymentState('TIMEOUT');
      setStatusCheckMessage('Upstream gateway response delayed. Querying status from backend...');

      setTimeout(async () => {
        const dummyOrderId = activeOrderId || `order_test_${Date.now()}`;
        const statusRes = await checkPaymentStatus(dummyOrderId);

        if (statusRes.verified && statusRes.payment) {
          markPaymentSettled(statusRes.payment);
          navigate('/payment/success', {
            state: {
              payment: statusRes.payment,
              product,
              orderId: dummyOrderId,
            },
          });
        } else {
          routeToFailure(
            'TIMEOUT',
            'We couldn’t confirm the payment status yet. We’re checking the transaction before allowing another attempt.',
            dummyOrderId
          );
        }
      }, 1200);
      return;
    }

    if (simulationMode === 'VERIFICATION_FAILED') {
      setPaymentState('VERIFYING');
      setTimeout(async () => {
        try {
          // Intentionally send forged signature to backend verify API
          await verifyPaymentSignature({
            razorpay_payment_id: 'pay_test_forged',
            razorpay_order_id: activeOrderId || `order_test_${Date.now()}`,
            razorpay_signature: 'invalid_forged_hash_payload',
          });
        } catch (err: unknown) {
          routeToFailure(
            'VERIFICATION_FAILED',
            'The payment could not be verified. Cryptographic hash mismatch.',
            activeOrderId || 'order_sim_verify_fail'
          );
        }
      }, 700);
      return;
    }

    if (simulationMode === 'NETWORK_ERROR') {
      setTimeout(() => {
        routeToFailure(
          'NETWORK_ERROR',
          'Network connectivity issue detected. We preserved your cart so you can safely retry.',
          activeOrderId || 'order_sim_net'
        );
      }, 500);
      return;
    }

    try {
      // Step 1: Create Razorpay Order on Backend
      const order = await createRazorpayOrder({
        authorization,
        productId: product.id,
        quantity: 1,
      });

      setActiveOrderId(order.id);

      // Step 2: Check backend configuration
      const config = await getPaymentConfig().catch(() => ({
        simulated: true,
        keyId: order.keyId,
        network: 'Razorpay Test Network',
      }));

      // Check if real Razorpay Checkout modal can be launched
      const canUseRealSdk =
        typeof window !== 'undefined' &&
        window.Razorpay &&
        !config.simulated &&
        !order.simulated &&
        order.keyId.startsWith('rzp_test_') &&
        !order.keyId.includes('sandbox');

      if (canUseRealSdk && window.Razorpay) {
        setPaymentState('CHECKOUT_OPEN');

        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'ShopPilot Retail India',
          description: 'AeroRun X Daily Road — AI Purchase Settlement',
          order_id: order.id,
          prefill: {
            name: 'ShopPilot Customer',
            email: 'gaurav.shopper@shoppilot.ai',
            contact: '+919876543210',
            'vpa[address]': vpaAddress,
          },
          theme: {
            color: '#000000',
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            setPaymentState('VERIFYING');
            try {
              const verifyResult = await verifyPaymentSignature({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              setPaymentState('VERIFIED');
              markPaymentSettled(verifyResult);

              setTimeout(() => {
                navigate('/payment/success', {
                  state: {
                    payment: verifyResult,
                    product,
                    orderId: order.id,
                  },
                });
              }, 600);
            } catch (vErr: unknown) {
              routeToFailure(
                'VERIFICATION_FAILED',
                vErr instanceof Error ? vErr.message : 'Signature verification failed',
                order.id
              );
            }
          },
          modal: {
            ondismiss: () => {
              // User cancelled / closed the checkout modal
              setPaymentState('CANCELLED');
              routeToFailure(
                'PAYMENT_CANCELLED',
                'Checkout was cancelled. No successful payment was verified.',
                order.id
              );
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failResp) => {
          setPaymentState('FAILED');
          routeToFailure(
            'PAYMENT_FAILED',
            failResp.error?.description || 'Payment rejected by payment gateway',
            order.id
          );
        });

        rzp.open();
        return;
      }

      // Step 3: Stitch-Faithful Sandbox Gateway Terminal Settlement
      setPaymentState('PAYMENT_PROCESSING');

      setTimeout(async () => {
        try {
          setPaymentState('VERIFYING');

          const mockPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const mockSig = `sig_test_verified_${Math.random().toString(36).substring(2, 8)}`;

          const verifyResult = await verifyPaymentSignature({
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: order.id,
            razorpay_signature: mockSig,
          });

          setPaymentState('VERIFIED');
          markPaymentSettled(verifyResult);

          setTimeout(() => {
            navigate('/payment/success', {
              state: {
                payment: verifyResult,
                product,
                orderId: order.id,
              },
            });
          }, 800);
        } catch (verifyError: unknown) {
          routeToFailure(
            'VERIFICATION_FAILED',
            verifyError instanceof Error ? verifyError.message : 'Backend HMAC verification failed',
            order.id
          );
        }
      }, 1200);
    } catch (err: unknown) {
      if (err instanceof PaymentApiError && err.code === 'ALREADY_PAID') {
        setPaymentState('ALREADY_PAID');
        routeToFailure('ALREADY_PAID', 'This order has already been verified and settled.');
        return;
      }

      if (err instanceof PaymentApiError && err.code === 'TIMEOUT') {
        setPaymentState('TIMEOUT');
        routeToFailure(
          'TIMEOUT',
          'We couldn’t confirm the payment status yet. We’re checking the transaction before allowing another attempt.'
        );
        return;
      }

      const isNetwork = err instanceof PaymentApiError && err.code === 'NETWORK_ERROR';
      const msg = err instanceof Error ? err.message : 'Failed to initialize payment order';
      setErrorMessage(msg);
      setPaymentState(isNetwork ? 'NETWORK_ERROR' : 'FAILED');
      routeToFailure(isNetwork ? 'NETWORK_ERROR' : 'ORDER_CREATION_FAILED', msg);
    }
  };

  return (
    <PageLayout>
      <div className="w-full max-w-content mx-auto space-y-space-24">
        {/* Context Telemetry Strip */}
        <div className="w-full bg-surface-container-low shadow-[0_1px_2px_0_rgba(17,17,16,0.03)] rounded-xl">
          <div className="px-gutter-mobile lg:px-gutter-desktop py-space-12 flex flex-col md:flex-row md:items-center justify-between gap-space-12">
            <div className="flex items-center gap-space-16 flex-wrap">
              <button
                type="button"
                onClick={() => navigate('/confirm')}
                className="inline-flex items-center gap-space-4 font-body-sm text-body-sm text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Return to Confirmation</span>
              </button>
              <span className="text-outline-variant font-mono text-label-sm">/</span>
              <div className="flex items-center gap-space-8">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Autonomous Checkout
                </span>
                <span className="text-outline-variant font-mono text-label-sm">#</span>
                <span className="font-mono text-label-sm bg-surface-container px-space-8 py-space-2 rounded text-on-surface">
                  Session {session.sessionId}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-space-12 flex-wrap">
              <div className="inline-flex items-center gap-space-8 bg-surface-container-lowest px-space-12 py-space-4 rounded-full shadow-sm">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                <span className="font-mono text-label-sm text-on-surface uppercase tracking-wider font-medium">
                  Test Mode — No real currency debited
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-space-8 text-on-surface-variant font-mono text-label-sm bg-surface-container px-space-12 py-space-4 rounded-full">
                <span>TLS 256-bit GCM</span>
                <span className="text-outline-variant">•</span>
                <span>Node: rzp-bom-edge-04</span>
                <span className="text-outline-variant">•</span>
                <span>RZP TEST-RAIL v2.4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Workspace Canvas (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-32 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Ledger & Autonomous Verification (7 cols)                    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-space-24">
            {/* Order Summary Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-24 lg:p-space-32 shadow-[0_1px_2px_0_rgba(17,17,16,0.03),0_1px_3px_0_rgba(17,17,16,0.02)] border border-outline-variant/30">
              <div className="flex items-center justify-between pb-space-20">
                <div>
                  <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Autonomous Allocation
                  </span>
                  <h1 className="font-headline text-headline-md text-on-surface pt-space-2 font-bold">
                    Order Summary
                  </h1>
                </div>
                <span className="font-mono text-label-md px-space-12 py-space-4 rounded bg-surface-container-low text-on-surface font-medium border border-outline-variant/20">
                  Order #SP-1024
                </span>
              </div>

              {/* Product Item Row */}
              <div className="p-space-16 rounded-lg bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center gap-space-20 border border-outline-variant/20">
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-md bg-surface overflow-hidden flex-shrink-0 shadow-sm border border-outline-variant/20">
                  <img
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                    src={product.images[0]}
                  />
                  <span className="absolute bottom-1 right-1 bg-surface-container-lowest/90 px-space-4 py-space-2 rounded text-[10px] font-mono text-on-surface font-medium border border-outline-variant/30">
                    {primaryItem?.selectedSize || 9.5} US
                  </span>
                </div>

                <div className="flex flex-col flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-space-8">
                    <div>
                      <h2 className="font-headline text-headline-sm text-on-surface tracking-tight font-bold truncate">
                        {product.name}
                      </h2>
                      <p className="font-body text-body-sm text-on-surface-variant line-clamp-1 pt-space-2">
                        Running Shoes • Ultralight Daily Road Running • Size US{' '}
                        {primaryItem?.selectedSize || 9.5}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[16px] text-on-surface font-semibold">
                        {formatCurrency(subtotal || 2999)}
                      </span>
                      <div className="font-mono text-label-sm text-on-surface-variant">Qty: 01</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-space-8 pt-space-12">
                    <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded-full bg-surface-container-lowest font-mono text-label-sm text-emerald-800 shadow-sm border border-outline-variant/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      Direct In-Stock • Ready for Auto-Dispatch
                    </span>
                  </div>
                </div>
              </div>

              {/* Deterministic Price Breakdown Ledger */}
              <div className="mt-space-24 space-y-space-12">
                <div className="flex justify-between items-center text-body-sm font-body">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="font-mono text-on-surface">{formatCurrency(subtotal || 2999)}</span>
                </div>

                <div className="flex justify-between items-center text-body-sm font-body">
                  <div className="flex items-center gap-space-8">
                    <span className="text-on-surface-variant">Autonomous Merchant Offer</span>
                    <span className="px-space-8 py-space-2 rounded bg-surface-container font-mono text-label-sm text-emerald-800 font-medium border border-outline-variant/20">
                      {appliedOffer?.code || 'RT-SUMMER200'}
                    </span>
                  </div>
                  <span className="font-mono text-emerald-700 font-medium">
                    −{formatCurrency(discount || 200)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-body-sm font-body">
                  <div className="flex items-center gap-space-8">
                    <span className="text-on-surface-variant">Express 24h Dispatch</span>
                    <span className="font-mono text-label-sm text-on-surface-variant bg-surface-container px-space-4 py-space-2 rounded">
                      Tier-1 SLA
                    </span>
                  </div>
                  <span className="font-mono text-emerald-700 font-medium uppercase">FREE</span>
                </div>

                <div className="flex justify-between items-center text-body-sm font-body">
                  <span className="text-on-surface-variant">
                    Integrated GST &amp; Razorpay Gateway Rails (18%)
                  </span>
                  <span className="font-mono text-on-surface-variant">Included</span>
                </div>

                {/* Final Settlement Row */}
                <div className="pt-space-16 mt-space-16 bg-surface-container-low p-space-16 rounded-lg flex items-end justify-between border border-outline-variant/25">
                  <div>
                    <div className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                      Final Settlement Ledger
                    </div>
                    <div className="font-body text-body-sm text-emerald-700 pt-space-2 font-medium">
                      Net Savings: ₹200.00 applied via AI protocol
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[24px] leading-tight text-on-surface font-bold">
                      {formatCurrency(total || 2799)}
                    </div>
                    <div className="font-mono text-label-sm text-on-surface-variant pt-space-2">
                      Deterministic Nonce: 0x9e81...a431
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardrail & Confidence Telemetry Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 shadow-[0_1px_2px_0_rgba(17,17,16,0.03)] border border-outline-variant/30 flex flex-col sm:flex-row items-start gap-space-16">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-emerald-700">
                <span className="material-symbols-outlined text-[22px]">verified_user</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-space-8 flex-wrap">
                  <span className="font-headline text-body-lg font-bold text-on-surface">
                    Autonomous Guardrail Enforced
                  </span>
                  <span className="font-mono text-label-sm bg-surface-container px-space-8 py-space-2 rounded-full text-emerald-800 font-semibold border border-outline-variant/20">
                    Confidence 99.8%
                  </span>
                </div>
                <p className="font-body text-body-sm text-on-surface-variant pt-space-4 leading-relaxed">
                  Deterministic Agent Trace{' '}
                  <span className="font-mono text-on-surface font-semibold">#SP-8902</span> has certified
                  pricing against the merchant catalog floor. Price guarantees apply for{' '}
                  <span className="font-mono font-bold text-on-surface">
                    {formatCountdown(secondsLeft)}
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Protocol Trace Signature Footer */}
            <div className="px-space-8 flex flex-wrap items-center justify-between gap-space-12 text-on-surface-variant font-mono text-label-sm">
              <div className="flex items-center gap-space-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Session Nonce: 9b207a90f1</span>
                <span className="text-outline-variant">•</span>
                <span>Rail: RZP-UPI-STG</span>
              </div>
              <div className="flex items-center gap-space-8">
                <span>MID: mid_aero_ind</span>
                <span className="text-emerald-700 font-medium">• Ledger Synchronized</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Razorpay Test Terminal (5 cols)                             */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-lowest rounded-xl p-space-24 lg:p-space-32 shadow-[0_4px_6px_-1px_rgba(17,17,16,0.04),0_2px_4px_-2px_rgba(17,17,16,0.03)] border border-outline-variant/30 flex flex-col">
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-space-16 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <div className="w-6 h-6 rounded bg-secondary flex items-center justify-center text-on-secondary">
                    <span className="material-symbols-outlined text-[16px]">terminal</span>
                  </div>
                  <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface font-bold">
                    Gateway Terminal
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-medium">
                    STATE: {paymentState}
                  </span>
                  <span className="font-mono text-label-sm px-space-8 py-space-2 rounded bg-surface-container-high text-on-surface-variant font-medium">
                    Test Stage
                  </span>
                </div>
              </div>

              {/* Total Payable */}
              <div className="pt-space-16 pb-space-20">
                <span className="font-body text-body-sm text-on-surface-variant">Total Payable</span>
                <div className="font-mono text-[32px] leading-tight text-on-surface font-bold pt-space-4">
                  {formatCurrency(total || 2799)}
                </div>
              </div>

              {/* Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-space-4 bg-surface-container p-space-4 rounded-lg">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('upi')}
                  className={`flex items-center justify-center gap-space-4 py-space-8 px-space-8 rounded text-body-sm font-medium transition-all ${
                    selectedMethod === 'upi'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                  <span>UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('cards')}
                  className={`flex items-center justify-center gap-space-4 py-space-8 px-space-8 rounded text-body-sm font-medium transition-all ${
                    selectedMethod === 'cards'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">credit_card</span>
                  <span>Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('netbanking')}
                  className={`flex items-center justify-center gap-space-4 py-space-8 px-space-8 rounded text-body-sm font-medium transition-all ${
                    selectedMethod === 'netbanking'
                      ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">account_balance</span>
                  <span>NetBanking</span>
                </button>
              </div>

              {/* Active Form Body */}
              <div className="pt-space-24 space-y-space-20">
                {selectedMethod === 'upi' && (
                  <>
                    <div>
                      <div className="flex items-center justify-between pb-space-8">
                        <label
                          className="font-body text-label-md text-on-surface font-medium"
                          htmlFor="vpa-input"
                        >
                          Virtual Payment Address (VPA / UPI ID)
                        </label>
                        <span className="font-mono text-[10px] text-emerald-800 bg-surface-container px-space-6 py-space-2 rounded flex items-center gap-space-2">
                          <span className="w-1 h-1 rounded-full bg-emerald-600" />
                          Format verified
                        </span>
                      </div>
                      <div className="relative flex items-center">
                        <input
                          id="vpa-input"
                          type="text"
                          value={vpaAddress}
                          onChange={(e) => setVpaAddress(e.target.value)}
                          placeholder="name@okhdfcbank"
                          className="w-full h-11 px-space-12 bg-surface-container-low rounded-lg font-mono text-body-md text-on-surface focus:outline-none focus:bg-surface-container-lowest transition-colors pr-24 border border-outline-variant/30"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          <span className="font-mono text-label-sm text-on-surface-variant bg-surface-container px-space-8 py-space-2 rounded font-medium">
                            UPI 2.0
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Sandbox Profiles */}
                    <div>
                      <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider block pb-space-8 font-semibold">
                        Simulate Test Responses:
                      </span>
                      <div className="flex items-center gap-space-8 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setVpaAddress('success@razorpay')}
                          className={`font-mono text-label-sm px-space-12 py-space-6 rounded-md transition-colors flex items-center gap-space-4 border ${
                            vpaAddress === 'success@razorpay'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                              : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/20'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                          success@razorpay
                        </button>

                        <button
                          type="button"
                          onClick={() => setVpaAddress('customer@okhdfcbank')}
                          className={`font-mono text-label-sm px-space-12 py-space-6 rounded-md transition-colors border ${
                            vpaAddress === 'customer@okhdfcbank'
                              ? 'bg-secondary-fixed text-on-secondary-fixed border-secondary font-semibold'
                              : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-outline-variant/20'
                          }`}
                        >
                          customer@okhdfcbank
                        </button>

                        <button
                          type="button"
                          onClick={() => setVpaAddress('failure@razorpay')}
                          className={`font-mono text-label-sm px-space-12 py-space-6 rounded-md transition-colors border ${
                            vpaAddress === 'failure@razorpay'
                              ? 'bg-error-container text-on-error-container border-error font-semibold'
                              : 'bg-surface-container-low hover:bg-error/10 text-on-surface-variant hover:text-error border-outline-variant/20'
                          }`}
                          title="Simulate upstream payment failure / timeout"
                        >
                          failure@razorpay
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {selectedMethod === 'cards' && (
                  <div className="p-space-16 rounded-lg bg-surface-container-low border border-outline-variant/20 space-y-3 font-mono text-label-sm text-on-surface-variant">
                    <div className="text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">credit_card</span>
                      <span>Razorpay Test Card Sandbox</span>
                    </div>
                    <p className="text-[12px] font-body text-on-surface-variant">
                      Test card numbers: <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface">4111 2222 3333 4444</code> (Any future date &amp; CVV)
                    </p>
                  </div>
                )}

                {selectedMethod === 'netbanking' && (
                  <div className="p-space-16 rounded-lg bg-surface-container-low border border-outline-variant/20 space-y-3 font-mono text-label-sm text-on-surface-variant">
                    <div className="text-on-surface font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">account_balance</span>
                      <span>Razorpay NetBanking Rails</span>
                    </div>
                    <p className="text-[12px] font-body text-on-surface-variant">
                      Available test banks: HDFC, ICICI, SBI, Axis Sandbox Rails.
                    </p>
                  </div>
                )}

                {/* Notification Info Panel */}
                <div className="p-space-16 rounded-lg bg-surface-container-low flex items-start gap-space-12 border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[18px] text-secondary flex-shrink-0 mt-0.5">
                    info
                  </span>
                  <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                    A simulated push request will hit your mock virtual handle. Click Pay to create the backend Razorpay test order and trigger instant sandbox settlement.
                  </p>
                </div>

                {/* Primary Execute CTA (Disabled during processing for idempotency) */}
                <button
                  id="pay-btn"
                  type="button"
                  disabled={
                    paymentState === 'CREATING_ORDER' ||
                    paymentState === 'CHECKOUT_OPEN' ||
                    paymentState === 'PAYMENT_PROCESSING' ||
                    paymentState === 'VERIFYING'
                  }
                  onClick={() => handleExecutePayment()}
                  className="w-full h-12 bg-primary text-on-primary font-headline text-body-lg rounded-lg flex items-center justify-center gap-space-8 hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md group cursor-pointer disabled:opacity-60"
                >
                  {paymentState === 'CREATING_ORDER' ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        autorenew
                      </span>
                      <span>Creating Razorpay Order...</span>
                    </div>
                  ) : paymentState === 'CHECKOUT_OPEN' ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        lock_clock
                      </span>
                      <span>Awaiting Razorpay Checkout...</span>
                    </div>
                  ) : paymentState === 'PAYMENT_PROCESSING' || paymentState === 'VERIFYING' ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        sync
                      </span>
                      <span>Transmitting to Razorpay...</span>
                    </div>
                  ) : (
                    <>
                      <span className="font-semibold tracking-tight">
                        Pay {formatCurrency(total || 2799)}
                      </span>
                      <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                        arrow_forward
                      </span>
                    </>
                  )}
                </button>

                {/* Status Check / Webhook Feedback */}
                {(paymentState === 'VERIFYING' ||
                  paymentState === 'PAYMENT_PROCESSING' ||
                  statusCheckMessage) && (
                  <div
                    id="settlement-status"
                    className="p-space-16 rounded-lg bg-surface-container flex items-center gap-space-12 border border-outline-variant/30 animate-fadeIn"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
                    <div className="flex-1">
                      <div className="font-headline text-body-sm text-on-surface font-semibold">
                        {statusCheckMessage || 'Broadcasting Test Webhook...'}
                      </div>
                      <div className="font-mono text-label-sm text-on-surface-variant">
                        HMAC SHA-256 handshake in progress
                        {activeOrderId ? ` (${activeOrderId})` : ''}
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner if any */}
                {errorMessage && (
                  <div className="p-space-12 rounded-lg bg-error-container text-on-error-container font-mono text-label-sm flex items-center justify-between gap-2 border border-error/30">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">error</span>
                      <span>{errorMessage}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setErrorMessage(null)}
                      className="text-on-error-container hover:opacity-75"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* Razorpay Protocol Seals & Security */}
                <div className="pt-space-8 space-y-space-12">
                  <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-mono">
                    <div className="flex items-center gap-space-4">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      <span>Secure 256-bit TLS</span>
                    </div>
                    <span>PCI DSS v4.0 Level 1</span>
                  </div>
                  <p className="font-body text-[11px] leading-relaxed text-on-surface-variant">
                    ShopPilot will only mark the order as paid after payment confirmation webhook is cryptographically received and validated against the session HMAC.
                  </p>
                </div>

                {/* Bottom Session Status Marker */}
                <div className="pt-space-12 flex items-center justify-between text-on-surface-variant font-mono text-[11px] bg-surface-container px-space-12 py-space-6 rounded">
                  <div className="flex items-center gap-space-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Razorpay Merchant Session</span>
                  </div>
                  <span className="text-on-surface font-medium">200 OK • Validated</span>
                </div>
              </div>
            </div>

            {/* Phase 7 Test Scenario Simulation Controls Toolbar */}
            <div className="mt-4 p-4 rounded-xl bg-surface-container-high/60 border border-dashed border-outline-variant/60 font-mono text-[11px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-secondary">bug_report</span>
                  Phase 7 Reliability Simulator
                </span>
                <span className="text-[10px] text-on-surface-variant font-semibold bg-surface-container px-2 py-0.5 rounded">
                  TEST ONLY
                </span>
              </div>

              <p className="text-[11px] text-on-surface-variant font-body leading-tight">
                Simulate different edge cases to verify non-debit guarantees and authorization recovery:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleExecutePayment()}
                  className="px-2.5 py-1.5 rounded bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 transition-colors font-semibold text-center cursor-pointer"
                >
                  ✓ Success (Settled)
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('PAYMENT_FAILED')}
                  className="px-2.5 py-1.5 rounded bg-error/10 hover:bg-error/20 text-error border border-error/30 transition-colors font-semibold text-center cursor-pointer"
                >
                  ✗ Bank Reject
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('PAYMENT_CANCELLED')}
                  className="px-2.5 py-1.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-colors font-semibold text-center cursor-pointer"
                >
                  ⚠ User Cancel
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('TIMEOUT')}
                  className="px-2.5 py-1.5 rounded bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 transition-colors font-semibold text-center cursor-pointer"
                >
                  ⏱ Timeout Check
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('VERIFICATION_FAILED')}
                  className="px-2.5 py-1.5 rounded bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 transition-colors font-semibold text-center cursor-pointer"
                >
                  ⚿ Bad Hash Proof
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePayment('NETWORK_ERROR')}
                  className="px-2.5 py-1.5 rounded bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline-variant/40 transition-colors font-semibold text-center cursor-pointer"
                >
                  ⚡ Network Drop
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;
