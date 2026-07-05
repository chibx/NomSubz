"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPlan, type PlanType } from "@/app/lib/api";

export default function CreatePlanPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<PlanType>("monthly");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await createPlan({ name, amount, currency: "NGN", type });
    setSubmitting(false);

    if (res.status !== 200) {
      setError(res.message || "Couldn't create plan.");
      return;
    }

    router.push("/plans");
  }

  return (
    <div>
      <Link href="/plans" className="text-sm font-medium text-muted hover:text-foreground">← Back to plans</Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">Create plan</h1>
      <p className="mt-1 text-sm text-muted">Price can&apos;t be changed after a plan is created.</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md rounded-xl border border-border bg-surface p-6">
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Plan name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Pro Monthly"
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Price (NGN)</label>
          <input type="number" required min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="5000"
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
        </div>
        <div className="mb-6">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Billing interval</label>
          <select value={type} onChange={(e) => setType(e.target.value as PlanType)}
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="annually">Annually</option>
          </select>
        </div>
        {error && <p className="mb-4 text-sm text-status-failed-fg">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full rounded-[7px] bg-brand py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
          {submitting ? "Creating…" : "Create plan"}
        </button>
      </form>
    </div>
  );
}
