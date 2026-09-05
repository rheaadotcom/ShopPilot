# ShopPilot — AI Commerce Agent

> From customer intent to explainable, policy-aware checkout.

ShopPilot is an AI‑powered commerce agent that transforms natural‑language shopping requests into a guided, explainable, and policy‑aware purchase journey.

Instead of forcing customers to search through multiple products, compare prices manually, discover offers, and navigate a traditional checkout flow, ShopPilot understands the customer's intent, identifies the best product match, applies eligible merchant offers, optimizes the basket within spending boundaries, asks for explicit approval, and completes the payment through Razorpay Test Mode.

The project demonstrates how an AI commerce agent can combine:

- Natural‑language customer intent
- Product recommendation
- Explainable AI decisions
- Deterministic pricing and settlement
- Merchant offers
- Budget‑aware basket optimization
- Merchant guardrails
- Customer approval gates
- Payment processing
- Failure recovery
- Agent execution tracing
- Revenue intelligence
- A deterministic live demo

---

## 🚀 What Problem Does ShopPilot Solve?

Traditional e‑commerce makes the customer perform many steps:

1. Understand what they need
2. Search products
3. Filter by price
4. Compare alternatives
5. Check ratings/specifications
6. Search for discounts
7. Apply offers
8. Decide whether recommendations are trustworthy
9. Add products to cart
10. Checkout
11. Make payment

This creates friction and makes the shopping journey fragmented.

ShopPilot changes this model.

The customer can provide a request such as:

> "I need running shoes under ₹3,000 for daily running."

The agent interprets the request and converts it into structured constraints:

- Category: Running Shoes
- Budget ceiling: ₹3,000
- Use case: Daily Road Running
- Availability requirement
- Rating requirements

It then finds the strongest product match, explains why it was selected, applies an eligible merchant offer, and presents a deterministic settlement amount.

The agent can also identify a relevant complementary product, but it does **not** automatically add it or charge the customer. The customer must explicitly approve the recommendation.

This creates a commerce experience that is:

**Intent‑driven + Explainable + Bounded + Customer‑controlled**

---

## 🎯 Core Value Proposition

ShopPilot is designed around three principles:

### 1. Explainable
The customer can inspect why a product was selected.

The system exposes:
- Customer intent
- Extracted constraints
- Product match score
- Recommendation rationale
- Offer applied
- Price calculation
- Agent execution trace

### 2. Bounded
The AI does not have unlimited purchasing authority.

Merchant policies define boundaries such as:
- Maximum basket value
- Maximum discount
- Upselling enabled/disabled
- Cross‑selling enabled/disabled
- Automatic offer application
- Payment approval requirements

### 3. Gated
Important actions require explicit customer approval.

For example, when the AI discovers a complementary product, it presents the recommendation first.

The customer can choose:

**Add to basket**

or

**Keep current basket**

No autonomous purchase is made without the appropriate approval.

---

## 🧠 How ShopPilot Works

The complete flow is:

```text
Customer Intent
      ↓
Intent Understanding
      ↓
Constraint Extraction
      ↓
Catalog Retrieval
      ↓
Product Matching
      ↓
Explainable Recommendation
      ↓
Merchant Offer
      ↓
Deterministic Price Ledger
      ↓
Basket Optimization
      ↓
Merchant Policy Check
      ↓
Customer Approval
      ↓
Checkout
      ↓
Razorpay Test Mode
      ↓
Payment Verification
      ↓
Success / Failure Recovery
      ↓
Revenue Intelligence
```

---

## 🏗️ Architecture & Technology Stack

**Frontend**
- **React 18** with functional components and hooks
- **TypeScript** for static typing
- **Vite** as the build tool and development server (`npm run dev`)
- **Vanilla CSS** implementing the custom *Stitch* design system (no Tailwind or external UI libraries)
- **React Router v6** for client‑side routing
- **Context API**:
  - `CartContext` – manages cart state, Razorpay checkout, and order persistence
  - `DemoFlowProvider` (via `useDemoFlow` hook) – deterministic state machine that drives the live demo
- **UI Components**: `RunLiveDemoButton`, `DemoControls`, `DemoSummary` – all styled consistently with the existing design tokens

**Backend**
- **Node.js** with **Express** (written in TypeScript) serving static assets and providing a thin proxy for Razorpay Test Mode integration
- Environment configuration via `.env` (Razorpay test keys are loaded here)

**Data Layer**
- **`src/data/mockData.ts`** – single source of truth for product catalog, deterministic `demoOrders`, and demo scenarios. No database is used.
- **Revenue Analytics** (`src/lib/revenueAnalytics.ts`) – derives KPIs (total revenue, AI‑assisted orders, basket uplift, conversion rate, etc.) directly from `demoOrders`.
- **Policy Engine** (`src/lib/policyEngine.ts`) – synchronous client‑side validation of merchant guardrails, persisted in `localStorage`.

**Payments**
- **Razorpay Test Mode** – client‑side checkout flow using Razorpay’s sandbox credentials. No real transactions are performed.

**Demo Flow**
- The deterministic flow is orchestrated by `useDemoFlow` (state machine with states like `IDLE → INTENT → … → SUCCESS`).
- UI components subscribe to this context to render appropriate screens and controls.
- `DemoSummary` displays the calculated revenue intelligence metrics after a successful demo run.

**Overall Architecture**
1. **User Interaction** → UI component triggers demo via `RunLiveDemoButton`.
2. **DemoFlowProvider** updates state machine, driving the sequence of actions.
3. **Hooks & Contexts** fetch data from `mockData.ts`, apply the **policy engine**, and compute **revenue analytics**.
4. **Razorpay Checkout** is invoked only after explicit customer approval.
5. **Agent Trace** logs each step for visibility on the merchant dashboard.
6. **Result** – a fully explainable, policy‑aware checkout experience showcased in a single click.

---

## 🛠️ Key Implementation Code

Below are the core pieces that make the demo flow work. They are intentionally concise to illustrate the architecture without exposing the entire codebase.

### `useDemoFlow.ts`
```tsx
import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useCart } from '../features/cart/CartContext';
import { primaryProduct, alternativeProducts } from '../data/mockData';
import { getRevenueMetrics } from '../lib/revenueAnalytics';

export enum DemoState { IDLE, INTENT, UNDERSTANDING, RECOMMENDATION, OFFER, OPTIMIZATION, POLICY_CHECK, APPROVAL, CHECKOUT, PAYMENT, SUCCESS, FAILED }

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
    case 'START': return DemoState.INTENT;
    case 'RESET':
    case 'EXIT': return DemoState.IDLE;
    case 'SET_STATE': return action.payload;
    default: return state;
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
    } catch {
      dispatch({ type: 'SET_STATE', payload: DemoState.FAILED });
    }
    setRevenueMetrics(getRevenueMetrics());
  };

  const resetDemo = () => { resetDefaultCart(); dispatch({ type: 'RESET' }); setRevenueMetrics(null); };
  const exitDemo = () => { resetDefaultCart(); dispatch({ type: 'EXIT' }); setRevenueMetrics(null); };
  const togglePolicyBlockDemo = () => setShowPolicyBlockDemo(prev => !prev);

  const value: DemoContextValue = { state, startDemo, resetDemo, exitDemo, showPolicyBlockDemo, togglePolicyBlockDemo, revenueMetrics };
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
};

export const useDemoFlow = (): DemoContextValue => {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemoFlow must be used within DemoFlowProvider');
  return ctx;
};
```

### `CartContext.tsx`
```tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, MerchantOffer, PurchaseAuthorization, PriceLedger, PaymentVerificationResult } from '../../types';
import { primaryProduct, mockOffer, PRIMARY_CUSTOMER_INTENT } from '../../data/mockData';

export interface CartContextValue {
  items: CartItem[];
  appliedOffer: MerchantOffer | null;
  customerIntent: string;
  authorization: PurchaseAuthorization | null;
  settledPayment: PaymentVerificationResult | null;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  ledger: PriceLedger;
  addToCart: (product: Product, quantity?: number, selectedSize?: number, selectedColor?: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  resetDefaultCart: () => void;
  authorizePurchase: () => PurchaseAuthorization;
  clearAuthorization: () => void;
  markPaymentSettled: (payment: PaymentVerificationResult) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('shoppilot_cart_items_v1');
    return saved ? JSON.parse(saved) : [{ id: 'cart-item-aerorun-x', product: { ...primaryProduct, originalPrice: 2999, finalPrice: 2799 }, quantity: 1, selectedSize: 9, selectedColor: 'Chalk & Stone Grey', appliedOffer: mockOffer }];
  });
  const [appliedOffer, setAppliedOffer] = useState<MerchantOffer | null>(mockOffer);
  const [customerIntent] = useState<string>(PRIMARY_CUSTOMER_INTENT);
  const [authorization, setAuthorization] = useState<PurchaseAuthorization | null>(null);
  const [settledPayment, setSettledPayment] = useState<PaymentVerificationResult | null>(null);

  // Sync cart changes to localStorage
  useEffect(() => { localStorage.setItem('shoppilot_cart_items_v1', JSON.stringify(items)); }, [items]);

  const addToCart = (product: Product, quantity = 1, selectedSize, selectedColor) => {
    const newItem: CartItem = { id: `${product.id}-${Date.now()}`, product, quantity, selectedSize, selectedColor, appliedOffer: null };
    setItems(prev => [...prev, newItem]);
  };

  const clearCart = () => setItems([]);
  const resetDefaultCart = () => setItems([/* default item definition omitted for brevity */]);
  const authorizePurchase = () => {
    if (items.length === 0) throw new Error('Cart is empty');
    const auth = { authorizedAt: Date.now(), token: 'demo-token' } as PurchaseAuthorization;
    setAuthorization(auth);
    return auth;
  };
  const clearAuthorization = () => setAuthorization(null);
  const markPaymentSettled = (payment: PaymentVerificationResult) => setSettledPayment(payment);

  // Compute totals (simplified example)
  const subtotal = items.reduce((sum, i) => sum + i.product.finalPrice * i.quantity, 0);
  const discount = appliedOffer?.discount ?? 0;
  const total = subtotal - discount;

  const value: CartContextValue = { items, appliedOffer, customerIntent, authorization, settledPayment, subtotal, discount, shipping: 0, tax: 0, total, ledger: { subtotal, discount, total }, addToCart, removeFromCart: () => {}, clearCart, resetDefaultCart, authorizePurchase, clearAuthorization, markPaymentSettled };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
```

These snippets give a concise view of the deterministic demo state machine (`useDemoFlow`) and the cart/checkout logic (`CartContext`). They illustrate how the front‑end orchestrates the AI‑driven commerce flow while keeping the implementation simple and hackathon‑ready.

---

## 📦 Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```
Open <http://localhost:5173> in your browser.

## 🤝 Contributing
- Do **not** redesign the UI or add new design dependencies.
- Do **not** introduce a database or external services.
- Keep all mock data in `src/data/mockData.ts`.
- Preserve the existing Razorpay integration and the Stitch‑inspired visual language.
- Follow the existing folder conventions and TypeScript typing standards.

## 📄 License
MIT – feel free to fork and adapt for hackathon demos or internal prototypes.
