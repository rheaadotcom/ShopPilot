import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { TestModeBanner } from '../../components/payment/TestModeBanner';
import { formatCurrency } from '../../lib/utils';
import { useCart } from '../../features/cart';

export const ConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    appliedOffer,
    customerIntent,
    subtotal,
    discount,
    shipping,
    tax,
    total,
    authorizePurchase,
    clearCart,
    resetDefaultCart,
  } = useCart();

  // State for collapsible Rationale / Trace Drawer
  const [showTrace, setShowTrace] = useState<boolean>(false);

  // State for Confirmation Dialog / Authorization Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [authComplete, setAuthComplete] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live price lock countdown timer (starts at 14:48 = 888 seconds)
  const [secondsLeft, setSecondsLeft] = useState<number>(888);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    if (seconds <= 0) return '00:00 EXPIRED';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Primary product from cart
  const primaryItem = items.length > 0 ? items[0] : null;
  const product = primaryItem?.product;

  // Handle explicit human authorization
  const handleAuthorizeAndProceed = () => {
    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Cannot authorize purchase.');
      return;
    }

    if (total !== 2799) {
      console.warn(`Total is ${total}, expected 2799 for MVP flow`);
    }

    setIsAuthorizing(true);
    setErrorMessage(null);

    // Simulate sealing ledger block and record frontend mock authorization
    setTimeout(() => {
      try {
        authorizePurchase();
        setAuthComplete(true);
        setTimeout(() => {
          setIsModalOpen(false);
          navigate('/checkout');
        }, 800);
      } catch (err: unknown) {
        setIsAuthorizing(false);
        setErrorMessage(err instanceof Error ? err.message : 'Authorization failed');
      }
    }, 1000);
  };

  // =========================================================================
  // EMPTY CART STATE
  // =========================================================================
  if (!primaryItem || !product || items.length === 0) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-space-48">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-32 text-center shadow-L1">
            <div className="w-16 h-16 mx-auto mb-space-20 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center">
              <span className="material-symbols-outlined text-[32px]">remove_shopping_cart</span>
            </div>

            <span className="font-mono text-label-sm uppercase px-2.5 py-1 rounded bg-surface-container text-on-surface-variant font-semibold">
              Cart Status: Empty
            </span>

            <h1 className="font-headline text-headline-md font-bold text-on-surface mt-space-12 mb-space-8">
              Your cart is empty
            </h1>

            <p className="font-body text-body-md text-on-surface-variant max-w-md mx-auto mb-space-24 leading-relaxed">
              No active purchase intent or product is currently queued for confirmation. ShopPilot requires an explicit item in your cart before constructing the deterministic authorization ledger.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-space-12">
              <Link
                to="/"
                className="w-full sm:w-auto px-space-24 py-space-12 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-body text-body-md font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                Back to ShopPilot
              </Link>

              <button
                type="button"
                onClick={resetDefaultCart}
                className="w-full sm:w-auto px-space-20 py-space-12 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-body-md font-medium transition-colors"
              >
                Load Demo Cart (AeroRun X)
              </button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  // =========================================================================
  // MAIN CONFIRMATION SCREEN (Stitch 100% Fidelity)
  // =========================================================================
  return (
    <PageLayout>
      <div className="w-full max-w-content mx-auto space-y-space-24">
        {/* Test Mode Banner */}
        <TestModeBanner
          sessionId="#SP-1024-AUTH"
          nodeId="NODE BLR-04"
          rail="RZP TEST-RAIL v2.4"
        />

        {/* Sub-header / Context Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-space-12 pb-space-16 border-b border-surface-container-highest">
          <div className="flex items-center gap-space-12">
            <button
              type="button"
              onClick={() => navigate(`/recommendation/${product.id}`)}
              className="inline-flex items-center gap-space-8 text-on-surface-variant hover:text-on-surface font-body text-body-sm transition-colors group"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
                arrow_back
              </span>
              <span>Back to Cart</span>
            </button>
            <span className="text-outline-variant font-mono text-label-sm">/</span>
            <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider font-medium">
              TX_ID: 9814-DF7B-AG
            </span>
          </div>

          <div className="flex items-center gap-space-12">
            <div className="hidden sm:flex items-center gap-space-8 px-space-12 py-space-4 rounded-full bg-surface-container-lowest border border-outline-variant/20 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse" />
              <span className="font-mono text-label-sm text-on-surface-variant">
                SESSION SECURED • NODE BLR-04
              </span>
            </div>

            <div className="flex items-center gap-space-4 px-space-10 py-1.5 rounded-md bg-surface-container-high text-on-surface font-mono text-label-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-[15px] text-amber-700">timer</span>
              <span className="font-semibold text-amber-900">{formatTimer(secondsLeft)}</span>
            </div>
          </div>
        </div>

        {/* 12-Column Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Ledger, Boundary, Authorization & CTA (7 Cols on lg)        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-space-24">
            <div className="bg-surface-container-lowest rounded-2xl p-space-24 lg:p-space-32 shadow-sm border border-outline-variant/30">
              {/* Header Status Strip */}
              <div className="flex flex-wrap items-center justify-between gap-space-12 mb-space-16">
                <div className="inline-flex items-center gap-space-8 px-space-12 py-space-4 rounded-full bg-secondary-fixed text-on-secondary-fixed font-mono text-label-sm uppercase tracking-wide font-medium">
                  <span className="material-symbols-outlined text-[14px]">shield_lock</span>
                  <span>Final Review</span>
                </div>
                <div className="flex items-center gap-space-8 text-on-surface-variant font-mono text-label-sm">
                  <span>LEDGER: v2.4.1</span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant" />
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">verified</span>
                    ECDSA SIGNED
                  </span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-headline text-headline-lg font-bold text-on-surface tracking-tight mb-space-8">
                Confirm your purchase
              </h1>
              <p className="font-body text-body-md text-on-surface-variant max-w-xl leading-relaxed">
                AI autonomy boundary check. Explicit customer signature required before order tokenization and financial debit.
              </p>

              {/* Customer Intent Context Box */}
              <div className="mt-space-16 p-space-12 rounded-xl bg-surface-container-low border border-outline-variant/25 flex items-start sm:items-center justify-between gap-space-12">
                <div className="flex items-start sm:items-center gap-space-10">
                  <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5 sm:mt-0">
                    psychology
                  </span>
                  <div>
                    <span className="font-mono text-label-sm uppercase text-on-surface-variant font-semibold tracking-wider block sm:inline mr-2">
                      Customer Intent:
                    </span>
                    <span className="font-body text-body-sm text-on-surface font-medium italic">
                      "{customerIntent}"
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[11px] text-tertiary-fixed-dim bg-surface-container-high px-2 py-0.5 rounded font-semibold border border-outline-variant/20 hidden md:inline">
                  99.2% Match
                </span>
              </div>

              {/* System Pre-Authorization Intent Callout */}
              <div className="mt-space-20 p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-space-12">
                <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
                  key_vertical
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-space-8">
                    <span className="font-mono text-label-md text-on-surface font-semibold">
                      System Pre-Authorization Intent
                    </span>
                    <span className="font-mono text-label-sm text-secondary font-bold tracking-wider">
                      TTL ACTIVE
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-on-surface-variant mt-space-4 leading-relaxed">
                    ShopPilot is ready to create an immutable Razorpay payment order for{' '}
                    <span className="font-mono font-bold text-on-surface">
                      {formatCurrency(total)}
                    </span>
                    . Funds are quarantined pending token unlock.
                  </p>
                </div>
              </div>

              {/* Product Order Summary Card */}
              <div className="mt-space-24 p-space-16 rounded-xl bg-surface-container-lowest border border-outline-variant/20">
                <div className="flex flex-col sm:flex-row gap-space-16 items-start sm:items-center pb-space-16 border-b border-surface-container-high">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-surface-container-high shrink-0 shadow-sm relative border border-outline-variant/20">
                    <img
                      alt={product.name}
                      className="w-full h-full object-cover"
                      src={product.images[0]}
                    />
                    <span className="absolute top-1.5 left-1.5 px-space-8 py-0.5 rounded bg-surface-container-lowest/90 backdrop-blur-sm text-on-surface font-mono text-label-sm font-semibold border border-outline-variant/30">
                      1x
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-space-8 mb-space-4">
                      <span className="font-mono text-label-sm px-space-8 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold">
                        ROAD PERFORMANCE
                      </span>
                      <span className="inline-flex items-center gap-space-4 text-emerald-700 font-mono text-label-sm font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        In Stock (BLR Hub)
                      </span>
                    </div>

                    <h2 className="font-headline text-headline-sm font-bold text-on-surface truncate">
                      {product.name} — Ultralight Daily Road Running
                    </h2>

                    <p className="font-mono text-label-md text-on-surface-variant mt-space-4">
                      Size: US {primaryItem.selectedSize || 9} • {primaryItem.selectedColor || 'Chalk & Stone Grey'} • SKU #{product.sku}
                    </p>
                  </div>
                </div>

                {/* Deterministic Price Ledger */}
                <div className="pt-space-16 flex flex-col gap-space-12 font-body text-body-sm">
                  {/* Product Base Price */}
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Product Base Price</span>
                    <span className="font-mono font-medium text-on-surface">
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {/* Merchant Offer */}
                  {appliedOffer && (
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-space-8">
                          <span className="text-on-surface-variant">Merchant Offer Applied</span>
                          <span className="px-space-8 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300/60 font-mono text-label-sm font-semibold">
                            {appliedOffer.code}
                          </span>
                        </div>
                        <span className="font-mono text-emerald-700 font-semibold">
                          −{formatCurrency(discount)}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-on-surface-variant pl-1">
                        Offer validated against merchant-approved pricing rules.
                      </span>
                    </div>
                  )}

                  {/* Logistics */}
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <div className="flex items-center gap-space-8">
                      <span>Logistics & Handling</span>
                      <span className="text-label-sm text-on-surface bg-surface-container px-space-8 py-0.5 rounded font-mono font-medium">
                        EXPRESS 24H
                      </span>
                    </div>
                    <span className="font-mono text-emerald-700 font-semibold">
                      {shipping === 0 ? 'FREE' : formatCurrency(shipping)}
                    </span>
                  </div>

                  {/* Taxes */}
                  <div className="flex justify-between items-center text-on-surface-variant">
                    <span>Deterministic Surcharge & GST (18% included)</span>
                    <span className="font-mono text-on-surface">
                      {formatCurrency(tax)}
                    </span>
                  </div>

                  {/* Total Final Settlement */}
                  <div className="mt-space-8 pt-space-16 border-t border-surface-container-high flex justify-between items-baseline">
                    <div>
                      <span className="font-headline text-headline-sm font-bold text-on-surface block">
                        Total Final Settlement
                      </span>
                      <span className="font-mono text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                        <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                        Guaranteed rate lock • Zero slippage
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-[28px] lg:text-headline-lg text-on-surface font-bold tracking-tight">
                        {formatCurrency(total)}
                      </span>
                      <span className="block font-mono text-label-sm text-on-surface-variant uppercase font-medium">
                        INR Net
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorization Boundary Gate Banner */}
              <div className="mt-space-20 p-space-16 rounded-xl bg-amber-500/10 border border-amber-600/30 flex items-start gap-space-12">
                <span className="material-symbols-outlined text-amber-700 text-[22px] shrink-0 mt-0.5">
                  gavel
                </span>
                <div className="text-body-sm leading-relaxed">
                  <span className="font-bold text-on-surface uppercase tracking-wide text-[12px] block">
                    READY TO PURCHASE?
                  </span>
                  <p className="text-on-surface font-medium mt-0.5">
                    You are explicitly authorizing a payment of <strong className="font-mono font-bold text-on-surface">{formatCurrency(total)}</strong> for <span className="font-semibold">{product.name}</span>.
                  </p>
                  <p className="text-on-surface-variant text-[12px] mt-1">
                    ShopPilot will create a Razorpay payment order for this exact amount after you confirm. The AI cannot initiate debits without your explicit signature.
                  </p>
                </div>
              </div>

              {/* Transaction Controls */}
              <div className="mt-space-24 pt-space-24 border-t border-surface-container-high">
                <div className="flex items-center justify-between mb-space-12">
                  <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Transaction Controls
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowTrace(!showTrace)}
                    className="text-secondary hover:text-on-surface-variant font-mono text-label-sm flex items-center gap-space-4 transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">terminal</span>
                    <span>{showTrace ? 'Hide Agent Rationale' : 'Inspect Agent Rationale'}</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-12">
                  <button
                    type="button"
                    onClick={() => navigate(`/recommendation/${product.id}`)}
                    className="px-space-20 py-space-12 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-body-md font-medium text-center transition-colors border border-outline-variant/30"
                  >
                    Cancel & Return
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 px-space-24 py-space-12 rounded-xl bg-primary hover:bg-primary/90 active:scale-[0.99] text-on-primary font-body text-body-lg font-semibold flex items-center justify-center gap-space-8 transition-all shadow-md cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>Confirm & Pay {formatCurrency(total)}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Security & Trust Indicators */}
              <div className="mt-space-20 flex flex-wrap items-center justify-center gap-x-space-16 gap-y-space-4 text-on-surface-variant font-mono text-label-sm">
                <span className="flex items-center gap-space-4">
                  <span className="material-symbols-outlined text-[14px]">lock</span>
                  Razorpay Test Network
                </span>
                <span>•</span>
                <span>256-Bit TLS Mutual Auth</span>
                <span>•</span>
                <span>Deterministic Ledger v2.4</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: 3 Safety Pillars, Reasoning Audit & Trace (5 Cols on lg)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-space-24">
            {/* 3 Safety Pillars Card (RFC-008) */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-24 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-space-16 pb-space-12 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-on-surface text-[20px]">policy</span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    3 Safety Pillars
                  </span>
                </div>
                <span className="px-space-8 py-0.5 rounded bg-surface-container font-mono text-label-sm text-on-surface-variant font-medium border border-outline-variant/20">
                  RFC-008
                </span>
              </div>

              <div className="flex flex-col gap-space-16">
                {/* Pillar 1 */}
                <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-space-4">
                    <div className="flex items-center gap-space-8">
                      <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-mono text-label-sm font-semibold">
                        1
                      </span>
                      <span className="font-mono text-label-md font-semibold text-on-surface uppercase tracking-wide">
                        Explainable
                      </span>
                    </div>
                    <span className="text-emerald-700 font-mono text-label-sm flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Verified
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-on-surface-variant pl-space-24 leading-relaxed">
                    Full deterministic decision tree attached. Transparent chain from raw user intent to merchant checkout state.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-space-4">
                    <div className="flex items-center gap-space-8">
                      <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-mono text-label-sm font-semibold">
                        2
                      </span>
                      <span className="font-mono text-label-md font-semibold text-on-surface uppercase tracking-wide">
                        Bounded
                      </span>
                    </div>
                    <span className="text-emerald-700 font-mono text-label-sm flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Compliant
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-on-surface-variant pl-space-24 leading-relaxed">
                    Firm limit cap: ≤ ₹3,000.00. Settlement payload sits at {formatCurrency(total)}, well inside user-defined financial boundary.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between mb-space-4">
                    <div className="flex items-center gap-space-8">
                      <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-mono text-label-sm font-semibold">
                        3
                      </span>
                      <span className="font-mono text-label-md font-semibold text-on-surface uppercase tracking-wide">
                        Gated
                      </span>
                    </div>
                    <span className="text-secondary font-mono text-label-sm flex items-center gap-1 font-semibold">
                      <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                      Awaiting Pin
                    </span>
                  </div>
                  <p className="font-body text-body-sm text-on-surface-variant pl-space-24 leading-relaxed">
                    No autonomous debit authority granted. Payment pipeline blocked until biometric or keypress confirmation.
                  </p>
                </div>
              </div>

              {/* Customer Control Guarantee */}
              <div className="mt-space-20 p-space-12 rounded-xl bg-surface-container text-on-surface-variant font-body text-body-sm border border-outline-variant/20 leading-relaxed">
                <span className="font-bold text-on-surface">Customer Control Guarantee:</span> ShopPilot cannot silently bill cards, charge secondary accounts, or mutate settlement tokens post-approval.
              </div>
            </div>

            {/* Why This Action? (Reasoning Audit Card) */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-24 shadow-sm border border-outline-variant/30">
              <div className="flex items-center justify-between mb-space-16 pb-space-12 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[20px]">fact_check</span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    Why This Action?
                  </span>
                </div>
                <span className="font-mono text-label-sm text-on-surface-variant font-medium">
                  REASONING AUDIT
                </span>
              </div>

              <ul className="flex flex-col gap-space-12 font-body text-body-sm leading-relaxed">
                <li className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    done
                  </span>
                  <span className="text-on-surface">
                    <strong>Product intent matched:</strong> Road running shoe under ₹3,000 budget with ultra-cushion spec for daily volume.
                  </span>
                </li>
                <li className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    done
                  </span>
                  <span className="text-on-surface">
                    <strong>Offer validated:</strong>{' '}
                    <code className="font-mono text-label-sm bg-surface-container px-1.5 py-0.5 rounded text-on-surface font-semibold border border-outline-variant/30">
                      {appliedOffer?.code || 'RT-SUMMER200'}
                    </code>{' '}
                    voucher was algorithmically fetched and validated against merchant rules.
                  </span>
                </li>
                <li className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    done
                  </span>
                  <span className="text-on-surface">
                    <strong>Ledger integrity:</strong> Shipping fee waiver confirmed via express logistics agreement. Zero stealth markups.
                  </span>
                </li>
                <li className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    done
                  </span>
                  <span className="text-on-surface">
                    <strong>Pre-debit barrier:</strong> Token pipeline halted at step 4 of 5. Requires your biometric or click action to seal.
                  </span>
                </li>
              </ul>
            </div>

            {/* Collapsible Trace Execution Manifest */}
            {showTrace && (
              <div className="bg-primary text-on-primary rounded-2xl p-space-20 shadow-md font-mono text-label-sm animate-fadeIn border border-primary-container">
                <div className="flex items-center justify-between pb-space-8 border-b border-primary-container mb-space-12">
                  <span className="text-primary-fixed uppercase tracking-wider font-bold">
                    Trace Execution Manifest
                  </span>
                  <span className="text-primary-fixed-dim text-[11px]">NODE_HASH: 7a8f...91c0</span>
                </div>

                <div className="flex flex-col gap-space-8 text-on-primary-container text-[12px] leading-relaxed">
                  <div>
                    <span className="text-primary-fixed">14:28:01.102</span> [INTENT_PARSER] matched query -&gt; category: athletic_footwear, cap: 3000 INR
                  </div>
                  <div>
                    <span className="text-primary-fixed">14:28:01.320</span> [MERCHANT_API] evaluated 14 SKUs, selected #SKU-RUN-401 (Confidence 99.4%)
                  </div>
                  <div>
                    <span className="text-primary-fixed">14:28:01.542</span> [DISCOUNT_ORCH] coupon RT-SUMMER200 injected, delta -200 INR validated
                  </div>
                  <div>
                    <span className="text-primary-fixed">14:28:01.780</span> [GATEKEEPER] state moved to REQUIRE_CUSTOMER_SIGNATURE
                  </div>
                </div>

                <div className="mt-space-16 pt-space-12 border-t border-primary-container flex justify-between items-center text-[11px]">
                  <span className="text-primary-fixed-dim">ECDSA Rail: RZP-BOM-04</span>
                  <Link
                    to="/agent/trace"
                    className="text-secondary-fixed hover:underline flex items-center gap-1 font-semibold"
                  >
                    View Full 9-Step Trace →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Autonomous Commerce Engine Bottom Banner */}
        <div className="mt-space-32 p-space-16 rounded-2xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-space-16">
          <div className="flex items-center gap-space-12">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface shrink-0">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
            <div>
              <div className="font-headline text-label-md font-bold text-on-surface">
                ShopPilot Autonomous Commerce Engine
              </div>
              <div className="font-mono text-label-sm text-on-surface-variant">
                Deterministic Ledger Architecture • Model Context Protocol Enabled
              </div>
            </div>
          </div>
          <div className="flex items-center gap-space-12">
            <span className="font-mono text-label-sm text-on-surface-variant">Need modifications?</span>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-body text-body-sm text-secondary hover:underline font-semibold"
            >
              Reject & Re-query Agent
            </button>
          </div>
        </div>

        {/* Developer Sandbox Test Controls */}
        <div className="p-space-12 rounded-xl bg-surface-container-high/60 border border-dashed border-outline-variant/50 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-on-surface-variant">
          <span className="font-semibold">TEST TOOLBAR (MVP Validation):</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearCart}
              className="px-2 py-1 rounded bg-surface hover:bg-error/10 hover:text-error transition-colors border border-outline-variant/30"
              title="Test empty cart boundary handling"
            >
              Simulate Empty Cart
            </button>
            <button
              type="button"
              onClick={resetDefaultCart}
              className="px-2 py-1 rounded bg-surface hover:bg-surface-container transition-colors border border-outline-variant/30"
              title="Reset cart to AeroRun X at ₹2,799"
            >
              Reset Default Cart
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: Initiating Razorpay Token & Pre-Authorization Dialog               */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-space-16 bg-inverse-surface/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-2xl p-space-24 shadow-2xl border border-outline-variant/30">
            <div className="flex items-center gap-space-12 mb-space-16">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[24px]">lock_reset</span>
              </div>
              <div>
                <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                  Initiating Razorpay Token
                </h3>
                <p className="font-mono text-label-sm text-on-surface-variant">
                  ECDSA Order Signature Payload
                </p>
              </div>
            </div>

            <div className="p-space-16 rounded-xl bg-surface-container-low mb-space-20 font-mono text-label-sm border border-outline-variant/20">
              <div className="flex justify-between py-1.5 border-b border-surface-container-high">
                <span className="text-on-surface-variant">Order Amount:</span>
                <span className="text-on-surface font-bold">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surface-container-high">
                <span className="text-on-surface-variant">Merchant:</span>
                <span className="text-on-surface">ShopPilot Retail India</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-on-surface-variant">Payment Mode:</span>
                <span className="text-on-surface">Test Mode Sandbox</span>
              </div>
            </div>

            {/* Tokenizing Status */}
            <div className="flex items-center gap-space-8 font-mono text-label-sm mb-space-20">
              {isAuthorizing ? (
                authComplete ? (
                  <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Ledger Block Sealed! Redirecting to checkout...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-secondary font-medium">
                    <span className="material-symbols-outlined animate-spin text-[16px]">
                      autorenew
                    </span>
                    <span>Generating cryptographically sealed authorization token...</span>
                  </div>
                )
              ) : (
                <div className="flex items-center gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    fingerprint
                  </span>
                  <span>Awaiting explicit customer confirmation to seal ledger payload.</span>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-error-container text-on-error-container font-mono text-label-sm mb-4">
                {errorMessage}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-space-12">
              <button
                type="button"
                disabled={isAuthorizing}
                onClick={() => setIsModalOpen(false)}
                className="px-space-16 py-space-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body text-body-sm font-medium transition-colors disabled:opacity-50"
              >
                Abort
              </button>

              <button
                type="button"
                disabled={isAuthorizing}
                onClick={handleAuthorizeAndProceed}
                className="px-space-20 py-space-10 rounded-xl bg-primary text-on-primary font-body text-body-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60 shadow-sm cursor-pointer"
              >
                {isAuthorizing ? (
                  <span>Sealing...</span>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">lock</span>
                    <span>Authorize {formatCurrency(total)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ConfirmationPage;
