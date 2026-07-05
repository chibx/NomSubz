"use client";

import { useEffect, useState } from "react";
import { listWebhookEndpoints, createWebhookEndpoint, type WebhookEndpoint } from "@/app/lib/api";
import { EmptyState } from "@/app/components/EmptyState";

const EVENT_OPTIONS = [
  "subscription.created",
  "subscription.cancelled",
  "subscription.paused",
  "invoice.paid",
  "invoice.failed",
];

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function refresh() {
    setLoading(true);
    listWebhookEndpoints().then((res) => {
      setEndpoints(res.data ?? []);
      setLoading(false);
    });
  }

  useEffect(() => {
    let mounted = true;
    listWebhookEndpoints().then((res) => {
      if (!mounted) return;
      setEndpoints(res.data ?? []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  function toggleEvent(ev: string) {
    setEvents((current) => (current.includes(ev) ? current.filter((e) => e !== ev) : [...current, ev]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await createWebhookEndpoint(url);

    setSubmitting(false);

    if (res.status !== 200) {
      setError(res.message || "This endpoint hasn't been implemented on the backend yet.");
      return;
    }

    setUrl("");
    setEvents([]);
    refresh();
  }

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Webhooks</h1>
      <p className="mt-1 text-sm text-muted">
        Send subscription and billing events from NomSubz to your own systems.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 max-w-lg rounded-xl border border-border bg-surface p-6">
        <div className="mb-4">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Endpoint URL</label>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourapp.com/webhooks/nomsubz"
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground"
          />
        </div>

        <div className="mb-5">
          <p className="mb-2 text-[13px] font-semibold text-foreground">Events to send</p>
          <div className="space-y-2">
            {EVENT_OPTIONS.map((ev) => (
              <label key={ev} className="flex items-center gap-2.5 text-sm text-foreground">
                <input type="checkbox" checked={events.includes(ev)} onChange={() => toggleEvent(ev)} />
                {ev}
              </label>
            ))}
          </div>
        </div>

        {error ? <p className="mb-4 text-sm text-status-failed-fg">{error}</p> : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-[7px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60"
        >
          {submitting ? "Adding…" : "Add endpoint"}
        </button>
      </form>

      <div className="mt-8">
        <h2 className="text-base font-bold text-foreground">Registered endpoints</h2>
        <div className="mt-3">
          {loading ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : endpoints.length === 0 ? (
            <EmptyState
              title="No webhook endpoints"
              description="The /api/webhooks/endpoints route is still a stub on the backend."
            />
          ) : (
            <ul className="space-y-2">
              {endpoints.map((ep) => (
                <li key={ep.id} className="rounded-xl border border-border bg-surface p-4">
                  <p className="font-medium text-foreground">{ep.url}</p>
                  <p className="mt-1 text-xs text-muted">Events not configurable yet.</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
