# NomSubz

**A managed recurring-billing engine built on top of Nomba's payment primitives.**

NomSubz wraps Nomba's Checkout, Tokenised Cards, Charge API, and Transfers into a full subscription-management layer, so downstream product teams can offer recurring billing without building state machines, dunning logic, or proration math themselves.

---

## Features

- 🔁 **Subscription state machine** — `incomplete → active → past_due → paused/canceled`
- 💳 **Tokenized card billing** via Nomba's Charge API
- 📉 **Dunning loop** — automatic retries and email notifications on failed payments (Day 1 / Day 3 / Day 7)
- ⏸️ **Delayed pause** — users keep access until the end of their paid period
- 🧮 **Accurate proration** — `decimal.js`-based math with defensive clamping, no floating-point drift
- 🧾 **Invoices & PDFs** — generated on the fly
- 🔐 **Secure by design** — HMAC-verified webhooks, hashed server-to-server API keys
- 🔔 **Webhook registration** — downstream products can subscribe to engine events

---

## Tech Stack

| Layer           | Choice                                                              |
| --------------- | ------------------------------------------------------------------- |
| Framework       | Next.js (Node.js / TypeScript monolith)                             |
| Database        | PostgreSQL                                                          |
| Background Jobs | `pg-boss` (SQL-backed queue, avoids Redis cache-eviction conflicts) |
| Scheduler       | Lightweight DB-backed cron / event-driven trigger                   |
| Payments        | Nomba (Checkout, Tokenised Cards, Charge API, Transfers)            |

---

## Database Schema

The core of the engine is the `subscriptions` table:

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL,
    plan_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'active', 'past_due', 'paused', 'canceled'

    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,

    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    pause_at_period_end BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crucial index for cron job / pg-boss performance
CREATE INDEX idx_subscriptions_billing ON subscriptions (status, current_period_end);
```

---

## Core Billing Logic

### Subscription States
- `incomplete` — initial state when setup starts
- `active` — successfully charged/renewed
- `past_due` — payment failed, currently in dunning loop
- `paused` — billing suspended (access checked depending on `current_period_end`)
- `canceled` — terminal state; cannot be resurrected, a new subscription must be created

### Dunning Loop (Failed Payment Recovery)
| Day | Action                                                                            |
| --- | --------------------------------------------------------------------------------- |
| 1   | Payment fails → status `past_due`, retry card charge, send "Payment Failed" email |
| 3   | Retry card charge, send "Update payment method" email                             |
| 7   | Final retry → on failure, transition to `canceled` or `paused`, revoke access     |

### Subscription Pausing (Delayed Pause Approach)
1. User pauses mid-cycle → `pause_at_period_end = true`, status stays `active`
2. User keeps access for the rest of their paid period
3. At `current_period_end <= NOW()`, the background worker transitions status to `paused`, clears the flag, and blocks further charges
4. Authorization middleware grants access if `status === 'active' || (status === 'paused' && NOW() < current_period_end)`

### Proration & Math Rules
- **Decimal precision**: all monetary calculations use `Decimal` (`decimal.js`) to prevent floating-point errors
- **Dynamic math**: proration uses explicit `startTime`, `endTime`, and `now` timestamps — never static duration constants
- **Defensive clamping**: elapsed time is clamped between `0` and `totalDuration` so the remaining fraction is never negative, guarding against webhook/API lag
- **Consistency**: monthly renewals add exactly 30 days (`30 * DAY_1`); annual renewals add exactly 365 days (`365 * DAY_1`) — avoids time-of-day drift from fractional years like `365.25`
- **Minimum threshold**: prorated charges below a threshold (e.g. ₦100) roll over to the next invoice instead of triggering a card charge

---

## Security

- **Admin/internal APIs**: server-to-server API keys (`sk_live_...`), stored hashed, enforced via Bearer token middleware
- **Webhooks**: `POST /api/webhooks/nomba` verifies HMAC signatures against the shared webhook secret to confirm the request originated from Nomba

---

## API Reference

### Plans & Catalog
```
GET    /api/plans                        List all active plans
GET    /api/plans/[planId]               Get details of a specific plan
POST   /api/plans                        Create a new plan (Admin only)
```

### Customers
```
POST   /api/customers                    Create a billing profile for an authenticated user
GET    /api/customers/[customerId]       Get specific customer profile (Admin only)
```

### Payment Methods (Tokenized Cards)
```
POST   /api/customers/[customerId]/payment-methods                    Attach a tokenized card from Nomba
GET    /api/customers/[customerId]/payment-methods                    List saved cards
PUT    /api/customers/[customerId]/payment-methods/[cardId]/default   Set default payment card
DELETE /api/customers/[customerId]/payment-methods/[cardId]           Remove card
```

### Subscriptions (State Machine)
```
POST   /api/customers/[customerId]/subscriptions                        Create new subscription (plan ID + payment method)
GET    /api/customers/[customerId]/subscriptions                        List subscriptions for a customer (filterable by status)
GET    /api/customers/[customerId]/subscriptions/[subscriptionId]       Get details of a specific subscription
PUT    /api/customers/[customerId]/subscriptions/[subscriptionId]       Upgrade/downgrade a plan (triggers proration)
POST   /api/customers/[customerId]/subscriptions/[subscriptionId]/cancel   Schedule cancellation (cancel_at_period_end = true)
POST   /api/customers/[customerId]/subscriptions/[subscriptionId]/pause    Schedule pause
POST   /api/customers/[customerId]/subscriptions/[subscriptionId]/resume   Reactivate paused subscription immediately
```

### Invoices & Receipts
```
GET    /api/invoices                                        List all invoices (Admin only)
GET    /api/customers/[customerId]/invoices                 List invoices for a specific customer
GET    /api/customers/[customerId]/invoices/[invoiceId]     Get details of a specific invoice
GET    /api/customers/[customerId]/invoices/[invoiceId]/pdf Generate and return PDF invoice on the fly
```

### Webhooks
```
POST   /api/webhooks/nomba              Secure endpoint for Nomba asynchronous event notifications
POST   /api/webhooks/endpoints          Let downstream products register URLs for engine events (e.g. subscription.created)
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start the dev server
npm run dev
```

### Environment Variables

```
DATABASE_URL=
NOMBA_API_KEY=
NOMBA_WEBHOOK_SECRET=
INTERNAL_API_KEY_SALT=
```

---

## Roadmap / Hackathon Scope

- [x] Core subscription CRUD + state machine
- [ ] Dunning loop worker
- [x] Proration engine
- [x] Nomba webhook handling
- [x] Invoice PDF generation
- [ ] Admin dashboard (stretch goal)

---

## License

MIT — built for **Team Flint** 2026.
