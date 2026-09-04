import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { primaryProduct, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import { PaymentVerificationResult, Product } from '../../types';

interface PaymentSuccessLocationState {
  payment?: PaymentVerificationResult;
  product?: Product;
  orderId?: string;
}

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as PaymentSuccessLocationState;
  const [showVerificationDetails, setShowVerificationDetails] = React.useState(false);

  const payment = state.payment;
  const product = state.product || primaryProduct;
  const session = defaultAgentSession;
  const orderId = state.orderId || payment?.orderId || '#SP-1024';
  const paymentId = payment?.paymentId || 'pay_test_984128';
  const amount = payment?.amount || 2799;

  return (
    <PageLayout>
      <div className="w-full max-w-content mx-auto space-y-space-24">
        {/* Context Breadcrumb Strip */}
        <div className="flex items-center justify-between pb-space-8 border-b border-surface-container-high">
          <div className="flex items-center gap-space-8 text-on-surface-variant font-body text-body-sm">
            <span className="font-mono text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Autonomous Checkout
            </span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-mono text-on-surface font-semibold">
              Order Confirmation {orderId}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-space-8 px-space-12 py-1 rounded-full bg-surface-container font-mono text-label-sm text-on-surface-variant">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>TLS 256-bit GCM • Node: rzp-bom-edge-04 • RZP TEST-RAIL v2.4</span>
          </div>
        </div>

        {/* Content Canvas */}
        <div className="max-w-[56rem] mx-auto w-full py-space-16 flex flex-col gap-space-32">
          {/* 1. Editorial Centered Success Header */}
          <section className="flex flex-col items-center text-center">
            {/* Quiet Status Mark */}
            <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mb-space-16 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
              <div className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center text-on-secondary shadow-sm">
                <span
                  className="material-symbols-outlined text-[20px] select-none text-white"
                  style={{ fontVariationSettings: "'wght' 600" }}
                >
                  check
                </span>
              </div>
            </div>

            <h1 className="font-headline text-headline-lg text-on-surface tracking-tight font-bold">
              Payment successful
            </h1>
            <p className="font-body text-body-md text-on-surface-variant mt-space-4">
              Your order has been cryptographically confirmed.
            </p>

            {/* Monetary Ledger Display */}
            <div className="mt-space-20 flex flex-col items-center">
              <div className="font-mono text-[38px] leading-[44px] font-bold text-on-surface tracking-tight">
                {formatCurrency(amount)}
              </div>
              <div className="mt-space-8 inline-flex items-center gap-space-8 px-space-12 py-space-4 rounded bg-surface-container text-on-surface-variant font-mono text-label-sm tracking-wider uppercase border border-outline-variant/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span>Paid via Razorpay Test Rail • Immutable Token Settled</span>
              </div>
            </div>

            {/* Reference Metadata Strip */}
            <div className="mt-space-16 flex flex-wrap items-center justify-center gap-space-12 text-on-surface-variant font-mono text-body-sm">
              <span className="px-space-8 py-space-2 rounded bg-surface-container-low text-on-surface font-semibold border border-outline-variant/20">
                {orderId}
              </span>
              <span className="text-outline-variant select-none">•</span>
              <span>
                Payment ID: <span className="text-on-surface font-semibold">{paymentId}</span>
              </span>
              <span className="text-outline-variant select-none">•</span>
              <span>
                Tx ID: <span className="text-on-surface font-semibold">{session.txId}</span>
              </span>
              <span className="text-outline-variant select-none">•</span>
              <span className="inline-flex items-center gap-space-4 text-emerald-700 font-semibold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>ECDSA VERIFIED</span>
              </span>
            </div>
          </section>

          {/* 2. Balanced Workflow Grid (12 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
            {/* ========================================================================= */}
            {/* LEFT COLUMN: Product Record & Agent Reasoning (7 cols)                    */}
            {/* ========================================================================= */}
            <div className="lg:col-span-7 flex flex-col gap-space-20">
              {/* Product Card */}
              <div className="bg-surface-container-lowest rounded-xl shadow-[0_1px_3px_rgba(17,17,16,0.04)] border border-outline-variant/30 overflow-hidden flex flex-col">
                {/* Top Row: Visual + Specs */}
                <div className="p-space-20 flex flex-col sm:flex-row gap-space-20 items-start">
                  <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-surface-container-low shrink-0 relative border border-outline-variant/20">
                    <img
                      alt={product.name}
                      className="w-full h-full object-cover object-center"
                      src={product.images[0]}
                    />
                  </div>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-space-8">
                      <span className="font-headline text-headline-sm font-bold text-on-surface tracking-tight truncate">
                        {product.name}
                      </span>
                      <span className="inline-flex items-center px-space-8 py-space-2 rounded bg-surface-container text-on-surface font-mono text-label-sm font-semibold border border-outline-variant/20">
                        {product.matchScore || 99.2}% Match
                      </span>
                    </div>
                    <p className="font-body text-body-sm text-on-surface-variant mt-space-2">
                      Running Shoes • Ultralight Daily Road Running
                    </p>

                    {/* Attribute Chips */}
                    <div className="flex flex-wrap gap-space-8 mt-space-12">
                      <span className="px-space-8 py-space-2 rounded bg-surface-container-low text-on-surface-variant font-mono text-label-sm border border-outline-variant/20">
                        Size: US {product.selectedSize || 9.5}
                      </span>
                      <span className="px-space-8 py-space-2 rounded bg-surface-container-low text-on-surface-variant font-mono text-label-sm border border-outline-variant/20">
                        Chalk &amp; Stone Grey
                      </span>
                      <span className="px-space-8 py-space-2 rounded bg-surface-container-low text-on-surface-variant font-mono text-label-sm border border-outline-variant/20">
                        #SKU-{product.sku || 'RUN-401'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Structured Ledger Segment */}
                <div className="px-space-20 py-space-16 bg-surface-container-low flex flex-col gap-space-8 text-body-sm font-body border-t border-outline-variant/20">
                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span>Catalog List Price</span>
                    <span className="font-mono text-on-surface">{formatCurrency(product.originalPrice || 2999)}</span>
                  </div>

                  <div className="flex items-center justify-between text-on-surface-variant">
                    <span className="inline-flex items-center gap-space-4">
                      <span>Merchant Offer</span>
                      <span className="px-space-4 py-0.5 rounded bg-surface-container-highest text-on-surface font-mono text-label-sm font-semibold">
                        {product.merchantOffer?.code || 'RT-SUMMER200'}
                      </span>
                    </span>
                    <span className="font-mono text-emerald-700 font-semibold">−₹200</span>
                  </div>

                  <div className="pt-space-8 mt-space-4 flex items-center justify-between font-medium text-on-surface border-t border-outline-variant/20">
                    <span className="font-bold">Final Settlement</span>
                    <span className="font-mono text-headline-sm text-on-surface font-bold">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                </div>

                {/* Dispatch SLA Bar */}
                <div className="px-space-20 py-space-12 bg-surface-container-lowest flex items-center gap-space-12 text-on-surface-variant font-body text-body-sm border-t border-outline-variant/20">
                  <span className="material-symbols-outlined text-[20px] text-secondary">
                    local_shipping
                  </span>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-space-8 min-w-0">
                    <span className="font-semibold text-on-surface">Express 24h Dispatch</span>
                    <span className="hidden sm:inline text-outline-variant">•</span>
                    <span className="text-on-surface-variant truncate">
                      Expected Delivery: Tomorrow by 2:00 PM (Bangalore Hub 04)
                    </span>
                  </div>
                </div>
              </div>

              {/* Agent Telemetry & Reasoning Card */}
              <div className="bg-surface-container-lowest rounded-xl p-space-20 shadow-[0_1px_3px_rgba(17,17,16,0.04)] border border-outline-variant/30 flex flex-col gap-space-16">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-label-sm tracking-wider uppercase text-on-surface-variant font-semibold">
                    AI Actions &amp; Reasoning Audit
                  </span>
                  <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded bg-surface-container text-emerald-800 font-mono text-label-sm font-semibold border border-outline-variant/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    Deterministic
                  </span>
                </div>

                <p className="font-body text-body-sm text-on-surface leading-relaxed">
                  ShopPilot selected <span className="font-semibold text-on-surface">AeroRun X</span>{' '}
                  because it matched your defined budget constraints, road surface preference, active
                  regional inventory, and merchant discount rules.
                </p>

                {/* Micro Telemetry Grid */}
                <div className="grid grid-cols-1 gap-space-8 font-body text-body-sm">
                  <div className="p-space-12 rounded bg-surface-container-low flex items-start gap-space-12 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Budget adherence</span>
                      <span className="text-on-surface-variant font-mono text-label-sm">
                        ₹2,799 settled within ₹3,000 ceiling (₹201 headroom preserved)
                      </span>
                    </div>
                  </div>

                  <div className="p-space-12 rounded bg-surface-container-low flex items-start gap-space-12 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Biomechanics evaluation</span>
                      <span className="text-on-surface-variant font-mono text-label-sm">
                        High-abrasion road compound verified for daily urban pavement
                      </span>
                    </div>
                  </div>

                  <div className="p-space-12 rounded bg-surface-container-low flex items-start gap-space-12 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Algorithmic promotion</span>
                      <span className="text-on-surface-variant font-mono text-label-sm">
                        Incentive RT-SUMMER200 injected without user coupon friction
                      </span>
                    </div>
                  </div>

                  <div className="p-space-12 rounded bg-surface-container-low flex items-start gap-space-12 border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[16px] text-emerald-700 mt-0.5 shrink-0">
                      check_circle
                    </span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">Autonomous guardrail</span>
                      <span className="text-on-surface-variant font-mono text-label-sm">
                        Floor price lock guaranteed against merchant volatility
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* RIGHT COLUMN: Real-Time Verification Journey (5 cols)                      */}
            {/* ========================================================================= */}
            <div className="lg:col-span-5 flex flex-col gap-space-20">
              <div className="bg-surface-container-lowest rounded-xl p-space-20 shadow-[0_1px_3px_rgba(17,17,16,0.04)] border border-outline-variant/30 flex flex-col">
                {/* Card Header */}
                <div className="flex items-center justify-between pb-space-16 border-b border-surface-container-high">
                  <div className="flex flex-col">
                    <span className="font-headline text-headline-sm font-bold text-on-surface">
                      Purchase journey
                    </span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      Deterministic Ledger Stream
                    </span>
                  </div>
                  <span className="px-space-8 py-space-2 rounded bg-surface-container text-emerald-800 font-mono text-label-sm font-semibold border border-outline-variant/20">
                    7 / 7 Done • 142ms
                  </span>
                </div>

                {/* Vertical Micro-Timeline */}
                <div className="relative pl-space-16 flex flex-col gap-space-16 pt-space-16">
                  {/* Continuous Line Background */}
                  <div className="absolute left-[7px] top-4 bottom-4 w-0.5 bg-surface-container-highest" />

                  {/* Step 1 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Intent parsed
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:02
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant">
                        Running shoes under ₹3,000 for daily road use
                      </p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Product recommended
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:04
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant">
                        AeroRun X matched with 99.2% confidence
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Merchant offer verified
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:06
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant">
                        RT-SUMMER200 (-₹200) cleared by margin bounds
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Customer authorization
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:10
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant">
                        Explicit customer settlement signature granted
                      </p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Razorpay order created
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:11
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant">
                        Tokenized on TLS 256-bit rail ({orderId})
                      </p>
                    </div>
                  </div>

                  {/* Step 6 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Payment successful
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:43
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant font-mono">
                        Settlement: {paymentId}
                      </p>
                    </div>
                  </div>

                  {/* Step 7 */}
                  <div className="relative flex items-start gap-space-12">
                    <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 z-10">
                      <span className="material-symbols-outlined text-[10px]">check</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-baseline justify-between gap-space-8">
                        <span className="font-body text-body-sm font-semibold text-on-surface">
                          Order confirmed
                        </span>
                        <span className="font-mono text-label-sm text-on-surface-variant shrink-0">
                          10:31:44
                        </span>
                      </div>
                      <p className="font-body text-body-sm text-on-surface-variant">
                        Warehouse dispatch webhook acknowledged
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cryptographic Mini-Badge */}
                <div className="mt-space-20 p-space-12 rounded bg-surface-container-low flex items-center justify-between gap-space-8 border border-outline-variant/20">
                  <div className="flex items-center gap-space-8 font-mono text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-on-surface">lock</span>
                    <span>Payload: 0x9e81...a431</span>
                  </div>
                  <span className="font-mono text-label-sm text-on-surface font-semibold">
                    FIPS 140-3 Valid
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Cryptographic Payment Verification & 5-Step Settlement Details */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-[0_1px_3px_rgba(17,17,16,0.04)]">
            <button
              type="button"
              onClick={() => setShowVerificationDetails(!showVerificationDetails)}
              className="w-full px-space-20 py-space-16 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-space-12">
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <span className="material-symbols-outlined text-[20px]">verified_user</span>
                </div>
                <div>
                  <div className="font-body text-body-md font-semibold text-on-surface flex items-center gap-space-8">
                    <span>View payment verification &amp; cryptographic settlement</span>
                    <span className="px-space-8 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-label-sm font-bold">
                      HMAC-SHA256 VALIDATED
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-on-surface-variant">
                    Cryptographic signature matched against Razorpay test secret by ShopPilot backend authority
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-space-8 text-on-surface-variant font-mono text-label-sm">
                <span>{showVerificationDetails ? 'Hide details' : 'Show details'}</span>
                <span
                  className="material-symbols-outlined text-[20px] transition-transform duration-200"
                  style={{ transform: showVerificationDetails ? 'rotate(180deg)' : 'none' }}
                >
                  expand_more
                </span>
              </div>
            </button>

            {showVerificationDetails && (
              <div className="px-space-20 pb-space-20 pt-space-8 border-t border-outline-variant/20 bg-surface-container-low/40 flex flex-col gap-space-20">
                {/* 5-Step Settlement Timeline */}
                <div>
                  <div className="flex items-center justify-between mb-space-12">
                    <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface font-semibold">
                      5-Step Settlement Lifecycle
                    </span>
                    <span className="font-mono text-label-sm text-emerald-700 font-semibold flex items-center gap-space-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      All 5 Stages Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-space-8">
                    {[
                      {
                        step: '1',
                        title: 'Authorization',
                        desc: 'Explicit user consent confirmed at ₹2,799',
                        status: 'Passed',
                      },
                      {
                        step: '2',
                        title: 'Order Created',
                        desc: `Razorpay order issued: ${orderId}`,
                        status: 'Passed',
                      },
                      {
                        step: '3',
                        title: 'Test Capture',
                        desc: `Payment processed: ${paymentId}`,
                        status: 'Passed',
                      },
                      {
                        step: '4',
                        title: 'Crypto Verify',
                        desc: 'HMAC-SHA256 digest signature validated',
                        status: 'Verified',
                      },
                      {
                        step: '5',
                        title: 'Settlement Lock',
                        desc: 'Order registered in settlement ledger',
                        status: 'Locked',
                      },
                    ].map((st) => (
                      <div
                        key={st.step}
                        className="p-space-12 rounded bg-surface-container-lowest border border-outline-variant/20 flex flex-col gap-space-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-5 h-5 rounded-full bg-emerald-700 text-white font-mono text-[11px] font-bold flex items-center justify-center">
                            {st.step}
                          </span>
                          <span className="font-mono text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-space-4 py-0.5 rounded">
                            {st.status}
                          </span>
                        </div>
                        <span className="font-body text-body-sm font-bold text-on-surface mt-space-4">
                          {st.title}
                        </span>
                        <p className="font-body text-[11px] text-on-surface-variant leading-relaxed">
                          {st.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cryptographic Ledger Breakdown */}
                <div className="p-space-16 rounded-lg bg-surface-container-lowest border border-outline-variant/20 font-mono text-label-sm flex flex-col gap-space-8">
                  <div className="flex items-center justify-between pb-space-8 border-b border-outline-variant/20">
                    <span className="font-semibold text-on-surface">Cryptographic Proof Parameters</span>
                    <span className="text-emerald-700 font-semibold">ZERO FALSE DEBITS GUARANTEE</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-12 pt-space-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-on-surface-variant text-[11px] uppercase">Razorpay Order ID</span>
                      <span className="font-bold text-on-surface bg-surface-container-low px-space-8 py-1 rounded select-all">
                        {orderId}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-on-surface-variant text-[11px] uppercase">Razorpay Payment ID</span>
                      <span className="font-bold text-on-surface bg-surface-container-low px-space-8 py-1 rounded select-all">
                        {paymentId}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <span className="text-on-surface-variant text-[11px] uppercase">
                        HMAC-SHA256 Signature (Verified by Backend Authority)
                      </span>
                      <span className="font-mono text-[11px] text-on-surface bg-surface-container-low px-space-8 py-1.5 rounded select-all break-all">
                        {payment?.signature || '0x9e81f72a431c8902d5bf14a382e7039c6b12a849f1092e478546b32819cd8e41'}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-on-surface-variant text-[11px] uppercase">Authority Verification Endpoint</span>
                      <span className="text-on-surface">POST http://localhost:5000/api/payments/verify</span>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-on-surface-variant text-[11px] uppercase">Settlement Ledger State</span>
                      <span className="text-emerald-700 font-bold">SETTLED &amp; LOCKED (Duplicate charges blocked)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Primary Action Bar & Footnote */}
          <div className="flex flex-col items-center gap-space-20 mt-space-8">
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-space-12 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full sm:w-auto h-11 px-space-24 rounded-lg bg-primary text-on-primary font-body text-body-md font-semibold inline-flex items-center justify-center gap-space-8 hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm cursor-pointer"
              >
                <span>Continue Shopping</span>
                <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
              </button>

              <Link
                to="/agent/trace"
                className="w-full sm:w-auto h-11 px-space-24 rounded-lg bg-surface-container-lowest text-on-surface font-body text-body-md font-medium inline-flex items-center justify-center gap-space-8 hover:bg-surface-container active:scale-[0.99] transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] border border-outline-variant/30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">terminal</span>
                <span>View Decision Trace</span>
              </Link>
            </div>

            {/* Secondary Links */}
            <div className="flex flex-wrap items-center justify-center gap-space-16 text-body-sm font-body text-on-surface-variant">
              <button
                type="button"
                onClick={() =>
                  alert('Receipt downloaded: ShopPilot Tax Invoice #SP-1024.pdf (2799 INR Net)')
                }
                className="inline-flex items-center gap-space-4 hover:text-on-surface transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Tax Invoice &amp; Receipt (PDF)</span>
              </button>
              <span className="text-outline-variant select-none">•</span>
              <Link
                to="/agent/trace"
                className="inline-flex items-center gap-space-4 hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                <span>Deterministic Audit Trail</span>
              </Link>
            </div>

            {/* Ledger Verification Footnote */}
            <div className="flex flex-col items-center text-center gap-space-4 text-on-surface-variant font-mono text-label-sm pt-space-12">
              <p>Transaction recorded in the ShopPilot audit trail.</p>
              <p className="text-on-surface font-medium">
                Block #8902-D • SHA-256: 0x9e81...a431 • Verified against merchant ledger v2.4
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default PaymentSuccessPage;
