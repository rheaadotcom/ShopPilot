import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../common/Badge';

export interface AgentRationalePanelProps {
  rationale: string;
  matchScore?: number;
  intentText?: string;
  latencyMs?: number;
  defaultExpanded?: boolean;
  showTraceLink?: boolean;
  className?: string;
}

export const AgentRationalePanel: React.FC<AgentRationalePanelProps> = ({
  rationale,
  matchScore = 99.2,
  intentText = 'I need running shoes under ₹3,000 for daily running.',
  latencyMs = 142,
  defaultExpanded = true,
  showTraceLink = true,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div
      className={`bg-surface-container-lowest border border-secondary/20 rounded-xl overflow-hidden shadow-L1 transition-all ${
        className || ''
      }`}
    >
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-space-20 py-3.5 bg-secondary-fixed/30 hover:bg-secondary-fixed/50 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-headline text-body-sm font-bold text-on-surface">
                ShopPilot Agent Rationale
              </span>
              <Badge variant="score" size="sm">
                {matchScore}% Match
              </Badge>
            </div>
            <span className="text-[11px] font-mono text-on-surface-variant">
              Evaluated in {latencyMs}ms across 24 catalog candidates
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="text-label-sm font-medium hidden sm:inline">
            {isExpanded ? 'Collapse' : 'Inspect'}
          </span>
          <span
            className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          >
            expand_more
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-space-20 space-y-3.5 border-t border-secondary/15">
          {intentText && (
            <div className="bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30 text-body-sm">
              <span className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">
                Parsed Customer Intent
              </span>
              <p className="font-medium text-on-surface italic">"{intentText}"</p>
            </div>
          )}

          <div className="text-body-sm text-on-surface leading-relaxed">
            <span className="font-semibold block mb-1">Algorithmic Decision:</span>
            <p className="text-on-surface-variant">{rationale}</p>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-surface-container-high text-label-sm">
            <span className="flex items-center gap-1.5 text-tertiary font-medium">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Policy Guardrails Verified (Zero-Drift)
            </span>

            {showTraceLink && (
              <Link
                to="/agent/trace"
                className="text-secondary hover:underline font-semibold flex items-center gap-1"
              >
                Inspect Agent Trace
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
