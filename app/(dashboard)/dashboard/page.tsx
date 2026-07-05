"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAnalytics, whoami, type Analytics } from "@/app/lib/api";
import { EmptyState } from "@/app/components/EmptyState";

export default function DashboardHomePage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [unreachable, setUnreachable] = useState(false);

  useEffect(() => {
    let mounted = true;

    Promise.all([whoami(), getAnalytics()]).then(([whoamiRes, analyticsRes]) => {
      if (!mounted) return;
      setAppId(whoamiRes.data?.app_id ?? null);
      setAnalytics(analyticsRes.data);
      // No /api/analytics route exists yet on the backend, so this will
      // come back 404 — that's expected, not a frontend bug.
      setUnreachable(analyticsRes.status === 404);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: "Total revenue", value: analytics ? formatNaira(analytics.TotalRevenue) : "—" },
    { label: "New customers", value: analytics?.NewUsers ?? "—" },
    { label: "Lost customers", value: analytics?.LostUsers ?? "—" },
    { label: "Active subscriptions", value: analytics?.OngoingSubscriptions ?? "—" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">{appId ? `Signed in as app ${appId}` : "Overview of your account."}</p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-xs font-medium text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{loading ? "…" : stat.value}</p>
          </div>
        ))}
      </div>

      {!loading && unreachable ? (
        <div className="mt-6">
          <EmptyState
            title="No analytics endpoint yet"
            description="There is no /api/analytics route on the backend yet, so these numbers can't be loaded. This will populate automatically once that route is built."
          />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/plans"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand-tint"
        >
          <p className="font-semibold text-foreground">Plans</p>
          <p className="mt-1 text-sm text-muted">Manage your pricing plans</p>
        </Link>
        <Link
          href="/subscriptions"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand-tint"
        >
          <p className="font-semibold text-foreground">Subscriptions</p>
          <p className="mt-1 text-sm text-muted">View active and past subscriptions</p>
        </Link>
        <Link
          href="/customers"
          className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand-tint"
        >
          <p className="font-semibold text-foreground">Customers</p>
          <p className="mt-1 text-sm text-muted">Browse subscriber accounts</p>
        </Link>
      </div>
    </div>
  );
}

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(
    amount,
  );
}
