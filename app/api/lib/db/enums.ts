import { pgEnum } from "drizzle-orm/pg-core";

export const subscriptionsStatusEnum = pgEnum("subscription_status", ["pending", "active", "cancelled", "paused"]);
export const planStatusEnum = pgEnum("plan_status", ["enabled", "disabled"]);
export const planTypeEnum = pgEnum("plan_type", ["weekly", "monthly", "annually"]);
export const paymentStatusEnum = pgEnum("payment_status", ["success", "pending", "failed"]);
