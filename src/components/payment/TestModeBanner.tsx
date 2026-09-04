import React from 'react';
import { cn } from '../../lib/utils';

export interface TestModeBannerProps {
  sessionId?: string;
  nodeId?: string;
  rail?: string;
  className?: string;
  compact?: boolean;
}

export const TestModeBanner: React.FC<TestModeBannerProps> = ({
  sessionId = '#SP-1024-AUTH',
  nodeId = 'NODE BLR-04',
  rail = 'RZP TEST-RAIL v2.4',
  className,
  compact = false,
}) => {
  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-label-sm font-mono text-on-surface select-none',
          className
        )}
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="font-semibold">TEST MODE</span>
        <span className="text-on-surface-variant">|</span>
        <span className="text-on-surface-variant">{sessionId}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-space-12 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-amber-700">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
        </div>
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="text-label-md font-bold text-on-surface uppercase tracking-wide">
              Razorpay Test Network
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold border border-amber-300/60">
              SIMULATED RAIL
            </span>
          </div>
          <p className="text-label-sm text-on-surface-variant">
            No real currency is debited. Safe sandbox environment for autonomous agent validation.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant self-end sm:self-center bg-surface-container-lowest px-2.5 py-1 rounded-md border border-outline-variant/30">
        <span>{nodeId}</span>
        <span>•</span>
        <span>{rail}</span>
      </div>
    </div>
  );
};
