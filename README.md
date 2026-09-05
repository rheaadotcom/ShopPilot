🛍️ ShopPilot — AI Commerce Agent

From customer intent to explainable, policy-aware checkout.

ShopPilot is an AI commerce agent prototype that turns a natural-language shopping request into a guided shopping journey — from intent understanding and product recommendation to merchant offers, customer approval, and Razorpay Test Mode checkout.

The project focuses on a key idea:

Commerce should feel like a conversation, not a search form.

Instead of making customers search, filter, compare, hunt for offers, and navigate checkout manually, ShopPilot demonstrates how an agent can coordinate these steps while keeping recommendations explainable, bounded by merchant rules, and gated by customer approval.

✨ Why ShopPilot?

Traditional e-commerce

Search → Filters → Compare → Reviews → Offers → Cart → Checkout → Payment

ShopPilot

Natural-language intent
        ↓
Understand requirements
        ↓
Find & rank products
        ↓
Explain recommendation
        ↓
Apply eligible merchant offer
        ↓
Validate policy & price
        ↓
Ask for customer approval
        ↓
Razorpay Test Mode checkout

The goal is not to remove customer control.
The goal is to remove unnecessary decision-making friction while keeping important actions under explicit control.

🎯 Example

A customer can simply say:

"I need running shoes under ₹3,000 for daily running."

ShopPilot converts that request into structured shopping constraints:

Constraint

Value

Category

Running Shoes

Budget ceiling

₹3,000

Use case

Daily Road Running

Availability

Required

Rating

Considered during matching

The agent then presents the strongest product match, explains the decision, applies an eligible merchant offer, and calculates a deterministic checkout amount.

🏗️ System Architecture

The application is intentionally designed as a hackathon-ready client application with a lightweight Node/Express payment integration.

flowchart TB
    U[👤 Customer]

    subgraph FE["Frontend — React + TypeScript + Vite"]
        UI["ShopPilot UI<br/>AI Agent • Recommendation • Confirm • Checkout • Decision Trace"]

        DF["DemoFlowProvider<br/>Deterministic demo state machine"]
        CC["CartContext<br/>Cart • Authorization • Checkout state"]

        DATA["mockData.ts<br/>Products • Offers • Demo Orders • Scenarios"]
        PE["policyEngine.ts<br/>Merchant guardrails & approval rules"]
        RA["revenueAnalytics.ts<br/>Revenue & basket metrics"]

        UI --> DF
        UI --> CC
        DF --> DATA
        DF --> PE
        DF --> RA
        CC --> DATA
        CC --> PE
    end

    subgraph BE["Backend — Node.js + Express + TypeScript"]
        PROXY["Thin Razorpay integration / proxy"]
    end

    RP["Razorpay Test Mode<br/>Sandbox Payment"]

    U --> UI
    CC -->|Approved checkout| PROXY
    PROXY --> RP
    RP -->|Payment result| PROXY
    PROXY --> CC

    DF -->|Trace events| UI
    DATA --> RA

Architecture at a glance

Customer Layer
The customer interacts with ShopPilot through a conversational-style shopping interface.

Demo Orchestration Layer
DemoFlowProvider uses a deterministic state machine to drive the complete demo flow.

Commerce State Layer
CartContext manages cart items, offers, customer authorization, totals, and payment state.

Data Layer
src/data/mockData.ts acts as the single source of truth for the demo catalog, offers, orders, and scenarios.

Policy Layer
src/lib/policyEngine.ts validates merchant-defined boundaries before important actions.

Analytics Layer
src/lib/revenueAnalytics.ts derives revenue and basket metrics from the deterministic demo order data.

Payment Layer
Razorpay Test Mode is invoked only after the required customer approval.

🧠 Core Execution Flow

flowchart LR
    A["Customer Intent"] --> B["Intent Understanding"]
    B --> C["Constraint Extraction"]
    C --> D["Catalog / Product Data"]
    D --> E["Product Matching"]
    E --> F["Explainable Recommendation"]
    F --> G["Merchant Offer"]
    G --> H["Deterministic Price Ledger"]
    H --> I["Basket Optimization"]
    I --> J["Policy Check"]
    J --> K{"Customer Approval"}
    K -->|Approved| L["Checkout"]
    K -->|Rejected| M["Keep Current Basket"]
    L --> N["Razorpay Test Mode"]
    N --> O{"Payment Result"}
    O -->|Success| P["Payment Verified"]
    O -->|Failure| Q["Failure / Recovery"]
    P --> R["Revenue Intelligence"]

🛡️ Trust & Safety Model

ShopPilot is built around three principles:

1. 🔍 Explainable

The interface exposes why a product was selected instead of presenting an unexplained recommendation.

The decision trace can surface:

Customer intent

Extracted constraints

Product match score

Recommendation rationale

Offer applied

Price calculation

Agent execution steps

2. 🔒 Bounded

The agent operates within merchant-defined boundaries such as:

Maximum basket value

Maximum discount

Upselling rules

Cross-selling rules

Offer eligibility

Payment approval requirements

3. ✅ Gated

Important monetary actions require explicit customer approval.

For example, when ShopPilot identifies a complementary product, it can present the recommendation without silently purchasing it.

The customer remains in control:

Add to Basket
      OR
Keep Current Basket

No autonomous purchase is performed without the required approval.

💳 Payment Flow

ShopPilot integrates Razorpay Test Mode for the checkout demonstration.

sequenceDiagram
    participant C as Customer
    participant UI as ShopPilot UI
    participant Cart as CartContext
    participant API as Node/Express
    participant R as Razorpay Test Mode

    C->>UI: Approve purchase
    UI->>Cart: authorizePurchase()
    Cart-->>UI: Purchase authorization
    UI->>API: Start test checkout
    API->>R: Create / process test payment flow
    R-->>API: Payment result
    API-->>UI: Result
    UI->>Cart: markPaymentSettled()
    UI-->>C: Success / Failure state

Important: The project uses Razorpay Test Mode. No real customer transaction is performed.

🧩 Technology Stack

Frontend

Technology

Purpose

React 18

UI and component architecture

TypeScript

Static typing and safer application code

Vite

Development server and build tooling

React Router v6

Client-side routing

Context API

Shared cart and demo-flow state

Vanilla CSS

Custom UI and Stitch-inspired design system

Frontend state

CartContext — cart, totals, authorization, payment state

DemoFlowProvider — deterministic demo state machine

useDemoFlow — access to demo execution state

useCart — access to commerce/cart state

Backend

Technology

Purpose

Node.js

Backend runtime

Express

Lightweight HTTP server / integration layer

TypeScript

Backend type safety

dotenv / .env

Environment configuration

The backend is intentionally lightweight and primarily supports the Razorpay Test Mode integration.

Data & Business Logic

Module

Responsibility

src/data/mockData.ts

Demo products, offers, orders and scenarios

src/lib/policyEngine.ts

Merchant guardrails and policy validation

src/lib/revenueAnalytics.ts

Revenue, conversion and basket metrics

src/features/cart/CartContext.tsx

Cart and checkout state

useDemoFlow.ts

Deterministic demo orchestration

Storage

The current prototype does not use a database.

Demo catalog and scenarios → mockData.ts

Cart persistence → browser localStorage

Demo revenue metrics → derived from demoOrders

Merchant policy state → browser localStorage

🔄 Deterministic Demo State Machine

The live demo is driven by DemoFlowProvider.

stateDiagram-v2
    [*] --> IDLE
    IDLE --> INTENT
    INTENT --> UNDERSTANDING
    UNDERSTANDING --> RECOMMENDATION
    RECOMMENDATION --> OFFER
    OFFER --> OPTIMIZATION
    OPTIMIZATION --> POLICY_CHECK
    POLICY_CHECK --> APPROVAL
    APPROVAL --> CHECKOUT
    CHECKOUT --> PAYMENT
    PAYMENT --> SUCCESS
    PAYMENT --> FAILED
    SUCCESS --> IDLE
    FAILED --> IDLE

This makes the live demonstration predictable and repeatable while still presenting the experience of an AI commerce workflow.

📊 Decision Trace

One of ShopPilot's main differentiators is the Agent Activity & Decision Trace.

The dashboard records the sequence of decisions made during a session, allowing the user or evaluator to inspect how the system moved from:

Customer Intent
      ↓
Constraints
      ↓
Product Evaluation
      ↓
Recommendation
      ↓
Offer
      ↓
Policy Validation
      ↓
Customer Approval
      ↓
Checkout
      ↓
Payment Result

This is especially useful for demonstrating explainability, auditability, and controlled agent execution.

💡 Key Features

🗣️ Natural-language shopping intent

🎯 Constraint-based product matching

🔎 Product recommendation

💬 Explainable recommendation rationale

🏷️ Merchant-approved offers

💰 Deterministic price calculation

🧺 Basket optimization

🛡️ Merchant policy guardrails

✅ Explicit customer approval

💳 Razorpay Test Mode checkout

🔁 Payment failure/recovery states

📋 Agent execution trace

📈 Revenue intelligence dashboard

🎬 Deterministic one-click live demo

📁 Project Structure

ShopPilot/
├── src/
│   ├── components/
│   ├── features/
│   │   └── cart/
│   │       └── CartContext.tsx
│   ├── data/
│   │   └── mockData.ts
│   ├── lib/
│   │   ├── policyEngine.ts
│   │   └── revenueAnalytics.ts
│   ├── hooks/
│   │   └── useDemoFlow.ts
│   ├── pages/
│   ├── types/
│   └── main.tsx
│
├── server/
│   └── Express / Razorpay integration
│
├── .env
├── package.json
├── tsconfig.json
└── vite.config.ts

Folder names may vary slightly depending on the current implementation; the modules above represent the core architecture documented by the project.

🚀 Getting Started

1. Clone the repository

git clone <your-repository-url>
cd ShopPilot

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file for the Razorpay Test Mode credentials used by the project.

RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

Never commit real secrets or production payment credentials to Git.

4. Start the development server

npm run dev

Open:

http://localhost:5173

🎬 Demo Journey

For the best demonstration, use the following flow:

1. Open ShopPilot
        ↓
2. Start the live demo
        ↓
3. Enter / view the customer intent
        ↓
4. Inspect the recommended product
        ↓
5. Review the recommendation rationale
        ↓
6. Inspect merchant offer
        ↓
7. Review basket & final amount
        ↓
8. Approve the purchase
        ↓
9. Complete Razorpay Test Mode checkout
        ↓
10. Open Decision Trace
        ↓
11. Inspect execution + revenue intelligence

🏆 What Makes It Different?

ShopPilot is not positioned as just a product search UI.

It demonstrates an agentic commerce workflow where the system coordinates:

Intent
  +
Product Data
  +
Business Rules
  +
Customer Approval
  +
Payment
  +
Auditability

The core product principle is:

Let the agent handle the complexity, but never hide the important decisions from the customer.

⚠️ Prototype Scope

This repository is a hackathon/demo prototype.

The current implementation uses:

Deterministic demo scenarios

Mock product/catalog data

Browser localStorage

Derived demo analytics

Razorpay Test Mode

It does not currently include a production database, production payment processing, or a production-grade autonomous purchasing backend.

🤝 Contributing

When extending the project:

Keep the existing UI language and design system.

Keep demo data centralized in src/data/mockData.ts.

Preserve customer approval gates.

Keep payment integration in Test Mode for demos.

Avoid adding unnecessary UI libraries.

Preserve TypeScript typing and existing folder conventions.

Do not introduce a database unless the architecture is intentionally being upgraded beyond the current prototype.

📄 License

MIT — feel free to fork and adapt for hackathon demonstrations and internal prototypes.
