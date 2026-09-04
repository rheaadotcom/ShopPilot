import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { StatusIndicator } from '../common/StatusIndicator';
import { useCart } from '../../features/cart';

export interface NavbarProps {
  cartCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ cartCount }) => {
  let contextCount = 0;
  try {
    const cart = useCart();
    contextCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  } catch {
    contextCount = 1;
  }
  const effectiveCartCount = cartCount !== undefined ? cartCount : contextCount;

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface/90 backdrop-blur-md border-b border-outline-variant/30 z-50 transition-all">
      <div className="max-w-content mx-auto h-full px-gutter-desktop flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shadow-sm group-hover:bg-surface-tint transition-colors">
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-headline text-headline-sm font-bold text-on-surface tracking-tight">
              ShopPilot
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-outline-variant/30">
              AI Agent
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            AI Agent
          </NavLink>
          <NavLink
            to="/recommendation/aerorun-x"
            className={({ isActive }) =>
              `px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            Recommendation
          </NavLink>
          <NavLink
            to="/confirm"
            className={({ isActive }) =>
              `px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            Confirm
          </NavLink>
          <NavLink
            to="/checkout"
            className={({ isActive }) =>
              `px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            Checkout
          </NavLink>
          <NavLink
            to="/agent/trace"
            className={({ isActive }) =>
              `px-3 py-1.5 text-body-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              }`
            }
          >
            Decision Trace
          </NavLink>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block">
            <StatusIndicator status="live" label="Live Agent" sublabel="(BLR-04)" />
          </div>

          <Link
            to="/confirm"
            className="relative p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
            title="View Cart & Confirmation"
          >
            <span className="material-symbols-outlined text-[22px]">shopping_bag</span>
            {effectiveCartCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-secondary text-on-secondary text-[10px] font-mono font-bold rounded-full flex items-center justify-center">
                {effectiveCartCount}
              </span>
            )}
          </Link>

          <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm select-none">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
};
