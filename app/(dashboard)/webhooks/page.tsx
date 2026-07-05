"use client";

import { useEffect, useState } from "react";
import { listWebhookEndpoints, createWebhookEndpoint, type WebhookEndpoint } from "@/app/lib/api";

export default function WebhooksPage() {
  const [endpoint, setEndpoint] = useState<WebhookEndpoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;
    listWebhookEndpoints().then((res) => {
      if (!mounted) return;
      // Backend returns a single webhook or an array. Handle both.
      if (Array.isArray(res.data) && res.data.length > 0) {
        setEndpoint(res.data[0]);
        setUrl(res.data[0].url);
      } else if (res.data && !Array.isArray(res.data)) {
        const single = res.data as unknown as WebhookEndpoint;
        if (single.url) {
          setEndpoint(single);
          setUrl(single.url);
        }
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const res = await createWebhookEndpoint(url);
    setSubmitting(false);

    if (res.status !== 200) {
      setError(res.message || "Failed to save webhook URL.");
      return;
    }

    if (res.data) setEndpoint(res.data);
    setSuccess("Webhook URL saved.");
    setTimeout(() => setSuccess(null), 3000);
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Webhooks</h1>
      <p className="mt-1 text-sm text-muted">
        NomSubz sends all billing events to this URL as signed POST requests.
      </p>

      {loading ? (
        <div className="mt-8 flex items-center gap-2 text-sm text-muted">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground" />
          Loading...
        </div>
      ) : (
        <div className="mt-6 max-w-lg rounded-2xl border border-border bg-surface p-6"
          style={{ boxShadow: "0 2px 8px rgba(10,10,10,0.04)" }}>

          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface-raised text-foreground">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">
                {endpoint ? "Your webhook endpoint" : "Set your webhook endpoint"}
              </p>
              <p className="text-[12px] text-muted">
                All events (subscription and invoice) are delivered to one URL.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Endpoint URL</label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourapp.com/webhooks/nomsubz"
              className="w-full rounded-lg border border-border bg-surface-raised px-3.5 py-2.5 text-[14px] placeholder:text-muted-foreground"
            />

            <div className="mt-4 rounded-lg border border-border-subtle bg-surface-raised px-4 py-3">
              <p className="text-[12px] font-semibold text-foreground mb-2">Events delivered</p>
              <div className="flex flex-wrap gap-1.5">
                {["subscription.created", "subscription.cancelled", "subscription.paused", "invoice.paid", "invoice.failed"].map((ev) => (
                  <span key={ev} className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                    {ev}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-muted">All events are sent automatically. No configuration needed.</p>
            </div>

            {error && <p className="mt-3 text-sm text-status-failed-fg">{error}</p>}
            {success && <p className="mt-3 text-sm text-status-success-fg">{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary mt-5 w-full justify-center py-2.5 text-[14px] font-semibold disabled:opacity-60"
            >
              {submitting ? "Saving..." : endpoint ? "Update webhook URL" : "Save webhook URL"}
            </button>
          </form>

          {endpoint && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-status-success-bg bg-status-success-bg/30 px-3 py-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" stroke="#166534" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-[12px] font-medium text-status-success-fg">Webhook active</span>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 max-w-lg rounded-lg border border-border-subtle bg-surface-raised px-5 py-4">
        <p className="text-[13px] font-semibold text-foreground mb-1.5">How it works</p>
        <p className="text-[13px] leading-relaxed text-muted">
          When a billing event occurs, NomSubz sends a signed POST request to your endpoint with a JSON payload
          and a signature header for verification. Failed deliveries are retried automatically.
        </p>
      </div>
    </div>
  );
}