import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  onRetry?: () => void;
  retryText?: string;
  onSecondaryAction?: () => void;
  secondaryActionText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Execution Incomplete',
  message = 'No funds have been debited from your account. Your cart state and locked offer remain safe.',
  code,
  onRetry,
  retryText = 'Retry Transaction',
  onSecondaryAction,
  secondaryActionText = 'Return to Recommendation',
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-space-32 text-center bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-L1 max-w-lg mx-auto',
        className
      )}
    >
      <div className="w-12 h-12 mb-space-16 rounded-full bg-error-container text-error flex items-center justify-center">
        <span className="material-symbols-outlined text-[28px]">error_outline</span>
      </div>
      
      {code && (
        <span className="text-label-sm font-mono uppercase px-2.5 py-0.5 rounded bg-surface-container text-on-surface-variant mb-2">
          STATUS: {code}
        </span>
      )}

      <h3 className="text-headline-sm font-semibold text-on-surface mb-2">{title}</h3>
      <p className="text-body-sm text-on-surface-variant mb-space-24 leading-relaxed">{message}</p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <Button variant="primary" onClick={onRetry} iconLeft="refresh">
            {retryText}
          </Button>
        )}
        {onSecondaryAction && (
          <Button variant="outline" onClick={onSecondaryAction}>
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
};
