"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAnalytics, whoami, type Analytics } from "@/app/lib/api";

// Dummy data shown while backend analytics route is pending
const DUMMY: Analytics = {
  TotalRevenue: 2400000,
  NewUsers: 48,
  LostUsers: 3,
  OngoingSubscriptions: 127,
};

const NAV_CARDS = [
  { href: "/plans", label: "Plans", desc: "Manage your pricing plans", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
  { href: "/subscriptions", label: "Subscriptions", desc: "Active and past subscriptions", icon: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" },
  { href: "/customers", label: "Customers", desc: "Browse subscriber accounts", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
  { href: "/invoices", label: "Invoices", desc: "View and download invoices", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/webhooks", label: "Webhooks", desc: "Manage your endpoint URL", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { href: "/settings", label: "Settings", desc: "Account and security settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(amount);
}

export default function DashboardHomePage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([whoami(), getAnalytics()]).then(([whoamiRes, analyticsRes]) => {
      if (!mounted) return;
      setAppId(whoamiRes.data?.app_id ?? null);
      if (analyticsRes.data) {
        setAnalytics(analyticsRes.data);
      } else {
        // Backend route not yet live, show dummy so the UI looks real
        setAnalytics(DUMMY);
        setUsingDummy(true);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const stats = [
    { label: "Total revenue", value: analytics ? formatNaira(analytics.TotalRevenue) : "", change: "+12% this month" },
    { label: "New customers", value: analytics?.NewUsers ?? "", change: "+8 this week" },
    { label: "Lost customers", value: analytics?.LostUsers ?? "", change: "Churn 2.3%" },
    { label: "Active subscriptions", value: analytics?.OngoingSubscriptions ?? "", change: "127 running" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">
            {appId ? `App ${appId}` : "Overview of your billing account."}
          </p>
        </div>
        {usingDummy && (
          <span className="rounded-full border border-status-pending-bg bg-status-pending-bg px-3 py-1 text-[11px] font-semibold text-status-pending-fg">
            Sample data
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card-lift p-5">
            <p className="text-[11.5px] font-medium text-muted">{stat.label}</p>
            <p className="mt-2 text-[24px] font-bold tracking-tight text-foreground">
              {loading ? (
                <span className="inline-block h-6 w-24 animate-pulse rounded bg-border" />
              ) : stat.value}
            </p>
            {!loading && (
              <p className="mt-1 text-[11px] text-muted-foreground">{stat.change}</p>
            )}
          </div>
        ))}
      </div>

      {/* Quick nav */}
      <div className="mt-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[2px] text-muted">Quick access</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {NAV_CARDS.map((item) => (
            <Link key={item.href} href={item.href}
              className="card-lift flex items-center gap-4 p-5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground">
                <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <div>
                <p className="text-[13.5px] font-semibold text-foreground">{item.label}</p>
                <p className="text-[12px] text-muted">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
