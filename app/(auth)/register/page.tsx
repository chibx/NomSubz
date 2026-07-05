"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { register } from "@/app/lib/api";

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

    const res = await register({
      appName,
      email,
      password,
      ...(logoUrl ? { logoUrl } : {}),
    });

    setSubmitting(false);

    if (res.status !== 200) {
      const firstFieldError = res.errors?.[0]?.message;
      setError(firstFieldError ?? res.message ?? "Something went wrong.");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5 py-10">
      <Link href="/" className="mb-9 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-[7px] bg-brand">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[17px] font-extrabold tracking-tight text-foreground">NomSubz</span>
      </Link>

      <div className="w-full max-w-[440px] rounded-xl border border-border bg-surface p-10">
        <h1 className="text-[22px] font-extrabold tracking-tight text-foreground">Create your account</h1>
        <p className="mb-7 mt-1.5 text-sm text-muted">Start managing recurring billing in minutes.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Business name</label>
            <input
              type="text"
              required
              minLength={3}
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Acme Nigeria Ltd"
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Work email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.ng"
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Password</label>
            <input
              type="password"
              required
              minLength={8}
              maxLength={30}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground"
            />
          </div>
          <div className="mb-6">
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">
              Logo URL <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://yourcompany.com/logo.png"
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground"
            />
          </div>

          {error ? <p className="mb-4 text-sm text-status-failed-fg">{error}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="mb-4 w-full rounded-[7px] bg-brand py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-[13px] text-muted">
          Have an account?{" "}
          <Link href="/login" className="font-semibold text-brand">
            Sign in →
          </Link>
        </p>
      </div>
    </div>
  );
}
