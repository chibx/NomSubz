"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getPlan, updatePlan, type Plan } from "@/app/lib/api";

export default function EditPlanPage() {
  const router = useRouter();
  const params = useParams<{ planId: string }>();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    getPlan(params.planId).then((res) => {
      if (!mounted) return;
      setPlan(res.data);
      if (res.data) {
        setName(res.data.name);
        setEnabled(res.data.status === "enabled");
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [params.planId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await updatePlan(params.planId, { name, status: enabled ? "enabled" : "disabled" });
    setSubmitting(false);

    if (res.status !== 200) {
      setError(res.message || "Couldn't save changes.");
      return;
    }

    router.push("/plans");
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <Link href="/plans" className="text-sm font-medium text-muted hover:text-foreground">← Back to plans</Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">Edit plan</h1>
      <p className="mt-1 text-sm text-muted">Price is locked — create a new plan to change pricing.</p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-md rounded-xl border border-border bg-surface p-6">
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Plan name</label>
          <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
        </div>
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Price</label>
          <input type="text" disabled value={plan ? `${plan.currency} ${plan.amount}` : "—"}
            className="w-full cursor-not-allowed rounded-[7px] border border-border bg-background px-3.5 py-2.5 text-sm text-muted" />
        </div>
        <label className="mb-6 flex items-center gap-2.5 text-sm font-medium text-foreground">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Plan is enabled (new signups allowed)
        </label>
        {error && <p className="mb-4 text-sm text-status-failed-fg">{error}</p>}
        <button type="submit" disabled={submitting}
          className="w-full rounded-[7px] bg-brand py-3 text-[15px] font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
          {submitting ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
