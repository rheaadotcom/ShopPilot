import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PageLayout } from '../../components/layout/PageLayout';
import { Button } from '../../components/common/Button';
import { RunLiveDemoButton } from '../../components/RunLiveDemoButton';
import {
  primaryProduct,
  alternativeProducts,
  scenariosData,
  mockActivityStream,
  PRIMARY_CUSTOMER_INTENT,
} from '../../data/mockData';
import { formatCurrency } from '../../lib/utils';

export const AgentHomePage: React.FC = () => {
  const navigate = useNavigate();

  // State management
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'agent' | 'trace' | 'merchant'>('agent');
  const [activeScenarioKey, setActiveScenarioKey] = useState<'shoes' | 'headphones'>('shoes');
  const [customIntentInput, setCustomIntentInput] = useState('');
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'agent'; text: string; product?: typeof primaryProduct; time?: string }>
  >([
    {
      sender: 'user',
      text: PRIMARY_CUSTOMER_INTENT,
    },
    {
      sender: 'agent',
      text: "I found 3 catalog matches. I've filtered for daily road running durability and applied your ₹200 merchant checkout credit to the AeroRun X Daily Road.",
      product: primaryProduct,
      time: '10:31:02 AM',
    },
  ]);

  // Failure simulation state for Section 8
  const [isFailureRecovered, setIsFailureRecovered] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);

  // Cart dock state in hero sandbox
  const [selectedProduct, setSelectedProduct] = useState(primaryProduct);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const handleAddToCart = (product: typeof primaryProduct) => {
    setSelectedProduct(product);
    showToast(`Added ${product.name} to ShopPilot Cart`);
  };

  const openAgentModalWithScenario = (key: 'shoes' | 'headphones') => {
    setActiveScenarioKey(key);
    const scen = scenariosData[key];
    if (scen) {
      setChatMessages([
        { sender: 'user', text: scen.query },
        {
          sender: 'agent',
          text: scen.reply,
          product: key === 'shoes' ? primaryProduct : undefined,
          time: '10:31:02 AM',
        },
      ]);
    }
    setActiveModalTab('agent');
    setIsAgentModalOpen(true);
  };

  const handleSendCustomIntent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customIntentInput.trim()) return;

    const userText = customIntentInput.trim();
    setCustomIntentInput('');

    setChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText },
      {
        sender: 'agent',
        text: `Analyzing intent for “${userText}”. Matched verified merchant inventory and validated discount rules within policy bounds.`,
        product: primaryProduct,
        time: 'Just now',
      },
    ]);
  };

  const handleSimulateRecovery = () => {
    setIsRecovering(true);
    showToast('Autonomous agent re-routing through instant UPI rail...');
    setTimeout(() => {
      setIsRecovering(false);
      setIsFailureRecovered(true);
      showToast('Order #SP-1025 settled successfully!');
    }, 600);
  };

  return (
    <PageLayout>
      {/* Toast Notification Container */}
      <div
        className={`fixed bottom-6 right-6 z-[100] transform transition-all duration-300 flex items-center gap-space-12 bg-primary text-on-primary px-space-20 py-space-12 rounded-xl shadow-2xl ${
          toastMessage ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'
        }`}
      >
        <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">check_circle</span>
        <span className="font-body text-body-sm font-medium">{toastMessage}</span>
      </div>

      <div className="flex flex-col w-full -mt-4">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO SECTION & INTERACTIVE SANDBOX WORKSPACE                  */}
        {/* ========================================================================= */}
        <section className="relative w-full overflow-hidden pb-space-64">
          {/* Subtle Background Ambient Geometry */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-surface-container-high/40 via-surface-container-low/20 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-content mx-auto pt-space-24 flex flex-col items-center text-center">
            {/* Active Pill Badge */}
            <div className="inline-flex items-center gap-space-8 px-space-12 py-space-4 rounded-full bg-surface-container-lowest shadow-sm mb-space-20 border border-outline-variant/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
              </span>
              <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant font-medium">
                AI Commerce Agent
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-mono text-label-sm text-secondary font-medium">
                Deterministic Settlement
              </span>
            </div>

            {/* Main Typography */}
            <h1 className="font-display text-display text-on-surface tracking-tight max-w-3xl mb-space-16 font-bold leading-tight">
              From intent to checkout.
            </h1>
            <p className="font-body text-body-lg text-on-surface-variant max-w-2xl mb-space-32">
              ShopPilot turns natural-language shopping requests into personalized recommendations,
              merchant-approved offers, and completed purchases.
            </p>

            {/* Primary Triggers */}
            <div className="flex flex-wrap items-center justify-center gap-space-16 mb-space-48">
              <Button
                variant="primary"
                size="lg"
                onClick={() => openAgentModalWithScenario('shoes')}
                iconRight="arrow_forward"
                className="shadow-md"
              >
                Try the Agent
              </Button>
                <RunLiveDemoButton />
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-space-8 px-space-24 py-space-12 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-low transition-all border border-outline-variant/30"
              >
                <span>See how it works</span>
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                  arrow_downward
                </span>
              </a>
            </div>

            {/* Hero Live Interactive Workspace Sandbox */}
            <div className="w-full text-left bg-surface-container-lowest rounded-2xl p-space-24 md:p-space-32 shadow-xl relative border border-outline-variant/30">
              {/* Window Chrome Bar */}
              <div className="flex flex-wrap items-center justify-between pb-space-16 mb-space-24 gap-space-12 bg-surface-container-low/60 -mx-space-24 md:-mx-space-32 -mt-space-24 md:-mt-space-32 p-space-16 md:px-space-32 rounded-t-2xl border-b border-outline-variant/30">
                <div className="flex items-center gap-space-12">
                  <div className="flex items-center gap-space-8">
                    <span className="w-3 h-3 rounded-full bg-[#EF4444]/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#F59E0B]/80 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-[#10B981]/80 inline-block" />
                  </div>
                  <span className="font-mono text-label-sm text-on-surface-variant font-medium">
                    ShopPilot Dynamic Execution Sandbox
                  </span>
                </div>
                <div className="flex items-center gap-space-12">
                  <span className="font-mono text-label-sm text-on-tertiary-container bg-tertiary-fixed/30 border border-tertiary-fixed-dim/40 px-space-8 py-space-2 rounded-full flex items-center gap-space-4 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />
                    Razorpay Test Network
                  </span>
                  <span className="font-mono text-label-sm text-on-surface-variant">Session #SP-8902</span>
                </div>
              </div>

              {/* Simulated Customer Intent Stream Bar */}
              <div className="p-space-16 rounded-xl bg-surface-container-low mb-space-24 flex flex-col md:flex-row md:items-center justify-between gap-space-12 border border-outline-variant/30">
                <div className="flex items-center gap-space-12">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-secondary text-[18px]">chat</span>
                  </div>
                  <div>
                    <div className="font-label text-label-sm uppercase text-on-surface-variant font-semibold tracking-wider">
                      Customer Intent Stream
                    </div>
                    <div className="font-body text-body-md text-on-surface font-medium">
                      “{PRIMARY_CUSTOMER_INTENT}”
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-space-8 self-end md:self-center">
                  <Link
                    to="/agent/trace"
                    className="px-space-12 py-space-6 rounded-lg bg-surface-container-lowest text-on-surface hover:text-secondary font-mono text-label-sm shadow-sm transition-colors border border-outline-variant/30 inline-flex items-center gap-1"
                  >
                    Inspect Agent Trace ↗
                  </Link>
                </div>
              </div>

              {/* ShopPilot Reasoning Pipeline Badges Strip */}
              <div className="flex flex-wrap items-center gap-space-8 mb-space-24">
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-bold tracking-wider mr-space-4">
                  Reasoning Chain:
                </span>
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-4 rounded-md bg-surface-container text-on-surface font-mono text-label-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">check</span>
                  Understanding request
                </span>
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-4 rounded-md bg-surface-container text-on-surface font-mono text-label-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">check</span>
                  Category: Running Shoes
                </span>
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-4 rounded-md bg-surface-container text-on-surface font-mono text-label-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">check</span>
                  Ceiling: ₹3,000
                </span>
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-4 rounded-md bg-surface-container text-on-surface font-mono text-label-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">check</span>
                  Terrain: Daily Road
                </span>
                <span className="inline-flex items-center gap-space-4 px-space-8 py-space-4 rounded-md bg-tertiary-fixed/40 text-on-tertiary-container font-mono text-label-sm border border-tertiary-fixed-dim/40 font-semibold">
                  <span className="material-symbols-outlined text-tertiary text-[14px]">verified</span>
                  Merchant Offer Applied
                </span>
              </div>

              {/* Product Cards 3-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-20">
                {/* Card 1: AeroRun X (Recommended Hero Item) */}
                <div className="relative flex flex-col justify-between p-space-16 rounded-xl bg-surface-container-lowest shadow-md hover:shadow-lg transition-all ring-1 ring-secondary/30 border border-secondary/20">
                  <div className="absolute -top-3 left-4 inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded-full bg-secondary text-on-secondary font-mono text-label-sm shadow-sm font-semibold">
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                    Top Agent Match ({primaryProduct.matchScore}%)
                  </div>

                  <div className="mt-space-8">
                    <div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-low mb-space-12 relative border border-outline-variant/20">
                      <img
                        alt={primaryProduct.name}
                        className="w-full h-full object-cover object-center"
                        src={primaryProduct.images[0]}
                      />
                      <span className="absolute top-2 right-2 px-space-8 py-space-2 rounded bg-surface-container-lowest/90 font-mono text-label-sm text-on-surface shadow-sm border border-outline-variant/30">
                        {primaryProduct.sku}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-space-8 mb-space-4">
                      <h3 className="font-headline text-headline-sm text-on-surface font-bold">
                        {primaryProduct.name}
                      </h3>
                      <div className="flex items-center gap-space-2 text-on-surface shrink-0 font-mono text-body-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">
                          star
                        </span>
                        {primaryProduct.rating}
                      </div>
                    </div>

                    <p className="font-body text-body-sm text-on-surface-variant mb-space-12">
                      {primaryProduct.subtitle}
                    </p>

                    {/* ShopPilot Rationale Box */}
                    <div className="p-space-8 rounded-lg bg-surface-container-low mb-space-12 border border-secondary/15">
                      <div className="font-label text-label-sm text-secondary font-semibold flex items-center gap-space-4 mb-1">
                        <span className="material-symbols-outlined text-[14px]">psychology</span>
                        ShopPilot Rationale:
                      </div>
                      <div className="font-body text-body-sm text-on-surface-variant leading-relaxed">
                        {primaryProduct.agentRationale}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-space-8 mb-space-12">
                      <span className="font-mono text-headline-sm text-on-surface font-bold">
                        {formatCurrency(primaryProduct.finalPrice)}
                      </span>
                      <span className="font-mono text-body-sm text-on-surface-variant line-through">
                        {formatCurrency(primaryProduct.originalPrice)}
                      </span>
                      <span className="font-mono text-label-sm text-on-tertiary-container bg-tertiary-fixed/30 border border-tertiary-fixed-dim/40 px-space-6 py-space-2 rounded font-semibold">
                        Offer -₹{primaryProduct.merchantOffer?.discountAmount}
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => navigate('/recommendation/aerorun-x')}
                      iconRight="arrow_forward"
                      className="w-full"
                    >
                      View Recommendation
                    </Button>
                  </div>
                </div>

                {/* Card 2: CloudStrider Tempo */}
                <div className="flex flex-col justify-between p-space-16 rounded-xl bg-surface-container-low shadow-sm border border-outline-variant/30">
                  <div>
                    <div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-highest mb-space-12 relative border border-outline-variant/20">
                      <img
                        alt={alternativeProducts[1].name}
                        className="w-full h-full object-cover object-center filter grayscale-[30%]"
                        src={alternativeProducts[1].images[0]}
                      />
                      <span className="absolute top-2 right-2 px-space-8 py-space-2 rounded bg-surface-container-lowest/90 font-mono text-label-sm text-on-surface shadow-sm border border-outline-variant/30">
                        {alternativeProducts[1].sku}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-space-8 mb-space-4">
                      <h3 className="font-headline text-headline-sm text-on-surface font-semibold">
                        {alternativeProducts[1].name}
                      </h3>
                      <div className="flex items-center gap-space-2 text-on-surface shrink-0 font-mono text-body-sm font-medium">
                        <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">
                          star
                        </span>
                        {alternativeProducts[1].rating}
                      </div>
                    </div>

                    <p className="font-body text-body-sm text-on-surface-variant mb-space-12">
                      {alternativeProducts[1].subtitle}
                    </p>

                    <div className="p-space-8 rounded-lg bg-surface-container mb-space-12 border border-outline-variant/20">
                      <div className="font-body text-body-sm text-on-surface-variant">
                        {alternativeProducts[1].agentRationale}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-space-8 mb-space-12">
                      <span className="font-mono text-headline-sm text-on-surface font-semibold">
                        {formatCurrency(alternativeProducts[1].finalPrice)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => handleAddToCart(alternativeProducts[1])}
                      iconLeft="shopping_cart"
                      className="w-full"
                    >
                      Add to cart
                    </Button>
                  </div>
                </div>

                {/* Card 3: VaporLite Breathable */}
                <div className="flex flex-col justify-between p-space-16 rounded-xl bg-surface-container-low shadow-sm opacity-90 border border-outline-variant/30">
                  <div>
                    <div className="w-full h-44 rounded-lg overflow-hidden bg-surface-container-highest mb-space-12 relative border border-outline-variant/20">
                      <img
                        alt={alternativeProducts[2].name}
                        className="w-full h-full object-cover object-center filter grayscale-[50%]"
                        src={alternativeProducts[2].images[0]}
                      />
                      <span className="absolute top-2 right-2 px-space-8 py-space-2 rounded bg-surface-container-lowest/90 font-mono text-label-sm text-error font-semibold shadow-sm border border-error/20">
                        Budget +₹100
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-space-8 mb-space-4">
                      <h3 className="font-headline text-headline-sm text-on-surface font-semibold">
                        {alternativeProducts[2].name}
                      </h3>
                      <div className="flex items-center gap-space-2 text-on-surface shrink-0 font-mono text-body-sm font-medium">
                        <span className="material-symbols-outlined text-[16px] text-[#F59E0B]">
                          star
                        </span>
                        {alternativeProducts[2].rating}
                      </div>
                    </div>

                    <p className="font-body text-body-sm text-on-surface-variant mb-space-12">
                      {alternativeProducts[2].subtitle}
                    </p>

                    <div className="p-space-8 rounded-lg bg-surface-container mb-space-12 border border-outline-variant/20">
                      <div className="font-body text-body-sm text-on-surface-variant flex items-center gap-space-4">
                        <span className="material-symbols-outlined text-[14px] text-error">info</span>
                        <span>{alternativeProducts[2].agentRationale}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-space-8 mb-space-12">
                      <span className="font-mono text-headline-sm text-on-surface font-semibold">
                        {formatCurrency(alternativeProducts[2].finalPrice)}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="md"
                      onClick={() => handleAddToCart(alternativeProducts[2])}
                      iconLeft="shopping_cart"
                      className="w-full"
                    >
                      Add to cart
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Interactive Cart Dock Preview in Sandbox */}
              <div className="mt-space-24 p-space-16 rounded-xl bg-surface-container-highest flex flex-col sm:flex-row items-center justify-between gap-space-16 border border-outline-variant/30">
                <div className="flex items-center gap-space-12">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center shadow-sm border border-outline-variant/30">
                    <span className="material-symbols-outlined text-secondary text-[22px]">
                      shopping_bag
                    </span>
                  </div>
                  <div>
                    <div className="font-label text-label-md text-on-surface font-semibold">
                      ShopPilot Execution Cart:{' '}
                      <span className="font-mono font-normal">1 item</span>
                    </div>
                    <div className="font-body text-body-sm text-on-surface-variant">
                      Active Delegate:{' '}
                      <span className="font-semibold text-on-surface">{selectedProduct.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-space-16">
                  <div className="text-right">
                    <div className="font-label text-label-sm text-on-surface-variant">
                      Net Settlement
                    </div>
                    <div className="font-mono text-headline-sm text-on-surface font-bold">
                      {formatCurrency(selectedProduct.finalPrice)}.00
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => navigate('/recommendation/aerorun-x')}
                    iconRight="arrow_forward"
                  >
                    Review & Pay
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: THE OLD WAY VS SHOPPILOT (PARADIGM SHIFT)                     */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64 bg-surface-container-low rounded-3xl mb-space-32" id="how-it-works">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Paradigm Shift
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                Commerce shouldn’t feel like a search form.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Replacing multi-tab decision fatigue with single-thread, deterministic autonomous
                execution.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-32">
              {/* Left: Traditional Shopping */}
              <div className="p-space-32 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="flex items-center justify-between mb-space-24">
                    <span className="font-label text-label-sm uppercase text-on-surface-variant font-bold tracking-wider">
                      Traditional Shopping
                    </span>
                    <span className="font-mono text-label-sm px-space-8 py-space-2 rounded bg-surface-container-highest text-on-surface-variant">
                      6+ Steps • High Abandonment
                    </span>
                  </div>

                  <div className="space-y-space-12 mb-space-32">
                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface-variant opacity-75">
                      <span className="font-mono text-label-sm text-error font-bold">01</span>
                      <span className="font-body text-body-sm">
                        Search query entered: "running shoes"
                      </span>
                      <span className="material-symbols-outlined text-outline text-[18px] ml-auto">
                        search
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface-variant opacity-75">
                      <span className="font-mono text-label-sm text-error font-bold">02</span>
                      <span className="font-body text-body-sm">
                        Apply 18 conflicting catalog filters (Size, Drop, Arch, Brand)
                      </span>
                      <span className="material-symbols-outlined text-outline text-[18px] ml-auto">
                        tune
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface-variant opacity-75">
                      <span className="font-mono text-label-sm text-error font-bold">03</span>
                      <span className="font-body text-body-sm">
                        Open 12 browser tabs to cross-reference customer reviews
                      </span>
                      <span className="material-symbols-outlined text-outline text-[18px] ml-auto">
                        tab
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface-variant opacity-75">
                      <span className="font-mono text-label-sm text-error font-bold">04</span>
                      <span className="font-body text-body-sm">
                        Hunt for promo codes on 3rd-party coupon blogs
                      </span>
                      <span className="material-symbols-outlined text-outline text-[18px] ml-auto">
                        local_offer
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-error-container/40 text-on-error-container">
                      <span className="font-mono text-label-sm text-error font-bold">05</span>
                      <span className="font-body text-body-sm font-semibold">
                        Cart hesitation & checkout form friction
                      </span>
                      <span className="material-symbols-outlined text-error text-[18px] ml-auto">
                        cancel
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-space-16 border-t border-surface-container-highest">
                  <span className="font-body text-body-sm text-on-surface-variant italic">
                    Outcome: Customers do all the manual research and validation work.
                  </span>
                </div>
              </div>

              {/* Right: ShopPilot Autonomous Agent */}
              <div className="p-space-32 rounded-2xl bg-surface-container-lowest shadow-md flex flex-col justify-between ring-1 ring-secondary/20 border border-secondary/30">
                <div>
                  <div className="flex items-center justify-between mb-space-24">
                    <span className="font-label text-label-sm uppercase text-secondary font-bold tracking-wider">
                      ShopPilot Autonomous Agent
                    </span>
                    <span className="font-mono text-label-sm px-space-8 py-space-2 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-semibold border border-tertiary-fixed-dim/40">
                      Single Thread • Deterministic
                    </span>
                  </div>

                  <div className="space-y-space-12 mb-space-32">
                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface">
                      <span className="font-mono text-label-sm text-secondary font-bold">01</span>
                      <span className="font-body text-body-sm font-semibold">
                        Intent parsed into multi-parameter criteria vector
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-[18px] ml-auto">
                        check_circle
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface">
                      <span className="font-mono text-label-sm text-secondary font-bold">02</span>
                      <span className="font-body text-body-sm font-semibold">
                        Real-time catalog evaluation & stock audit (sub-second)
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-[18px] ml-auto">
                        check_circle
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-surface-container-low text-on-surface">
                      <span className="font-mono text-label-sm text-secondary font-bold">03</span>
                      <span className="font-body text-body-sm font-semibold">
                        Merchant rules validated & best discount pre-applied
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-[18px] ml-auto">
                        check_circle
                      </span>
                    </div>

                    <div className="flex items-center gap-space-12 p-space-12 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container border border-tertiary-fixed-dim/40">
                      <span className="font-mono text-label-sm text-on-tertiary-container font-bold">
                        04
                      </span>
                      <span className="font-body text-body-sm font-bold">
                        Gated customer consent & 1-click Razorpay settlement
                      </span>
                      <span className="material-symbols-outlined text-tertiary text-[18px] ml-auto">
                        lock
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-space-16 border-t border-surface-container-highest">
                  <span className="font-body text-body-sm text-on-surface font-semibold">
                    Outcome: ShopPilot executes the workflow. The customer merely confirms.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 3: PRODUCT EXPERIENCE & LIVE CONVERSATION                        */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-48 gap-space-16">
              <div>
                <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                  Conversational Commerce
                </span>
                <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 font-bold">
                  One conversation. A complete purchase journey.
                </h2>
              </div>
              <p className="font-body text-body-md text-on-surface-variant max-w-md">
                See how an ambiguous natural-language question turns into a verified merchant checkout
                with full trade-off rationale.
              </p>
            </div>

            {/* Dialogue Simulation Canvas */}
            <div className="max-w-3xl mx-auto bg-surface-container-lowest rounded-2xl p-space-24 md:p-space-32 shadow-xl border border-outline-variant/30">
              {/* Message 1: Customer */}
              <div className="flex items-start gap-space-12 mb-space-20">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-mono text-label-sm font-semibold shrink-0">
                  U
                </div>
                <div className="flex flex-col items-start max-w-[85%]">
                  <span className="font-label text-label-sm text-on-surface-variant mb-space-4">
                    Customer
                  </span>
                  <div className="p-space-16 rounded-2xl rounded-tl-none bg-surface-container-low text-on-surface font-body text-body-md border border-outline-variant/20">
                    I need wireless headphones under ₹2,500. Good for travel.
                  </div>
                </div>
              </div>

              {/* Message 2: ShopPilot */}
              <div className="flex items-start gap-space-12 mb-space-20">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono text-label-sm font-semibold shrink-0 shadow-sm">
                  SP
                </div>
                <div className="flex flex-col items-start max-w-[90%] w-full">
                  <div className="flex items-center gap-space-8 mb-space-4">
                    <span className="font-label text-label-sm text-on-surface font-semibold">
                      ShopPilot Agent
                    </span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      10:31:02 AM
                    </span>
                  </div>

                  <div className="p-space-16 rounded-2xl rounded-tl-none bg-surface-container-lowest text-on-surface font-body text-body-md shadow-sm w-full border border-outline-variant/30">
                    <p className="mb-space-16 text-on-surface-variant">
                      I found 4 strong matches. I'm prioritizing active noise cancellation, 30h+
                      battery life, and your ₹2,500 budget.
                    </p>

                    {/* Inline Product Card inside conversation */}
                    <div className="p-space-16 rounded-xl bg-surface-container-low flex flex-col sm:flex-row gap-space-16 items-center border border-outline-variant/30">
                      <img
                        alt="AeroSound Pro Wireless ANC"
                        className="w-24 h-24 rounded-lg object-cover bg-surface-container-highest shrink-0"
                        src={scenariosData.headphones.product.image}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-space-8 mb-space-4">
                          <span className="font-headline text-body-lg text-on-surface font-bold truncate">
                            {scenariosData.headphones.product.name}
                          </span>
                          <span className="font-mono text-label-sm px-space-6 py-space-2 rounded bg-tertiary-fixed/30 text-on-tertiary-container shrink-0 font-semibold border border-tertiary-fixed-dim/40">
                            Best Match
                          </span>
                        </div>
                        <p className="font-body text-body-sm text-on-surface-variant mb-space-8">
                          Hybrid Active Noise Cancellation • 32h Playtime • Foldable Travel Case Included
                        </p>
                        <div className="flex items-baseline gap-space-8">
                          <span className="font-mono text-headline-sm text-on-surface font-bold">
                            ₹2,299
                          </span>
                          <span className="font-mono text-body-sm text-on-surface-variant line-through">
                            ₹2,499
                          </span>
                          <span className="font-mono text-label-sm text-on-tertiary-container font-semibold">
                            Merchant credit -₹200
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message 3: Customer follow-up */}
              <div className="flex items-start gap-space-12 mb-space-20">
                <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center font-mono text-label-sm font-semibold shrink-0">
                  U
                </div>
                <div className="flex flex-col items-start max-w-[85%]">
                  <span className="font-label text-label-sm text-on-surface-variant mb-space-4">
                    Customer
                  </span>
                  <div className="p-space-16 rounded-2xl rounded-tl-none bg-surface-container-low text-on-surface font-body text-body-md border border-outline-variant/20">
                    Which one would you choose between this and the StudioBeat?
                  </div>
                </div>
              </div>

              {/* Message 4: ShopPilot Rationale & One-Click Gated CTA */}
              <div className="flex items-start gap-space-12">
                <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono text-label-sm font-semibold shrink-0 shadow-sm">
                  SP
                </div>
                <div className="flex flex-col items-start max-w-[90%] w-full">
                  <div className="flex items-center gap-space-8 mb-space-4">
                    <span className="font-label text-label-sm text-on-surface font-semibold">
                      ShopPilot Agent
                    </span>
                    <span className="font-mono text-label-sm text-on-surface-variant">
                      10:31:05 AM
                    </span>
                  </div>

                  <div className="p-space-16 rounded-2xl rounded-tl-none bg-surface-container-lowest text-on-surface font-body text-body-md shadow-sm w-full space-y-space-16 border border-outline-variant/30">
                    <p className="text-on-surface leading-relaxed">
                      I'd choose the <strong className="font-semibold text-on-surface">AeroSound Pro</strong>.
                      It offers 12 hours more battery (32h vs 20h), includes plush memory foam padding
                      better suited for long flights, and is currently eligible for an instant ₹200 merchant
                      checkout discount.
                    </p>

                    {/* Quick Action Row */}
                    <div className="flex flex-wrap items-center gap-space-12 pt-space-8 border-t border-surface-container-high">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => navigate('/recommendation/aerorun-x')}
                        iconLeft="lock"
                      >
                        Confirm Recommendation (₹2,799)
                      </Button>
                      <Link
                        to="/agent/trace"
                        className="px-space-16 py-space-8 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container-high font-mono text-label-sm transition-colors border border-outline-variant/30 inline-flex items-center gap-1"
                      >
                        View full decision trace →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 4: AGENT CAPABILITIES BENTO GRID                                 */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64 bg-surface-container-low rounded-3xl mb-space-32">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Full Stack Autonomous Commerce
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                The agent doesn’t just talk. It acts.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                ShopPilot operates across the entire transaction lifecycle—from linguistic ingestion to
                banking webhook reconciliation.
              </p>
            </div>

            {/* Bento Grid (5 Capabilities) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-20">
              {/* Card 1: Understand Intent */}
              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center mb-space-16 text-secondary border border-outline-variant/20">
                    <span className="material-symbols-outlined">data_object</span>
                  </div>
                  <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                    1. Understand intent
                  </h3>
                  <p className="font-body text-body-sm text-on-surface-variant mb-space-16">
                    Translates unstructured consumer prompts into schema-constrained query vectors,
                    extracting explicit price ceilings, implicit usage contexts, and strict constraints.
                  </p>
                </div>
                <div className="p-space-12 rounded-xl bg-surface-container-low font-mono text-[12px] text-on-surface-variant overflow-x-auto border border-outline-variant/20">
                  <code>&#123; "category": "footwear", "budget_max": 3000, "terrain": "road" &#125;</code>
                </div>
              </div>

              {/* Card 2: Search Catalog */}
              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center mb-space-16 text-secondary border border-outline-variant/20">
                    <span className="material-symbols-outlined">database</span>
                  </div>
                  <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                    2. Search catalog
                  </h3>
                  <p className="font-body text-body-sm text-on-surface-variant mb-space-16">
                    Executes low-latency vector embeddings directly against live merchant inventory
                    caches, verifying stock availability, variant counts, and warehouse location.
                  </p>
                </div>
                <div className="flex items-center justify-between p-space-12 rounded-xl bg-surface-container-low font-mono text-[12px] border border-outline-variant/20">
                  <span className="text-on-surface font-medium">Catalog latency</span>
                  <span className="text-tertiary font-bold">18ms • 24 SKUs evaluated</span>
                </div>
              </div>

              {/* Card 3: Explainable Recommendations */}
              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center mb-space-16 text-secondary border border-outline-variant/20">
                    <span className="material-symbols-outlined">visibility</span>
                  </div>
                  <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                    3. Explainable recommendations
                  </h3>
                  <p className="font-body text-body-sm text-on-surface-variant mb-space-16">
                    Generates explicit rationale chains for every suggestion. Surfaces honest
                    compromises, like cushioning vs weight or budget overages, ensuring uncompromised consumer trust.
                  </p>
                </div>
                <div className="flex items-center gap-space-8 p-space-12 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <span className="w-2 h-2 rounded-full bg-tertiary" />
                  <span className="font-label text-label-sm text-on-surface font-semibold">
                    Deterministic reason score: 99.2%
                  </span>
                </div>
              </div>

              {/* Card 4: Grow the Basket */}
              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/30">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center mb-space-16 text-secondary border border-outline-variant/20">
                    <span className="material-symbols-outlined">add_business</span>
                  </div>
                  <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                    4. Grow the basket
                  </h3>
                  <p className="font-body text-body-sm text-on-surface-variant mb-space-16">
                    Suggests highly contextual add-ons and merchant-approved discount combinations only
                    when they deliver clear value without feeling intrusive or spammy.
                  </p>
                </div>
                <div className="p-space-12 rounded-xl bg-surface-container-low flex items-center justify-between font-body text-body-sm border border-outline-variant/20">
                  <span className="text-on-surface-variant">Merchant Rules</span>
                  <span className="font-mono text-tertiary font-bold">RT-SUMMER200 (-₹200)</span>
                </div>
              </div>

              {/* Card 5: Complete Checkout (Spans 2 cols on lg) */}
              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between lg:col-span-2 border border-outline-variant/30">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center mb-space-16 text-secondary border border-outline-variant/20">
                    <span className="material-symbols-outlined">credit_card</span>
                  </div>
                  <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                    5. Complete checkout
                  </h3>
                  <p className="font-body text-body-sm text-on-surface-variant mb-space-16">
                    Constructs verified payload tokens, orchestrates Razorpay Standard and Custom
                    Checkouts, verifies signatures, and fires deterministic webhooks for ERP sync.
                  </p>
                </div>
                <div className="p-space-16 rounded-xl bg-surface-container-low flex flex-wrap items-center justify-between gap-space-12 border border-outline-variant/20">
                  <div className="flex items-center gap-space-12">
                    <span className="material-symbols-outlined text-secondary">verified_user</span>
                    <span className="font-mono text-label-sm text-on-surface font-medium">
                      Razorpay Tokenized Vault • PCI-DSS Level 1 Compliant
                    </span>
                  </div>
                  <span className="font-mono text-label-sm text-on-tertiary-container bg-tertiary-fixed/30 border border-tertiary-fixed-dim/40 px-space-8 py-space-2 rounded font-bold">
                    Instant Settlement
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 5: EXPLAINABLE AI & DECISION TRACE INSPECTION                     */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="max-w-2xl mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Inspectable Intelligence
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                Every recommendation has a reason.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Black-box algorithms erode buyer confidence. ShopPilot publishes real-time decision
                traces so buyers and merchants see the underlying financial and logical verification.
              </p>
            </div>

            {/* High Fidelity Inspector Box */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-24 bg-surface-container-lowest p-space-24 md:p-space-32 rounded-2xl shadow-xl border border-outline-variant/30">
              {/* Left: Product & Confidence Details */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-space-16">
                    <span className="font-label text-label-sm uppercase text-on-surface-variant font-bold">
                      Inspecting Entity
                    </span>
                    <span className="font-mono text-label-sm px-space-8 py-space-2 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-semibold border border-tertiary-fixed-dim/40">
                      Confidence 99.2%
                    </span>
                  </div>

                  <div className="flex items-center gap-space-16 mb-space-20">
                    <img
                      alt={primaryProduct.name}
                      className="w-16 h-16 rounded-xl object-cover bg-surface-container-high shrink-0 border border-outline-variant/30"
                      src={primaryProduct.images[0]}
                    />
                    <div>
                      <h4 className="font-headline text-headline-sm text-on-surface font-bold">
                        {primaryProduct.name}
                      </h4>
                      <div className="font-mono text-label-sm text-on-surface-variant">
                        {primaryProduct.sku} • Net {formatCurrency(primaryProduct.finalPrice)}
                      </div>
                    </div>
                  </div>

                  {/* Decision Checklist */}
                  <div className="space-y-space-8 mb-space-24">
                    <div className="flex items-center gap-space-8 p-space-8 rounded-lg bg-surface-container-low font-body text-body-sm text-on-surface border border-outline-variant/20">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">
                        check
                      </span>
                      <span>Within target budget ceiling (₹2,799 net &le; ₹3,000)</span>
                    </div>
                    <div className="flex items-center gap-space-8 p-space-8 rounded-lg bg-surface-container-low font-body text-body-sm text-on-surface border border-outline-variant/20">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">
                        check
                      </span>
                      <span>Suitable for high-mileage daily road running (Dual BioFoam)</span>
                    </div>
                    <div className="flex items-center gap-space-8 p-space-8 rounded-lg bg-surface-container-low font-body text-body-sm text-on-surface border border-outline-variant/20">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">
                        check
                      </span>
                      <span>Highest-rated relevant candidate (4.8 ★ / 128 verified reviews)</span>
                    </div>
                    <div className="flex items-center gap-space-8 p-space-8 rounded-lg bg-surface-container-low font-body text-body-sm text-on-surface border border-outline-variant/20">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">
                        check
                      </span>
                      <span>In stock: Bangalore Hub (Express 24h dispatch SLA)</span>
                    </div>
                    <div className="flex items-center gap-space-8 p-space-8 rounded-lg bg-surface-container-low font-body text-body-sm text-on-surface border border-outline-variant/20">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">
                        check
                      </span>
                      <span>Validated merchant concession 'RT-SUMMER200' (-₹200 discount)</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/agent/trace"
                  className="w-full py-space-10 px-space-12 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-mono text-label-sm transition-colors text-center border border-outline-variant/30 font-semibold"
                >
                  Open Full Audit Trace (JSON / 9 Steps) →
                </Link>
              </div>

              {/* Right: Flow Timeline Visualization */}
              <div className="lg:col-span-7 p-space-20 rounded-xl bg-surface-container-low flex flex-col justify-between border border-outline-variant/30">
                <span className="font-mono text-label-sm uppercase text-on-surface-variant font-bold mb-space-16">
                  Deterministic Verification Pipeline
                </span>

                <div className="relative space-y-space-16 pl-space-24 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant/40">
                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-secondary" />
                    <div className="font-mono text-label-sm text-secondary font-bold">
                      Phase 1: Intent Extraction (12ms)
                    </div>
                    <p className="font-body text-body-sm text-on-surface-variant mt-space-2">
                      Dissected prompt into max_price=3000, category="running_shoes", terrain="road_daily".
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-secondary" />
                    <div className="font-mono text-label-sm text-secondary font-bold">
                      Phase 2: Sub-second Catalog Filter (18ms)
                    </div>
                    <p className="font-body text-body-sm text-on-surface-variant mt-space-2">
                      24 inventory SKUs matched vector space; 3 items passed shock absorption and durability thresholds.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-secondary" />
                    <div className="font-mono text-label-sm text-secondary font-bold">
                      Phase 3: Multi-attribute Ranking (22ms)
                    </div>
                    <p className="font-body text-body-sm text-on-surface-variant mt-space-2">
                      Weighted composite score (0.4 Price + 0.3 Cushioning + 0.3 Durability). AeroRun X scored 0.992.
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-tertiary" />
                    <div className="font-mono text-label-sm text-tertiary font-bold">
                      Phase 4: Policy & Offer Gate (15ms)
                    </div>
                    <p className="font-body text-body-sm text-on-surface-variant mt-space-2">
                      Applied discount token 'RT-SUMMER200'. Pre-authorized price lock ₹2,799 for 15 minutes.
                    </p>
                  </div>
                </div>

                <div className="mt-space-20 p-space-12 rounded-lg bg-surface-container-lowest font-mono text-label-sm flex items-center justify-between border border-outline-variant/30">
                  <span className="text-on-surface-variant">Signature Hash:</span>
                  <span className="text-secondary font-semibold">0x892b...c401 (ECDSA Verified)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 6: SAFE COMMERCE & GATED AUTHORIZATION BOUNDARIES                */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64 bg-surface-container-low rounded-3xl mb-space-32">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Safety & Guardrails
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                AI can recommend. You stay in control.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                ShopPilot operates under strict cryptographic and user-authorized boundaries. The
                autonomous agent cannot initiate a monetary transfer without explicit physical consent.
              </p>
            </div>

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-24 mb-space-48">
              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center mb-space-16 font-mono font-bold border border-tertiary-fixed-dim/40">
                  01
                </div>
                <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                  Explainable
                </h3>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Zero hidden affiliate bias. Every recommendation comes with clear, inspectable
                  parameters explaining why this item was surfaced over alternatives.
                </p>
              </div>

              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center mb-space-16 font-mono font-bold border border-tertiary-fixed-dim/40">
                  02
                </div>
                <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                  Bounded
                </h3>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Operates strictly within merchant-defined policy guardrails: minimum pricing floors,
                  real-time inventory locks, and verified discount caps.
                </p>
              </div>

              <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center mb-space-16 font-mono font-bold border border-tertiary-fixed-dim/40">
                  03
                </div>
                <h3 className="font-headline text-headline-sm text-on-surface font-semibold mb-space-8">
                  Gated
                </h3>
                <p className="font-body text-body-sm text-on-surface-variant">
                  Monetary settlement is strictly gated. Payment execution requires physical customer
                  authorization via OTP, Biometric UPI, or explicit token consent.
                </p>
              </div>
            </div>

            {/* Gated Confirmation Modal Card Mockup */}
            <div className="max-w-md mx-auto p-space-24 rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/30">
              <div className="flex items-center justify-between pb-space-16 border-b border-surface-container">
                <div className="flex items-center gap-space-8">
                  <span className="material-symbols-outlined text-secondary text-[20px]">lock</span>
                  <span className="font-label text-label-md font-semibold text-on-surface">
                    Gated Authorization Window
                  </span>
                </div>
                <span className="font-mono text-label-sm px-space-6 py-space-2 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-semibold border border-tertiary-fixed-dim/40">
                  Secured
                </span>
              </div>

              <div className="py-space-20 text-center">
                <span className="font-label text-label-sm text-on-surface-variant uppercase font-medium">
                  Pre-authorized Intent Total
                </span>
                <div className="font-mono text-display text-on-surface font-bold mt-space-4">
                  ₹2,799.00
                </div>
                <p className="font-body text-body-sm text-on-surface-variant mt-space-4 font-medium">
                  AeroRun X Daily Road Trainer (Size UK 9)
                </p>
              </div>

              <div className="p-space-12 rounded-xl bg-surface-container-low space-y-space-8 mb-space-20 font-body text-body-sm border border-outline-variant/20">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Catalog Subtotal</span>
                  <span className="font-mono text-on-surface">₹2,999.00</span>
                </div>
                <div className="flex justify-between text-tertiary font-semibold">
                  <span>Merchant Offer Applied (RT-SUMMER200)</span>
                  <span className="font-mono">-₹200.00</span>
                </div>
                <div className="flex justify-between pt-space-8 border-t border-surface-container-highest font-bold">
                  <span className="text-on-surface">Total Due</span>
                  <span className="font-mono text-on-surface text-body-lg">₹2,799.00</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-12">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => showToast('Authorization cancelled safely')}
                >
                  Decline
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => navigate('/recommendation/aerorun-x')}
                >
                  Confirm & Pay
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 7: RAZORPAY PAYMENT FLOW ARCHITECTURE                            */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="max-w-2xl mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Frictionless Rail
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                Conversation to payment, without breaking the experience.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Integrating deeply with Razorpay's unified checkout, ShopPilot hands off tokenized cart
                payloads seamlessly into trusted payment modal layers.
              </p>
            </div>

            {/* Architecture Flow Diagram */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-space-12 mb-space-48">
              <div className="p-space-16 rounded-xl bg-surface-container-low text-center flex flex-col items-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px] mb-space-8">
                  chat
                </span>
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-semibold">
                  1. Prompt
                </span>
                <span className="font-body text-body-sm font-semibold text-on-surface mt-space-2">
                  Intent Stated
                </span>
              </div>

              <div className="p-space-16 rounded-xl bg-surface-container-low text-center flex flex-col items-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px] mb-space-8">
                  psychology
                </span>
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-semibold">
                  2. Engine
                </span>
                <span className="font-body text-body-sm font-semibold text-on-surface mt-space-2">
                  Recommendation
                </span>
              </div>

              <div className="p-space-16 rounded-xl bg-surface-container-low text-center flex flex-col items-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px] mb-space-8">
                  local_offer
                </span>
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-semibold">
                  3. Rule Check
                </span>
                <span className="font-body text-body-sm font-semibold text-on-surface mt-space-2">
                  Gated Offer
                </span>
              </div>

              <div className="p-space-16 rounded-xl bg-surface-container-low text-center flex flex-col items-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px] mb-space-8">
                  shopping_bag
                </span>
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-semibold">
                  4. Session
                </span>
                <span className="font-body text-body-sm font-semibold text-on-surface mt-space-2">
                  Cart Lock
                </span>
              </div>

              <div className="p-space-16 rounded-xl bg-surface-container-low text-center flex flex-col items-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-secondary text-[24px] mb-space-8">
                  credit_card
                </span>
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-semibold">
                  5. Gateway
                </span>
                <span className="font-body text-body-sm font-semibold text-on-surface mt-space-2">
                  Razorpay Sheet
                </span>
              </div>

              <div className="p-space-16 rounded-xl bg-tertiary-fixed/30 text-center flex flex-col items-center border border-tertiary-fixed-dim/40">
                <span className="material-symbols-outlined text-tertiary text-[24px] mb-space-8">
                  verified
                </span>
                <span className="font-label text-label-sm uppercase text-tertiary font-bold">
                  6. Webhook
                </span>
                <span className="font-body text-body-sm font-bold text-tertiary mt-space-2">
                  Order Confirmed
                </span>
              </div>
            </div>

            {/* Payment Success Card Showcase */}
            <div className="max-w-xl mx-auto p-space-32 rounded-2xl bg-surface-container-lowest shadow-xl border border-outline-variant/30">
              <div className="flex items-center gap-space-16 pb-space-20 border-b border-surface-container">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center shrink-0 border border-tertiary-fixed-dim/40">
                  <span className="material-symbols-outlined text-[28px]">check_circle</span>
                </div>
                <div>
                  <span className="font-mono text-label-sm text-on-tertiary-container font-bold uppercase">
                    Payment Verified & Settled
                  </span>
                  <h3 className="font-headline text-headline-sm text-on-surface font-bold">
                    Order #SP-1024 Confirmed
                  </h3>
                </div>
              </div>

              <div className="py-space-20 space-y-space-12 font-body text-body-sm">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Settlement Amount</span>
                  <span className="font-mono text-headline-sm text-on-surface font-bold">
                    ₹2,799.00
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Razorpay Payment ID</span>
                  <span className="font-mono text-label-sm text-on-surface">pay_test_9k8xL12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Payment Method</span>
                  <span className="font-mono text-label-sm text-on-surface">UPI (test@okhdfcbank)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Fulfillment Routing</span>
                  <span className="font-body text-body-sm text-on-surface font-medium">
                    Indiranagar Hub, Bengaluru
                  </span>
                </div>
              </div>

              <div className="p-space-12 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                <span className="font-mono text-label-sm text-on-surface-variant">
                  Delivery Estimate: Tomorrow, 2 PM
                </span>
                <button
                  type="button"
                  className="font-label text-label-sm text-secondary font-semibold hover:underline"
                  onClick={() => showToast('Tracking webhook connected')}
                >
                  Track Shipment →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 8: RESILIENT RECOVERY & FAILURE MITIGATION                       */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64 bg-surface-container-low rounded-3xl mb-space-32">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="text-center max-w-2xl mx-auto mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-error font-semibold">
                Resilient Recovery
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                When something goes wrong, the agent knows what to do.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Payment timeouts and OTP drop-offs happen. ShopPilot preserves intent, prevents duplicate
                charges, and orchestrates zero-friction recovery.
              </p>
            </div>

            {/* Interactive Failure Simulation Panel */}
            <div className="max-w-2xl mx-auto bg-surface-container-lowest p-space-24 md:p-space-32 rounded-2xl shadow-xl border border-outline-variant/30">
              {!isFailureRecovered ? (
                <div>
                  <div className="flex items-start gap-space-16 mb-space-20 p-space-16 rounded-xl bg-error-container/30 border border-error/20">
                    <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[22px]">error</span>
                    </div>
                    <div>
                      <h4 className="font-headline text-headline-sm text-on-error-container font-semibold">
                        Payment couldn’t be completed
                      </h4>
                      <p className="font-body text-body-sm text-on-error-container mt-space-4">
                        Issuing bank reported an OTP verification timeout (Error code: GATEWAY_TIMEOUT_104).
                      </p>
                    </div>
                  </div>

                  {/* ShopPilot Autonomous Response */}
                  <div className="flex items-start gap-space-12 mb-space-24">
                    <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-mono text-label-sm shrink-0">
                      SP
                    </div>
                    <div className="p-space-16 rounded-2xl rounded-tl-none bg-surface-container-low text-on-surface font-body text-body-md border border-outline-variant/20">
                      Your payment did not go through, but don't worry: <strong>no funds were deducted</strong>{' '}
                      from your account. Your cart for <span className="font-semibold">{primaryProduct.name}</span> (₹2,799)
                      remains locked with your ₹200 discount for the next 10 minutes.
                    </div>
                  </div>

                  {/* Audit Log Trail for Incident */}
                  <div className="p-space-16 rounded-xl bg-surface-container-low space-y-space-8 font-mono text-label-sm text-on-surface-variant mb-space-24 border border-outline-variant/20">
                    <div className="flex justify-between">
                      <span>10:31:10 - Razorpay order_Nz81K dispatched</span>
                      <span className="text-on-surface font-medium">DISPATCHED</span>
                    </div>
                    <div className="flex justify-between text-error font-medium">
                      <span>10:31:12 - Bank gateway timeout (code 104)</span>
                      <span>FAILED</span>
                    </div>
                    <div className="flex justify-between text-tertiary font-medium">
                      <span>10:31:13 - ShopPilot verified zero charge ledger</span>
                      <span>SAFE_GUARD_OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>10:31:14 - Cart lock preserved for retry</span>
                      <span className="text-secondary font-semibold">LOCKED</span>
                    </div>
                  </div>

                  {/* Recovery Button */}
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSimulateRecovery}
                    isLoading={isRecovering}
                    iconLeft="replay"
                    className="w-full"
                  >
                    Retry payment with 1-click UPI
                  </Button>
                </div>
              ) : (
                <div className="text-center py-space-20">
                  <div className="w-12 h-12 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container flex items-center justify-center mx-auto mb-space-16 border border-tertiary-fixed-dim/40">
                    <span className="material-symbols-outlined text-[28px]">check_circle</span>
                  </div>
                  <h4 className="font-headline text-headline-sm text-on-surface font-bold">
                    Successfully Recovered & Settled!
                  </h4>
                  <p className="font-body text-body-md text-on-surface-variant mt-space-8 mb-space-20">
                    Agent seamlessly retried via UPI rail without losing cart context. Order #SP-1025 settled.
                  </p>
                  <button
                    type="button"
                    className="font-mono text-label-sm text-secondary hover:underline font-semibold"
                    onClick={() => {
                      setIsFailureRecovered(false);
                      showToast('Failure scenario reset to baseline');
                    }}
                  >
                    ← Reset Failure Scenario
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 9: STOREFRONT INTELLIGENCE & MERCHANT CENTER PREVIEW             */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-48 gap-space-16">
              <div>
                <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                  Storefront Intelligence
                </span>
                <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 font-bold">
                  A smarter storefront, with control behind it.
                </h2>
              </div>
              <p className="font-body text-body-md text-on-surface-variant max-w-md">
                Live telemetry, intent heatmaps, conversion lift metrics, and active conversational
                pipelines for store managers.
              </p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-20 mb-space-32">
              <div className="p-space-20 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-medium">
                  Daily Revenue
                </span>
                <div className="font-mono text-headline-lg text-on-surface font-bold mt-space-4">
                  ₹84,240
                </div>
                <div className="font-mono text-label-sm text-on-tertiary-container font-semibold mt-space-4 flex items-center gap-space-2">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span> +18.4% vs
                  last week
                </div>
              </div>

              <div className="p-space-20 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-medium">
                  Total Orders
                </span>
                <div className="font-mono text-headline-lg text-on-surface font-bold mt-space-4">
                  142
                </div>
                <div className="font-mono text-label-sm text-on-surface-variant font-medium mt-space-4">
                  38 completed in last 4 hrs
                </div>
              </div>

              <div className="p-space-20 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-medium">
                  AI-Assisted Purchases
                </span>
                <div className="font-mono text-headline-lg text-secondary font-bold mt-space-4">
                  87
                </div>
                <div className="font-mono text-label-sm text-on-tertiary-container font-semibold mt-space-4 flex items-center gap-space-2">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span> 61.2%
                  autonomous adoption
                </div>
              </div>

              <div className="p-space-20 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30">
                <span className="font-label text-label-sm uppercase text-on-surface-variant font-medium">
                  Cart Conversion Rate
                </span>
                <div className="font-mono text-headline-lg text-on-surface font-bold mt-space-4">
                  14.8%
                </div>
                <div className="font-mono text-label-sm text-on-tertiary-container font-semibold mt-space-4 flex items-center gap-space-2">
                  <span className="material-symbols-outlined text-[14px]">arrow_upward</span> +4.2%
                  lift vs traditional checkout
                </div>
              </div>
            </div>

            {/* Real-time Agent Activity Table */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden border border-outline-variant/30">
              <div className="p-space-20 bg-surface-container-low flex items-center justify-between border-b border-outline-variant/30">
                <div className="flex items-center gap-space-12">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
                  <h3 className="font-label text-label-md uppercase tracking-wider text-on-surface font-bold">
                    Real-time Agent Activity Stream
                  </h3>
                </div>
                <span className="font-mono text-label-sm text-on-surface-variant">
                  Refreshes every 2s
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-body text-body-sm">
                  <thead className="bg-surface-container-lowest border-b border-surface-container text-on-surface-variant font-label text-label-sm uppercase">
                    <tr>
                      <th className="p-space-16">Customer</th>
                      <th className="p-space-16">Natural Intent Prompt</th>
                      <th className="p-space-16">Surfaced Recommendation</th>
                      <th className="p-space-16">Value</th>
                      <th className="p-space-16">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-high/40">
                    {mockActivityStream.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="p-space-16 font-medium text-on-surface">{row.customerName}</td>
                        <td className="p-space-16 text-on-surface-variant">{row.prompt}</td>
                        <td className="p-space-16 text-on-surface font-medium">
                          {row.recommendation}
                        </td>
                        <td className="p-space-16 font-mono font-semibold text-on-surface">
                          {formatCurrency(row.value)}
                        </td>
                        <td className="p-space-16">
                          {row.status === 'paid' ? (
                            <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-mono text-label-sm font-semibold border border-tertiary-fixed-dim/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container" />{' '}
                              Paid ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-space-4 px-space-8 py-space-2 rounded bg-secondary-fixed text-secondary font-mono text-label-sm font-semibold border border-secondary/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Active in
                              Cart
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 10: FORENSIC AUDIT TRAIL LOG TERMINAL                            */}
        {/* ========================================================================= */}
        <section className="w-full py-space-64 bg-surface-container-low rounded-3xl mb-space-32">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="max-w-2xl mb-space-48">
              <span className="font-mono text-label-sm uppercase tracking-wider text-secondary font-semibold">
                Sub-second Ledger
              </span>
              <h2 className="font-headline text-headline-lg text-on-surface tracking-tight mt-space-8 mb-space-16 font-bold">
                See exactly what the agent did.
              </h2>
              <p className="font-body text-body-md text-on-surface-variant">
                Complete forensic traceability for finance teams, customer support, and merchant audits.
              </p>
            </div>

            {/* Granular Log Terminal Box */}
            <div className="p-space-24 rounded-2xl bg-surface-container-lowest shadow-xl font-mono text-label-sm border border-outline-variant/30">
              <div className="flex items-center justify-between pb-space-16 mb-space-16 border-b border-surface-container">
                <div className="flex items-center gap-space-8 text-on-surface">
                  <span className="material-symbols-outlined text-secondary text-[18px]">terminal</span>
                  <span className="font-semibold">Audit Trail: Session #SP-8902-EXEC</span>
                </div>
                <span className="text-on-tertiary-container bg-tertiary-fixed/30 border border-tertiary-fixed-dim/40 px-space-8 py-space-2 rounded font-semibold">
                  Verified Cryptographic Log
                </span>
              </div>

              <div className="space-y-space-8 text-on-surface">
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:02.102</span>
                  <span className="text-secondary font-semibold shrink-0">[INTENT_IN]</span>
                  <span>Customer requested running shoes under ₹3,000</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:03.240</span>
                  <span className="text-on-surface font-semibold shrink-0">[CATALOG_SCAN]</span>
                  <span>Catalog queried. 24 SKUs matched filter vectors.</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:04.015</span>
                  <span className="text-on-surface font-semibold shrink-0">[EVAL_RANK]</span>
                  <span>24 products evaluated against running biomechanics criteria</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:05.188</span>
                  <span className="text-secondary font-semibold shrink-0">[SELECT_TOP]</span>
                  <span>Product #ARX-2026 (AeroRun X Daily Road) selected as primary match</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:06.490</span>
                  <span className="text-tertiary font-semibold shrink-0">[OFFER_CHECK]</span>
                  <span>Merchant-approved offer 'RT-SUMMER200' validated against profit margin bounds</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:10.822</span>
                  <span className="text-secondary font-semibold shrink-0">[CONSENT_GATE]</span>
                  <span>Customer physically confirmed purchase via gated modal</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:11.002</span>
                  <span className="text-on-surface font-semibold shrink-0">[RAZORPAY_INIT]</span>
                  <span>Razorpay order order_Nz81K created via API with payload hash</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:43.910</span>
                  <span className="text-tertiary font-semibold shrink-0">[PAYMENT_VERIFIED]</span>
                  <span>Payment verified via cryptographically signed webhook (pay_test_9k8xL12)</span>
                </div>
                <div className="flex items-start gap-space-12">
                  <span className="text-on-surface-variant shrink-0">10:31:44.020</span>
                  <span className="text-tertiary font-semibold shrink-0">[SETTLED]</span>
                  <span>Order marked paid. Warehouse ERP notified. Receipt emitted.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 11: FINAL CALL TO ACTION                                         */}
        {/* ========================================================================= */}
        <section className="w-full py-space-80 bg-surface-container-lowest rounded-3xl mb-space-32 border border-outline-variant/30 text-center">
          <div className="max-w-content mx-auto px-gutter-desktop">
            <div className="max-w-2xl mx-auto">
              <h2 className="font-display text-display text-on-surface tracking-tight mb-space-16 font-bold">
                Let customers shop by intent.
              </h2>
              <p className="font-body text-body-lg text-on-surface-variant mb-space-32">
                Give your storefront an autonomous agent that understands, recommends, and checks out
                without friction.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-space-16">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => openAgentModalWithScenario('shoes')}
                  iconRight="arrow_forward"
                  className="shadow-md"
                >
                  Launch ShopPilot
                </Button>
                <Link
                  to="/agent/trace"
                  className="inline-flex items-center justify-center gap-space-8 px-space-24 py-space-12 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md shadow-sm hover:bg-surface-container-high transition-all border border-outline-variant/30 font-semibold"
                >
                  Explore Interactive Demo
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE AGENT MODAL / SANDBOX WINDOW                                 */}
      {/* ========================================================================= */}
      {isAgentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-space-16 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/30">
            {/* Modal Navigation Bar */}
            <div className="p-space-16 bg-surface-container flex items-center justify-between border-b border-surface-container-highest">
              <div className="flex items-center gap-space-12">
                <div className="w-7 h-7 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-headline text-body-lg font-bold text-on-surface">
                    ShopPilot Interactive Runtime
                  </h3>
                  <span className="font-mono text-[11px] text-on-surface-variant">
                    Deterministic Autonomous Agent Environment
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-space-8">
                <div className="flex bg-surface-container-low p-space-2 rounded-lg border border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('agent')}
                    className={`px-space-12 py-space-4 rounded-md font-label text-label-sm transition-all ${
                      activeModalTab === 'agent'
                        ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Customer Agent
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('trace')}
                    className={`px-space-12 py-space-4 rounded-md font-label text-label-sm transition-all ${
                      activeModalTab === 'trace'
                        ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Decision Trace
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveModalTab('merchant')}
                    className={`px-space-12 py-space-4 rounded-md font-label text-label-sm transition-all ${
                      activeModalTab === 'merchant'
                        ? 'bg-surface-container-lowest text-on-surface font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Merchant Control
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAgentModalOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-space-24">
              {/* Tab 1: Customer Agent */}
              {activeModalTab === 'agent' && (
                <div className="space-y-space-20">
                  <div className="flex flex-wrap items-center gap-space-8 pb-space-12 border-b border-surface-container">
                    <span className="font-label text-label-sm text-on-surface-variant font-semibold">
                      Try Instant Scenarios:
                    </span>
                    <button
                      type="button"
                      onClick={() => openAgentModalWithScenario('shoes')}
                      className={`px-space-10 py-space-4 rounded-full font-mono text-label-sm transition-colors border ${
                        activeScenarioKey === 'shoes'
                          ? 'bg-secondary text-on-secondary border-secondary font-bold'
                          : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
                      }`}
                    >
                      👟 Running shoes under ₹3,000
                    </button>
                    <button
                      type="button"
                      onClick={() => openAgentModalWithScenario('headphones')}
                      className={`px-space-10 py-space-4 rounded-full font-mono text-label-sm transition-colors border ${
                        activeScenarioKey === 'headphones'
                          ? 'bg-secondary text-on-secondary border-secondary font-bold'
                          : 'bg-surface-container text-on-surface border-outline-variant/30 hover:bg-surface-container-high'
                      }`}
                    >
                      🎧 Travel headphones under ₹2,500
                    </button>
                  </div>

                  {/* Dynamic Chat Thread */}
                  <div className="space-y-space-16 min-h-[220px]">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-space-12 ${
                          msg.sender === 'user' ? 'justify-start' : 'justify-start w-full'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-label-sm font-semibold shrink-0 shadow-sm ${
                            msg.sender === 'user'
                              ? 'bg-surface-container-highest text-on-surface'
                              : 'bg-primary text-on-primary'
                          }`}
                        >
                          {msg.sender === 'user' ? 'U' : 'SP'}
                        </div>

                        <div
                          className={`p-space-16 rounded-2xl rounded-tl-none font-body text-body-md shadow-sm border border-outline-variant/20 ${
                            msg.sender === 'user'
                              ? 'bg-surface-container-low text-on-surface max-w-[85%]'
                              : 'bg-surface-container-lowest text-on-surface flex-1'
                          }`}
                        >
                          <p className="text-on-surface leading-relaxed">{msg.text}</p>

                          {msg.product && (
                            <div className="mt-space-12 p-space-12 rounded-lg bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-12 border border-outline-variant/30">
                              <div className="flex items-center gap-space-12">
                                <img
                                  src={msg.product.images[0]}
                                  className="w-12 h-12 rounded-lg object-cover bg-surface-container-high border border-outline-variant/20"
                                  alt={msg.product.name}
                                />
                                <div>
                                  <div className="font-headline font-bold text-on-surface text-body-md">
                                    {msg.product.name}
                                  </div>
                                  <div className="font-mono text-headline-sm font-bold text-on-surface">
                                    {formatCurrency(msg.product.finalPrice)}
                                  </div>
                                </div>
                              </div>

                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setIsAgentModalOpen(false);
                                  navigate('/recommendation/aerorun-x');
                                }}
                              >
                                View Recommendation →
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input Bar */}
                  <form
                    onSubmit={handleSendCustomIntent}
                    className="pt-space-16 border-t border-surface-container flex items-center gap-space-8"
                  >
                    <input
                      className="flex-1 px-space-16 py-space-10 rounded-xl bg-surface-container-low text-on-surface font-body text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder:text-on-surface-variant"
                      placeholder="Type a commerce intent... (e.g. lightweight road running shoes under ₹3,000)"
                      type="text"
                      value={customIntentInput}
                      onChange={(e) => setCustomIntentInput(e.target.value)}
                    />
                    <Button variant="primary" size="md" type="submit">
                      Send Intent
                    </Button>
                  </form>
                </div>
              )}

              {/* Tab 2: Decision Trace */}
              {activeModalTab === 'trace' && (
                <div className="space-y-space-16">
                  <div className="flex items-center justify-between pb-space-8 border-b border-surface-container">
                    <div>
                      <span className="font-headline font-bold text-on-surface text-body-md">
                        Chronological Agent Reasoning Stream
                      </span>
                      <p className="font-body text-[12px] text-on-surface-variant">
                        Deterministic operations executed for active session #SP-8902
                      </p>
                    </div>
                    <Link
                      to="/agent/trace"
                      className="px-space-12 py-1 rounded bg-secondary text-on-secondary font-mono text-label-sm font-bold flex items-center gap-1 hover:bg-secondary/90 transition-colors"
                    >
                      <span>Open Full Trace</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </Link>
                  </div>

                  {/* Micro-Event Stream */}
                  <div className="space-y-space-8 font-mono text-label-sm">
                    {[
                      {
                        time: '10:31:02.102',
                        type: 'INTENT_RECEIVED',
                        desc: 'Customer request received: “I need running shoes under ₹3,000 for daily running.”',
                        status: '✓ Completed',
                      },
                      {
                        time: '10:31:02.180',
                        type: 'INTENT_PARSED',
                        desc: 'Category: Running Shoes • Ceiling: ≤ ₹3,000.00 • Terrain: Daily Road Running',
                        status: '✓ Completed',
                      },
                      {
                        time: '10:31:02.420',
                        type: 'CATALOG_SEARCH',
                        desc: 'Evaluated 24 candidate SKUs in vector space (k=24, 18ms). 4 within budget.',
                        status: '✓ Completed',
                      },
                      {
                        time: '10:31:02.611',
                        type: 'PRODUCT_SELECTED',
                        desc: 'AeroRun X Daily Road selected (99.2% deterministic match score).',
                        status: '✓ Completed',
                      },
                      {
                        time: '10:31:03.002',
                        type: 'MERCHANT_RULE_APPLIED',
                        desc: 'Applied coupon RT-SUMMER200 (-₹200) within pre-approved margin bounds.',
                        status: '✓ Completed',
                      },
                      {
                        time: '10:31:03.120',
                        type: 'PRICE_CALCULATED',
                        desc: 'Locked final settlement amount at ₹2,799.00 (₹201 headroom preserved).',
                        status: '✓ Completed',
                      },
                      {
                        time: '10:31:04.510',
                        type: 'CUSTOMER_AUTHORIZED',
                        desc: 'Zero-stealth confirmation gate: explicit human approval token required.',
                        status: '✓ Gated',
                      },
                    ].map((step, idx) => (
                      <div
                        key={idx}
                        className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-space-8">
                            <span className="text-secondary font-bold">[{step.type}]</span>
                            <span className="text-on-surface-variant">{step.time}</span>
                          </div>
                          <span className="text-emerald-700 font-bold">{step.status}</span>
                        </div>
                        <p className="font-body text-[13px] text-on-surface mt-1">{step.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-space-12 rounded-lg bg-surface-container-lowest border border-outline-variant/20 font-mono text-[11px] text-on-surface-variant flex items-center justify-between">
                    <span>Session ECDSA Digest: 0x9e81...a431</span>
                    <Link to="/agent/trace" className="text-secondary hover:underline font-bold">
                      View Cryptographic Proof →
                    </Link>
                  </div>
                </div>
              )}

              {/* Tab 3: Merchant Control Hub */}
              {activeModalTab === 'merchant' && (
                <div className="space-y-space-20">
                  <div>
                    <span className="font-headline font-bold text-on-surface text-body-md block">
                      Merchant Guardrails &amp; Policy Control
                    </span>
                    <p className="font-body text-[12px] text-on-surface-variant">
                      Real-time limits and safety boundaries configured for autonomous agent operations
                    </p>
                  </div>

                  {/* 3 Principles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-12">
                    <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                      <span className="font-mono text-[11px] font-bold text-secondary uppercase block mb-1">
                        01 — Explainable
                      </span>
                      <p className="font-body text-[12px] text-on-surface-variant">
                        Every recommendation has a visible deterministic rationale.
                      </p>
                    </div>

                    <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                      <span className="font-mono text-[11px] font-bold text-secondary uppercase block mb-1">
                        02 — Bounded
                      </span>
                      <p className="font-body text-[12px] text-on-surface-variant">
                        Agent cannot alter product, price, or currency without renewed approval.
                      </p>
                    </div>

                    <div className="p-space-12 rounded-lg bg-surface-container-low border border-outline-variant/20">
                      <span className="font-mono text-[11px] font-bold text-secondary uppercase block mb-1">
                        03 — Gated
                      </span>
                      <p className="font-body text-[12px] text-on-surface-variant">
                        Money actions require explicit customer authorization.
                      </p>
                    </div>
                  </div>

                  {/* Policy Configuration Table */}
                  <div className="p-space-16 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-space-8 font-mono text-label-sm">
                    <div className="font-bold text-on-surface text-body-sm pb-1 border-b border-outline-variant/20">
                      Configured Merchant Policies
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-8">
                      <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Maximum Order Value:</span>
                        <span className="font-bold text-on-surface">₹3,000</span>
                      </div>
                      <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Allowed Currency:</span>
                        <span className="font-bold text-on-surface">INR</span>
                      </div>
                      <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Automatic Discounts:</span>
                        <span className="font-bold text-emerald-700">Enabled (Max ₹500)</span>
                      </div>
                      <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Customer Authorization:</span>
                        <span className="font-bold text-emerald-700">Required</span>
                      </div>
                      <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Payment Mode:</span>
                        <span className="font-bold text-on-surface">Razorpay Test Mode</span>
                      </div>
                      <div className="flex items-center justify-between p-space-8 rounded bg-surface-container-lowest">
                        <span className="text-on-surface-variant">Agent Purchase Authority:</span>
                        <span className="font-bold text-secondary">GATED</span>
                      </div>
                    </div>
                  </div>

                  {/* Active Policy Evaluation */}
                  <div className="p-space-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between font-mono text-label-sm">
                    <div className="flex items-center gap-space-8 text-emerald-900">
                      <span className="material-symbols-outlined text-emerald-700 text-[18px]">verified</span>
                      <span>Policy Evaluation: ₹2,799 settlement passes all 7 checks</span>
                    </div>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-space-8 py-0.5 rounded">
                      AUTHORIZED FOR CHECKOUT
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default AgentHomePage;
