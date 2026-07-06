"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getInvoice, type Invoice } from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";

// Calls the PDF endpoint, reads the byte buffer, and triggers a file download
// exactly as Chiboy described: call the API, read the buffer, convert to PDF file.
async function downloadInvoicePdf(customerId: string, invoiceId: string) {
  const BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";
  const res = await fetch(`${BASE}/customers/${customerId}/invoices/${invoiceId}/pdf`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch PDF");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${invoiceId}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function InvoiceDetailPage() {
  const params = useParams<{ invoiceId: string }>();
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId");

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(Boolean(customerId));
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) return;
    let mounted = true;
    getInvoice(customerId, params.invoiceId).then((res) => {
      if (!mounted) return;
      setInvoice(res.data);
      setLoading(false);
    });
    return () => { mounted = false; };
  }, [customerId, params.invoiceId]);

  async function handleDownload() {
    if (!customerId) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadInvoicePdf(customerId, params.invoiceId);
    } catch {
      setDownloadError("Could not download PDF. Try again.");
    } finally {
      setDownloading(false);
    }
  }

  if (!customerId) {
    return (
      <p className="text-sm text-status-failed-fg">
        Missing customer context. Open this page from a customer invoice list.
      </p>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
        Loading...
      </div>
    );
  }

  return (
    <div>
      <Link href="/invoices" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground transition-colors">
        <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back to invoices
      </Link>

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface-raised">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-foreground">Invoice</h1>
          <p className="text-[12px] text-muted font-mono">{params.invoiceId}</p>
        </div>
      </div>

      {!invoice ? (
        <div className="mt-6 rounded-2xl border border-border-subtle bg-surface-raised p-6 text-sm text-muted">
          Invoice details not yet returned by the backend.
        </div>
      ) : (
        <div className="mt-5 max-w-lg rounded-2xl border border-border bg-surface p-6"
          style={{ boxShadow: "0 2px 8px rgba(10,10,10,0.04)" }}>
          <dl className="divide-y divide-border-subtle">
            {[
              { label: "Invoice ID", value: invoice.id },
              { label: "Amount", value: invoice.amount },
              { label: "Status", value: <StatusBadge status={invoice.status} /> },
              { label: "Date", value: new Date(invoice.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" }) },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <dt className="text-[13px] text-muted">{row.label}</dt>
                <dd className="text-[13px] font-semibold text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>

          {downloadError && (
            <p className="mt-4 text-sm text-status-failed-fg">{downloadError}</p>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary mt-5 w-full justify-center py-2.5 text-[14px] font-semibold disabled:opacity-60"
          >
            {downloading ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Generating PDF...
              </>
            ) : (
              <>
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download PDF receipt
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
