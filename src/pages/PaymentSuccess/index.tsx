import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { PriceBreakdown } from '../../components/commerce/PriceBreakdown';
import { primaryProduct, defaultPriceLedger, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

export const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const product = primaryProduct;
  const session = defaultAgentSession;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Success Header */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-32 text-center shadow-L1 space-y-4">
          <div className="w-16 h-16 rounded-full bg-tertiary-fixed/40 text-tertiary flex items-center justify-center mx-auto shadow-sm">
            <span className="material-symbols-outlined text-[36px]">check_circle</span>
          </div>

          <div>
            <Badge variant="verified" size="sm" icon="lock">
              Paid via Razorpay UPI • Immutable Token Settled
            </Badge>
            <h1 className="font-headline text-display font-bold text-on-surface mt-3">
              Payment Successful
            </h1>
            <div className="font-mono text-display font-bold text-on-surface mt-1">
              {formatCurrency(defaultPriceLedger.totalSettlement)}
            </div>
          </div>

          {/* Transaction Metadata Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-surface-container-low rounded-xl text-mono-data text-[12px] text-left">
            <div>
              <span className="text-on-surface-variant block text-[10px] uppercase">Order ID</span>
              <span className="font-semibold text-on-surface">{session.sessionId}</span>
            </div>
            <div>
              <span className="text-on-surface-variant block text-[10px] uppercase">Transaction TX</span>
              <span className="font-semibold text-on-surface">{session.txId}</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-on-surface-variant block text-[10px] uppercase">Security Audit</span>
              <span className="font-semibold text-tertiary">ECDSA SIGNED</span>
            </div>
          </div>
        </div>

        {/* Product & Fulfillment Summary */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-20 shadow-L1 space-y-4">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
            <h3 className="font-headline text-body-md font-bold text-on-surface">
              Order Fulfillment Summary
            </h3>
            <span className="text-label-sm font-mono text-tertiary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
              {product.fulfillmentSla}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-16 h-16 rounded-xl object-cover border border-outline-variant/20 bg-surface-container-low"
            />
            <div className="flex-1">
              <h4 className="font-headline text-body-sm font-bold text-on-surface">
                {product.name}
              </h4>
              <p className="text-label-sm text-on-surface-variant">
                Size: UK {product.selectedSize} | Color: {product.colors[0]}
              </p>
            </div>
            <div className="font-mono text-body-md font-bold text-on-surface">
              {formatCurrency(product.finalPrice)}
            </div>
          </div>
        </div>

        {/* Ledger */}
        <PriceBreakdown ledger={defaultPriceLedger} offer={product.merchantOffer} />

        {/* Navigation & Trace Link */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            iconLeft="shopping_bag"
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>

          <Link
            to="/agent/trace"
            className="inline-flex items-center gap-1 text-body-sm font-semibold text-secondary hover:underline"
          >
            <span className="material-symbols-outlined text-[18px]">terminal</span>
            View Full Autonomous Decision Trace
          </Link>
        </div>
      </div>
    </PageLayout>
  );
};
export default PaymentSuccessPage;
