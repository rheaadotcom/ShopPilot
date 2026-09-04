import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { primaryProduct, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import { useCart } from '../../features/cart';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  getPaymentConfig,
} from '../../services/paymentApi';

type PaymentState =
  | 'idle'
  | 'creating_order'
  | 'opening_gateway'
  | 'verifying'
  | 'settled'
  | 'failed';

type PaymentMethod = 'upi' | 'cards' | 'netbanking';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { authorization, items, total, subtotal, discount, appliedOffer } = useCart();
  const session = defaultAgentSession;
  const primaryItem = items.length > 0 ? items[0] : null;
  const product = primaryItem?.product || primaryProduct;

  // Selected payment tab
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');

  // VPA Address input
  const [vpaAddress, setVpaAddress] = useState<string>('success@razorpay');

  // Payment execution state
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

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
  // EXECUTE PAYMENT FLOW (Order Creation -> Gateway / Simulation -> Verification)
  // =========================================================================
  const handleExecutePayment = async (forceFailure: boolean = false) => {
    // Idempotency: Prevent duplicate submissions
    if (paymentState !== 'idle' && paymentState !== 'failed') {
      return;
    }

    setPaymentState('creating_order');
    setErrorMessage(null);

    try {
      // Step 1: Create Razorpay Order via Backend
      const order = await createRazorpayOrder({
        authorization,
        productId: product.id,
        quantity: 1,
      });

      setActiveOrderId(order.id);

      // If user simulated failure via profile
      if (forceFailure || vpaAddress === 'failure@razorpay') {
        setTimeout(() => {
          navigate('/payment/failure', {
            state: {
              reason: 'Issuing bank session expired • OTP not authenticated in window',
              code: 'BAD_REQUEST_ERROR',
              orderId: order.id,
              step: 'gateway_payment',
            },
          });
        }, 1000);
        return;
      }

      // Step 2: Check backend config and window.Razorpay availability
      const config = await getPaymentConfig().catch(() => ({
        simulated: true,
        keyId: order.keyId,
      }));

      // If Razorpay SDK is available and we have a valid key (not simulated sandbox)
      const canUseRealSdk =
        typeof window !== 'undefined' &&
        window.Razorpay &&
        !config.simulated &&
        !order.simulated &&
        order.keyId.startsWith('rzp_test_') &&
        !order.keyId.includes('sandbox');

      if (canUseRealSdk && window.Razorpay) {
        setPaymentState('opening_gateway');

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
            setPaymentState('verifying');
            try {
              const verifyResult = await verifyPaymentSignature({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });

              setPaymentState('settled');
              setTimeout(() => {
                navigate('/payment/success', {
                  state: {
                    payment: verifyResult,
                    product,
                    orderId: order.id,
                  },
                });
              }, 800);
            } catch (vErr: unknown) {
              navigate('/payment/failure', {
                state: {
                  reason: vErr instanceof Error ? vErr.message : 'Signature verification failed',
                  orderId: order.id,
                  paymentId: response.razorpay_payment_id,
                  step: 'backend_verification',
                },
              });
            }
          },
          modal: {
            ondismiss: () => {
              setPaymentState('idle');
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (failResp) => {
          navigate('/payment/failure', {
            state: {
              reason: failResp.error?.description || 'Payment rejected by payment gateway',
              code: failResp.error?.code,
              orderId: order.id,
              step: 'gateway_rejection',
            },
          });
        });
        rzp.open();
        return;
      }

      // Step 3: Stitch-Faithful Sandbox Gateway Terminal Simulation
      // Emulates the exact webhook & HMAC handshake modeled in the Stitch prototype
      setPaymentState('settled');

      setTimeout(async () => {
        try {
          const mockPaymentId = `pay_test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
          const mockSig = `sig_test_verified_${Math.random().toString(36).substring(2, 8)}`;

          const verifyResult = await verifyPaymentSignature({
            razorpay_payment_id: mockPaymentId,
            razorpay_order_id: order.id,
            razorpay_signature: mockSig,
          });

          setTimeout(() => {
            navigate('/payment/success', {
              state: {
                payment: verifyResult,
                product,
                orderId: order.id,
              },
            });
          }, 1000);
        } catch (verifyError: unknown) {
          navigate('/payment/failure', {
            state: {
              reason:
                verifyError instanceof Error
                  ? verifyError.message
                  : 'Backend HMAC verification failed',
              orderId: order.id,
              step: 'signature_verification',
            },
          });
        }
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to initialize payment order';
      setErrorMessage(msg);
      setPaymentState('failed');
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
                <span className="font-mono text-label-sm px-space-8 py-space-2 rounded bg-surface-container-high text-on-surface-variant font-medium">
                  Test Stage
                </span>
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

              {/* Active Form Body: UPI Mock Engine */}
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

                {/* Primary Execute CTA */}
                <button
                  id="pay-btn"
                  type="button"
                  disabled={paymentState !== 'idle' && paymentState !== 'failed'}
                  onClick={() => handleExecutePayment(false)}
                  className="w-full h-12 bg-primary text-on-primary font-headline text-body-lg rounded-lg flex items-center justify-center gap-space-8 hover:bg-primary/90 active:scale-[0.99] transition-all shadow-md group cursor-pointer disabled:opacity-60"
                >
                  {paymentState === 'creating_order' ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        autorenew
                      </span>
                      <span>Creating Razorpay Order...</span>
                    </div>
                  ) : paymentState === 'opening_gateway' ? (
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-[20px]">
                        lock_clock
                      </span>
                      <span>Awaiting Razorpay Checkout...</span>
                    </div>
                  ) : paymentState === 'verifying' || paymentState === 'settled' ? (
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

                {/* Inline Verification State Feedback (Stitch element #settlement-status) */}
                {(paymentState === 'verifying' || paymentState === 'settled') && (
                  <div
                    id="settlement-status"
                    className="p-space-16 rounded-lg bg-surface-container flex items-center gap-space-12 border border-outline-variant/30 animate-fadeIn"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping" />
                    <div className="flex-1">
                      <div className="font-headline text-body-sm text-on-surface font-semibold">
                        Broadcasting Test Webhook...
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
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CheckoutPage;
