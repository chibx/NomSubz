"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/app/lib/api";

// Register: image on the LEFT, form on the RIGHT -- mirrored from login
// Stable Unsplash photo -- entrepreneur at modern workspace, business growth
const HERO_IMG = "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=95&fit=crop";

export default function RegisterPage() {
  const router = useRouter();
  const [appName, setAppName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await register({ appName, email, password, ...(logoUrl ? { logoUrl } : {}) });
    setSubmitting(false);
    if (res.status !== 200) {
      setError(res.errors?.[0]?.message ?? res.message ?? "Something went wrong.");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* LEFT: Full-height image . desktop only, mirrored from login */}
      <div className="relative hidden flex-1 overflow-hidden md:block">
        {/* Photo: team collaborating on business growth . Unsplash, free license */}
        <img
          src={HERO_IMG}
          alt="Business team collaborating on growth"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: "grayscale(100%) contrast(1.12) brightness(0.85)",
            imageRendering: "crisp-edges",
          }}
          loading="eager"
          decoding="async"
        />
        {/* Gradient depth layer */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(225deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.12) 55%, rgba(0,0,0,0.4) 100%)" }} />
        {/* Floating stats . product proof */}
        <div className="absolute bottom-10 left-10 right-10">
          <div className="flex flex-col gap-4">
            {[
              { value: "10 min", label: "Time to first charge" },
              { value: "99.9%", label: "Billing uptime" },
              { value: "0", label: "Setup fees" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[24px] font-extrabold tracking-tight text-white leading-none">{s.value}</p>
                <p className="text-[12.5px] text-white/55 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT: Form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 md:w-[480px] md:flex-shrink-0 lg:w-[520px]">
        <div className="mx-auto w-full max-w-[380px]">

          {/* Logo */}
          <Link href="/" className="mb-10 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-brand">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[17px] font-extrabold tracking-tight">NomSubz</span>
          </Link>

          <h1 className="text-[26px] font-extrabold tracking-tight">Create your account</h1>
          <p className="mt-1.5 mb-8 text-[14px] text-muted">Start managing recurring billing in minutes.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">Business name</label>
              <input type="text" required minLength={3} value={appName} onChange={e => setAppName(e.target.value)}
                placeholder="Acme Nigeria Ltd"
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[14px] placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">Work email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.ng"
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[14px] placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">Password</label>
              <input type="password" required minLength={8} maxLength={30} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[14px] placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-semibold">
                Logo URL <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <input type="url" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                placeholder="https://yourcompany.com/logo.png"
                className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[14px] placeholder:text-muted-foreground" />
            </div>

            {error && <p className="text-[13.5px] text-status-failed-fg">{error}</p>}

            <button type="submit" disabled={submitting}
              className="btn-primary w-full justify-center py-3.5 text-[14.5px] font-semibold disabled:opacity-60">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[13px] text-muted">
            Have an account?{" "}
            <Link href="/login" className="font-semibold text-foreground underline underline-offset-2">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-[12px] text-muted-foreground">
            No credit card required. Free to set up.
          </p>
        </div>
      </div>

    </div>
  );
}
