"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  getCustomer,
  listPaymentMethods,
  listSubscriptions,
  listCustomerInvoices,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  type Subscriber,
  type SubscriberCard,
  type Subscription,
  type Invoice,
} from "@/app/lib/api";
import { StatusBadge } from "@/app/components/StatusBadge";
import { EmptyState } from "@/app/components/EmptyState";

export default function CustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const customerId = params.customerId;

  const [customer, setCustomer] = useState<Subscriber | null>(null);
  const [cards, setCards] = useState<SubscriberCard[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  function refreshCards() {
    listPaymentMethods(customerId).then((res) => setCards(res.data?.cards ?? []));
  }

  useEffect(() => {
    let mounted = true;
    Promise.all([
      getCustomer(customerId),
      listPaymentMethods(customerId),
      listSubscriptions(customerId),
      listCustomerInvoices(customerId),
    ]).then(([customerRes, cardsRes, subsRes, invoicesRes]) => {
      if (!mounted) return;
      setCustomer(customerRes.data);
      setCards(cardsRes.data?.cards ?? []);
      setSubscriptions(subsRes.data?.subscriptions ?? []);
      setInvoices(invoicesRes.data ?? []);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, [customerId]);

  async function handleRemoveCard(cardId: string) {
    await deletePaymentMethod(customerId, cardId);
    refreshCards();
  }

  async function handleSetDefault(cardId: string) {
    await setDefaultPaymentMethod(customerId, cardId);
    refreshCards();
  }

  if (loading) return <p className="text-sm text-muted">Loading…</p>;

  return (
    <div>
      <Link href="/customers" className="text-sm font-medium text-muted hover:text-foreground">
        ← Back to customers
      </Link>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">
        {customer?.userId ?? "Customer"}
      </h1>
      <p className="mt-1 text-sm text-muted">
        Customer since {customer ? new Date(customer.createdAt).toLocaleDateString() : "—"}
      </p>

      {/* Payment methods */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">Payment methods</h2>
        <div className="mt-3">
          {cards.length === 0 ? (
            <EmptyState title="No saved cards" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="table-wrap"><table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background">
                  <tr>
                    <th className="px-5 py-3 font-medium text-muted">Card</th>
                    <th className="px-5 py-3 font-medium text-muted">Expires</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {cards.map((card) => (
                    <tr key={card.id} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 capitalize text-foreground">
                        {card.brand} •••• {card.last4}
                      </td>
                      <td className="px-5 py-3 text-foreground">
                        {String(card.expiryMonth).padStart(2, "0")}/{card.expiryYear}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => handleSetDefault(card.id)}
                          className="mr-3 text-sm font-medium text-brand hover:text-brand-hover"
                        >
                          Set default
                        </button>
                        <button
                          onClick={() => handleRemoveCard(card.id)}
                          className="text-sm font-medium text-status-failed-fg hover:opacity-80"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}
        </div>
      </section>

      {/* Subscriptions */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">Subscriptions</h2>
        <div className="mt-3">
          {subscriptions.length === 0 ? (
            <EmptyState
              title="No subscriptions"
              description="The subscriptions list endpoint for this customer is still a stub on the backend."
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="table-wrap"><table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-background">
                  <tr>
                    <th className="px-5 py-3 font-medium text-muted">Plan</th>
                    <th className="px-5 py-3 font-medium text-muted">Amount</th>
                    <th className="px-5 py-3 font-medium text-muted">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => (
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
              </table></div>
            </div>
          )}
        </div>
      </section>

      {/* Invoices */}
      <section className="mt-8">
        <h2 className="text-base font-bold text-foreground">Invoices</h2>
        <div className="mt-3">
          {invoices.length === 0 ? (
            <EmptyState
              title="No invoices"
              description="The invoices endpoints are still stubs on the backend."
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
                        <Link
                          href={`/invoices/${inv.id}?customerId=${customerId}`}
                          className="font-medium text-foreground hover:text-brand"
                        >
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
      </section>
    </div>
  );
}
