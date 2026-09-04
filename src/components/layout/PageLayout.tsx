import React from 'react';
import { cn } from '../../lib/utils';
import { Navbar } from '../navigation/Navbar';

export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  cartCount?: number;
  showNavbar?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  className,
  cartCount,
  showNavbar = true,
}) => {
  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-secondary-fixed selection:text-secondary">
      {showNavbar && <Navbar cartCount={cartCount} />}
      
      <main
        className={cn(
          'flex-1 w-full max-w-content mx-auto px-gutter-desktop pt-20 pb-16 transition-all',
          className
        )}
      >
        {children}
      </main>

      <footer className="border-t border-outline-variant/30 py-6 text-center text-label-sm text-on-surface-variant">
        <div className="max-w-content mx-auto px-gutter-desktop flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-on-surface">ShopPilot AI</span>
            <span>•</span>
            <span>Autonomous Commerce Engine v2.4</span>
          </div>
          <div className="flex items-center gap-4 text-mono-data">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-tertiary">shield_lock</span>
              Razorpay Test Network
            </span>
            <span>BLR-04 Edge</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
