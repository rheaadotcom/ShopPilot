import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: string;
  iconRight?: string;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

  const variantStyles = {
    primary:
      'bg-primary text-white hover:bg-surface-tint shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] rounded-lg',
    secondary:
      'bg-secondary text-on-secondary hover:bg-secondary-container shadow-sm rounded-lg',
    outline:
      'bg-surface-container-lowest text-on-surface border border-outline-variant/50 hover:bg-surface-container-low hover:border-outline-variant rounded-lg',
    ghost:
      'bg-transparent text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface rounded-lg',
    tertiary:
      'bg-tertiary-fixed/30 text-on-tertiary-container hover:bg-tertiary-fixed/50 rounded-lg',
  };

  const sizeStyles = {
    sm: 'h-8 px-3 text-label-sm gap-1.5',
    md: 'h-10 px-4 text-body-sm gap-2',
    lg: 'h-12 px-6 text-body-md gap-2.5 font-semibold',
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
      ) : (
        iconLeft && <span className="material-symbols-outlined text-[18px]">{iconLeft}</span>
      )}
      {children}
      {!isLoading && iconRight && (
        <span className="material-symbols-outlined text-[18px]">{iconRight}</span>
      )}
    </button>
  );
};
