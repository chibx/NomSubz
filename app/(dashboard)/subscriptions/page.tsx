"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCustomers, listSubscriptions, type Subscription, type SubscriptionStatus } from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";
import { EmptyState } from "@/app/components/EmptyState";

const FILTERS: { label: string; value: SubscriptionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Subscriptions are scoped per-customer on the backend. With no global
    // list endpoint, we pull the first customer to demonstrate the real call.
    listCustomers().then(async (customersRes) => {
      const firstCustomer = customersRes.data?.[0];
      if (!firstCustomer) {
        if (mounted) setLoading(false);
        return;
      }
      if (mounted) setCustomerId(firstCustomer.subscriberId);
      const subsRes = await listSubscriptions(firstCustomer.subscriberId);
      if (mounted) {
        setSubscriptions(subsRes.data ?? []);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = filter === "all" ? subscriptions : subscriptions.filter((s) => s.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Subscriptions</h1>
      <p className="mt-1 text-sm text-muted">All active and past subscriptions across your customers.</p>

      <div className="mt-5 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              filter === f.value ? "bg-brand text-white" : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No subscriptions"
            description={
              customerId
                ? "This customer has no subscriptions, or the subscriptions list endpoint hasn't been implemented on the backend yet."
                : "There are no customers yet, so there's nothing to look up subscriptions for."
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-5 py-3 font-medium text-muted">Plan</th>
                  <th className="px-5 py-3 font-medium text-muted">Amount</th>
                  <th className="px-5 py-3 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link
                        href={`/subscriptions/${sub.id}?customerId=${customerId}`}
                        className="font-medium text-foreground hover:text-brand"
                      >
                        {sub.planName}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">{sub.amount}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
