import React from 'react';
import { PriceLedger, MerchantOffer } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Badge } from '../common/Badge';

export interface PriceBreakdownProps {
  ledger: PriceLedger;
  offer?: MerchantOffer;
  title?: string;
  className?: string;
}

export const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  ledger,
  offer,
  title = 'Price Ledger & Settlement Summary',
  className,
}) => {
  return (
    <div
      className={`bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-space-20 shadow-L1 ${
        className || ''
      }`}
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-container-high">
        <h4 className="font-headline text-body-md font-bold text-on-surface">{title}</h4>
        <span className="text-[11px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
          LEDGER v2.4.1
        </span>
      </div>

      <div className="space-y-2.5 text-body-sm">
        {/* Base Price */}
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>Product Base Price</span>
          <span className="font-mono font-medium text-on-surface">
            {formatCurrency(ledger.basePrice)}
          </span>
        </div>

        {/* Merchant Concession */}
        {ledger.merchantDiscount > 0 && (
          <div className="flex items-center justify-between text-tertiary">
            <span className="flex items-center gap-1.5">
              <span>Merchant Offer</span>
              {offer && (
                <Badge variant="verified" size="sm">
                  {offer.code}
                </Badge>
              )}
            </span>
            <span className="font-mono font-semibold">
              -{formatCurrency(ledger.merchantDiscount)}
            </span>
          </div>
        )}

        {/* Logistics */}
        <div className="flex items-center justify-between text-on-surface-variant">
          <span className="flex items-center gap-1">
            <span>Logistics (Express 24h)</span>
            <span className="text-[11px] text-tertiary font-medium">FREE</span>
          </span>
          <span className="font-mono text-on-surface">
            {ledger.logisticsFee === 0 ? '₹0' : formatCurrency(ledger.logisticsFee)}
          </span>
        </div>

        {/* Taxes */}
        <div className="flex items-center justify-between text-on-surface-variant">
          <span>GST (18% Included)</span>
          <span className="font-mono text-on-surface">
            {ledger.gstAmount === 0 ? '₹0.00' : formatCurrency(ledger.gstAmount)}
          </span>
        </div>
      </div>

      {/* Total Final Settlement */}
      <div className="mt-4 pt-3.5 border-t border-surface-container-high flex items-baseline justify-between">
        <div>
          <span className="block text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">
            Total Final Settlement
          </span>
          <span className="text-[11px] font-mono text-tertiary flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[12px]">verified</span>
            Price locked by autonomous engine
          </span>
        </div>
        <div className="text-right">
          <span className="font-mono text-headline-md font-bold text-on-surface">
            {formatCurrency(ledger.totalSettlement)}
          </span>
        </div>
      </div>
    </div>
  );
};
