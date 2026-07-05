import Link from "next/link";
import { SilkHero } from "@/app/components/SilkHero";
import { PhoneMockup } from "@/app/components/PhoneMockup";

export default function MarketingPage() {
  return (
    <div className="font-sans text-foreground" style={{ background: "#F7F3EF" }}>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden" style={{ background: "#07030A" }}>
        <SilkHero />

        {/* Nav */}
        <header className="relative z-20 flex items-center justify-between px-12 py-6 lg:px-20">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[18px] font-black tracking-tight text-white">NomSubz</span>
          </div>
          <nav className="hidden items-center gap-1 md:flex">
            <a href="#features" className="px-4 py-2 text-sm font-medium text-white/45 transition-colors hover:text-white/80">Features</a>
            <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-white/45 transition-colors hover:text-white/80">How it works</a>
            <div className="mx-4 h-4 w-px bg-white/10" />
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-white/60 transition-colors hover:text-white">Sign in</Link>
            <Link href="/register"
              className="ml-1 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover">
              Get started →
            </Link>
          </nav>
        </header>

        {/* Hero content */}
        <div className="relative z-20 mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center px-6 pb-20 pt-10 text-center lg:flex-row lg:gap-20 lg:px-20 lg:text-left">

          {/* Left — copy */}
          <div className="flex-1 max-w-[620px]">
            <div className="animate-fade-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
              style={{ animationDelay: "0.1s" }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-tint" />
              <span className="text-[13px] font-medium tracking-wide text-white/70">Payments powered by Nomba</span>
            </div>

            <h1 className="animate-fade-up mb-6 text-[clamp(42px,7vw,88px)] font-black leading-[1.01] tracking-[-3px] text-white"
              style={{ animationDelay: "0.2s" }}>
              Recurring billing,<br />
              <span style={{ color: "#c4899a" }}>built for Nigeria.</span>
            </h1>

            <p className="animate-fade-up mb-10 max-w-[460px] text-[clamp(16px,1.8vw,20px)] font-light leading-relaxed text-white/45"
              style={{ animationDelay: "0.35s" }}>
              Subscription plans, automated invoicing, and Nomba-powered card payments — managed from one clean dashboard.
            </p>

            <div className="animate-fade-up flex flex-wrap items-center gap-4 lg:justify-start justify-center"
              style={{ animationDelay: "0.5s" }}>
              <Link href="/register"
                className="rounded-2xl bg-white px-9 py-4 text-[15px] font-black tracking-tight text-foreground shadow-lg transition-transform hover:scale-[1.02]">
                Start for free
              </Link>
              <Link href="/dashboard"
                className="flex items-center gap-2 text-[15px] font-medium text-white/50 transition-colors hover:text-white/80">
                View dashboard
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div className="animate-fade-up mt-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
              style={{ animationDelay: "0.65s" }}>
              {[
                { value: "99.9%", label: "billing uptime" },
                { value: "₦2.4M", label: "processed monthly" },
                { value: "1,284", label: "active subscribers" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/30 text-[12px] font-black text-white">
                    {item.value}
                  </div>
                  <div className="text-left">
                    <div className="text-[12px] font-semibold leading-none text-white">{item.value}</div>
                    <div className="text-[11px] leading-none text-white/45">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="mt-16 flex-shrink-0 lg:mt-0">
            <PhoneMockup />
          </div>
        </div>

        {/* Fade to section below */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-40"
          style={{ background: "linear-gradient(to bottom, transparent, #F7F3EF)" }} />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 py-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[3px] text-brand">Built right</p>
          <h2 className="mb-16 max-w-[500px] text-[clamp(28px,4vw,52px)] font-black leading-[1.06] tracking-[-1.5px] text-foreground">
            Everything a subscription business needs
          </h2>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { title: "Recurring Billing", body: "Set up once, collect forever. Subscriptions renew automatically on schedule — weekly, monthly, or annually." },
              { title: "Plan Management", body: "Create flexible pricing plans and enable or disable them instantly. Price is locked once set, keeping things honest." },
              { title: "Nomba Payments", body: "Card payments tokenized and charged through Nomba — built specifically for businesses operating in Nigeria." },
            ].map((f) => (
              <div key={f.title} className="rounded-3xl border border-border bg-surface p-8 transition-shadow hover:shadow-md">
                <div className="mb-6 h-10 w-10 rounded-2xl bg-brand-soft flex items-center justify-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-brand" />
                </div>
                <h3 className="mb-3 text-[17px] font-bold tracking-tight text-foreground">{f.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="border-t border-border px-6 py-28 lg:px-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-center text-xs font-bold uppercase tracking-[3px] text-brand">Three steps</p>
          <h2 className="mb-20 text-center text-[clamp(28px,4vw,52px)] font-black leading-[1.06] tracking-[-1.5px] text-foreground">
            Up and running in minutes
          </h2>
          <div className="relative grid gap-12 md:grid-cols-3 md:gap-6 text-center">
            <div className="absolute left-[20%] right-[20%] top-8 hidden h-px md:block"
              style={{ background: "linear-gradient(to right, #e6ddd9, #c4899a, #e6ddd9)" }} />
            {[
              { n: "1", title: "Create your plans", body: "Define your subscription tiers — name, price, and billing interval." },
              { n: "2", title: "Add your customers", body: "Bring your subscribers into NomSubz and attach their payment cards." },
              { n: "3", title: "Let it run", body: "Subscriptions bill automatically. Pause, cancel, or upgrade any time." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface shadow-sm">
                  <span className="text-xl font-black text-brand">{s.n}</span>
                </div>
                <h3 className="mb-2.5 text-base font-bold tracking-tight text-foreground">{s.title}</h3>
                <p className="text-[14px] leading-relaxed text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border px-6 py-28 lg:px-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-[clamp(32px,5vw,64px)] font-black leading-[1.04] tracking-[-2px] text-foreground">
            Ready to get started?
          </h2>
          <p className="mb-10 text-lg text-muted">Join businesses already using NomSubz to run their subscriptions.</p>
          <Link href="/register"
            className="inline-block rounded-2xl bg-brand px-12 py-5 text-[16px] font-black text-white transition-all hover:bg-brand-hover hover:scale-[1.02]">
            Create your account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-10 lg:px-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between text-sm text-muted">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="font-bold text-foreground">NomSubz</span>
            <span className="text-border">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
