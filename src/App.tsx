import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './features/cart';
import { DemoFlowProvider } from './hooks/useDemoFlow';
import AgentHomePage from './pages/AgentHome';
import RecommendationPage from './pages/Recommendation';
import ConfirmationPage from './pages/Confirmation';
import CheckoutPage from './pages/Checkout';
import PaymentSuccessPage from './pages/PaymentSuccess';
import PaymentFailurePage from './pages/PaymentFailure';
import AgentTracePage from './pages/AgentTrace';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CartProvider>
        <DemoFlowProvider>
          <Routes>
            {/* Screen 1: AI Commerce Agent */}
            <Route path="/" element={<AgentHomePage />} />

            {/* Screen 2: AI Product Recommendation */}
            <Route path="/recommendation/:id" element={<RecommendationPage />} />

            {/* Screen 3: Confirm Your Purchase */}
            <Route path="/confirm" element={<ConfirmationPage />} />

            {/* Screen 4: Secure Checkout & Razorpay Payment */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Screen 5: Payment Successful */}
            <Route path="/payment/success" element={<PaymentSuccessPage />} />

            {/* Screen 6: Payment Failure & Recovery */}
            <Route path="/payment/failure" element={<PaymentFailurePage />} />

            {/* Screen 7: Agent Activity & Decision Trace */}
            <Route path="/agent/trace" element={<AgentTracePage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DemoFlowProvider>
      </CartProvider>
    </BrowserRouter>
  );
};

export default App;
