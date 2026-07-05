/**
 * Shared API client for NomSubz frontend.
 * Matches the real backend contract exactly — form data for auth endpoints,
 * JSON elsewhere. No mock data anywhere.
 */

export type StructuredResponse<T> = {
  status: number;
  message: string;
  data: T | null;
  errors?: { message: string; path?: string }[];
};

export type PlanType = "weekly" | "monthly" | "annually";
export type PlanStatus = "enabled" | "disabled";
export type SubscriptionStatus = "pending" | "active" | "cancelled" | "paused";

export type Plan = {
  id: string;
  name: string;
  amount: string;
  currency: string;
  status: PlanStatus;
  type: PlanType;
  details?: unknown;
};

export type Subscriber = {
  subscriberId: string;
  appId: string;
  userId: string;
  email: string;
  createdAt: string;
  deletedAt: string | null;
};

export type SubscriberCard = {
  id: string;
  subscriberId: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  createdAt: string;
};

export type Subscription = {
  id: string;
  amount: string;
  createdAt: string;
  startTime: string;
  endTime: string;
  status: SubscriptionStatus;
  planName: string;
  planType: PlanType;
};

export type Analytics = {
  TotalRevenue: number;
  NewUsers: number;
  LostUsers: number;
  OngoingSubscriptions: number;
};

export type Invoice = {
  id: string;
  amount: string;
  status: string;
  createdAt: string;
};

export type WebhookEndpoint = {
  id: string;
  url: string;
};

export type ApiKey = {
  id: string;
  prefix: string;
  createdAt: string;
};

export type TwoFASetupData = {
  secret: string;
  totpURI: string;
  backupCodes: string[];
};

export type LoginResponse = {
  requires2FA?: boolean;
  pendingToken?: string;
};

const BASE = "/api";

async function parse<T>(res: Response): Promise<StructuredResponse<T>> {
  try {
    return (await res.json()) as StructuredResponse<T>;
  } catch {
    return { status: res.status, message: res.statusText || "Unknown response", data: null };
  }
}

function jsonRequest<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<StructuredResponse<T>> {
  return fetch(`${BASE}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined,
  }).then((res) => parse<T>(res));
}

function formRequest<T>(path: string, fields: Record<string, string>, options: { method?: string } = {}): Promise<StructuredResponse<T>> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  return fetch(`${BASE}${path}`, {
    method: options.method ?? "POST",
    credentials: "include",
    body: fd,
  }).then((res) => parse<T>(res));
}

// ---- Auth ----

export function register(fields: { appName: string; email: string; password: string; logoUrl?: string }) {
  return formRequest<null>("/auth/register", fields as Record<string, string>);
}

export function login(fields: { email: string; password: string }) {
  return formRequest<LoginResponse>("/auth/login", fields);
}

/** Second step when login returns requires2FA: true */
export function login2FA(fields: { pendingToken: string; token: string }) {
  return formRequest<null>("/auth/login/2fa", fields);
}

export function logout() {
  return jsonRequest<null>("/auth/logout", { method: "POST" });
}

export function whoami() {
  return jsonRequest<{ appId: string }>("/auth/whoami");
}

// ---- 2FA ----
// POST /auth/2fa/setup — returns secret, totpURI, backupCodes (no body required)
export function setup2FA() {
  return jsonRequest<TwoFASetupData>("/auth/2fa/setup", { method: "POST" });
}

// POST /auth/2fa/enable — form data: token (6-digit OTP)
export function enable2FA(token: string) {
  return formRequest<null>("/auth/2fa/enable", { token });
}

// ---- Customers ----
// GET /customers — stub, no list handler yet
export function listCustomers() {
  return jsonRequest<Subscriber[]>("/customers");
}

// POST /customers — form data: userId + email (both required per CreateSubscriberSchema)
export function createCustomer(fields: { userId: string; email: string }) {
  return formRequest<{ subscriberId: string }>("/customers", fields);
}

export function getCustomer(customerId: string) {
  return jsonRequest<Subscriber>(`/customers/${customerId}`);
}

// ---- Payment methods ----

export function listPaymentMethods(customerId: string) {
  return jsonRequest<{ cards: SubscriberCard[] }>(`/customers/${customerId}/payment-methods`);
}

export function deletePaymentMethod(customerId: string, cardId: string) {
  return jsonRequest<null>(`/customers/${customerId}/payment-methods/${cardId}`, { method: "DELETE" });
}

// Route exports PUT
export function setDefaultPaymentMethod(customerId: string, cardId: string) {
  return jsonRequest<null>(`/customers/${customerId}/payment-methods/${cardId}/default`, { method: "PUT" });
}

// ---- Plans — top-level /api/plans (moved back from per-customer) ----

export function listPlans() {
  return jsonRequest<Plan[]>("/plans");
}

export function createPlan(body: { name: string; amount: string; currency: string; type: PlanType; details?: unknown }) {
  return jsonRequest<Plan>("/plans", { method: "POST", body });
}

export function getPlan(planId: string) {
  return jsonRequest<Plan>(`/plans/${planId}`);
}

export function updatePlan(planId: string, body: Partial<Pick<Plan, "name" | "status">>) {
  return jsonRequest<Plan>(`/plans/${planId}`, { method: "PATCH", body });
}

// ---- Subscriptions ----

export function listSubscriptions(customerId: string) {
  return jsonRequest<Subscription[]>(`/customers/${customerId}/subscriptions`);
}

// POST /customers/[id]/subscriptions — requires planId, optional cardId, required callbackUrl
export function createSubscription(customerId: string, body: { planId: string; cardId?: string; callbackUrl: string }) {
  return jsonRequest<{ subscriptionId: string }>(`/customers/${customerId}/subscriptions`, { method: "POST", body });
}

export function getSubscription(customerId: string, subscriptionId: string) {
  return jsonRequest<Subscription>(`/customers/${customerId}/subscriptions/${subscriptionId}`);
}

export function changeSubscriptionPlan(customerId: string, subscriptionId: string, planId: string) {
  return jsonRequest<Subscription>(`/customers/${customerId}/subscriptions/${subscriptionId}`, {
    method: "PATCH",
    body: { planId },
  });
}

export function pauseSubscription(customerId: string, subscriptionId: string) {
  return jsonRequest<null>(`/customers/${customerId}/subscriptions/${subscriptionId}/pause`, { method: "POST" });
}

export function resumeSubscription(customerId: string, subscriptionId: string) {
  return jsonRequest<null>(`/customers/${customerId}/subscriptions/${subscriptionId}/resume`, { method: "POST" });
}

export function cancelSubscription(customerId: string, subscriptionId: string) {
  return jsonRequest<null>(`/customers/${customerId}/subscriptions/${subscriptionId}/cancel`, { method: "POST" });
}

// ---- Invoices — stubs ----

export function listInvoices() {
  return jsonRequest<Invoice[]>("/invoices");
}

export function listCustomerInvoices(customerId: string) {
  return jsonRequest<Invoice[]>(`/customers/${customerId}/invoices`);
}

export function getInvoice(customerId: string, invoiceId: string) {
  return jsonRequest<Invoice>(`/customers/${customerId}/invoices/${invoiceId}`);
}

export function getInvoicePdfUrl(customerId: string, invoiceId: string) {
  return `${BASE}/customers/${customerId}/invoices/${invoiceId}/pdf`;
}

// ---- Webhooks — stubs ----

export function listWebhookEndpoints() {
  return jsonRequest<WebhookEndpoint[]>("/webhooks/endpoints");
}

export function createWebhookEndpoint(url: string) {
  return jsonRequest<WebhookEndpoint>("/webhooks/endpoints", { method: "POST", body: { webhookUrl: url } });
}

// ---- Analytics — no route yet ----

export function getAnalytics() {
  return jsonRequest<Analytics>("/analytics");
}

// ---- Settings / API keys — no routes yet ----

export function updateProfile(body: { name?: string; email?: string }) {
  return jsonRequest<null>("/settings/profile", { method: "PATCH", body });
}

export function listApiKeys() {
  return jsonRequest<ApiKey[]>("/settings/api-keys");
}

export function generateApiKey() {
  return jsonRequest<{ key: string }>("/settings/api-keys", { method: "POST" });
}

export function revokeApiKey(keyId: string) {
  return jsonRequest<null>(`/settings/api-keys/${keyId}`, { method: "DELETE" });
}
