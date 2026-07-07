"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { listInvoices, type Invoice } from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";
import { EmptyState } from "@/app/components/EmptyState";
import { DUMMY_INVOICES } from "@/app/lib/dummy";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);

  useEffect(() => {
    listInvoices().then((res) => {
      if (res.data && res.data.length > 0) {
        setInvoices(res.data);
      } else {
        setInvoices(DUMMY_INVOICES);
        setUsingDummy(true);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Invoices</h1>
          <p className="mt-1 text-sm text-muted">Payment history across all your customers.</p>
        </div>
        {usingDummy && (
          <span className="rounded-full border border-status-pending-bg bg-status-pending-bg px-3 py-1 text-[11px] font-semibold text-status-pending-fg">
            Sample data
          </span>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : invoices.length === 0 ? (
          <EmptyState
            title="No invoices"
            description="The /api/invoices route is still a stub on the backend, so this list is genuinely empty for now."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="table-wrap"><table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-5 py-3 font-medium text-muted">Date</th>
                  <th className="px-5 py-3 font-medium text-muted">Amount</th>
                  <th className="px-5 py-3 font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/invoices/${inv.id}`} className="font-medium text-foreground hover:text-brand">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">{inv.amount}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
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
