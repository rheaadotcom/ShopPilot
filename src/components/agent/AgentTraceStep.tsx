import React, { useState } from 'react';
import { AgentTraceStepData } from '../../types';
import { Badge } from '../common/Badge';

export interface AgentTraceStepProps {
  step: AgentTraceStepData;
  isLast?: boolean;
  className?: string;
}

export const AgentTraceStep: React.FC<AgentTraceStepProps> = ({
  step,
  isLast = false,
  className,
}) => {
  const [showPayload, setShowPayload] = useState(false);

  const formattedStepNum = String(step.stepNumber).padStart(2, '0');

  return (
    <div className={`relative flex gap-4 ${className || ''}`}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute top-9 left-4 -ml-px w-0.5 h-[calc(100%-1.25rem)] bg-outline-variant/40" />
      )}

      {/* Numbered Step Node */}
      <div className="relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-surface-container-lowest border-2 border-secondary flex items-center justify-center font-mono text-label-sm font-bold text-secondary shadow-sm">
        {formattedStepNum}
      </div>

      {/* Step Card Content */}
      <div className="flex-1 pb-6">
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-16 shadow-L1">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/20">
                {step.category}
              </span>
              <h4 className="font-headline text-body-sm font-bold text-on-surface">{step.name}</h4>
            </div>

            <div className="flex items-center gap-2 text-label-sm font-mono text-on-surface-variant">
              <span>{step.timestamp}</span>
              <span>•</span>
              <span className="text-secondary font-medium">{step.latencyMs}ms</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-body-sm text-on-surface-variant leading-relaxed mb-3">
            {step.description}
          </p>

          {/* Badges & Payload Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-surface-container-high">
            <div className="flex items-center gap-2">
              {step.verificationBadge && (
                <Badge variant="verified" size="sm" icon="check_circle">
                  {step.verificationBadge}
                </Badge>
              )}
            </div>

            {step.parameters && (
              <button
                type="button"
                onClick={() => setShowPayload(!showPayload)}
                className="text-label-sm font-mono text-secondary hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">code</span>
                {showPayload ? 'Hide Payload' : 'View Payload'}
              </button>
            )}
          </div>

          {/* Parameters Payload View */}
          {showPayload && step.parameters && (
            <div className="mt-3 p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-mono-data text-[12px] overflow-x-auto">
              <pre className="text-on-surface font-mono whitespace-pre-wrap">
                {JSON.stringify(step.parameters, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
