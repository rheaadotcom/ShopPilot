import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { TestModeBanner } from '../../components/payment/TestModeBanner';
import { PriceBreakdown } from '../../components/commerce/PriceBreakdown';
import { primaryProduct, defaultPriceLedger, defaultAgentSession } from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const product = primaryProduct;
  const session = defaultAgentSession;

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Sandbox Test Mode Banner */}
        <TestModeBanner
          sessionId={session.sessionId}
          nodeId={session.nodeId}
          rail={session.rail}
        />

        {/* Security Telemetry */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-space-24 shadow-L1 space-y-6">
          <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
            <div>
              <h1 className="font-headline text-headline-sm font-bold text-on-surface">
                Razorpay Checkout Gateway
              </h1>
              <p className="text-body-sm text-on-surface-variant">
                Immutable authorization token verified for session {session.sessionId}
              </p>
            </div>
            <Badge variant="test" size="sm">
              SANDBOX RAIL
            </Badge>
          </div>

          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 space-y-2 text-mono-data text-[12px]">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Security Protocol:</span>
              <span className="font-semibold text-on-surface">{session.tlsInfo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">ECDSA Authorization:</span>
              <span className="font-semibold text-tertiary">3a9f...81c2 (VERIFIED)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Merchant Account:</span>
              <span className="text-on-surface">rzp_test_aeroathletics_01</span>
            </div>
          </div>

          {/* Mini Order Summary */}
          <div className="flex items-center justify-between p-3 bg-surface-container-lowest border border-outline-variant/20 rounded-xl">
            <div className="flex items-center gap-3">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover bg-surface-container-low"
              />
              <div>
                <h4 className="font-headline text-body-sm font-bold text-on-surface">
                  {product.name}
                </h4>
                <span className="text-[11px] font-mono text-on-surface-variant">
                  Size: {product.selectedSize} | Qty: 1
                </span>
              </div>
            </div>
            <div className="font-mono text-body-md font-bold text-on-surface">
              {formatCurrency(defaultPriceLedger.totalSettlement)}
            </div>
          </div>

          <PriceBreakdown ledger={defaultPriceLedger} offer={product.merchantOffer} />

          {/* Razorpay Gateway Simulation Actions */}
          <div className="pt-4 border-t border-surface-container-high space-y-3">
            <h4 className="text-label-sm font-semibold text-on-surface-variant uppercase tracking-wider">
              Gateway Trigger Simulator (Phase 2 MVP Preview)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/payment/success')}
                iconLeft="check_circle"
                className="w-full"
              >
                Simulate Success
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/payment/failure')}
                iconLeft="error_outline"
                className="w-full text-error border-error/30 hover:bg-error-container/20"
              >
                Simulate Failure
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/confirm')}
              iconLeft="arrow_back"
              className="w-full mt-2"
            >
              Back to Confirmation
            </Button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};
export default CheckoutPage;
