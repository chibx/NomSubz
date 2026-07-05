import Link from "next/link";
import { MorphBlob } from "@/app/components/MorphBlob";
import { Grain } from "@/app/components/Grain";
import { Reveal } from "@/app/components/Reveal";
import { Magnetic } from "@/app/components/Magnetic";

export default function MarketingPage() {
  return (
    <div className="font-sans" style={{ background: "#F5F5F7", color: "#0A0A0B" }}>
      <Grain />

      {/* ── NAV ── */}
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6 lg:px-14">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="#F5F5F7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[16px] font-black tracking-tight">NomSubz</span>
          </div>
          <nav className="flex items-center gap-2">
            <Link href="/login"
              className="px-4 py-2 text-[14px] font-medium text-muted transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Magnetic>
              <Link href="/register"
                className="block rounded-full bg-foreground px-6 py-2.5 text-[14px] font-bold text-white transition-transform hover:scale-[1.03]">
                Get started
              </Link>
            </Magnetic>
          </nav>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">

        {/* Blob — behind everything */}
        <div className="animate-drift pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[60%] opacity-80"
          style={{ zIndex: 0 }}>
          <MorphBlob size={680} />
        </div>

        {/* Type — clearly above the blob */}
        <div className="relative text-center" style={{ zIndex: 10 }}>
          <p className="animate-fade-up mb-6 text-[12px] font-bold uppercase tracking-[5px] text-muted"
            style={{ animationDelay: "0.2s" }}>
            Subscription infrastructure · Nigeria
          </p>

          <h1 className="animate-fade-up font-black leading-[0.95] tracking-[-0.045em]"
            style={{ fontSize: "clamp(56px, 11vw, 150px)", animationDelay: "0.35s" }}>
            Revenue,<br />
            <span className="text-brand">in motion.</span>
          </h1>

          <p className="animate-fade-up mx-auto mt-8 max-w-[400px] text-[16px] leading-relaxed text-muted"
            style={{ animationDelay: "0.55s" }}>
            Recurring billing that runs itself — plans, cards, invoices, and Nomba payments in one engine.
          </p>

          <div className="animate-fade-up mt-10 flex items-center justify-center gap-5"
            style={{ animationDelay: "0.7s" }}>
            <Magnetic>
              <Link href="/register"
                className="block rounded-full bg-brand px-10 py-4 text-[15px] font-bold text-white shadow-lg transition-all hover:bg-brand-hover">
                Start now →
              </Link>
            </Magnetic>
            <Link href="/dashboard"
              className="text-[14px] font-semibold text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline">
              See the dashboard
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="animate-fade-in absolute bottom-10 left-1/2 -translate-x-1/2"
          style={{ animationDelay: "1.4s" }}>
          <div className="flex h-9 w-6 items-start justify-center rounded-full border border-border p-1.5">
            <div className="h-2 w-1 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>
      </section>

      {/* ── STATEMENT ── */}
      <section className="px-6 py-40">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p className="font-black leading-[1.15] tracking-[-0.03em] text-foreground"
              style={{ fontSize: "clamp(28px, 4.5vw, 56px)" }}>
              You build the product.<br />
              <span className="text-muted-foreground">NomSubz bills for it —</span><br />
              weekly, monthly, annually.<br />
              <span className="text-brand">Forever.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CAPABILITIES ── */}
      <section className="border-t border-border px-6 py-32" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-5xl">
          {[
            { n: "01", title: "Plans", body: "Tiered pricing in NGN. Weekly, monthly, or annual intervals. Enable and disable in real time — price locked once set, by design." },
            { n: "02", title: "Customers & cards", body: "Subscribers with Nomba-tokenized cards attached. Add, remove, set defaults. The raw card never touches your stack." },
            { n: "03", title: "Subscriptions", body: "Pause, resume, cancel at period end. Upgrades and downgrades prorate automatically — charges and credits handled for you." },
            { n: "04", title: "Webhooks & 2FA", body: "Billing events pushed to your systems the moment they happen. TOTP two-factor auth guarding the whole dashboard." },
          ].map((item, i) => (
            <Reveal key={item.n} delay={i * 90}>
              <div className="group flex flex-col gap-4 border-b border-border py-12 md:flex-row md:items-baseline md:gap-16 last:border-0">
                <span className="text-[13px] font-black tracking-widest text-brand">{item.n}</span>
                <h3 className="min-w-[240px] text-[28px] font-black tracking-[-1px] transition-colors group-hover:text-brand">
                  {item.title}
                </h3>
                <p className="max-w-[440px] text-[15px] leading-relaxed text-muted">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative overflow-hidden px-6 py-44">
        <div className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 opacity-60">
          <MorphBlob size={420} />
        </div>
        <div className="relative z-10 mx-auto max-w-3xl">
          <Reveal>
            <h2 className="font-black leading-[0.98] tracking-[-0.04em]"
              style={{ fontSize: "clamp(44px, 8vw, 110px)" }}>
              Set it.<br />Forget it.<br />
              <span className="text-brand">Get paid.</span>
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-12">
              <Magnetic>
                <Link href="/register"
                  className="inline-block rounded-full bg-foreground px-12 py-5 text-[16px] font-black text-white transition-all hover:scale-[1.02]">
                  Create your account
                </Link>
              </Magnetic>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-border px-6 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-[13px] text-muted">
          <div className="flex items-center gap-2">
            <span className="font-black text-foreground">NomSubz</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-8">
            <Link href="/login" className="transition-colors hover:text-foreground">Sign in</Link>
            <Link href="/register" className="transition-colors hover:text-foreground">Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}