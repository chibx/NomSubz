"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listCustomers, createCustomer, type Subscriber } from "@/app/lib/api";
import { EmptyState } from "@/app/components/EmptyState";
import { DUMMY_CUSTOMERS } from "@/app/lib/dummy";

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingDummy, setUsingDummy] = useState(false);
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fetchCustomers() {
    return listCustomers().then((res) => setCustomers(res.data ?? []));
  }

  useEffect(() => {
    let mounted = true;
    listCustomers().then((res) => {
      if (!mounted) return;
      if (res.data && res.data.length > 0) {
        setCustomers(res.data);
      } else {
        setCustomers(DUMMY_CUSTOMERS);
        setUsingDummy(true);
      }
      setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    const res = await createCustomer({ userId, email });
    setCreating(false);

    if (res.status !== 200) {
      setError(res.message || "Couldn't create customer.");
      return;
    }

    setUserId("");
    setEmail("");
    if (res.data?.subscriberId) {
      router.push(`/customers/${res.data.subscriberId}`);
    } else {
      fetchCustomers();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted">Subscribers belonging to your business.</p>
        </div>
        {usingDummy && (
          <span className="rounded-full border border-status-pending-bg bg-status-pending-bg px-3 py-1 text-[11px] font-semibold text-status-pending-fg">
            Sample data
          </span>
        )}
      </div>

      <form onSubmit={handleCreate} className="mt-6 flex max-w-xl flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">User ID</label>
          <input type="text" required value={userId} onChange={(e) => setUserId(e.target.value)}
            placeholder="your-internal-user-id"
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="mb-1.5 block text-[13px] font-semibold text-foreground">Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="customer@email.com"
            className="w-full rounded-[7px] border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground" />
        </div>
        <button type="submit" disabled={creating}
          className="rounded-[7px] bg-brand px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-hover disabled:opacity-60">
          {creating ? "Adding…" : "Add customer"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-status-failed-fg">{error}</p>}

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : customers.length === 0 ? (
          <EmptyState title="No customers yet" description="No GET list route exists yet on the backend. Add a customer above to test creation." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            <div className="table-wrap"><table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background">
                <tr>
                  <th className="px-5 py-3 font-medium text-muted">User ID</th>
                  <th className="px-5 py-3 font-medium text-muted">Email</th>
                  <th className="px-5 py-3 font-medium text-muted">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.subscriberId} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      <Link href={`/customers/${c.subscriberId}`} className="font-medium text-foreground hover:text-brand">
                        {c.userId}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-foreground">{c.email}</td>
                    <td className="px-5 py-3 text-foreground">{new Date(c.createdAt).toLocaleDateString()}</td>
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
