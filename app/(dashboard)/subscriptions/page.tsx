"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listCustomers, listSubscriptions, type Subscription, type SubscriptionStatus } from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";
import { EmptyState } from "@/app/components/EmptyState";

const FILTERS: { label: string; value: SubscriptionStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Past Due", value: "past_due" },
  { label: "Paused", value: "paused" },
  { label: "Cancelled", value: "cancelled" },
];

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("all");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  async function fetchPage(cid: string, status: SubscriptionStatus | "all", cursorParam?: string) {
    const res = await listSubscriptions(cid, {
      status: status === "all" ? undefined : status,
      cursor: cursorParam,
      count: 15,
    });
    return res.data;
  }

  useEffect(() => {
    let mounted = true;

    listCustomers().then(async (customersRes) => {
      if (!mounted) return;
      const firstCustomer = customersRes.data?.[0];

      if (!firstCustomer) {
        setSubscriptions([]);
        setCursor(null);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setCustomerId(firstCustomer.subscriberId);
      const page = await fetchPage(firstCustomer.subscriberId, filter);
      if (!mounted) return;
      setSubscriptions(page?.subscriptions ?? []);
      setCursor(page?.cursor ?? null);
      setHasMore(page?.nextPage !== null);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleLoadMore() {
    if (!customerId || !cursor) return;
    setLoadingMore(true);
    const page = await fetchPage(customerId, filter, cursor);
    setSubscriptions((prev) => [...prev, ...(page?.subscriptions ?? [])]);
    setCursor(page?.cursor ?? null);
    setHasMore(page?.nextPage !== null);
    setLoadingMore(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Subscriptions</h1>
      <p className="mt-1 text-sm text-muted">All subscriptions across your customers.</p>

      <div className="mt-5 flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
            style={{
              background: filter === f.value ? "#0A0A0A" : "#ffffff",
              color: filter === f.value ? "#ffffff" : "#6E6E73",
              border: "1px solid",
              borderColor: filter === f.value ? "#0A0A0A" : "#D8D8DC",
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : subscriptions.length === 0 ? (
          <EmptyState
            title="No subscriptions"
            description={customerId ? "No subscriptions found for this filter." : "No customers yet."}
          />
        ) : (
          <>
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="table-wrap"><table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background-2">
                  <tr>
                    <th className="px-5 py-3 font-medium text-muted">Plan</th>
                    <th className="px-5 py-3 font-medium text-muted">Amount</th>
                    <th className="px-5 py-3 font-medium text-muted">Status</th>
                    <th className="px-5 py-3 font-medium text-muted">Period end</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3">
                        <Link href={`/subscriptions/${sub.id}?customerId=${customerId}`}
                          className="font-medium text-foreground hover:text-brand">
                          {sub.planName}
                        </Link>
                        {sub.cancelAtEnd && (
                          <span className="ml-2 rounded-full bg-status-pending-bg px-2 py-0.5 text-[10px] font-semibold text-status-pending-fg">
                            Cancels at period end
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-foreground">{sub.amount}</td>
                      <td className="px-5 py-3"><StatusBadge status={sub.status} /></td>
                      <td className="px-5 py-3 text-muted">{new Date(sub.endTime).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>

            {hasMore && (
              <button onClick={handleLoadMore} disabled={loadingMore}
                className="mt-4 rounded-xl border border-border bg-surface px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background-2 disabled:opacity-60">
                {loadingMore ? "Loading…" : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
