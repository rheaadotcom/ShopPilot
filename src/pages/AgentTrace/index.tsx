import React from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { AgentTraceStep } from '../../components/agent/AgentTraceStep';
import { defaultAgentSession } from '../../data/mockData';

export const AgentTracePage: React.FC = () => {
  const session = defaultAgentSession;

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `shoppilot_audit_trace_${session.sessionId.replace(/[^a-zA-Z0-9]/g, '')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container-high pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="agent" size="sm" icon="terminal">
                Audit Stream
              </Badge>
              <span className="font-mono text-mono-data text-on-surface-variant">
                UID: {session.sessionUid}
              </span>
            </div>
            <h1 className="font-headline text-headline-lg font-bold text-on-surface">
              Autonomous Agent Decision Trace
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              Deterministic, cryptographically-bound execution ledger for session {session.sessionId}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={handleExportJson}
            iconLeft="file_download"
          >
            Export Audit Log (JSON)
          </Button>
        </div>

        {/* 4-Column Metrics Bar from Stitch Screen 11 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3.5 shadow-L1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Policy Engine
            </span>
            <span className="font-mono text-body-sm font-bold text-tertiary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              {session.metrics.policyEngine}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3.5 shadow-L1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Retrieval Latency
            </span>
            <span className="font-mono text-body-sm font-bold text-secondary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">speed</span>
              {session.metrics.retrievalLatency}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3.5 shadow-L1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Authorization Hook
            </span>
            <span className="font-mono text-body-sm font-bold text-on-surface flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">key</span>
              {session.metrics.authorizationHook}
            </span>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-3.5 shadow-L1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block">
              Settlement State
            </span>
            <span className="font-mono text-body-sm font-bold text-tertiary flex items-center gap-1 mt-1">
              <span className="material-symbols-outlined text-[14px]">lock</span>
              {session.metrics.settlementIntegrity}
            </span>
          </div>
        </div>

        {/* Cryptographic Session Root Card */}
        <div className="p-space-16 bg-surface-container-low border border-outline-variant/30 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-mono-data text-[12px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[18px]">fingerprint</span>
            <span className="font-semibold text-on-surface">ECDSA ROOT HASH:</span>
            <span className="text-on-surface-variant">{session.ecdsaSignature}</span>
          </div>
          <span className="text-tertiary font-bold bg-surface-container-lowest px-2 py-0.5 rounded border border-outline-variant/20">
            INTEGRITY VERIFIED
          </span>
        </div>

        {/* 9-Step Chronological Execution Stream */}
        <div className="pt-2">
          <h2 className="font-headline text-headline-sm font-bold text-on-surface mb-4">
            Deterministic Pipeline Execution ({session.steps.length} Steps)
          </h2>

          <div className="space-y-0">
            {session.steps.map((step, index) => (
              <AgentTraceStep
                key={step.stepNumber}
                step={step}
                isLast={index === session.steps.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default AgentTracePage;
