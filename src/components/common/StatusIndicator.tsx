import React from 'react';
import { cn } from '../../lib/utils';

export interface StatusIndicatorProps {
  status?: 'live' | 'verified' | 'pending' | 'error' | 'neutral';
  label?: string;
  className?: string;
  sublabel?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = 'verified',
  label,
  sublabel,
  className,
}) => {
  const dotColors = {
    live: 'bg-secondary',
    verified: 'bg-tertiary',
    pending: 'bg-amber-500',
    error: 'bg-error',
    neutral: 'bg-outline',
  };

  return (
    <div className={cn('inline-flex items-center gap-2 text-label-md select-none', className)}>
      <span className="relative flex h-2 w-2">
        {status === 'live' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
        )}
        <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[status])} />
      </span>
      {label && (
        <span className="font-medium text-on-surface">
          {label}
          {sublabel && <span className="ml-1 text-on-surface-variant font-normal">{sublabel}</span>}
        </span>
      )}
    </div>
  );
};
