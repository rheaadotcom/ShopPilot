import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'verified' | 'score' | 'agent' | 'info' | 'error' | 'test' | 'neutral';
  size?: 'sm' | 'md';
  icon?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-medium select-none tracking-tight';

  const variantStyles = {
    verified: 'bg-tertiary-fixed/30 text-on-tertiary-container border border-tertiary-fixed-dim/40 rounded-full',
    score: 'bg-secondary text-on-secondary font-mono font-semibold rounded-full',
    agent: 'bg-secondary-fixed text-secondary border border-secondary/20 rounded-full',
    info: 'bg-surface-container-low text-on-surface-variant border border-outline-variant/30 rounded-lg',
    error: 'bg-error-container text-on-error-container border border-error/20 rounded-full',
    test: 'bg-surface-container text-on-surface border border-outline-variant/40 rounded-lg font-mono',
    neutral: 'bg-surface-container text-on-surface-variant rounded-md',
  };

  const sizeStyles = {
    sm: 'text-label-sm px-2 py-0.5 gap-1',
    md: 'text-body-sm px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props}>
      {icon && <span className="material-symbols-outlined text-[14px] leading-none">{icon}</span>}
      {children}
    </span>
  );
};
