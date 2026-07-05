import Link from "next/link";
import { Mist } from "@/app/components/Mist";

const FEATURES = [
  { title: "Recurring billing", body: "Set up once, collect forever. Subscriptions renew automatically — weekly, monthly, or annually." },
  { title: "Plan management", body: "Create flexible pricing plans and enable or disable them instantly. Prices lock once set." },
  { title: "Nomba payments", body: "Cards tokenized and charged through Nomba — built for businesses operating in Nigeria." },
  { title: "Automated invoicing", body: "Every charge produces a clean PDF invoice, delivered and stored without you lifting a finger." },
  { title: "Webhooks", body: "Every billing event pushed to your systems in real time. Retry logic included." },
  { title: "Customer portal", body: "Subscribers can view invoices, update cards, and manage their own subscriptions." },
];

const STEPS = [
  { n: "01", title: "Create your plans", body: "Define your subscription tiers — name, price, and billing interval." },
  { n: "02", title: "Add your customers", body: "Bring subscribers into NomSubz and attach their payment cards." },
  { n: "03", title: "Let it run", body: "Billing happens automatically. Pause, cancel, or upgrade any time." },
];

const PREVIEW_ROWS = [
  { name: "Acme Corp", plan: "Pro · Monthly", status: "Active", amt: "₦45,000" },
  { name: "Foodco Ltd", plan: "Basic · Weekly", status: "Active", amt: "₦8,500" },
  { name: "TechNG", plan: "Enterprise · Annual", status: "Paused", amt: "₦1.2M" },
  { name: "Lagos Fitness", plan: "Pro · Monthly", status: "Active", amt: "₦45,000" },
];

function Logo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MarketingPage() {
  return (
    <div className="bg-background font-sans text-foreground">

      {/* ── NAV ── */}
      <header className="nav-blur fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <Logo />
            <span className="text-[15px] font-bold tracking-tight">NomSubz</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="link-sweep text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="link-sweep text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">How it works</a>
            <Link href="/login" className="text-[13.5px] font-medium text-muted hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="btn-primary px-4 py-2 text-[13.5px] font-semibold">
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-40 pb-28">
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

          {/* Dashboard preview panel */}
          <div className="animate-rise-in mt-20" style={{ animationDelay: "0.55s" }}>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface"
              style={{ boxShadow: "0 40px 80px -40px rgba(10,10,10,0.25), 0 0 0 1px rgba(10,10,10,0.02)" }}>
              {/* window chrome */}
              <div className="flex items-center gap-2 border-b border-border-subtle px-5 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="ml-3 text-[12px] text-muted-foreground">app.nomsubz.com/dashboard</span>
              </div>
              <div className="grid gap-0 md:grid-cols-[1fr_2fr]">
                {/* stats column */}
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
                {/* table */}
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="border-t border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-[12px] font-semibold uppercase tracking-[2px] text-muted">Built right</p>
          <h2 className="mt-3 max-w-[480px] text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
            Everything a subscription business needs
          </h2>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-lift p-7">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-raised">
                  <div className="h-2 w-2 rounded-full bg-foreground" />
                </div>
                <h3 className="text-[15.5px] font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-t border-border-subtle px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-[12px] font-semibold uppercase tracking-[2px] text-muted">Three steps</p>
          <h2 className="mx-auto mt-3 max-w-[440px] text-center text-[clamp(28px,3.6vw,44px)] font-bold leading-[1.08] tracking-[-0.025em]">
            Up and running in minutes
          </h2>
          <div className="mt-16 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-border-subtle bg-surface-raised p-8">
                <p className="text-[13px] font-bold tabular-nums text-muted-foreground">{s.n}</p>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border-subtle px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[clamp(30px,4.5vw,56px)] font-extrabold leading-[1.04] tracking-[-0.03em]">
            Ready to get started?
          </h2>
          <p className="mt-5 text-[16.5px] text-muted">
            Join businesses already using NomSubz to run their subscriptions.
          </p>
          <div className="mt-9">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-[15px] font-semibold">
              Create your account
              <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border-subtle px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-[13.5px] text-muted">
          <div className="flex items-center gap-2.5">
            <span className="text-foreground"><Logo size={15} /></span>
            <span className="font-semibold text-foreground">NomSubz</span>
            <span className="text-border">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            <Link href="/register" className="transition-colors hover:text-foreground">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
