import React from 'react';
import { useDemoFlow } from '../../hooks/useDemoFlow';
import { formatCurrency } from '../../lib/utils';

/**
 * Displays revenue and KPI metrics after the demo run.
 * Shown on the AgentHome page when demo data is available.
 */
export const DemoSummary: React.FC = () => {
  const { revenueMetrics, state } = useDemoFlow();

  // Only show after demo has completed (SUCCESS or FAILED) and metrics exist
  if (!revenueMetrics || (state !== 'SUCCESS' && state !== 'FAILED')) {
    return null;
  }

  const {
    totalRevenue,
    totalOrders,
    aiAssistedOrders,
    averageBasketValue,
    basketUplift,
    conversionRate,
  } = revenueMetrics;

  return (
    <div className="mt-space-24 p-space-16 rounded-xl bg-surface-container-lowest shadow-md border border-outline-variant/30">
      <h3 className="font-headline text-headline-sm text-on-surface font-bold mb-space-12">
        Demo Summary (Merchant Dashboard)
      </h3>
      <ul className="space-y-space-8 text-body-md text-on-surface-variant">
        <li>Total Revenue: {formatCurrency(totalRevenue)}</li>
        <li>Total Orders: {totalOrders}</li>
        <li>AI‑Assisted Orders: {aiAssistedOrders}</li>
        <li>Average Basket Value: {formatCurrency(averageBasketValue)}</li>
        <li>Basket Uplift: {formatCurrency(basketUplift)}</li>
        <li>Conversion Rate: {(conversionRate * 100).toFixed(1)}%</li>
      </ul>
    </div>
  );
};
