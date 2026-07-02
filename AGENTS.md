<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# NomSubz Subscription Engine Guidelines

NomSubz is a managed recurring-billing layer built on top of Nomba's payment primitives (Checkout, Tokenised cards, Charge API, Transfers) for downstream product teams.

## Tech Stack & Architecture

- **Framework**: Next.js (Node.js/TypeScript monolith).
- **Database**: PostgreSQL.
- **Queue/Background Jobs**: `pg-boss` (or a similar SQL-backed database queue) to avoid Redis caching conflicts (avoid mixing cache eviction policies with persistent billing tasks).
- **Scheduler**: Simple lightweight cron/scheduler (such as a database-backed cron or event-driven trigger) querying subscriptions at regular intervals.

## Database Schema (PostgreSQL)

The `subscriptions` table must strictly follow this structure:

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'past_due', 'paused', 'canceled'
    
    -- Pre-computed timestamps for the current running cycle
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Flags for handling the end of the current cycle
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    pause_at_period_end BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crucial index for cron job / pg-boss performance
CREATE INDEX idx_subscriptions_billing ON subscriptions (status, current_period_end);
```

## Core Billing & State Machine Logic

### 1. Subscription States
A subscription is a state machine with the following states:
- `incomplete` (initial state when setup starts)
- `active` (successfully charged/renewed)
- `past_due` (payment failed, currently in dunning loop)
- `paused` (billing suspended, access checked depending on current_period_end)
- `canceled` (terminal state; cannot be resurrected—new subscription must be created)

### 2. Dunning Loop (Failed Payment Recovery)
When a subscription charge fails, the system must trigger the dunning process:
- **Day 1**: Payment fails -> Mark status as `past_due`, retry card charge, send "Payment Failed" email.
- **Day 3**: Retry card charge, send "Update payment method" email.
- **Day 7**: Final retry -> If fails, transition status to `canceled` or `paused`, revoke access.

### 3. Subscription Pausing (Delayed Pause Approach)
- When a user pauses billing mid-cycle, set `pause_at_period_end = true`.
- Maintain status as `active` so they keep access for the rest of their paid period.
- At the end of the cycle (`current_period_end <= NOW()`), the background worker sees `pause_at_period_end = true`, transitions the status to `paused`, clears the flag, and blocks further charges.
- The authorization middleware grants access if `status === 'active' || (status === 'paused' && NOW() < current_period_end)`.

### 4. Proration & Math Rules
- **Decimal Precision**: All monetary/financial calculations must be performed using `Decimal` (e.g., `decimal.js`) to prevent floating-point errors.
- **Dynamic Math**: Do not use static duration values (e.g., 30 days in milliseconds) for proration. Pass explicit `startTime`, `endTime`, and `now` timestamps.
- **Defensive Clamping**: Guard against webhook or API lag by clamping elapsed time between `0` and `totalDuration` so the remaining fraction is never negative.
- **Consistency**: 
  - For standard monthly cycles, renewal workers should add exactly 30 days (`30 * DAY_1` where `DAY_1 = 24 * 60 * 60 * 1000`).
  - For annual cycles, use exactly 365 days (`365 * DAY_1`) to prevent time-of-day renewal drift that occurs when using fractional years like `365.25`.
- **Minimum Threshold**: Before executing a card charge for a tiny prorated amount, check if the amount is below the threshold (e.g., ₦100). If below the threshold, roll the balance over to the next invoice rather than performing an API charge.

## Security & API Design

### 1. Route Protection
- **Server-to-Server API Keys**: Internal/Admin APIs must be secured using server-to-server API keys (`sk_live_...`). Store hashed versions of these keys in the database. Protect using a Bearer token middleware.
- **HMAC Signatures**: The Nomba webhook route (`POST /api/webhooks/nomba`) must verify the request payload using HMAC signatures and the shared webhook secret to ensure it originates from Nomba.

### 2. API Routes Structure

#### Plans & Catalog
- `GET /api/plans` - List all active plans
- `GET /api/plans/:id` - Get details of a specific plan
- `POST /api/plans` - Create a new plan (Admin only)
- `PUT /api/plans/:id` - Update plan details (names/descriptions only; pricing is immutable)

#### Customers
- `POST /api/customers` - Create a billing profile for an authenticated user
- `GET /api/customers/me` - Get current customer's profile
- `GET /api/customers/:id` - Get specific customer profile (Admin only)
- `PUT /api/customers/me` - Update billing/contact details

#### Payment Methods (Tokenized Cards)
- `POST /api/customers/me/payment-methods` - Attach a tokenized card from Nomba
- `GET /api/customers/me/payment-methods` - List saved cards
- `PUT /api/customers/me/payment-methods/:cardId/default` - Set default payment card
- `DELETE /api/customers/me/payment-methods/:cardId` - Remove card

#### Subscriptions (State Machine)
- `POST /api/subscriptions` - Create new subscription (requires plan ID, payment method)
- `GET /api/subscriptions` - List subscriptions (Admin only, supports filter by status)
- `GET /api/subscriptions/me` - List current user's subscriptions
- `GET /api/subscriptions/:id` - Get details of a specific subscription
- `PUT /api/subscriptions/:id` - Upgrade/downgrade a plan (triggers proration math)
- `POST /api/subscriptions/:id/cancel` - Schedule cancellation (`cancel_at_period_end = true`)
- `POST /api/subscriptions/:id/pause` - Schedule pause (`pause_at_period_end = true`)
- `POST /api/subscriptions/:id/resume` - Reactivate paused subscription immediately

#### Invoices & Receipts
- `GET /api/invoices` - List all invoices (Admin only)
- `GET /api/customers/me/invoices` - List invoices for current user
- `GET /api/invoices/:id` - Get details of specific invoice
- `GET /api/invoices/:id/pdf` - Generate and return PDF invoice on the fly (e.g. using `pdfkit` or templates)
- `POST /api/invoices/:id/refund` - Process a refund via Nomba's Refund API (transitions to `refunded` or `partially_refunded`)

#### Webhooks
- `POST /api/webhooks/nomba` - Secure endpoint for Nomba asynchronous event notifications
- `POST /api/webhooks/endpoints` - Let downstream products register URLs for engine events (e.g. `subscription.created`)

