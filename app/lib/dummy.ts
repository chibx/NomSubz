/**
 * Dummy seed data — shown when backend endpoints return empty.
 * Frontend-only. Never imported by any API or server route.
 */

import type { Subscriber, Plan, Subscription, Invoice } from "./api";

export const DUMMY_CUSTOMERS: Subscriber[] = [
  { subscriberId: "sub_01", appId: "app_demo", userId: "user_adebayo", email: "adebayo.k@gmail.com", createdAt: "2024-09-12T08:30:00Z", deletedAt: null },
  { subscriberId: "sub_02", appId: "app_demo", userId: "user_ngozi",   email: "ngozi.eze@yahoo.com",  createdAt: "2024-10-04T11:15:00Z", deletedAt: null },
  { subscriberId: "sub_03", appId: "app_demo", userId: "user_tunde",   email: "tunde.ola@outlook.com", createdAt: "2024-11-20T09:00:00Z", deletedAt: null },
  { subscriberId: "sub_04", appId: "app_demo", userId: "user_amaka",   email: "amaka.o@proton.me",     createdAt: "2025-01-08T14:22:00Z", deletedAt: null },
  { subscriberId: "sub_05", appId: "app_demo", userId: "user_emeka",   email: "emeka.ch@gmail.com",    createdAt: "2025-02-17T07:45:00Z", deletedAt: null },
  { subscriberId: "sub_06", appId: "app_demo", userId: "user_chisom",  email: "chisom.n@gmail.com",    createdAt: "2025-03-03T16:10:00Z", deletedAt: null },
];

export const DUMMY_PLANS: Plan[] = [
  { id: "plan_01", name: "Starter",     amount: "2500",  currency: "NGN", status: "enabled",  type: "monthly" },
  { id: "plan_02", name: "Growth",      amount: "7500",  currency: "NGN", status: "enabled",  type: "monthly" },
  { id: "plan_03", name: "Pro",         amount: "15000", currency: "NGN", status: "enabled",  type: "monthly" },
  { id: "plan_04", name: "Enterprise",  amount: "50000", currency: "NGN", status: "enabled",  type: "annually" },
  { id: "plan_05", name: "Legacy Free", amount: "0",     currency: "NGN", status: "disabled", type: "monthly" },
];

export const DUMMY_SUBSCRIPTIONS: Subscription[] = [
  { id: "sid_01", amount: "NGN 7,500",  createdAt: "2025-01-10T00:00:00Z", startTime: "2025-01-10T00:00:00Z", endTime: "2025-07-10T00:00:00Z", status: "active",    cancelAtEnd: false, planId: "plan_02", planName: "Growth",     planType: "monthly" },
  { id: "sid_02", amount: "NGN 2,500",  createdAt: "2024-11-01T00:00:00Z", startTime: "2024-11-01T00:00:00Z", endTime: "2025-07-01T00:00:00Z", status: "active",    cancelAtEnd: true,  planId: "plan_01", planName: "Starter",    planType: "monthly" },
  { id: "sid_03", amount: "NGN 15,000", createdAt: "2025-02-14T00:00:00Z", startTime: "2025-02-14T00:00:00Z", endTime: "2025-08-14T00:00:00Z", status: "active",    cancelAtEnd: false, planId: "plan_03", planName: "Pro",        planType: "monthly" },
  { id: "sid_04", amount: "NGN 7,500",  createdAt: "2024-08-20T00:00:00Z", startTime: "2024-08-20T00:00:00Z", endTime: "2025-02-20T00:00:00Z", status: "past_due",  cancelAtEnd: false, planId: "plan_02", planName: "Growth",     planType: "monthly" },
  { id: "sid_05", amount: "NGN 2,500",  createdAt: "2025-03-01T00:00:00Z", startTime: "2025-03-01T00:00:00Z", endTime: "2025-09-01T00:00:00Z", status: "paused",    cancelAtEnd: false, planId: "plan_01", planName: "Starter",    planType: "monthly" },
  { id: "sid_06", amount: "NGN 50,000", createdAt: "2024-06-15T00:00:00Z", startTime: "2024-06-15T00:00:00Z", endTime: "2025-06-15T00:00:00Z", status: "cancelled", cancelAtEnd: false, planId: "plan_04", planName: "Enterprise", planType: "annually" },
  { id: "sid_07", amount: "NGN 15,000", createdAt: "2025-04-01T00:00:00Z", startTime: "2025-04-01T00:00:00Z", endTime: "2025-10-01T00:00:00Z", status: "active",    cancelAtEnd: false, planId: "plan_03", planName: "Pro",        planType: "monthly" },
  { id: "sid_08", amount: "NGN 7,500",  createdAt: "2025-05-10T00:00:00Z", startTime: "2025-05-10T00:00:00Z", endTime: "2025-11-10T00:00:00Z", status: "active",    cancelAtEnd: false, planId: "plan_02", planName: "Growth",     planType: "monthly" },
];

export const DUMMY_INVOICES: Invoice[] = [
  { id: "inv_01", amount: "NGN 7,500",  status: "paid",    createdAt: "2025-06-10T00:00:00Z" },
  { id: "inv_02", amount: "NGN 2,500",  status: "paid",    createdAt: "2025-06-01T00:00:00Z" },
  { id: "inv_03", amount: "NGN 15,000", status: "paid",    createdAt: "2025-05-14T00:00:00Z" },
  { id: "inv_04", amount: "NGN 7,500",  status: "overdue", createdAt: "2025-05-01T00:00:00Z" },
  { id: "inv_05", amount: "NGN 50,000", status: "paid",    createdAt: "2025-04-15T00:00:00Z" },
  { id: "inv_06", amount: "NGN 2,500",  status: "paid",    createdAt: "2025-04-01T00:00:00Z" },
  { id: "inv_07", amount: "NGN 15,000", status: "pending", createdAt: "2025-03-14T00:00:00Z" },
  { id: "inv_08", amount: "NGN 7,500",  status: "paid",    createdAt: "2025-03-01T00:00:00Z" },
  { id: "inv_09", amount: "NGN 50,000", status: "paid",    createdAt: "2025-02-15T00:00:00Z" },
  { id: "inv_10", amount: "NGN 2,500",  status: "failed",  createdAt: "2025-02-01T00:00:00Z" },
];