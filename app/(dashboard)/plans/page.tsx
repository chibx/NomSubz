"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listPlans, type Plan } from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";
import { EmptyState } from "@/app/components/EmptyState";

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    listPlans().then((res) => {
      if (!mounted) return;
      setPlans(res.data ?? []);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Plans</h1>
          <p className="mt-1 text-sm text-muted">Pricing plans your customers can subscribe to.</p>
        </div>
        <Link href="/plans/create"
          className="rounded-[7px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover">
          Create plan
        </Link>
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : plans.length === 0 ? (
          <EmptyState title="No plans yet" description="Create your first pricing plan above." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="table-wrap"><table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-5 py-3 font-medium text-muted">Name</th>
                  <th className="px-5 py-3 font-medium text-muted">Price</th>
                  <th className="px-5 py-3 font-medium text-muted">Interval</th>
                  <th className="px-5 py-3 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/plans/${plan.id}/edit`} className="font-medium text-foreground hover:text-brand">
                        {plan.name}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">{plan.currency} {plan.amount}</td>
                    <td className="px-5 py-3 capitalize text-foreground">{plan.type}</td>
                    <td className="px-5 py-3"><StatusBadge status={plan.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        )}
      </div>
    </div>
  );
}
