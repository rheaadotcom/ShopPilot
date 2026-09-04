import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { useCart } from '../../features/cart/CartContext';
import { primaryProduct, PRIMARY_CUSTOMER_INTENT } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';
import {
  buildAgentTraceEvents,
  buildForensicAuditLog,
  evaluateMerchantPolicy,
  DEFAULT_MERCHANT_POLICY,
} from '../../lib/agentTraceService';

export const AgentTracePage: React.FC = () => {
  const { authorization, settledPayment } = useCart();

  // Active scenario switcher (default to success or actual settled state)
  const initialScenario = settledPayment ? 'success' : 'success';
  const [activeScenario, setActiveScenario] = useState<'success' | 'failed' | 'cancelled' | 'blocked'>(
    initialScenario
  );

  // Blocked action demo state
  const [isBlockedDemoActive, setIsBlockedDemoActive] = useState(false);

  // Trace events based on scenario or active blocked demo
  const effectiveScenario = isBlockedDemoActive ? 'blocked' : activeScenario;
  const events = buildAgentTraceEvents({
    scenario: effectiveScenario,
    authorization,
    settledPayment,
    orderId: settledPayment?.orderId || '#SP-1024',
    paymentId: settledPayment?.paymentId || 'pay_test_984128',
  });

  // Expandable steps tracking
  const [expandedStepIds, setExpandedStepIds] = useState<Record<string, boolean>>({
    'trace-evt-04': true, // Product selection expanded by default
    'trace-evt-05': true, // Merchant offer expanded by default
  });

  const toggleStep = (id: string) => {
    setExpandedStepIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    events.forEach((e) => {
      all[e.id] = true;
    });
    setExpandedStepIds(all);
  };

  const collapseAll = () => {
    setExpandedStepIds({});
  };

  // Toast / Export state
  const [exportState, setExportState] = useState<'idle' | 'exporting' | 'exported'>('idle');
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  const handleExportJson = () => {
    setExportState('exporting');
    setTimeout(() => {
      const exportPayload = {
        sessionUid: '#SP-8902',
        sessionStatus:
          effectiveScenario === 'success'
            ? 'VERIFIED'
            : effectiveScenario === 'blocked'
            ? 'BLOCKED'
            : effectiveScenario === 'cancelled'
            ? 'RECOVERABLE'
            : 'FAILED',
        timestamp: new Date().toISOString(),
        customerIntent: PRIMARY_CUSTOMER_INTENT,
        merchantPolicy: DEFAULT_MERCHANT_POLICY,
        deterministicMatchScore: 99.2,
        recommendedProduct: {
          name: primaryProduct.name,
          sku: primaryProduct.sku,
          basePrice: 2999,
          merchantOfferDiscount: 200,
          netSettledAmount: 2799,
          currency: 'INR',
        },
        executionMetrics: {
          policyEngine: 'Zero-Drift (100% Gated)',
          retrievalLatencyMs: 18,
          totalExecutionMs: 142,
          ecdsaRootHash: '0x9e81f72a431ced74b39210984128',
          consensusHash: 'sha256:7fa8901c901e',
        },
        events,
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `shoppilot_agent_trace_SP8902_${effectiveScenario}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setExportState('exported');
      setTimeout(() => setExportState('idle'), 2500);
    }, 600);
  };

  const handleCopyTerminal = () => {
    const text = buildForensicAuditLog(events);
    navigator.clipboard.writeText(text);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  // Policy evaluation for current intent vs demo breach
  const policyEvalAmount = isBlockedDemoActive ? 3499 : 2799;
  const policyResult = evaluateMerchantPolicy(DEFAULT_MERCHANT_POLICY, {
    amount: policyEvalAmount,
    currency: 'INR',
    discount: 200,
    productApproved: true,
    customerAuthorizationPresent: !isBlockedDemoActive,
    paymentMode: 'Razorpay Test Mode',
    isAutonomousAction: isBlockedDemoActive,
  });

  return (
    <PageLayout>
      <div className="w-full max-w-max-width-content mx-auto px-gutter-desktop space-y-space-24">
        {/* ========================================================================= */}
        {/* TOP PROTOCOL BREADCRUMB BAR & HEADER BANNER                              */}
        {/* ========================================================================= */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-16 pb-space-16 border-b border-surface-container-high">
          <div className="flex flex-col gap-space-4">
            <div className="flex items-center gap-space-8 flex-wrap">
              <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                Deterministic Ledger Stream
              </span>
              <span className="text-outline-variant font-mono text-label-sm">/</span>
              <span className="font-mono text-label-sm text-secondary font-semibold uppercase tracking-wider">
                Agent Trace
              </span>
              <span className="inline-flex items-center gap-space-4 px-space-8 py-0.5 rounded-full bg-surface-container font-mono text-label-sm text-on-surface">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    effectiveScenario === 'success'
                      ? 'bg-emerald-600'
                      : effectiveScenario === 'blocked'
                      ? 'bg-red-600'
                      : 'bg-amber-600'
                  }`}
                />
                <span>
                  Status: {events.length} of {events.length} Steps Recorded • 142ms Execution
                </span>
              </span>
            </div>

            <div className="flex items-baseline gap-space-12 mt-space-4">
              <h1 className="font-headline text-headline-lg font-bold text-on-surface tracking-tight">
                Agent Activity &amp; Decision Trace
              </h1>
              <span className="hidden sm:inline font-mono text-label-sm text-on-surface-variant">
                Live Runtime Inspector
              </span>
            </div>

            <p className="font-body text-body-md text-on-surface-variant max-w-3xl">
              Inspect how ShopPilot parsed customer constraints, evaluated merchant inventory, applied margin policies, and gated deterministic monetary settlement.
            </p>
          </div>

          {/* Metadata Signature Capsule & Action */}
          <div className="flex flex-wrap items-center gap-space-12 self-start lg:self-center shrink-0">
            <div className="flex items-center gap-space-8 px-space-12 py-space-8 rounded-lg bg-surface-container-lowest border border-outline-variant/30 shadow-sm font-mono">
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Session UID</span>
                <span className="text-body-sm font-bold text-on-surface">#SP-8902</span>
              </div>
              <div className="w-px h-6 bg-surface-container-high mx-space-4" />
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Session Status</span>
                <span
                  className={`text-body-sm font-bold ${
                    effectiveScenario === 'success'
                      ? 'text-emerald-700'
                      : effectiveScenario === 'blocked'
                      ? 'text-red-700'
                      : 'text-amber-700'
                  }`}
                >
                  {effectiveScenario === 'success'
                    ? 'VERIFIED'
                    : effectiveScenario === 'blocked'
                    ? 'BLOCKED'
                    : effectiveScenario === 'cancelled'
                    ? 'RECOVERABLE'
                    : 'FAILED'}
                </span>
              </div>
              <div className="w-px h-6 bg-surface-container-high mx-space-4" />
              <div className="flex flex-col">
                <span className="text-[10px] text-on-surface-variant uppercase font-semibold">ECDSA Root</span>
                <span className="text-[11px] text-on-surface">0x9e81...a431</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportJson}
              disabled={exportState === 'exporting'}
              className="flex items-center gap-space-8 px-space-16 py-space-10 rounded-lg bg-primary text-on-primary hover:bg-primary/90 transition-all shadow-sm active:scale-[0.99] cursor-pointer text-body-sm font-semibold"
            >
              <span className={`material-symbols-outlined text-[18px] ${exportState === 'exporting' ? 'animate-spin' : ''}`}>
                {exportState === 'exported' ? 'check' : exportState === 'exporting' ? 'sync' : 'file_download'}
              </span>
              <span>
                {exportState === 'exported'
                  ? 'Audit Log Exported (.json)'
                  : exportState === 'exporting'
                  ? 'Compiling Ledger...'
                  : 'Export Audit Log (JSON)'}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TELEMETRY STRIP BANNER (Stitch Screen 11)                                 */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-space-12 p-space-16 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm">
          <div className="flex flex-col gap-1 px-space-8">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Policy Engine
            </span>
            <div className="flex items-center gap-space-8">
              <span className="font-headline text-headline-sm font-bold text-on-surface">Zero-Drift</span>
              <span className="px-space-8 py-0.5 rounded bg-surface-container font-mono text-[11px] text-emerald-800 font-bold border border-outline-variant/20">
                100% Gated
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 px-space-8">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Retrieval Latency
            </span>
            <div className="flex items-center gap-space-8">
              <span className="font-headline text-headline-sm font-bold text-on-surface">18ms</span>
              <span className="font-mono text-label-sm text-on-surface-variant">vector k=24</span>
            </div>
          </div>

          <div className="flex flex-col gap-1 px-space-8">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Authorization Hook
            </span>
            <div className="flex items-center gap-space-8">
              <span className="font-headline text-headline-sm font-bold text-on-surface">Explicit</span>
              <span className="px-space-8 py-0.5 rounded bg-surface-container font-mono text-[11px] text-secondary font-bold border border-outline-variant/20">
                Customer Token
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 px-space-8">
            <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Consensus Hash
            </span>
            <div className="flex items-center gap-space-8">
              <span className="font-mono text-body-sm text-on-surface font-semibold truncate">
                sha256:7fa8...c901
              </span>
              <span className="material-symbols-outlined text-[16px] text-emerald-700">verified</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE SCENARIO SWITCHER (Phase 8 Step 20 Verification)             */}
        {/* ========================================================================= */}
        <div className="p-space-12 rounded-xl bg-surface-container-low border border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-8">
          <div className="flex items-center gap-space-8">
            <span className="material-symbols-outlined text-secondary text-[18px]">tune</span>
            <span className="font-body text-body-sm font-bold text-on-surface">Inspect Trace Scenario:</span>
          </div>

          <div className="flex flex-wrap items-center gap-space-8 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setIsBlockedDemoActive(false);
                setActiveScenario('success');
              }}
              className={`px-space-10 py-1 rounded-lg font-mono text-label-sm font-semibold transition-all cursor-pointer border ${
                activeScenario === 'success' && !isBlockedDemoActive
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
              }`}
            >
              ✓ 1. Successful Purchase (Settled)
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBlockedDemoActive(false);
                setActiveScenario('cancelled');
              }}
              className={`px-space-10 py-1 rounded-lg font-mono text-label-sm font-semibold transition-all cursor-pointer border ${
                activeScenario === 'cancelled' && !isBlockedDemoActive
                  ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
              }`}
            >
              ⚠ 2. Cancelled Payment (Retry)
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBlockedDemoActive(false);
                setActiveScenario('failed');
              }}
              className={`px-space-10 py-1 rounded-lg font-mono text-label-sm font-semibold transition-all cursor-pointer border ${
                activeScenario === 'failed' && !isBlockedDemoActive
                  ? 'bg-red-700 text-white border-red-800 shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
              }`}
            >
              ✕ 3. Failed Payment (Declined)
            </button>

            <button
              type="button"
              onClick={() => {
                setIsBlockedDemoActive(true);
              }}
              className={`px-space-10 py-1 rounded-lg font-mono text-label-sm font-semibold transition-all cursor-pointer border ${
                isBlockedDemoActive
                  ? 'bg-red-800 text-white border-red-900 shadow-sm'
                  : 'bg-surface-container-lowest text-on-surface hover:bg-surface-container border-outline-variant/30'
              }`}
            >
              🚫 4. Blocked Action Demo
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CUSTOMER INTENT BANNER                                                    */}
        {/* ========================================================================= */}
        <div className="p-space-16 rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-12">
          <div className="flex items-start gap-space-12">
            <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div>
              <span className="font-mono text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                Customer Intent Stream
              </span>
              <p className="font-body text-body-md font-medium text-on-surface italic mt-0.5">
                “{PRIMARY_CUSTOMER_INTENT}”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-8 self-end sm:self-center font-mono text-label-sm text-on-surface-variant">
            <span className="px-space-8 py-space-2 rounded bg-surface-container border border-outline-variant/20 text-emerald-800 font-semibold">
              Intent Parsed • Road Running
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN 12-COLUMN CONTENT GRID                                              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 items-start">
          {/* ======================================================================= */}
          {/* LEFT COLUMN: Chronological Timeline & Decision Detail (8 cols)          */}
          {/* ======================================================================= */}
          <div className="lg:col-span-8 flex flex-col gap-space-24">
            {/* Timeline Header Controls */}
            <div className="flex items-center justify-between pb-space-8 border-b border-surface-container-high">
              <div className="flex items-center gap-space-8">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="font-mono text-label-sm text-on-surface font-semibold uppercase tracking-wider">
                  Step-by-Step Decision Ledger ({events.length} Events)
                </span>
              </div>

              <div className="flex items-center gap-space-8 text-label-sm font-mono">
                <button
                  type="button"
                  onClick={expandAll}
                  className="text-secondary hover:underline cursor-pointer"
                >
                  Expand All
                </button>
                <span className="text-outline-variant">•</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="text-secondary hover:underline cursor-pointer"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Step-by-Step Deterministic Stream */}
            <div className="relative flex flex-col gap-space-16 pl-space-12 sm:pl-space-16">
              {/* Continuous Hairline Spine */}
              <div className="absolute left-[13px] sm:left-[17px] top-4 bottom-8 w-0.5 bg-surface-container-high -z-0" />

              {events.map((evt, idx) => {
                const isExpanded = !!expandedStepIds[evt.id];

                return (
                  <div key={evt.id} className="relative flex items-start gap-space-16 group">
                    {/* Number Node Icon */}
                    <div
                      className={`relative z-10 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-sm shrink-0 border-2 font-mono text-[11px] font-bold ${
                        evt.status === 'blocked'
                          ? 'bg-red-50 border-red-600 text-red-700'
                          : evt.status === 'failed'
                          ? 'bg-amber-50 border-amber-600 text-amber-700'
                          : evt.status === 'verified'
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-700'
                          : 'bg-surface-container-lowest border-secondary text-secondary'
                      }`}
                    >
                      {evt.status === 'blocked' ? (
                        <span className="material-symbols-outlined text-[14px]">block</span>
                      ) : evt.status === 'failed' ? (
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      ) : evt.status === 'verified' ? (
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      ) : (
                        String(evt.stepNumber || idx + 1).padStart(2, '0')
                      )}
                    </div>

                    {/* Step Card */}
                    <div className="w-full bg-surface-container-lowest rounded-xl p-space-16 sm:p-space-20 border border-outline-variant/30 shadow-sm transition-all hover:shadow-md">
                      {/* Step Header */}
                      <div className="flex flex-wrap items-center justify-between gap-space-8 pb-space-8">
                        <div className="flex items-center gap-space-8 flex-wrap">
                          <span className="px-space-8 py-0.5 rounded bg-surface-container font-mono text-[11px] text-on-surface font-semibold border border-outline-variant/20">
                            STEP {String(evt.stepNumber || idx + 1).padStart(2, '0')}
                          </span>
                          <span className="font-headline text-body-md font-bold text-on-surface">
                            {evt.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-space-8 font-mono text-label-sm text-on-surface-variant">
                          <span>{evt.timestamp}</span>
                          <span>•</span>
                          <span className="text-secondary font-medium">{evt.latencyMs || 12}ms</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                        {evt.description}
                      </p>

                      {/* Special Step 4 Product Visualization Card */}
                      {evt.eventType === 'PRODUCT_SELECTED' && (
                        <div className="mt-space-12 p-space-12 rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col sm:flex-row items-center gap-space-12">
                          <img
                            src={primaryProduct.images[0]}
                            alt={primaryProduct.name}
                            className="w-16 h-16 rounded-lg object-cover bg-surface-container-high border border-outline-variant/20 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-space-8">
                              <span className="font-headline font-bold text-on-surface text-body-md truncate">
                                {primaryProduct.name} Daily Road
                              </span>
                              <span className="font-mono font-bold text-on-surface text-body-md">
                                {formatCurrency(2799)}
                              </span>
                            </div>
                            <p className="font-body text-[11px] text-on-surface-variant mt-0.5">
                              Dual BioFoam • Road &amp; Pavement • Size US 9.5 Confirmed
                            </p>
                            <div className="mt-1 flex items-center gap-space-8 font-mono text-[10px] text-emerald-800">
                              <span className="bg-emerald-100 px-1.5 py-0.5 rounded font-bold">
                                99.2% MATCH SCORE
                              </span>
                              <span>RT-SUMMER200 (-₹200) Applied</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Sub-strip: Badge & Expand Toggle */}
                      <div className="mt-space-12 pt-space-8 border-t border-outline-variant/20 flex items-center justify-between flex-wrap gap-space-8">
                        <div className="flex items-center gap-space-8">
                          {evt.verificationBadge && (
                            <span
                              className={`px-space-8 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider ${
                                evt.status === 'blocked'
                                  ? 'bg-red-100 text-red-800'
                                  : evt.status === 'failed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {evt.verificationBadge}
                            </span>
                          )}
                          <span className="font-mono text-[11px] text-on-surface-variant uppercase">
                            Actor: {evt.actor}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleStep(evt.id)}
                          className="font-mono text-label-sm text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {isExpanded ? 'expand_less' : 'code'}
                          </span>
                          <span>{isExpanded ? 'Hide Payload' : 'View Payload & Explanation'}</span>
                        </button>
                      </div>

                      {/* Expandable Technical Detail Area (Step 5) */}
                      {isExpanded && (
                        <div className="mt-space-12 pt-space-12 border-t border-outline-variant/20 space-y-space-12">
                          {/* Human Operational Explanation */}
                          {evt.explanation && (
                            <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                              <span className="font-mono text-[10px] uppercase font-bold text-on-surface-variant block mb-1">
                                Operational Explanation:
                              </span>
                              <p className="font-body text-body-sm text-on-surface leading-relaxed">
                                {evt.explanation}
                              </p>
                            </div>
                          )}

                          {/* Technical JSON Payload (NO SECRETS) */}
                          {evt.payload && (
                            <div className="p-space-12 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-mono text-[11px]">
                              <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20 mb-2">
                                <span className="text-on-surface-variant font-bold uppercase">
                                  Technical Metadata (Non-Sensitive)
                                </span>
                                <span className="text-emerald-700">Audit Verified</span>
                              </div>
                              <pre className="text-on-surface overflow-x-auto whitespace-pre-wrap leading-relaxed">
                                {JSON.stringify(evt.payload, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ===================================================================== */}
            {/* STEP 6: DEDICATED "WHY THIS RECOMMENDATION?" SECTION                   */}
            {/* ===================================================================== */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 sm:p-space-24 border border-outline-variant/30 shadow-sm space-y-space-16">
              <div className="flex items-center justify-between pb-space-12 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[22px]">psychology</span>
                  <h2 className="font-headline text-headline-sm font-bold text-on-surface">
                    Why this recommendation?
                  </h2>
                </div>
                <div className="flex items-center gap-space-8">
                  <span className="px-space-8 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-label-sm font-bold">
                    99.2% Deterministic Match Score
                  </span>
                </div>
              </div>

              <p className="font-body text-body-md text-on-surface leading-relaxed">
                Selected <span className="font-bold text-on-surface">AeroRun X Daily Road</span> because it satisfies the customer's road-running requirement, stays <span className="font-semibold text-emerald-700">₹201 below</span> the customer's budget ceiling after the merchant credit, and achieved the highest deterministic match score in the catalog index.
              </p>

              {/* Requirement & Signal Verification Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-16 pt-space-4">
                {/* Customer Requirements */}
                <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-space-8">
                  <span className="font-mono text-label-sm text-on-surface-variant uppercase font-bold tracking-wider block">
                    Customer Requirements (User Constraints)
                  </span>
                  <div className="space-y-space-6 font-body text-body-sm">
                    <div className="flex items-center gap-space-8 text-on-surface">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                      <span>Running shoes category requested</span>
                    </div>
                    <div className="flex items-center gap-space-8 text-on-surface">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                      <span>Under ₹3,000 ceiling (₹2,799 settled)</span>
                    </div>
                    <div className="flex items-center gap-space-8 text-on-surface">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                      <span>Daily road running terrain optimization</span>
                    </div>
                  </div>
                </div>

                {/* Product Signals */}
                <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-space-8">
                  <span className="font-mono text-label-sm text-on-surface-variant uppercase font-bold tracking-wider block">
                    Product Signals (Catalog Truth)
                  </span>
                  <div className="space-y-space-6 font-body text-body-sm">
                    <div className="flex items-center gap-space-8 text-on-surface">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                      <span>Dual BioFoam road compound (500km road durability)</span>
                    </div>
                    <div className="flex items-center gap-space-8 text-on-surface">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                      <span>Within budget (₹201 headroom preserved)</span>
                    </div>
                    <div className="flex items-center gap-space-8 text-on-surface">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
                      <span>Merchant-approved offer RT-SUMMER200 (-₹200)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note about deterministic score */}
              <div className="p-space-12 rounded-lg bg-surface-container-lowest border border-outline-variant/20 font-mono text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>Score Formulation: Price Compliance (0.40) + Durability Index (0.35) + Delivery SLA (0.25)</span>
                <span className="text-on-surface font-semibold">Deterministic Match Score</span>
              </div>
            </div>

            {/* ===================================================================== */}
            {/* STEP 11: FORENSIC AUDIT TRAIL TERMINAL                                */}
            {/* ===================================================================== */}
            <div className="bg-[#0f141c] rounded-xl p-space-20 border border-outline-variant/40 shadow-xl text-[#c7d2fe] font-mono space-y-space-12">
              <div className="flex items-center justify-between pb-space-8 border-b border-gray-800">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-emerald-400 text-[18px]">terminal</span>
                  <span className="text-body-sm font-bold text-white tracking-wider uppercase">
                    Forensic Audit Trail (Monospace Ledger)
                  </span>
                </div>

                <div className="flex items-center gap-space-8">
                  <button
                    type="button"
                    onClick={handleCopyTerminal}
                    className="px-space-8 py-1 rounded bg-gray-800 text-gray-200 hover:bg-gray-700 transition-colors text-label-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      {copiedTerminal ? 'done' : 'content_copy'}
                    </span>
                    <span>{copiedTerminal ? 'Copied' : 'Copy Log'}</span>
                  </button>
                  <span className="text-[10px] text-gray-400">Node: rzp-bom-edge-04</span>
                </div>
              </div>

              <div className="bg-[#090d13] p-space-16 rounded-lg overflow-x-auto text-[12px] leading-relaxed select-all text-gray-300 font-mono">
                <pre>{buildForensicAuditLog(events)}</pre>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-space-4">
                <span>Cryptographic Digest: 0x9e81f72a431ced74b39210984128...verified</span>
                <span className="text-emerald-400">IMMUTABLE_ROOT_SEALED</span>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN: Enterprise Guardrails, Policies & Ledger (4 cols)         */}
          {/* ======================================================================= */}
          <div className="lg:col-span-4 flex flex-col gap-space-24">
            {/* CARD 1: AGENT GUARDRAILS (Step 7) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/30 shadow-sm space-y-space-16">
              <div className="flex items-center justify-between pb-space-12 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[20px]">shield</span>
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                    Agent Guardrails
                  </h3>
                </div>
                <span className="px-space-8 py-0.5 rounded bg-surface-container font-mono text-[10px] text-emerald-800 font-bold uppercase">
                  Active
                </span>
              </div>

              {/* 3 Core Principles */}
              <div className="space-y-space-8 font-body text-body-sm">
                <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between font-bold text-on-surface font-mono text-label-sm">
                    <span>01 — EXPLAINABLE</span>
                    <span className="text-emerald-700">Verified</span>
                  </div>
                  <p className="text-on-surface-variant text-[12px] mt-1">
                    Every recommendation has a visible deterministic rationale and candidate comparison.
                  </p>
                </div>

                <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between font-bold text-on-surface font-mono text-label-sm">
                    <span>02 — BOUNDED</span>
                    <span className="text-emerald-700">Enforced</span>
                  </div>
                  <p className="text-on-surface-variant text-[12px] mt-1">
                    The agent cannot change product, quantity, price, or currency without renewed customer approval.
                  </p>
                </div>

                <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                  <div className="flex items-center justify-between font-bold text-on-surface font-mono text-label-sm">
                    <span>03 — GATED</span>
                    <span className="text-emerald-700">Strict Lock</span>
                  </div>
                  <p className="text-on-surface-variant text-[12px] mt-1">
                    All money actions require explicit customer confirmation. Zero autonomous debits.
                  </p>
                </div>
              </div>

              {/* Guardrails Status Checkpoints */}
              <div className="space-y-space-6 pt-space-4 border-t border-outline-variant/20 font-body text-body-sm">
                <div className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface block">Customer Confirmation</span>
                    <span className="text-[11px] font-mono text-on-surface-variant">Required • Zero stealth charges</span>
                  </div>
                </div>

                <div className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface block">Merchant-Approved Offer</span>
                    <span className="text-[11px] font-mono text-on-surface-variant">Required • Margin bounds verified</span>
                  </div>
                </div>

                <div className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface block">Maximum Coupon Subsidy</span>
                    <span className="text-[11px] font-mono text-on-surface-variant">₹500 ceiling hardcoded by merchant</span>
                  </div>
                </div>

                <div className="flex items-start gap-space-8">
                  <span className="material-symbols-outlined text-emerald-700 text-[18px] shrink-0 mt-0.5">
                    check_circle
                  </span>
                  <div>
                    <span className="font-semibold text-on-surface block">Payment Authorization Gate</span>
                    <span className="text-[11px] font-mono text-on-surface-variant">Explicit customer session token</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: MERCHANT POLICIES (Step 8) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/30 shadow-sm space-y-space-12">
              <div className="flex items-center justify-between pb-space-8 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[20px]">storefront</span>
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                    Merchant Policies
                  </h3>
                </div>
                <span className="font-mono text-[10px] text-on-surface-variant uppercase">Demo Config</span>
              </div>

              <div className="space-y-space-8 font-mono text-label-sm">
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Maximum Order Value:</span>
                  <span className="font-bold text-on-surface">₹3,000</span>
                </div>
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Allowed Currency:</span>
                  <span className="font-bold text-on-surface">INR</span>
                </div>
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Automatic Discounts:</span>
                  <span className="font-bold text-emerald-700">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Maximum Discount:</span>
                  <span className="font-bold text-on-surface">₹500</span>
                </div>
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Customer Authorization:</span>
                  <span className="font-bold text-emerald-700">Required</span>
                </div>
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Payment Mode:</span>
                  <span className="font-bold text-on-surface">Razorpay Test Mode</span>
                </div>
                <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-low">
                  <span className="text-on-surface-variant">Agent Purchase Authority:</span>
                  <span className="font-bold text-secondary">GATED</span>
                </div>
              </div>
            </div>

            {/* CARD 3: POLICY EVALUATION (Step 9) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/30 shadow-sm space-y-space-12">
              <div className="flex items-center justify-between pb-space-8 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[20px]">fact_check</span>
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                    Policy Evaluation
                  </h3>
                </div>
                <span
                  className={`px-space-8 py-0.5 rounded font-mono text-[10px] font-bold ${
                    policyResult.allPassed
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {policyResult.outcome}
                </span>
              </div>

              <div className="flex items-center justify-between font-mono text-body-sm pb-space-4">
                <span className="text-on-surface-variant">Purchase Requested:</span>
                <span className="font-bold text-on-surface">{formatCurrency(policyEvalAmount)}</span>
              </div>

              <div className="space-y-space-6 font-body text-[12px]">
                {policyResult.checks.map((chk) => (
                  <div
                    key={chk.id}
                    className="flex items-start gap-space-8 p-space-6 rounded bg-surface-container-low"
                  >
                    <span
                      className={`material-symbols-outlined text-[16px] shrink-0 mt-0.5 ${
                        chk.passed ? 'text-emerald-700' : 'text-red-700'
                      }`}
                    >
                      {chk.passed ? 'check_circle' : 'cancel'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-on-surface">{chk.name}</span>
                        <span className="font-mono text-[11px] text-on-surface-variant">
                          {chk.actual}
                        </span>
                      </div>
                      <p className="text-on-surface-variant text-[11px] mt-0.5">{chk.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {!policyResult.allPassed && policyResult.blockedReason && (
                <div className="p-space-8 rounded bg-red-50 border border-red-200 text-red-800 font-mono text-[11px] mt-2">
                  <span className="font-bold block">BLOCKED:</span>
                  <span>{policyResult.blockedReason}</span>
                </div>
              )}
            </div>

            {/* CARD 4: BLOCKED ACTION DEMO (Step 10) */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/30 shadow-sm space-y-space-12">
              <div className="flex items-center justify-between pb-space-8 border-b border-surface-container-high">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-red-700 text-[20px]">gavel</span>
                  <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                    Blocked Action Demo
                  </h3>
                </div>
                <span className="px-space-8 py-0.5 rounded bg-red-50 text-red-700 font-mono text-[10px] font-bold border border-red-200">
                  DEMO CHECK
                </span>
              </div>

              <p className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                Demonstrates how ShopPilot bounded agency halts and rejects actions that violate merchant limits.
              </p>

              <div className="p-space-12 rounded-lg bg-red-50/50 border border-red-200/80 space-y-space-6 font-mono text-label-sm">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Attempt:</span>
                  <span className="text-red-800 font-bold">Change price to ₹3,499</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Merchant Policy:</span>
                  <span className="text-on-surface font-semibold">Max order value ₹3,000</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-red-200">
                  <span className="text-on-surface-variant font-bold">Result:</span>
                  <span className="px-space-8 py-0.5 rounded bg-red-700 text-white font-bold text-[11px]">
                    BLOCKED
                  </span>
                </div>
                <p className="font-body text-[11px] text-red-900 leading-normal pt-1">
                  “Agent cannot increase the authorized purchase above the merchant's configured ceiling of ₹3,000.”
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsBlockedDemoActive(!isBlockedDemoActive)}
                  className={`w-full py-space-8 px-space-12 rounded-lg font-mono text-label-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                    isBlockedDemoActive
                      ? 'bg-red-700 text-white border-red-800'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container border-outline-variant/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isBlockedDemoActive ? 'refresh' : 'play_circle'}
                  </span>
                  <span>{isBlockedDemoActive ? 'Reset to Authorized State' : 'Simulate Breach in Trace'}</span>
                </button>
              </div>

              <p className="font-mono text-[10px] text-on-surface-variant italic">
                * Note: Evaluated purely at the policy verification boundary. Zero money moved.
              </p>
            </div>

            {/* CARD 5: SESSION SETTLEMENT LEDGER */}
            <div className="bg-surface-container-lowest rounded-xl p-space-20 border border-outline-variant/30 shadow-sm space-y-space-12">
              <div className="flex items-center justify-between pb-space-8 border-b border-surface-container-high">
                <h3 className="font-headline text-headline-sm font-bold text-on-surface">
                  Session Settlement Ledger
                </h3>
                <span className="font-mono text-label-sm text-on-surface font-bold">#SP-1024</span>
              </div>

              <div className="space-y-space-6 font-mono text-body-sm">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Catalog Subtotal</span>
                  <span className="text-on-surface">{formatCurrency(2999)}</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Merchant Subsidy (RT-SUMMER200)</span>
                  <span className="text-emerald-700 font-semibold">-₹200.00</span>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span>Fulfillment &amp; GST</span>
                  <span className="text-on-surface">₹0.00</span>
                </div>

                <div className="pt-space-8 mt-space-8 flex items-baseline justify-between bg-surface-container-low p-space-12 rounded-lg border border-outline-variant/20">
                  <div className="flex flex-col">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase">Settlement Total</span>
                    <span className="text-body-sm text-emerald-800 font-semibold">Authorized Amount</span>
                  </div>
                  <span className="font-mono text-headline-md text-on-surface font-bold">
                    {formatCurrency(2799)}
                  </span>
                </div>
              </div>

              <div className="p-space-12 rounded-lg bg-surface-container-low flex flex-col gap-space-4 font-mono text-[11px] border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Wall-Clock Elapsed:</span>
                  <span className="text-on-surface font-semibold">42.1s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">AI Compute Overhead:</span>
                  <span className="text-on-surface font-semibold">142ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Ledger Block:</span>
                  <span className="text-secondary font-semibold">#8902-D</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-on-surface-variant">Merkle Root:</span>
                  <span className="text-on-surface truncate max-w-[140px]">0x9e81...a431</span>
                </div>
              </div>
            </div>

            {/* CARD 6: ENTERPRISE CRYPTOGRAPHIC GUARANTEE */}
            <div className="bg-surface-container-lowest rounded-xl p-space-16 border border-outline-variant/30 shadow-sm space-y-space-8">
              <div className="flex items-center gap-space-8">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span className="font-mono text-[11px] text-on-surface font-bold uppercase tracking-wider">
                  Enterprise Cryptographic Guarantee
                </span>
              </div>
              <p className="font-body text-[12px] text-on-surface-variant leading-relaxed">
                All agent decisions and monetary execution tokens are recorded into an append-only, tamper-evident trace. Full deterministic auditability guaranteed under SOC2 Type II, PCI DSS v4.0, and FIPS 140-3 standards.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* FOOTER ACTIONS BAR                                                        */}
        {/* ========================================================================= */}
        <div className="pt-space-16 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-space-16">
          <div className="flex items-center gap-space-12 text-body-sm font-body text-on-surface-variant">
            <Link to="/" className="hover:text-on-surface transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Back to Agent Home</span>
            </Link>
            <span>•</span>
            <Link to="/confirm" className="hover:text-on-surface transition-colors">
              Authorization Boundary
            </Link>
            <span>•</span>
            <Link to="/checkout" className="hover:text-on-surface transition-colors">
              Razorpay Checkout
            </Link>
          </div>

          <div className="flex items-center gap-space-12">
            <button
              type="button"
              onClick={handleExportJson}
              className="px-space-16 py-space-8 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-mono text-label-sm font-semibold transition-colors border border-outline-variant/30 cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download JSON Audit Log</span>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AgentTracePage;
