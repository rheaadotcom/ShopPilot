import { demoOrders, primaryProduct } from '../data/mockData';
import { Product } from '../types';

/** Calculate total revenue from deterministic demo orders */
export const getTotalRevenue = (): number =>
  demoOrders.reduce((sum, order) => sum + order.total, 0);

/** Count AI-assisted orders (those that are not the primary product) */
export const getAiAssistedOrdersCount = (): number =>
  demoOrders.filter((o) => o.productId !== primaryProduct.id).length;

/** Average basket value across all demo orders */
export const getAverageBasketValue = (): number => {
  if (demoOrders.length === 0) return 0;
  return getTotalRevenue() / demoOrders.length;
};

/** Total basket uplift from add‑on products */
export const getBasketUplift = (): number =>
  demoOrders
    .filter((o) => o.productId !== primaryProduct.id)
    .reduce((sum, o) => {
      const base = primaryProduct.finalPrice * o.quantity;
      return sum + (o.total - base);
    }, 0);

/** Conversion rate: AI‑assisted orders / total orders */
export const getConversionRate = (): number => {
  if (demoOrders.length === 0) return 0;
  return getAiAssistedOrdersCount() / demoOrders.length;
};

/** Composite metrics for merchant dashboard */
export const getRevenueMetrics = () => {
  const totalRevenue = getTotalRevenue();
  const totalOrders = demoOrders.length;
  const aiOrders = getAiAssistedOrdersCount();
  const avgBasket = getAverageBasketValue();
  const uplift = getBasketUplift();
  const conversion = getConversionRate();
  return {
    totalRevenue,
    totalOrders,
    aiAssistedOrders: aiOrders,
    averageBasketValue: avgBasket,
    basketUplift: uplift,
    conversionRate: conversion,
  };
};
