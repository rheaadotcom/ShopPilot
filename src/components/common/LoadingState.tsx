import React from 'react';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'AI Agent Processing...',
  subtext = 'Evaluating vector embeddings & merchant concession policies',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-space-32 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-L1',
        className
      )}
    >
      <div className="relative flex items-center justify-center w-12 h-12 mb-space-16 rounded-full bg-secondary-fixed/50 text-secondary">
        <span className="material-symbols-outlined text-[28px] animate-spin">progress_activity</span>
      </div>
      <h3 className="text-headline-sm font-semibold text-on-surface mb-1">{message}</h3>
      {subtext && <p className="text-body-sm text-on-surface-variant max-w-md">{subtext}</p>}
    </div>
  );
};
