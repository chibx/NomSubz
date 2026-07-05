"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Mist } from "@/app/components/Mist";

// ── SVG icon set: unique NomSubz product icons ──────────────────────────────

function IconLogo({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRecurring() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M17 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 11V9a4 4 0 014-4h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 22l-4-4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 13v2a4 4 0 01-4 4H3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconPlans() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M14 17.5h7M17.5 14v7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconNomba() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 12h8M12 8v8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconInvoice() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconWebhook() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconPortal() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="16" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M7 8h5M7 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 11V7a4 4 0 018 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  );
}

function IconSpeed() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconChart() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconCard() {
  return (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M6 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="18" height="18" fill="none" viewBox="0 0 24 24"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)" }}
    >
      <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: <IconRecurring />, title: "Recurring billing", body: "Set up once, collect forever. Subscriptions renew automatically on your schedule. Zero manual intervention required." },
  { icon: <IconPlans />, title: "Plan management", body: "Create flexible pricing tiers and toggle them on or off instantly. Prices lock once a plan goes live, keeping you and your subscribers honest." },
  { icon: <IconNomba />, title: "Nomba payments", body: "Cards tokenized and charged through the PCI compliant Nomba infrastructure. Built exclusively for businesses operating in Nigeria." },
  { icon: <IconInvoice />, title: "Automated invoicing", body: "Every charge produces a clean, downloadable PDF invoice. Stored, numbered, and delivered without you touching a thing." },
  { icon: <IconWebhook />, title: "Real time webhooks", body: "Every billing event pushed to your systems the instant it happens. Retry logic built in for failed deliveries." },
  { icon: <IconPortal />, title: "Customer portal", body: "Subscribers can view invoices, swap payment cards, and manage their own subscriptions without ever contacting your support team." },
  { icon: <IconLock />, title: "Two factor auth", body: "Protect your billing dashboard with TOTP based 2FA. Backup codes generated on setup. Security that does not slow you down." },
  { icon: <IconSpeed />, title: "Instant setup", body: "From registration to first charge in under ten minutes. No sales calls, no procurement cycles, no setup fees." },
  { icon: <IconChart />, title: "Revenue analytics", body: "Track total revenue, subscriber growth, churn rate, and active subscriptions from one glanceable dashboard." },
];

const STEPS = [
  {
    n: "01",
    icon: <IconPlans />,
    title: "Create your plans",
    body: "Define subscription tiers with a name, price in NGN, and billing interval. Weekly, monthly, or annual. Plans lock once published to protect existing subscribers.",
    note: "Takes about 60 seconds.",
  },
  {
    n: "02",
    icon: <IconCard />,
    title: "Add your customers",
    body: "Register subscribers with a user ID and email. Attach their Nomba tokenized payment card. The first charge happens immediately on successful card attachment.",
    note: "Cards never touch your servers.",
  },
  {
    n: "03",
    icon: <IconRecurring />,
    title: "Let the engine run",
    body: "NomSubz handles renewals, retries on failure, invoice generation, and webhook delivery. Pause, cancel, or upgrade any subscription at any time.",
    note: "99.9% billing uptime.",
  },
];

const PREVIEW_ROWS = [
  { name: "Acme Corp", plan: "Pro · Monthly", status: "Active", amt: 45000 },
  { name: "Foodco Ltd", plan: "Basic · Weekly", status: "Active", amt: 8500 },
  { name: "TechNG", plan: "Enterprise · Annual", status: "Paused", amt: 1200000 },
  { name: "Lagos Fitness", plan: "Pro · Monthly", status: "Active", amt: 45000 },
  { name: "Suya Republic", plan: "Starter · Monthly", status: "Active", amt: 12000 },
];

const STATS = [
  { value: "2.4M+", label: "NGN processed monthly" },
  { value: "1,284", label: "Active subscribers" },
  { value: "99.9%", label: "Billing uptime" },
  { value: "10 min", label: "Time to first charge" },
];

const INTEGRATIONS = [
  { name: "Nomba", desc: "Payment infrastructure" },
  { name: "Webhooks", desc: "Event delivery" },
  { name: "REST API", desc: "Full programmatic access" },
  { name: "TOTP 2FA", desc: "Security layer" },
  { name: "PDF Invoices", desc: "Automatic generation" },
  { name: "Card Tokenization", desc: "Secure storage" },
];

const LIFECYCLE = [
  { state: "Pending", color: "bg-status-pending-bg text-status-pending-fg", desc: "Awaiting first charge" },
  { state: "Active", color: "bg-status-success-bg text-status-success-fg", desc: "Billing normally" },
  { state: "Paused", color: "bg-status-paused-bg text-status-paused-fg", desc: "Temporarily suspended" },
  { state: "Cancelled", color: "bg-status-failed-bg text-status-failed-fg", desc: "Access until period end" },
];

const FAQS = [
  { q: "What payment methods does NomSubz support?", a: "NomSubz charges subscriptions using Nomba tokenized card data. Customers add their card once through the Nomba checkout flow. NomSubz handles all future charges automatically using the stored token, with no manual intervention required." },
  { q: "Can I change a subscription's plan?", a: "Yes. You can switch a subscriber to any plan with the same billing interval, for example monthly to monthly. The price difference is prorated based on time remaining in the current period." },
  { q: "What happens if a charge fails?", a: "NomSubz marks the subscription as past due and triggers a webhook event to your systems. You can configure retry logic or notify your customer to update their payment card." },
  { q: "Is there a setup fee?", a: "No. NomSubz is free to set up. You only pay the standard Nomba processing fees on each successful charge. No monthly platform fee, no per seat pricing." },
  { q: "How do webhooks work?", a: "Every billing event fires a signed POST request to your registered endpoint. We include a signature header for verification and retry failed deliveries automatically so your systems stay in sync." },
  { q: "Can my customers manage their own subscriptions?", a: "Yes. The customer portal lets subscribers view their invoice history, update payment cards, and manage their own subscription status without contacting your support team." },
];

const naira = (n: number) => `\u20A6${n.toLocaleString("en-NG")}`;

// ── Accordion ───────────────────────────────────────────────────────────────

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-subtle">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-5 text-left"
        aria-expanded={open}
      >
        <span className="pr-8 text-[15.5px] font-semibold leading-snug">{q}</span>
        <span className="flex-shrink-0 text-muted"><IconChevron open={open} /></span>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.35s cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <p className="pb-5 text-[14.5px] leading-relaxed text-muted">{a}</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <div className="bg-background font-sans text-foreground">

      {/* NAV */}
      <header className="nav-blur fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-foreground" onClick={() => setMenuOpen(false)}>
            <IconLogo />
            <span className="text-[15px] font-bold tracking-tight">NomSubz</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {["Features", "How it works", "FAQ"].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`}
                className="link-sweep text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
            <Link href="/login" className="text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-[13.5px] font-semibold">Get started</Link>
          </nav>

          {/* Hamburger: three bars morph into an X */}
          <button
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span style={{
              position: "absolute", width: 16, height: 1.5, background: "#0A0A0A", borderRadius: 2,
              transform: menuOpen ? "translateY(0) rotate(45deg)" : "translateY(-4px)",
              transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
            }} />
            <span style={{
              position: "absolute", width: 16, height: 1.5, background: "#0A0A0A", borderRadius: 2,
              opacity: menuOpen ? 0 : 1, transition: "opacity 0.2s ease",
            }} />
            <span style={{
              position: "absolute", width: 16, height: 1.5, background: "#0A0A0A", borderRadius: 2,
              transform: menuOpen ? "translateY(0) rotate(-45deg)" : "translateY(4px)",
              transition: "transform 0.3s cubic-bezier(0.22,1,0.36,1)",
            }} />
          </button>
        </div>

        {/* Mobile menu */}
        <div style={{
          overflow: "hidden",
          maxHeight: menuOpen ? 400 : 0,
          transition: "max-height 0.4s cubic-bezier(0.22,1,0.36,1)",
          background: "var(--surface)",
        }}>
          <nav className="flex flex-col gap-1 border-t border-border-subtle px-6 pb-4 pt-3">
            {["Features", "How it works", "FAQ"].map((label) => (
              <a key={label} href={`#${label.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-muted hover:bg-surface-raised hover:text-foreground transition-colors">
                {label}
              </a>
            ))}
            <div className="my-2 border-t border-border-subtle" />
            <Link href="/login" onClick={() => setMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-[14px] font-medium text-muted hover:bg-surface-raised hover:text-foreground transition-colors">
              Sign in
            </Link>
            <Link href="/register" onClick={() => setMenuOpen(false)}
              className="btn-primary mt-1 w-full justify-center px-4 py-2.5 text-[14px] font-semibold">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden pb-24 pt-40">
        <Mist />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5"
            style={{ animationDelay: "0.05s" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-foreground" />
            <span className="text-[12.5px] font-medium text-muted">Payments powered by Nomba</span>
          </div>

          <h1 className="animate-fade-up mt-7 max-w-[820px] text-[clamp(42px,7vw,88px)] font-extrabold leading-[1.02] tracking-[-0.035em]"
            style={{ animationDelay: "0.15s" }}>
            Recurring billing,<br />built for Nigeria.
          </h1>

          <p className="animate-fade-up mt-6 max-w-[500px] text-[clamp(15px,1.5vw,18px)] leading-relaxed text-muted"
            style={{ animationDelay: "0.28s" }}>
            Subscription plans, automated invoicing, and Nomba card payments managed from one clean dashboard.
          </p>

          <div className="animate-fade-up mt-9 flex flex-wrap items-center gap-3" style={{ animationDelay: "0.4s" }}>
            <Link href="/register" className="btn-primary px-6 py-3 text-[14px] font-semibold">
              Start for free <IconArrow />
            </Link>
            <Link href="/dashboard" className="btn-quiet px-6 py-3 text-[14px] font-medium">
              View dashboard
            </Link>
          </div>

          {/* Dashboard preview */}
          <div className="animate-rise-in mt-16" style={{ animationDelay: "0.5s" }}>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface"
              style={{ boxShadow: "0 32px 64px -32px rgba(10,10,10,0.2), 0 0 0 1px rgba(10,10,10,0.03)" }}>
              <div className="flex items-center gap-2 border-b border-border-subtle bg-surface-raised px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-3 rounded-md border border-border bg-surface px-3 py-0.5 text-[11.5px] text-muted-foreground">
                  app.nomsubz.com/dashboard
                </span>
              </div>

              <div className="grid md:grid-cols-[240px_1fr]">
                <div className="border-b border-border-subtle md:border-b-0 md:border-r">
                  {[
                    { label: "Revenue this month", value: naira(2400000) },
                    { label: "Active subscribers", value: "1,284" },
                    { label: "Active plans", value: "6" },
                    { label: "Churn rate", value: "2.1%" },
                  ].map((s, i) => (
                    <div key={s.label} className={`p-5 ${i < 3 ? "border-b border-border-subtle" : ""}`}>
                      <p className="text-[11.5px] font-medium text-muted">{s.label}</p>
                      <p className="mt-1 text-[20px] font-bold tracking-tight">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-5">
                  <p className="mb-4 text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground">
                    Recent subscriptions
                  </p>
                  <div className="divide-y divide-border-subtle">
                    {PREVIEW_ROWS.map((r) => (
                      <div key={r.name} className="flex items-center justify-between py-3">
                        <div>
                          <p className="text-[13.5px] font-semibold">{r.name}</p>
                          <p className="text-[12px] text-muted">{r.plan}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            r.status === "Active"
                              ? "bg-status-success-bg text-status-success-fg"
                              : "bg-status-paused-bg text-status-paused-fg"
                          }`}>{r.status}</span>
                          <span className="w-24 text-right text-[13px] font-semibold tabular-nums">{naira(r.amt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-foreground text-white">
                        <IconRecurring />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold">Auto renewal active</p>
                        <p className="text-[11px] text-muted">Next batch: July 7, 2026</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-status-success-bg px-2.5 py-0.5 text-[11px] font-semibold text-status-success-fg">
                      On schedule
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border-subtle bg-surface-raised px-6 py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[26px] font-extrabold tracking-tight">{s.value}</p>
              <p className="mt-1 text-[13px] text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-b border-border-subtle px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-muted">Built right</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[420px] text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.025em]">
              Everything a subscription business needs
            </h2>
            <p className="max-w-[340px] text-[14.5px] leading-relaxed text-muted">
              From the first charge to the hundredth renewal, NomSubz handles the full lifecycle of your recurring revenue.
            </p>
          </div>
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-lift p-6">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground">
                  {f.icon}
                </div>
                <h3 className="text-[14.5px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="border-b border-border-subtle px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-muted">Three steps</p>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 className="max-w-[380px] text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.025em]">
              Up and running in minutes
            </h2>
            <p className="max-w-[340px] text-[14.5px] leading-relaxed text-muted">
              No sales calls. No setup fees. No procurement cycles. Just a clean flow from signup to first charge.
            </p>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl border border-border bg-surface p-7">
                {i < STEPS.length - 1 && (
                  <div className="absolute -right-2 top-8 z-10 hidden text-muted-foreground md:block">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-[11px] font-bold tabular-nums text-muted-foreground">{s.n}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground">
                    {s.icon}
                  </div>
                </div>
                <h3 className="text-[15px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{s.body}</p>
                <p className="mt-4 border-t border-border-subtle pt-4 text-[11.5px] font-medium text-muted-foreground">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UNDER THE HOOD */}
      <section className="border-b border-border-subtle px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[2.5px] text-muted">Under the hood</p>
              <h2 className="mt-3 text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.025em]">
                Built on infrastructure you can trust
              </h2>
              <p className="mt-4 max-w-[400px] text-[14.5px] leading-relaxed text-muted">
                NomSubz runs on the PCI compliant Nomba payment rails. Card data never touches your servers. It is tokenized, stored, and charged by Nomba.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { icon: <IconLock />, label: "PCI compliant card tokenization via Nomba" },
                  { icon: <IconWebhook />, label: "Signed webhook delivery with automatic retry" },
                  { icon: <IconInvoice />, label: "PDF invoices generated and stored per charge" },
                  { icon: <IconRecurring />, label: "Cursor based pagination on all list endpoints" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground">
                      {item.icon}
                    </div>
                    <span className="text-[13.5px] text-muted">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INTEGRATIONS.map((item) => (
                <div key={item.name} className="card-lift p-5">
                  <p className="text-[14px] font-semibold">{item.name}</p>
                  <p className="mt-1 text-[13px] text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LIFECYCLE */}
      <section className="border-b border-border-subtle bg-surface-raised px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[2.5px] text-muted">Subscription lifecycle</p>
          <h2 className="mx-auto mt-3 max-w-[440px] text-center text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.025em]">
            Every state, under control
          </h2>
          <p className="mx-auto mt-4 max-w-[400px] text-center text-[14.5px] leading-relaxed text-muted">
            Subscriptions move through well defined states. You control every transition.
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
            {LIFECYCLE.map((item, i) => (
              <div key={item.state} className="flex items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`rounded-full px-3.5 py-1 text-[12.5px] font-semibold ${item.color}`}>
                    {item.state}
                  </span>
                  <span className="text-[11px] text-muted">{item.desc}</span>
                </div>
                {i < LIFECYCLE.length - 1 && (
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" className="mb-4 text-muted-foreground">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {[
              { icon: <IconRecurring />, action: "Pause", desc: "Suspend billing while keeping the subscription alive. Resume any time." },
              { icon: <IconChart />, action: "Change plan", desc: "Upgrade or downgrade within the same billing interval. Proration applied automatically." },
              { icon: <IconInvoice />, action: "Cancel at period end", desc: "Subscriber keeps access until the current period expires. No mid period refunds needed." },
            ].map((item) => (
              <div key={item.action} className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground">
                  {item.icon}
                </div>
                <p className="text-[14.5px] font-semibold">{item.action}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-border-subtle px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[2.5px] text-muted">Common questions</p>
          <h2 className="mx-auto mt-3 max-w-[400px] text-center text-[clamp(26px,3.2vw,40px)] font-bold leading-[1.1] tracking-[-0.025em]">
            Frequently asked
          </h2>
          <div className="mt-12">
            {FAQS.map((faq) => (
              <AccordionItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground text-white">
            <IconLogo size={18} />
          </div>
          <h2 className="text-[clamp(28px,4vw,52px)] font-extrabold leading-[1.06] tracking-[-0.03em]">
            Ready to get started?
          </h2>
          <p className="mt-4 text-[16px] text-muted">
            Join businesses already using NomSubz to run their subscriptions. Free to set up. No sales call required.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-7 py-3.5 text-[14.5px] font-semibold">
              Create your account <IconArrow />
            </Link>
            <Link href="/login" className="btn-quiet px-7 py-3.5 text-[14.5px] font-medium">
              Sign in
            </Link>
          </div>
          <p className="mt-5 text-[12.5px] text-muted-foreground">No credit card required to sign up.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-start justify-between gap-10">
            <div>
              <div className="flex items-center gap-2">
                <IconLogo />
                <span className="text-[14.5px] font-bold">NomSubz</span>
              </div>
              <p className="mt-2 max-w-[200px] text-[13px] leading-relaxed text-muted">
                Recurring billing infrastructure for Nigerian businesses.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-2.5 text-[13.5px]">
              {[
                { label: "Get started", href: "/register" },
                { label: "Sign in", href: "/login" },
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how-it-works" },
                { label: "FAQ", href: "#faq" },
                { label: "Dashboard", href: "/dashboard" },
              ].map((item) => (
                <Link key={item.label} href={item.href} className="text-muted transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-border-subtle pt-6 text-[13px] text-muted">
            <span>© {new Date().getFullYear()} NomSubz</span>
            <span>Powered by Nomba</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
