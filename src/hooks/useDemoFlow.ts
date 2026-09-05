import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useCart } from '../features/cart/CartContext';
import { primaryProduct, alternativeProducts } from '../data/mockData';
import { getRevenueMetrics } from '../lib/revenueAnalytics';

export enum DemoState {
  IDLE = 'IDLE',
  INTENT = 'INTENT',
  UNDERSTANDING = 'UNDERSTANDING',
  RECOMMENDATION = 'RECOMMENDATION',
  OFFER = 'OFFER',
  OPTIMIZATION = 'OPTIMIZATION',
  POLICY_CHECK = 'POLICY_CHECK',
  APPROVAL = 'APPROVAL',
  CHECKOUT = 'CHECKOUT',
  PAYMENT = 'PAYMENT',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

interface DemoContextValue {
  state: DemoState;
  startDemo: () => void;
  resetDemo: () => void;
  exitDemo: () => void;
  showPolicyBlockDemo: boolean;
  togglePolicyBlockDemo: () => void;
  revenueMetrics: ReturnType<typeof getRevenueMetrics> | null;
}

const DemoContext = createContext<DemoContextValue | undefined>(undefined);

type Action =
  | { type: 'START' }
  | { type: 'RESET' }
  | { type: 'EXIT' }
  | { type: 'SET_STATE'; payload: DemoState };

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case 'START':
      return DemoState.INTENT;
    case 'RESET':
    case 'EXIT':
      return DemoState.IDLE;
    case 'SET_STATE':
      return action.payload;
    default:
      return state;
  }
}

export const DemoFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, DemoState.IDLE);
  const { clearCart, resetDefaultCart, addToCart, authorizePurchase } = useCart();
  const [showPolicyBlockDemo, setShowPolicyBlockDemo] = React.useState(false);
  const [revenueMetrics, setRevenueMetrics] = React.useState<ReturnType<typeof getRevenueMetrics> | null>(null);

  const startDemo = () => {
    dispatch({ type: 'START' });
    dispatch({ type: 'SET_STATE', payload: DemoState.UNDERSTANDING });
    dispatch({ type: 'SET_STATE', payload: DemoState.RECOMMENDATION });
    clearCart();
    addToCart(primaryProduct);
    dispatch({ type: 'SET_STATE', payload: DemoState.OFFER });
    const addOn = alternativeProducts[0];
    addToCart(addOn);
    dispatch({ type: 'SET_STATE', payload: DemoState.OPTIMIZATION });
    dispatch({ type: 'SET_STATE', payload: DemoState.POLICY_CHECK });
    dispatch({ type: 'SET_STATE', payload: DemoState.APPROVAL });
    dispatch({ type: 'SET_STATE', payload: DemoState.CHECKOUT });
    try {
      authorizePurchase();
      dispatch({ type: 'SET_STATE', payload: DemoState.PAYMENT });
    } catch (e) {
      dispatch({ type: 'SET_STATE', payload: DemoState.FAILED });
    }
    setRevenueMetrics(getRevenueMetrics());
  };

  const resetDemo = () => {
    resetDefaultCart();
    dispatch({ type: 'RESET' });
    setRevenueMetrics(null);
  };

  const exitDemo = () => {
    resetDefaultCart();
    dispatch({ type: 'EXIT' });
    setRevenueMetrics(null);
  };

  const togglePolicyBlockDemo = () => {
    setShowPolicyBlockDemo((prev) => !prev);
  };

  const value: DemoContextValue = {
    state,
    startDemo,
    resetDemo,
    exitDemo,
    showPolicyBlockDemo,
    togglePolicyBlockDemo,
    revenueMetrics,
  };

  return React.createElement(DemoContext.Provider, { value }, children);
};

export const useDemoFlow = (): DemoContextValue => {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemoFlow must be used within DemoFlowProvider');
  }
  return ctx;
};
