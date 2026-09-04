import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Badge } from '../../components/common/Badge';
import { primaryProduct, defaultPriceLedger, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

export const PaymentFailurePage: React.FC = () => {
  const navigate = useNavigate();
  const product = primaryProduct;
  const session = defaultAgentSession;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Failure Header */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-24 shadow-L1 space-y-4 text-center">
          <div className="w-14 h-14 rounded-full bg-error-container text-error flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">error_outline</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="error" size="sm">
                STATUS: 402 PAYMENT_INCOMPLETE
              </Badge>
              <Badge variant="verified" size="sm" icon="lock">
                Offer Locked
              </Badge>
            </div>
            <h1 className="font-headline text-headline-lg font-bold text-on-surface">
              Payment Couldn't Be Completed
            </h1>
            <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
              No money has been charged to your account. Your session state, selected shoe size, and ₹200 merchant discount remain safely reserved.
            </p>
          </div>
        </div>

        {/* AI Concierge Reassurance Box */}
        <div className="bg-secondary-fixed/20 border border-secondary/20 rounded-xl p-space-16 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">psychology</span>
          </div>
          <div>
            <h4 className="font-headline text-body-sm font-bold text-on-surface">
              ShopPilot Concierge Assistance
            </h4>
            <p className="text-body-sm text-on-surface-variant mt-0.5">
              "The payment attempt timed out or was rejected by the simulated rail. I have retained your <span className="font-semibold text-on-surface">{product.name}</span> reservation for 14 minutes at <span className="font-mono font-semibold text-on-surface">{formatCurrency(defaultPriceLedger.totalSettlement)}</span>."
            </p>
          </div>
        </div>

        {/* Recovery Action Cards */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-20 shadow-L1 space-y-3">
          <h3 className="font-headline text-body-md font-bold text-on-surface">
            Select a Recovery Option
          </h3>

          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full p-4 rounded-xl border border-secondary/30 bg-surface-container-lowest hover:bg-secondary-fixed/20 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary text-[24px]">refresh</span>
                <div>
                  <div className="font-headline text-body-sm font-bold text-on-surface">
                    Retry Payment Gateway
                  </div>
                  <span className="text-label-sm text-on-surface-variant">
                    Re-initiate Razorpay test modal with existing authorization token
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-secondary">
                arrow_forward
              </span>
            </button>

            <button
              onClick={() => navigate('/confirm')}
              className="w-full p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:bg-surface-container-low text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[24px]">edit_note</span>
                <div>
                  <div className="font-headline text-body-sm font-bold text-on-surface">
                    Return to Order Confirmation
                  </div>
                  <span className="text-label-sm text-on-surface-variant">
                    Review cart items, change shoe size, or view ledger breakdown
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-on-surface">
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Abort Audit Trace Callout */}
        <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl text-mono-data text-[12px]">
          <span className="text-on-surface-variant">Session {session.sessionId}</span>
          <span className="text-tertiary flex items-center gap-1 font-semibold">
            <span className="material-symbols-outlined text-[14px]">shield</span>
            Deterministic Abort Sequence Logged
          </span>
        </div>
      </div>
    </PageLayout>
  );
};
export default PaymentFailurePage;
