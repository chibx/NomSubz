"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getInvoice, getInvoicePdfUrl, type Invoice } from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";

export default function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(Boolean(customerId));

  useEffect(() => {
    if (!customerId) return;
    let mounted = true;
    getInvoice(customerId, params.invoiceId).then((res) => {
      if (!mounted) return;
      setInvoice(res.data);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [customerId, params.invoiceId]);

  if (!customerId) {
    return (
      <p className="text-sm text-status-failed-fg">
        Missing customer context — open this page from a customer&apos;s invoice list.
      </p>
    );
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <Link href="/invoices" className="text-sm font-medium text-muted hover:text-foreground">
        ← Back to invoices
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">Invoice</h1>

      {!invoice ? (
        <p className="mt-4 text-sm text-muted">
          No data returned — the invoice detail endpoint is still a stub on the backend.
        </p>
      ) : (
        <div className="mt-6 max-w-lg rounded-xl border border-border bg-surface p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Amount</dt>
              <dd className="font-medium text-foreground">{invoice.amount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Status</dt>
              <dd>
                <StatusBadge status={invoice.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Date</dt>
              <dd className="font-medium text-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>

          <a
            href={getInvoicePdfUrl(customerId, invoice.id)}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-[7px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover"
          >
            Download PDF receipt
          </a>
        </div>
      )}
    </div>
  );
}
