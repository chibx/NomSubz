"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login, login2FA } from "@/app/lib/api";

type Step = "credentials" | "otp";

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

    if (res.status !== 200) {
      setError(res.message || "Invalid email or password.");
      return;
    }

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

    if (res.status !== 200) {
      setError(res.message || "Invalid code. Try again.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <Link href="/" className="mb-9 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-brand">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="text-[17px] font-extrabold tracking-tight text-foreground">NomSubz</span>
      </Link>

      <div className="w-full max-w-[400px] rounded-xl border border-border bg-surface p-10">
        {step === "credentials" ? (
          <>
            <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Sign in</h1>
            <p className="mb-7 mt-1.5 text-sm text-muted">Access your billing dashboard.</p>
            <form onSubmit={handleCredentials}>
              <div className="mb-4">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Email address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.ng"
                  className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
              </div>
              <div className="mb-6">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Password</label>
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
              </div>
              {error && <p className="mb-4 text-sm text-status-failed-fg">{error}</p>}
              <button type="submit" disabled={submitting}
                className="mb-4 w-full rounded-[7px] bg-brand py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
                {submitting ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className="text-center text-[13px] text-muted">
              No account?{" "}
              <Link href="/register" className="font-semibold text-brand">Create one →</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Two-factor auth</h1>
            <p className="mb-7 mt-1.5 text-sm text-muted">Enter the 6-digit code from your authenticator app.</p>
            <form onSubmit={handleOTP}>
              <div className="mb-6">
                <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Authentication code</label>
                <input type="text" inputMode="numeric" maxLength={6} required value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-center text-lg font-mono tracking-[0.4em] text-foreground" />
              </div>
              {error && <p className="mb-4 text-sm text-status-failed-fg">{error}</p>}
              <button type="submit" disabled={submitting || otp.length !== 6}
                className="mb-4 w-full rounded-[7px] bg-brand py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
                {submitting ? "Verifying…" : "Verify"}
              </button>
            </form>
            <button onClick={() => { setStep("credentials"); setError(null); setOtp(""); }}
              className="w-full text-center text-[13px] text-muted hover:text-foreground">
              ← Back to sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}
