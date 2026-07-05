import Link from "next/link";
import { Mist } from "@/app/components/Mist";

// ── Unique product SVG icons ─────────────────────────────────────────────────

function IconRecurring() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M17 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 22l-4-4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPlans() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M14 17.5h7M17.5 14v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconNomba() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M9.5 9.5l5 5M14.5 9.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.4"/>
    </svg>
  );
}

function IconInvoice() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconWebhook() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 000-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81A2.99 2.99 0 006 9a3 3 0 000 6c.34 0 .67-.06.97-.16l.17.09 6.97 4.08c-.04.2-.07.4-.07.61a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3.54z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPortal() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 8h5M7 11h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="16" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.8"/>
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function IconSpeed() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconNombaLogo() {
  return (
    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <IconRecurring />, title: "Recurring billing", body: "Set up once, collect forever. Subscriptions renew automatically — weekly, monthly, or annually. Zero manual intervention required." },
  { icon: <IconPlans />, title: "Plan management", body: "Create flexible pricing tiers and toggle them on or off instantly. Prices lock once a plan goes live — keeping you and your subscribers honest." },
  { icon: <IconNomba />, title: "Nomba payments", body: "Cards tokenized and charged through Nomba's PCI-compliant infrastructure. Built exclusively for businesses operating in Nigeria." },
  { icon: <IconInvoice />, title: "Automated invoicing", body: "Every charge produces a clean, downloadable PDF invoice — stored, numbered, and delivered without you touching a thing." },
  { icon: <IconWebhook />, title: "Real-time webhooks", body: "Every billing event — success, failure, cancellation — pushed to your systems the instant it happens. Retry logic built in." },
  { icon: <IconPortal />, title: "Customer portal", body: "Subscribers can view invoices, swap payment cards, and manage their own subscriptions without ever contacting your support team." },
  { icon: <IconLock />, title: "Two-factor auth", body: "Protect your billing dashboard with TOTP-based 2FA. Backup codes generated on setup. Security that doesn't slow you down." },
  { icon: <IconSpeed />, title: "Instant setup", body: "From registration to first charge in under ten minutes. No sales calls, no procurement cycles, no setup fees." },
  { icon: <IconChart />, title: "Revenue analytics", body: "Track total revenue, subscriber growth, churn rate, and active subscriptions from one glanceable dashboard." },
];

const STEPS = [
  {
    n: "01",
    icon: <IconPlans />,
    title: "Create your plans",
    body: "Define subscription tiers — name, price in NGN, and billing interval. Weekly, monthly, or annual. Plans lock once published to protect existing subscribers.",
    detail: "Takes about 60 seconds."
  },
  {
    n: "02",
    icon: <IconCard />,
    title: "Add your customers",
    body: "Register subscribers with a user ID and email. Attach their Nomba-tokenized payment card. First charge happens immediately on successful card attachment.",
    detail: "Cards never touch your servers."
  },
  {
    n: "03",
    icon: <IconRecurring />,
    title: "Let the engine run",
    body: "NomSubz handles renewals, retries on failure, invoice generation, and webhook delivery. You watch the numbers go up. Pause, cancel, or upgrade any sub at any time.",
    detail: "99.9% billing uptime."
  },
];

const PREVIEW_ROWS = [
  { name: "Acme Corp", plan: "Pro · Monthly", status: "Active", amt: "₦45,000" },
  { name: "Foodco Ltd", plan: "Basic · Weekly", status: "Active", amt: "₦8,500" },
  { name: "TechNG", plan: "Enterprise · Annual", status: "Paused", amt: "₦1.2M" },
  { name: "Lagos Fitness", plan: "Pro · Monthly", status: "Active", amt: "₦45,000" },
  { name: "PayStack Alt", plan: "Starter · Monthly", status: "Active", amt: "₦12,000" },
];

const STATS = [
  { value: "₦2.4M+", label: "processed this month" },
  { value: "1,284", label: "active subscribers" },
  { value: "99.9%", label: "billing uptime" },
  { value: "< 10min", label: "time to first charge" },
];

const INTEGRATIONS = [
  { name: "Nomba", desc: "Payment infrastructure" },
  { name: "Webhooks", desc: "Event delivery" },
  { name: "REST API", desc: "Full programmatic access" },
  { name: "2FA / TOTP", desc: "Security layer" },
  { name: "PDF invoices", desc: "Automatic generation" },
  { name: "Card tokenization", desc: "Secure storage" },
];

const FAQS = [
  { q: "What payment methods does NomSubz support?", a: "NomSubz charges subscriptions using Nomba-tokenized card data. Customers add their card once through the Nomba checkout flow — NomSubz handles all future charges automatically using the stored token." },
  { q: "Can I change a subscription's plan?", a: "Yes. You can switch a subscriber to any plan with the same billing interval (e.g., monthly to monthly). The price difference is prorated based on time remaining in the current period." },
  { q: "What happens if a charge fails?", a: "NomSubz marks the subscription as past-due and triggers a webhook event to your systems. You can configure retry logic or notify your customer to update their card." },
  { q: "Is there a setup fee?", a: "No. NomSubz is free to set up. You only pay Nomba's standard processing fees on each successful charge." },
  { q: "How do webhooks work?", a: "Every billing event — successful charge, failure, pause, cancel — fires a signed POST request to your registered endpoint. We include a signature header for verification and retry failed deliveries automatically." },
  { q: "Can my customers manage their own subscriptions?", a: "Yes. The customer portal lets subscribers view their invoice history, update payment cards, and manage their own subscription status without contacting you." },
];

export default function MarketingPage() {
  return (
    <div className="bg-background font-sans text-foreground">

      {/* ── NAV ── */}
      <header className="nav-blur fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <IconNombaLogo />
            <span className="text-[15px] font-bold tracking-tight">NomSubz</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="link-sweep text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="link-sweep text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">How it works</a>
            <a href="#faq" className="link-sweep text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">FAQ</a>
            <Link href="/login" className="text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-[13.5px] font-semibold">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-40 pb-20">
        <Mist />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5"
            style={{ animationDelay: "0.05s" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <span className="text-[12.5px] font-medium text-muted">Payments powered by Nomba</span>
          </div>

          <h1 className="animate-fade-up mt-8 max-w-[820px] text-[clamp(44px,7.5vw,92px)] font-extrabold leading-[1.0] tracking-[-0.035em]"
            style={{ animationDelay: "0.15s" }}>
            Recurring billing,<br />built for Nigeria.
          </h1>

          <p className="animate-fade-up mt-7 max-w-[520px] text-[clamp(16px,1.6vw,19px)] leading-relaxed text-muted"
            style={{ animationDelay: "0.3s" }}>
            Subscription plans, automated invoicing, and Nomba-powered card
            payments — managed from one clean dashboard.
          </p>

          <div className="animate-fade-up mt-10 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "0.45s" }}>
            <Link href="/register" className="btn-primary px-6 py-3 text-[14.5px] font-semibold">
              Start for free
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/dashboard" className="btn-quiet px-6 py-3 text-[14.5px] font-medium">
              View dashboard
            </Link>
          </div>

          {/* Dashboard preview */}
          <div className="animate-rise-in mt-20" style={{ animationDelay: "0.55s" }}>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface"
              style={{ boxShadow: "0 40px 80px -40px rgba(10,10,10,0.25), 0 0 0 1px rgba(10,10,10,0.02)" }}>
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="ml-3 text-[12px] text-muted-foreground">app.nomsubz.com/dashboard</span>
              </div>
              <div className="grid gap-0 md:grid-cols-[1fr_2fr]">
                <div className="grid grid-cols-2 gap-px border-b border-border-subtle bg-border-subtle md:grid-cols-1 md:border-b-0 md:border-r">
                  {[
                    { label: "Revenue this month", value: "₦2.4M" },
                    { label: "Active subscribers", value: "1,284" },
                    { label: "Active plans", value: "6" },
                    { label: "Churn rate", value: "2.1%" },
                  ].map((s) => (
                    <div key={s.label} className="bg-surface p-5">
                      <p className="text-[11.5px] font-medium text-muted">{s.label}</p>
                      <p className="mt-1.5 text-[22px] font-bold tracking-tight">{s.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-5">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">Recent subscriptions</p>
                  <div className="divide-y divide-border-subtle">
                    {PREVIEW_ROWS.map((r) => (
                      <div key={r.name} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[13.5px] font-semibold">{r.name}</p>
                          <p className="text-[12px] text-muted">{r.plan}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            r.status === "Active"
                              ? "bg-status-success-bg text-status-success-fg"
                              : "bg-status-paused-bg text-status-paused-fg"
                          }`}>{r.status}</span>
                          <span className="w-16 text-right text-[13px] font-semibold tabular-nums">{r.amt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-white">
                        <IconRecurring />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold">Auto-renewal active</p>
                        <p className="text-[11px] text-muted">Next batch: July 7, 2026</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-status-success-fg">On schedule</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-border-subtle bg-surface-raised px-6 py-10">
        <div className="mx-auto max-w-6xl grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[28px] font-extrabold tracking-tight">{s.value}</p>
              <p className="mt-1 text-[13px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-b border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-muted">Built right</p>
          <h2 className="mt-3 max-w-[480px] text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
            Everything a subscription business needs
          </h2>
          <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-muted">
            From the first charge to the hundredth renewal, NomSubz handles the full lifecycle of your recurring revenue.
          </p>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-lift p-7">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-raised text-foreground">
                  {f.icon}
                </div>
                <h3 className="text-[15.5px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-b border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-muted">Three steps</p>
          <h2 className="mt-3 max-w-[480px] text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
            Up and running in minutes
          </h2>
          <p className="mt-4 max-w-[420px] text-[15px] leading-relaxed text-muted">
            No sales calls. No setup fees. No procurement cycles. Just a clean flow from signup to first charge.
          </p>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-border-subtle bg-surface-raised p-8">
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="#D4D4D8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <span className="text-[12px] font-bold tabular-nums text-muted-foreground">{s.n}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground">
                    {s.icon}
                  </div>
                </div>
                <h3 className="text-[16px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
                <p className="mt-4 text-[12px] font-medium text-muted-foreground">{s.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── INTEGRATIONS / TECH ── */}
      <section className="border-b border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[2px] text-muted">Under the hood</p>
              <h2 className="mt-3 text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
                Built on infrastructure you can trust
              </h2>
              <p className="mt-4 max-w-[400px] text-[15px] leading-relaxed text-muted">
                NomSubz is built on Nomba's PCI-compliant payment rails. Your customers' card data never touches your servers — it's tokenized, stored, and charged by Nomba.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { icon: <IconLock />, label: "PCI-compliant card tokenization via Nomba" },
                  { icon: <IconWebhook />, label: "Signed webhook delivery with automatic retry" },
                  { icon: <IconInvoice />, label: "PDF invoices generated and stored per charge" },
                  { icon: <IconRecurring />, label: "Cursor-based pagination on all list endpoints" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border text-foreground">
                      {item.icon}
                    </div>
                    <span className="text-[14px] text-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INTEGRATIONS.map((item) => (
                <div key={item.name} className="card-lift p-5">
                  <p className="text-[14.5px] font-semibold">{item.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SUBSCRIPTION LIFECYCLE DIAGRAM ── */}
      <section className="border-b border-border-subtle bg-surface-raised px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[2px] text-muted">Subscription lifecycle</p>
          <h2 className="mx-auto mt-3 max-w-[480px] text-center text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
            Every state, under control
          </h2>
          <p className="mx-auto mt-4 max-w-[440px] text-center text-[15px] leading-relaxed text-muted">
            Subscriptions move through well-defined states. You control every transition.
          </p>
          <div className="mt-16 flex flex-wrap items-center justify-center gap-3">
            {[
              { state: "Pending", color: "bg-status-pending-bg text-status-pending-fg", desc: "Awaiting first charge" },
              { state: "→", color: "text-muted-foreground", desc: "" },
              { state: "Active", color: "bg-status-success-bg text-status-success-fg", desc: "Billing normally" },
              { state: "→", color: "text-muted-foreground", desc: "" },
              { state: "Paused", color: "bg-status-paused-bg text-status-paused-fg", desc: "Temporarily suspended" },
              { state: "→", color: "text-muted-foreground", desc: "" },
              { state: "Cancelled", color: "bg-status-failed-bg text-status-failed-fg", desc: "Access until period end" },
            ].map((item, i) => (
              item.state === "→" ? (
                <span key={i} className="text-xl font-light text-muted-foreground">→</span>
              ) : (
                <div key={item.state} className="flex flex-col items-center gap-2">
                  <span className={`rounded-full px-4 py-1.5 text-[13px] font-semibold ${item.color}`}>
                    {item.state}
                  </span>
                  <span className="text-[12px] text-muted">{item.desc}</span>
                </div>
              )
            ))}
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { icon: <IconRecurring />, action: "Pause", desc: "Suspend billing while keeping the subscription alive. Resume any time." },
              { icon: <IconChart />, action: "Change plan", desc: "Upgrade or downgrade within the same billing interval. Proration applied automatically." },
              { icon: <IconInvoice />, action: "Cancel at period end", desc: "Subscriber keeps access until the current period expires. No mid-period refunds needed." },
            ].map((item) => (
              <div key={item.action} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground">
                  {item.icon}
                </div>
                <p className="text-[15px] font-semibold">{item.action}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-b border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-4xl">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[2px] text-muted">Common questions</p>
          <h2 className="mx-auto mt-3 max-w-[440px] text-center text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
            Frequently asked
          </h2>
          <div className="mt-14 divide-y divide-border-subtle">
            {FAQS.map((faq) => (
              <div key={faq.q} className="py-6">
                <p className="text-[15.5px] font-semibold">{faq.q}</p>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-b border-border-subtle px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-white">
            <IconNombaLogo />
          </div>
          <h2 className="text-[clamp(30px,4.5vw,56px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Ready to get started?
          </h2>
          <p className="mt-5 text-[16.5px] text-muted">
            Join businesses already using NomSubz to run their subscriptions. Free to set up. No sales call required.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-[15px] font-semibold">
              Create your account
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href="/login" className="btn-quiet px-8 py-3.5 text-[15px] font-medium">
              Sign in
            </Link>
          </div>
          <p className="mt-6 text-[13px] text-muted-foreground">No credit card required to sign up.</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div>
              <div className="flex items-center gap-2.5">
                <IconNombaLogo />
                <span className="text-[15px] font-bold">NomSubz</span>
              </div>
              <p className="mt-2 max-w-[220px] text-[13px] leading-relaxed text-muted">
                Recurring billing infrastructure for Nigerian businesses.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[13.5px]">
              <Link href="/register" className="text-muted hover:text-foreground transition-colors">Get started</Link>
              <Link href="/login" className="text-muted hover:text-foreground transition-colors">Sign in</Link>
              <a href="#features" className="text-muted hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted hover:text-foreground transition-colors">How it works</a>
              <a href="#faq" className="text-muted hover:text-foreground transition-colors">FAQ</a>
              <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">Dashboard</Link>
            </div>
          </div>
          <div className="mt-10 flex items-center justify-between border-t border-border-subtle pt-6 text-[13px] text-muted">
            <span>© {new Date().getFullYear()} NomSubz</span>
            <span>Powered by Nomba</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
