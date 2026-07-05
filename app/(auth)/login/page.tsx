"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, login2FA } from "@/app/lib/api";

type Step = "credentials" | "otp";

// Stable Unsplash photo — person at desk with financial data, forced greyscale via CSS
const HERO_IMG = "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=95&fit=crop";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [pendingToken, setPendingToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await login({ email, password });
    setSubmitting(false);
    if (res.status !== 200) { setError(res.message || "Invalid email or password."); return; }
    if (res.data?.requires2FA && res.data.pendingToken) {
      setPendingToken(res.data.pendingToken);
      setStep("otp");
      return;
    }
    router.push("/dashboard");
  }

  async function handleOTP(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await login2FA({ pendingToken, token: otp });
    setSubmitting(false);
    if (res.status !== 200) { setError(res.message || "Invalid code. Try again."); return; }
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">

      {/* LEFT: Form panel */}
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

          {step === "credentials" ? (
            <>
              <h1 className="text-[26px] font-extrabold tracking-tight">Welcome back</h1>
              <p className="mt-1.5 mb-8 text-[14px] text-muted">Sign in to your billing dashboard.</p>

              <form onSubmit={handleCredentials} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Email address</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@company.ng"
                    className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[14px] placeholder:text-muted-foreground" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-[14px] placeholder:text-muted-foreground" />
                </div>
                {error && <p className="text-[13.5px] text-status-failed-fg">{error}</p>}
                <button type="submit" disabled={submitting}
                  className="btn-primary w-full justify-center py-3.5 text-[14.5px] font-semibold disabled:opacity-60">
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <p className="mt-6 text-center text-[13px] text-muted">
                No account?{" "}
                <Link href="/register" className="font-semibold text-foreground underline underline-offset-2">
                  Create one
                </Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-[26px] font-extrabold tracking-tight">Two-factor auth</h1>
              <p className="mt-1.5 mb-8 text-[14px] text-muted">Enter the 6-digit code from your authenticator app.</p>

              <form onSubmit={handleOTP} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Authentication code</label>
                  <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-center text-xl font-mono tracking-[0.5em] placeholder:tracking-normal placeholder:text-muted-foreground" />
                </div>
                {error && <p className="text-[13.5px] text-status-failed-fg">{error}</p>}
                <button type="submit" disabled={submitting || otp.length !== 6}
                  className="btn-primary w-full justify-center py-3.5 text-[14.5px] font-semibold disabled:opacity-60">
                  {submitting ? "Verifying..." : "Verify"}
                </button>
              </form>

              <button onClick={() => { setStep("credentials"); setError(null); setOtp(""); }}
                className="mt-5 w-full text-center text-[13px] text-muted hover:text-foreground transition-colors">
                Back to sign in
              </button>
            </>
          )}
        </div>
      </div>

      {/* RIGHT: Full-height image — desktop only */}
      <div className="relative hidden flex-1 overflow-hidden md:block">
        {/* Photo: professional working with financial data — Unsplash, free license */}
        <img
          src={HERO_IMG}
          alt="Professional managing business payments"
          className="absolute inset-0 h-full w-full object-cover"
          style={{
            filter: "grayscale(100%) contrast(1.1) brightness(0.88)",
            imageRendering: "crisp-edges",
          }}
          loading="eager"
          decoding="async"
        />
        {/* Gradient overlay so the image has depth, not flat grey */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.35) 100%)" }} />
        {/* Floating caption */}
        <div className="absolute bottom-10 left-10 right-10">
          <blockquote className="max-w-sm">
            <p className="text-[17px] font-semibold leading-snug text-white">
              "From first charge to hundredth renewal — all automated."
            </p>
            <footer className="mt-3 text-[13px] font-medium text-white/60">NomSubz billing engine</footer>
          </blockquote>
        </div>
      </div>

    </div>
  );
}
