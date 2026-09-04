import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/common/Button';
import { primaryProduct, mockOffer } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

export const RecommendationPage: React.FC = () => {
  const navigate = useNavigate();
  const product = primaryProduct;

  // Active thumbnail selection
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Collapsible decision trace drawer toggle
  const [isTraceExpanded, setIsTraceExpanded] = useState(false);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const thumbnailLabels = ['Profile', 'Mesh', 'Grip', 'Stride'];

  return (
    <PageLayout>
      {/* Toast Notification Container */}
      <div
        className={`fixed bottom-6 right-6 z-[100] transform transition-all duration-300 flex items-center gap-space-12 bg-primary text-on-primary px-space-20 py-space-12 rounded-xl shadow-2xl ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>
        <span className="font-body text-body-sm font-medium">{toastMessage}</span>
      </div>

      <div className="flex flex-col w-full -mt-2">
        {/* Navigation & Context Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-12 pb-space-20 border-b border-outline-variant/30 mb-space-24">
          <Link
            to="/"
            className="inline-flex items-center gap-space-8 text-on-surface-variant hover:text-on-surface transition-colors group"
          >
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
              arrow_back
            </span>
            <span className="font-label text-label-md font-semibold">Back to search results</span>
          </Link>

          <div className="inline-flex items-center gap-space-8 px-space-12 py-space-4 rounded-full bg-surface-container-low text-on-surface-variant max-w-full overflow-hidden border border-outline-variant/30">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
            <span className="font-mono text-[12px] truncate">
              <span className="text-on-surface font-semibold">Intent:</span> "running shoes under ₹3,000 for daily road use"
            </span>
            <span className="text-outline text-xs">/</span>
            <span className="font-mono text-[11px] text-outline shrink-0">24 evaluated in 142ms</span>
          </div>
        </div>

        {/* Primary 2-Column Evaluation & Commerce Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-32 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Visuals, Specs, & Provenance (7 cols on lg)                 */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 flex flex-col gap-space-24">
            {/* Main Visual Showcase */}
            <div className="relative bg-surface-container-lowest rounded-2xl p-space-20 shadow-L1 overflow-hidden border border-outline-variant/30">
              {/* Badge Overlay */}
              <div className="absolute top-space-24 left-space-24 z-10 flex flex-wrap gap-space-8">
                <div className="flex items-center gap-space-8 px-space-12 py-space-4 rounded-md bg-surface/90 backdrop-blur-md shadow-sm border border-outline-variant/30">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="font-mono text-label-sm text-on-surface tracking-tight font-semibold">
                    Verified SKU #{product.sku}
                  </span>
                </div>
                <div className="px-space-8 py-space-4 rounded-md bg-surface-container-high/90 backdrop-blur-md font-mono text-label-sm text-on-surface-variant font-medium">
                  Road Runner Profile
                </div>
              </div>

              {/* High-res product canvas */}
              <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-surface-container-low flex items-center justify-center relative border border-outline-variant/20">
                <img
                  className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
                  alt={product.name}
                  src={product.images[selectedImageIndex] || product.images[0]}
                />
                <div className="absolute bottom-3 right-3 px-space-8 py-1 rounded bg-inverse-surface/80 backdrop-blur text-inverse-on-surface font-mono text-[11px] flex items-center gap-1.5 font-medium">
                  <span className="material-symbols-outlined text-[14px]">view_in_ar</span> 360° Studio Scan
                </div>
              </div>

              {/* Interactive Thumbnail Strip */}
              <div className="grid grid-cols-4 gap-space-12 mt-space-16">
                {[0, 1, 2, 3].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative rounded-lg overflow-hidden aspect-square p-1 transition-all ${
                      selectedImageIndex === idx
                        ? 'bg-surface-container-high ring-2 ring-primary'
                        : 'bg-surface-container-low hover:bg-surface-container border border-outline-variant/30'
                    }`}
                  >
                    <img
                      className="w-full h-full object-cover rounded"
                      alt={`Thumbnail ${idx + 1}`}
                      src={product.images[idx] || product.images[0]}
                    />
                    <span className="absolute bottom-1 right-1 font-mono text-[9px] bg-primary text-on-primary px-1 rounded font-semibold">
                      {thumbnailLabels[idx] || `View ${idx + 1}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Specs Sheet */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-24 shadow-L1 flex flex-col gap-space-20 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                  Biomechanical Specifications
                </h3>
                <span className="font-mono text-label-sm text-outline">Lab verified index v2.4</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-space-16">
                <div className="p-space-12 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Weight
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    240g <span className="text-body-sm font-normal text-on-surface-variant">(Men's US 9)</span>
                  </span>
                </div>

                <div className="p-space-12 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Heel-to-Toe Drop
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    8mm <span className="text-body-sm font-normal text-on-surface-variant">(32 / 24mm)</span>
                  </span>
                </div>

                <div className="p-space-12 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Cushion Core
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface truncate">
                    Dual BioFoam
                  </span>
                </div>

                <div className="p-space-12 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Intended Surface
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    Road & Pavement
                  </span>
                </div>

                <div className="p-space-12 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Fit Confidence
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    True to size
                  </span>
                </div>

                <div className="p-space-12 rounded-xl bg-surface-container-low flex flex-col gap-1 border border-outline-variant/20">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
                    Active Size Range
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-on-surface">
                    US 7 – 12
                  </span>
                </div>
              </div>

              {/* Fulfillment & Dispatch Assurance */}
              <div className="mt-space-8 pt-space-16 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-space-12">
                <div className="flex items-center gap-space-12">
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                    <span className="material-symbols-outlined text-[18px]">local_shipping</span>
                  </div>
                  <div>
                    <p className="font-body text-body-md font-bold text-on-surface">
                      Bangalore Logistics Hub 04
                    </p>
                    <p className="font-body text-body-sm text-on-surface-variant">
                      Express 24h Settlement & Dispatch
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-space-8 px-space-12 py-space-8 rounded-lg bg-surface-container text-on-surface font-label text-label-md font-semibold border border-outline-variant/30">
                  <span className="material-symbols-outlined text-tertiary text-[16px]">
                    verified_user
                  </span>
                  30-Day Free Running Trial
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: AI Recommendation & Financial Settlement (5 cols on lg)    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 flex flex-col gap-space-20">
            {/* 1. Header Card: Identity & Status */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-24 shadow-L1 flex flex-col gap-space-16 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-space-8 px-space-12 py-space-4 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container border border-tertiary-fixed-dim/40">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                  <span className="font-mono text-label-sm font-bold tracking-wide uppercase">
                    ShopPilot Recommends
                  </span>
                </div>
                <span className="font-mono text-label-sm text-outline font-semibold">
                  Match Score {product.matchScore}%
                </span>
              </div>

              <div>
                <h1 className="font-headline text-headline-lg font-bold text-on-surface tracking-tight">
                  {product.name}
                </h1>
                <p className="font-body text-body-lg text-on-surface-variant mt-1">
                  {product.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-x-space-16 gap-y-space-8 pt-space-8 border-t border-outline-variant/30">
                <div className="flex items-center gap-1 text-on-surface font-mono text-body-md font-bold">
                  <span className="material-symbols-outlined text-[18px] text-[#F59E0B] fill">star</span>
                  <span>{product.rating}</span>
                  <span className="font-body text-on-surface-variant text-body-sm font-normal">
                    ({product.reviewCount} verified runners)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 px-space-8 py-0.5 rounded bg-tertiary-fixed/20 text-on-tertiary-container font-mono text-label-sm font-semibold border border-tertiary-fixed-dim/30">
                  <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                  38 units in your size (US 9.5)
                </div>
              </div>

              <div className="flex items-baseline gap-space-12 pt-space-8">
                <span className="font-mono text-display font-bold text-on-surface tracking-tight">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="font-mono text-body-md text-outline line-through">
                  ₹3,499
                </span>
                <span className="font-mono text-label-sm text-on-tertiary-container bg-surface-container-low px-space-8 py-1 rounded border border-outline-variant/20 font-semibold">
                  14% Base Catalog Off
                </span>
              </div>
            </div>

            {/* 2. AI Deterministic Reasoning Card ("Why this product?") */}
            <div className="bg-surface-container-low rounded-2xl p-space-24 shadow-L1 flex flex-col gap-space-16 border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[20px]">smart_toy</span>
                  <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                    Why this product?
                  </h2>
                </div>
                <span
                  className="text-on-surface-variant material-symbols-outlined text-[18px] cursor-help"
                  title="Evaluated against your conversational constraints"
                >
                  info
                </span>
              </div>

              {/* Structured Checklist */}
              <div className="flex flex-col gap-space-12">
                <div className="flex items-start gap-space-12">
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary shrink-0 mt-0.5 shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-body-md font-bold text-on-surface">
                      Fits your ₹3,000 budget
                    </span>
                    <span className="font-body text-body-sm text-on-surface-variant">
                      Ceiling was ₹3,000.00 • Clears threshold comfortably
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-space-12">
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary shrink-0 mt-0.5 shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-body-md font-bold text-on-surface">
                      Optimized for daily road use
                    </span>
                    <span className="font-body text-body-sm text-on-surface-variant">
                      High-abrasion carbon rubber compound handles asphalt abrasion
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-space-12">
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary shrink-0 mt-0.5 shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-body-md font-bold text-on-surface">
                      Highest rated in comparison matrix
                    </span>
                    <span className="font-body text-body-sm text-on-surface-variant">
                      4.8★ vs 4.3★ category baseline across 24 peers
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-space-12">
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary shrink-0 mt-0.5 shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-body-md font-bold text-on-surface">
                      Immediate inventory match
                    </span>
                    <span className="font-body text-body-sm text-on-surface-variant">
                      Reserved at Bangalore Hub 04 for priority routing
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-space-12">
                  <div className="w-5 h-5 rounded-full bg-surface-container-lowest flex items-center justify-center text-tertiary shrink-0 mt-0.5 shadow-sm border border-outline-variant/20">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body text-body-md font-bold text-on-surface">
                      Autonomous merchant incentive unlocked
                    </span>
                    <span className="font-body text-body-sm text-on-surface-variant">
                      Pre-negotiated token automatically shaved ₹200 at checkout
                    </span>
                  </div>
                </div>
              </div>

              {/* Preference Match Vector Breakdown */}
              <div className="mt-space-8 pt-space-16 border-t border-outline-variant/30 flex flex-col gap-space-8">
                <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider font-semibold">
                  Constraint Compatibility
                </span>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between font-mono text-label-sm mb-1 text-on-surface font-semibold">
                      <span>Budget Fit (≤ ₹3,000)</span>
                      <span className="text-tertiary">100%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-label-sm mb-1 text-on-surface font-semibold">
                      <span>Road Surface Geometry</span>
                      <span className="text-tertiary">98%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-[98%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-label-sm mb-1 text-on-surface font-semibold">
                      <span>Direct Local Availability</span>
                      <span className="text-tertiary">100%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-full" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-mono text-label-sm mb-1 text-on-surface font-semibold">
                      <span>Runner Durability Index</span>
                      <span className="text-tertiary">96%</span>
                    </div>
                    <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-[96%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Merchant Ledger & Offer Card */}
            <div className="bg-surface-container-lowest rounded-2xl p-space-20 shadow-L1 border-l-4 border-tertiary border-y border-r border-outline-variant/30 flex flex-col gap-space-12">
              <div className="flex items-center justify-between">
                <span className="px-space-8 py-0.5 rounded bg-surface-container font-mono text-[11px] font-bold text-tertiary tracking-wide border border-tertiary-fixed-dim/40">
                  MERCHANT OFFER • ₹200 APPLIED
                </span>
                <span className="font-mono text-[11px] text-outline font-semibold">
                  Rule: {mockOffer.code}
                </span>
              </div>
              <div className="space-y-1.5 pt-space-4">
                <div className="flex justify-between font-body text-body-sm text-on-surface-variant">
                  <span>List Catalog Price</span>
                  <span className="font-mono text-on-surface font-semibold">
                    {formatCurrency(product.originalPrice)}
                  </span>
                </div>
                <div className="flex justify-between font-body text-body-sm text-tertiary font-semibold">
                  <span>ShopPilot Autonomous Deduction</span>
                  <span className="font-mono">−{formatCurrency(mockOffer.discountAmount)}</span>
                </div>
                <div className="flex justify-between items-baseline pt-space-8 border-t border-outline-variant/30 text-on-surface">
                  <span className="font-headline text-headline-sm font-bold">Final Settlement</span>
                  <span className="font-mono text-[28px] font-bold text-primary">
                    {formatCurrency(product.finalPrice)}
                  </span>
                </div>
              </div>
              <p className="font-body text-[12px] text-outline leading-relaxed">
                Zero coupon hunting required. Settlement authorization locked for 14:59 minutes.
              </p>
            </div>

            {/* 4. CTAs & Actions */}
            <div className="flex flex-col gap-space-12 pt-space-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/confirm')}
                iconRight="arrow_forward"
                className="w-full h-12 shadow-md"
              >
                Proceed to Confirmation
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => showToast('Connecting to ShopPilot Sizing Advisor...')}
                iconLeft="chat_bubble_outline"
                className="w-full text-secondary hover:bg-surface-container-low"
              >
                Ask ShopPilot about sizing & wear
              </Button>

              {/* Decision Trace Trigger */}
              <div className="flex justify-center pt-space-4">
                <button
                  type="button"
                  onClick={() => setIsTraceExpanded(!isTraceExpanded)}
                  className="inline-flex items-center gap-space-8 text-on-surface-variant hover:text-on-surface font-mono text-label-sm transition-colors cursor-pointer py-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[16px]">account_tree</span>
                  <span>View deterministic decision trace</span>
                  <span
                    className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                      isTraceExpanded ? 'rotate-180' : ''
                    }`}
                  >
                    expand_more
                  </span>
                </button>
              </div>
            </div>

            {/* 5. Collapsible Audit / Decision Trace Drawer */}
            {isTraceExpanded && (
              <div className="bg-surface-container-highest/40 rounded-xl p-space-16 flex flex-col gap-space-12 font-mono text-[12px] text-on-surface-variant border border-outline-variant/30 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-space-8 border-b border-outline-variant/30">
                  <span className="font-bold text-on-surface text-label-sm">AUTONOMOUS AUDIT LOG</span>
                  <span className="text-[10px] text-tertiary bg-surface-container px-1.5 py-0.5 rounded font-semibold">
                    Deterministic: SHA-256 Valid
                  </span>
                </div>

                <ol className="relative border-l border-outline-variant/50 ml-2 space-y-3">
                  <li className="pl-4 relative">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-surface border-2 border-secondary" />
                    <p className="font-bold text-on-surface">1. Query Decomposition</p>
                    <p className="text-[11px] text-outline">
                      Parameters parsed: [category: running], [max_price: 3000], [surface: road_asphalt], [cadence: daily].
                    </p>
                  </li>
                  <li className="pl-4 relative">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-surface border-2 border-secondary" />
                    <p className="font-bold text-on-surface">2. Vector Search & Candidate Filtration</p>
                    <p className="text-[11px] text-outline">
                      Retrieved 24 candidate nodes. 21 culled due to soft outsole compounds or MSRP &gt; ₹3,000.
                    </p>
                  </li>
                  <li className="pl-4 relative">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-surface border-2 border-secondary" />
                    <p className="font-bold text-on-surface">3. Multi-Attribute Scoring Function</p>
                    <p className="text-[11px] text-outline">
                      AeroRun X achieved highest composite scalar (0.992) based on weight=0.4 price + 0.3 reviews + 0.3 locality.
                    </p>
                  </li>
                  <li className="pl-4 relative">
                    <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-surface border-2 border-tertiary" />
                    <p className="font-bold text-on-surface">4. Margin Settlement Clearance</p>
                    <p className="text-[11px] text-outline">
                      Auto-applied token RT-SUMMER200 from Merchant API. Instant pricing drop verified against ledger.
                    </p>
                  </li>
                </ol>

                <div className="p-space-8 rounded bg-surface-container text-[11px] text-outline flex items-center justify-between mt-space-4 border border-outline-variant/20">
                  <span>Trace ID: trace_89a0f4de21c9</span>
                  <Link to="/agent/trace" className="text-primary font-bold cursor-pointer hover:underline">
                    View Full 9-Step Log →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default RecommendationPage;
