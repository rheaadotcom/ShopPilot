import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { primaryProduct, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import { useCart } from '../../features/cart';

interface PaymentFailureLocationState {
  reason?: string;
  code?: string;
  orderId?: string;
  paymentId?: string;
  step?: string;
}

export const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { total, subtotal, discount, appliedOffer } = useCart();
  const state = (location.state || {}) as PaymentFailureLocationState;

  const product = primaryProduct;
  const session = defaultAgentSession;
  const orderId = state.orderId || session.sessionId;
  const failureReason =
    state.reason || 'Issuing bank session expired • OTP not authenticated in window';

  // Live countdown timer for inventory hold: 12m 38s = 758s
  const [secondsLeft, setSecondsLeft] = useState<number>(758);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <PageLayout>
      <div className="w-full max-w-content mx-auto space-y-space-24">
        {/* Telemetry Sub-Header / Breadcrumb Strip */}
        <section className="w-full bg-surface-container-low/80 py-space-12 px-space-16 rounded-xl shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-space-12">
            <div className="flex items-center gap-space-8 text-on-surface-variant font-mono text-body-sm">
              <button
                type="button"
                onClick={() => navigate('/confirm')}
                className="hover:text-on-surface flex items-center gap-space-4 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm leading-none">arrow_back</span>
                <span>Cart</span>
              </button>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-medium">Session {orderId}</span>
            </div>

            <div className="flex flex-wrap items-center gap-space-8">
              <div className="inline-flex items-center gap-space-8 px-space-8 py-space-2 rounded-full bg-surface-container text-on-surface-variant font-mono text-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span>TEST MODE — NO REAL CURRENCY DEBITED</span>
              </div>
              <div className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded-full bg-surface-container-highest text-on-surface font-mono text-label-sm border border-error/20">
                <span className="material-symbols-outlined text-[13px] text-error">info</span>
                <span className="text-error font-medium">Status: 402 Settlement Incomplete</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Workstation Layout (12 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 lg:gap-space-32 items-start">
          {/* ========================================================================= */}
          {/* Primary Resolution Column (8 Cols)                                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 flex flex-col gap-space-24">
            {/* Primary Calm Reassurance Banner Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-24 lg:p-space-32 shadow-sm border border-outline-variant/30 relative overflow-hidden">
              <div className="flex items-start gap-space-16">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0 text-secondary">
                  <span className="material-symbols-outlined text-[22px]">error_outline</span>
                </div>

                <div className="flex flex-col gap-space-8 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-space-8">
                    <span className="font-mono text-label-sm uppercase tracking-wider text-secondary px-space-8 py-space-2 rounded bg-surface-container-low font-semibold">
                      Notice of Incompletion
                    </span>
                    <span className="text-outline-variant font-mono text-label-sm">•</span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      Trace SP-8902-REV
                    </span>
                  </div>

                  <h1 className="font-headline text-headline-lg font-bold text-on-surface">
                    Payment couldn't be completed
                  </h1>

                  <p className="font-body text-body-lg text-on-surface font-bold">
                    No money has been charged.
                  </p>

                  <p className="font-body text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                    Your bank account and saved cards were not debited. The reserved inventory holds for
                    your order, and your checkout session state is securely preserved.
                  </p>
                </div>
              </div>
            </div>

            {/* ShopPilot AI Agent Reassurance Card */}
            <div className="bg-surface-container-low rounded-xl p-space-20 lg:p-space-24 flex flex-col gap-space-16 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-12">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm text-on-primary">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-8">
                      <span className="font-headline text-headline-sm font-bold text-on-surface">
                        ShopPilot Concierge
                      </span>
                      <span className="px-space-8 py-space-2 rounded-full bg-surface-container text-emerald-800 font-mono text-label-sm font-semibold border border-outline-variant/20">
                        Safe State Active
                      </span>
                    </div>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      Autonomous Guard v3.4.1
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-emerald-700">verified_user</span>
              </div>

              <div className="bg-surface-container-lowest rounded-lg p-space-16 flex flex-col gap-space-8 shadow-sm border border-outline-variant/20">
                <p className="font-body text-body-md text-on-surface font-medium leading-normal italic">
                  “Don't worry — the order is still safe. I haven't recorded the purchase as complete.”
                </p>
                <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                  ShopPilot detected that the payment attempt did not complete. Your order has not been
                  marked as paid, and zero settlement records were written to ledger balance. Your items
                  and promotional prices are locked in this instance.
                </p>
              </div>
            </div>

            {/* Transparent "What Happened" Audit Sequence Flow */}
            <div className="bg-surface-container-lowest rounded-xl p-space-24 shadow-sm border border-outline-variant/30 flex flex-col gap-space-20">
              <div className="flex flex-col gap-space-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                    Execution Audit Trail
                  </h2>
                  <span className="font-mono text-label-sm text-on-surface-variant">
                    Deterministic Sequence
                  </span>
                </div>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Cryptographically signed inspection of the aborted checkout session.
                </p>
              </div>

              {/* Vertical Timeline Steps */}
              <div className="relative flex flex-col gap-space-20 pl-space-12 ml-space-8">
                {/* Timeline connector line */}
                <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-surface-container-highest" />

                {/* Step 1 */}
                <div className="relative flex items-start gap-space-16">
                  <div className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center -ml-[25px] ring-4 ring-surface-container-lowest text-emerald-700 border border-emerald-600/30">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between flex-1 gap-space-4">
                    <div className="flex flex-col">
                      <span className="font-body text-body-md text-on-surface font-semibold">
                        1. Intent &amp; Ledger Allocation
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        Cart state verified, discount token locked
                      </span>
                    </div>
                    <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                      10:31:10 UTC
                    </span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative flex items-start gap-space-16">
                  <div className="w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center -ml-[25px] ring-4 ring-surface-container-lowest text-emerald-700 border border-emerald-600/30">
                    <span className="material-symbols-outlined text-[15px]">check</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between flex-1 gap-space-4">
                    <div className="flex flex-col">
                      <span className="font-body text-body-md text-on-surface font-semibold">
                        2. Gateway Dispatch
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        Routed to Razorpay Gateway / Core Settlement Pipe
                      </span>
                    </div>
                    <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                      10:31:12 UTC
                    </span>
                  </div>
                </div>

                {/* Step 3: Failure Point */}
                <div className="relative flex items-start gap-space-16">
                  <div className="w-6 h-6 rounded-full bg-error-container text-error flex items-center justify-center -ml-[25px] ring-4 ring-surface-container-lowest border border-error/30">
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between flex-1 gap-space-4">
                    <div className="flex flex-col">
                      <span className="font-body text-body-md font-bold text-error">
                        3. Upstream Provider Interruption
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        {failureReason}
                      </span>
                    </div>
                    <span className="font-mono text-label-sm text-error font-semibold shrink-0">
                      10:31:42 UTC
                    </span>
                  </div>
                </div>

                {/* Step 4: Reversible Safe Lock */}
                <div className="relative flex items-start gap-space-16">
                  <div className="w-6 h-6 rounded-full bg-surface-container text-secondary flex items-center justify-center -ml-[25px] ring-4 ring-surface-container-lowest border border-secondary/30">
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between flex-1 gap-space-4">
                    <div className="flex flex-col">
                      <span className="font-body text-body-md text-on-surface font-semibold">
                        4. Non-Debit Ledger Lock Verified
                      </span>
                      <span className="font-body text-body-sm text-on-surface-variant">
                        Zero funds transferred. Reserved cart stored for instant re-execution.
                      </span>
                    </div>
                    <span className="font-mono text-label-sm text-secondary font-semibold shrink-0">
                      Current State
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable "Your Options" Section */}
            <div className="bg-surface-container-lowest rounded-xl p-space-24 shadow-sm border border-outline-variant/30 flex flex-col gap-space-20">
              <div className="flex flex-col gap-space-4">
                <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                  Available Recovery Actions
                </h2>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Select an execution route. Your inventory reservation expires in{' '}
                  <span className="font-mono text-on-surface font-bold" id="countdown">
                    {formatCountdown(secondsLeft)}
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-12">
                {/* Retry Same Method */}
                <button
                  id="retry-btn"
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="flex-1 inline-flex items-center justify-center gap-space-8 bg-primary text-on-primary hover:bg-primary/90 font-body text-body-md font-semibold px-space-24 py-space-12 rounded-lg transition-all active:scale-[0.99] shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                  <span>Try payment again</span>
                </button>

                {/* Choose Another Payment Method */}
                <button
                  id="alt-method-btn"
                  type="button"
                  onClick={() => navigate('/checkout')}
                  className="flex-1 inline-flex items-center justify-center gap-space-8 bg-surface-container text-on-surface hover:bg-surface-container-high font-body text-body-md font-medium px-space-20 py-space-12 rounded-lg transition-all active:scale-[0.99] border border-outline-variant/30 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">credit_card</span>
                  <span>Choose another payment method</span>
                </button>
              </div>

              {/* Secondary Links / Options Strip */}
              <div className="flex flex-wrap items-center justify-between pt-space-12 gap-space-16 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => navigate('/confirm')}
                  className="inline-flex items-center gap-space-4 text-on-surface-variant hover:text-on-surface font-body text-body-sm transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">shopping_cart</span>
                  <span>Return to confirmation to adjust items</span>
                </button>

                <div className="flex items-center gap-space-16 text-on-surface-variant font-body text-body-sm">
                  <Link to="/agent/trace" className="hover:text-on-surface transition-colors">
                    Audit Decision Trace
                  </Link>
                  <span className="text-outline-variant">•</span>
                  <span className="hover:text-on-surface transition-colors cursor-pointer">
                    Bank Support Rails
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* Telemetry & Ledger Summary Sidebar (4 Cols)                                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-space-24">
            {/* Order Context & Item Summary Card */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 lg:p-space-24 shadow-sm border border-outline-variant/30 flex flex-col gap-space-20">
              <div className="flex items-center justify-between pb-space-12 border-b border-surface-container-high">
                <div className="flex flex-col">
                  <span className="font-mono text-label-sm text-on-surface-variant">Ledger Order</span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    {orderId}
                  </span>
                </div>
                <span className="px-space-8 py-space-4 rounded bg-amber-100 text-amber-900 border border-amber-300 font-mono text-label-sm font-semibold">
                  Reserved Hold
                </span>
              </div>

              {/* Product Item Card */}
              <div className="flex items-center gap-space-16 bg-surface-container-low p-space-12 rounded-lg border border-outline-variant/20">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-surface-container shrink-0 border border-outline-variant/20">
                  <img
                    alt={product.name}
                    className="w-full h-full object-cover"
                    src={product.images[0]}
                  />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-headline text-body-md font-bold text-on-surface truncate">
                    {product.name}
                  </span>
                  <span className="font-body text-body-sm text-on-surface-variant truncate">
                    Daily Road Running Shoes
                  </span>
                  <div className="flex items-center gap-space-8 mt-space-4 font-mono text-label-sm text-on-surface-variant">
                    <span>Size: US {product.selectedSize || 9.5}</span>
                    <span className="text-outline-variant">•</span>
                    <span>Qty: 01</span>
                  </div>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="flex flex-col gap-space-8 text-body-sm font-body">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Item Subtotal</span>
                  <span className="font-mono text-on-surface">{formatCurrency(subtotal || 2999)}</span>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant">
                  <div className="flex items-center gap-space-4">
                    <span>Autonomous Promo</span>
                    <span className="font-mono text-[10px] uppercase bg-surface-container px-space-4 py-space-2 rounded text-secondary font-semibold">
                      {appliedOffer?.code || 'RT-SUMMER200'}
                    </span>
                  </div>
                  <span className="font-mono text-emerald-700 font-semibold">
                    −{formatCurrency(discount || 200)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Autonomous Express Delivery</span>
                  <span className="font-mono text-emerald-700 font-medium">Free</span>
                </div>

                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Applicable GST (18% incl.)</span>
                  <span className="font-mono text-on-surface">Included</span>
                </div>

                {/* Terminal Row */}
                <div className="pt-space-12 mt-space-8 flex items-baseline justify-between border-t border-surface-container-high">
                  <div className="flex flex-col">
                    <span className="font-headline text-body-md font-bold text-on-surface">
                      Settlement Total
                    </span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      Pending user retry
                    </span>
                  </div>
                  <span className="font-mono text-headline-md text-on-surface font-bold">
                    {formatCurrency(total || 2799)}
                  </span>
                </div>
              </div>

              {/* Promotion Price Guarantee Pin */}
              <div className="bg-surface-container-low rounded-lg p-space-12 flex items-start gap-space-12 border border-outline-variant/20">
                <span className="material-symbols-outlined text-secondary text-[18px] mt-0.5">
                  lock_clock
                </span>
                <div className="flex flex-col text-label-sm">
                  <span className="font-semibold text-on-surface">
                    Promotion &amp; Price Guarantee Locked
                  </span>
                  <p className="text-on-surface-variant text-[11px] leading-relaxed mt-0.5">
                    The merchant discount of ₹200.00 ({appliedOffer?.code || 'RT-SUMMER200'}) and your
                    size allocation remain strictly reserved for the duration of this recovery session.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PaymentFailurePage;
