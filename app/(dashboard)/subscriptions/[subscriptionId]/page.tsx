"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  cancelSubscription,
  changeSubscriptionPlan,
  listPlans,
  type Subscription,
  type Plan,
} from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";

export default function SubscriptionDetailPage() {
  const params = useParams<{ subscriptionId: string }>();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(Boolean(customerId));
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showChangePlan, setShowChangePlan] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState("");

  function refresh() {
    if (!customerId) {
      setLoading(false);
      return;
    }
    Promise.all([getSubscription(customerId, params.subscriptionId), listPlans()]).then(
      ([subRes, plansRes]) => {
        setSubscription(subRes.data);
        setPlans(plansRes.data ?? []);
        setLoading(false);
      },
    );
  }

  useEffect(() => {
    if (!customerId) return;
    let mounted = true;
    Promise.all([getSubscription(customerId, params.subscriptionId), listPlans()]).then(
      ([subRes, plansRes]) => {
        if (!mounted) return;
        setSubscription(subRes.data);
        setPlans(plansRes.data ?? []);
        setLoading(false);
      },
    );
    return () => {
      mounted = false;
    };
  }, [customerId, params.subscriptionId]);

  async function handlePause() {
    if (!customerId) return;
    const res = await pauseSubscription(customerId, params.subscriptionId);
    setActionMessage(res.status === 200 ? "Subscription paused." : res.message || "This endpoint isn't implemented yet.");
    refresh();
  }

  async function handleResume() {
    if (!customerId) return;
    const res = await resumeSubscription(customerId, params.subscriptionId);
    setActionMessage(res.status === 200 ? "Subscription resumed." : res.message || "This endpoint isn't implemented yet.");
    refresh();
  }

  async function handleCancel() {
    if (!customerId) return;
    const res = await cancelSubscription(customerId, params.subscriptionId);
    setActionMessage(
      res.status === 200 ? "Cancellation scheduled." : res.message || "This endpoint isn't implemented yet.",
    );
    refresh();
  }

  async function handleChangePlan() {
    if (!customerId || !targetPlanId) return;
    const res = await changeSubscriptionPlan(customerId, params.subscriptionId, targetPlanId);
    setActionMessage(
      res.status === 200
        ? "Plan changed. Any proration has been applied as a charge or credit."
        : res.message || "Couldn't change plan — note the backend rejects switching between different billing intervals.",
    );
    setShowChangePlan(false);
    refresh();
  }

  if (!customerId) {
    return (
      <p className="text-sm text-status-failed-fg">
        Missing customer context — open this page from a customer&apos;s subscription list.
      </p>
    );
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  if (!subscription) {
    return (
      <div>
        <Link href="/subscriptions" className="text-sm font-medium text-muted hover:text-foreground">
          ← Back to subscriptions
        </Link>
        <p className="mt-4 text-sm text-muted">Subscription not found, or this endpoint returned no data.</p>
      </div>
    );
  }

  const otherPlans = plans.filter((p) => p.type === subscription.planType);

  return (
    <div>
      <Link href="/subscriptions" className="text-sm font-medium text-muted hover:text-foreground">
        ← Back to subscriptions
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{subscription.planName}</h1>
        <StatusBadge status={subscription.status} />
      </div>

      <div className="mt-6 max-w-lg rounded-xl border border-border bg-surface p-6">
        <dl className="space-y-3 text-sm">
          <Row label="Amount" value={subscription.amount} />
          <Row label="Plan type" value={subscription.planType} />
          <Row label="Started" value={new Date(subscription.startTime).toLocaleDateString()} />
          <Row label="Current period ends" value={new Date(subscription.endTime).toLocaleDateString()} />
        </dl>

        {subscription.cancelAtEnd ? (
          <p className="mt-4 rounded-lg bg-status-pending-bg px-4 py-2.5 text-sm text-status-pending-fg">
            Cancellation scheduled — access continues until {new Date(subscription.endTime).toLocaleDateString()}.
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          {subscription.status === "paused" ? (
            <ActionButton onClick={handleResume}>Resume</ActionButton>
          ) : (
            <ActionButton onClick={handlePause}>Pause</ActionButton>
          )}
          <ActionButton onClick={handleCancel} variant="danger">
            Cancel
          </ActionButton>
          <ActionButton onClick={() => setShowChangePlan((v) => !v)} variant="secondary">
            Change plan
          </ActionButton>
        </div>

        {actionMessage ? <p className="mt-4 text-sm text-muted">{actionMessage}</p> : null}

        {showChangePlan ? (
          <div className="mt-5 rounded-lg border border-border bg-background p-4">
            <p className="mb-2 text-sm font-semibold text-foreground">
              Change to another plan (same billing interval only)
            </p>
            <select
              value={targetPlanId}
              onChange={(e) => setTargetPlanId(e.target.value)}
              className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground"
            >
              <option value="">Select a plan…</option>
              {otherPlans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.currency} {p.amount}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-muted">
              Any price difference is charged or credited to the customer&apos;s balance based on time remaining in
              the current period.
            </p>
            <button
              onClick={handleChangePlan}
              disabled={!targetPlanId}
              className="mt-3 rounded-[7px] bg-brand px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
            >
              Confirm change
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger";
}) {
  const classes =
    variant === "danger"
      ? "border border-status-failed-fg text-status-failed-fg hover:bg-status-failed-bg"
      : variant === "secondary"
        ? "border border-border text-foreground hover:bg-background"
        : "bg-brand text-white hover:bg-brand-hover";

  return (
    <button onClick={onClick} className={`rounded-[7px] px-4 py-2 text-sm font-semibold transition-colors ${classes}`}>
      {children}
    </button>
  );
}
