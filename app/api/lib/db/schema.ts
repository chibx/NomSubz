import { sql } from "drizzle-orm";
import {
    boolean,
    decimal,
    bigint,
    foreignKey,
    index,
    jsonb,
    pgTable,
    text,
    timestamp,
    uniqueIndex,
    uuid,
    date,
    smallint,
    integer,
    check,
    json,
    pgEnum,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";
import { snowflake } from "../utils/utils";

export enum CardConfirmationStatus {
    PENDING = 0,
    CONFIRMED = 1,
}

export type AnalyticsPeriodType = number & {};

export const subscriptionsStatusEnum = pgEnum("subscription_status", ["pending", "active", "cancelled", "paused"]);
export const planStatusEnum = pgEnum("plan_status", ["enabled", "disabled"]);
export const planTypeEnum = pgEnum("plan_type", ["weekly", "monthly", "annually"]);
export const paymentStatusEnum = pgEnum("payment_status", ["success", "pending", "failed"]);

export const applications = pgTable(
    "applications",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        name: text("name").notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
        email: text("email").notNull(),
        password: text("password").notNull(),
        logoUrl: text("logo_url"),
        amount: decimal("amount", { precision: 15, scale: 4, mode: "string" }),
        isEmailVerified: boolean("is_email_verified").default(false),
        is2FAEnabled: boolean("is_2fa_enabled").default(false),
        webhookUrl: text("webhook_url"),
        settings: json("settings").default({}),
    },
    (table) => [
        uniqueIndex("apps_email_idx").on(table.email),
        index("apps_name_idx").on(table.name),
        index("apps_created_at_idx").on(table.createdAt),
    ],
);

export const appApiKeys = pgTable(
    "app_api_keys",
    {
        secret: text("secret").notNull(),
        prefix: text("prefix").notNull(),
        appId: uuid("app_id").notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        index("app_api_keys_appId_idx").on(table.appId),
        index("app_api_keys_prefix_idx").on(table.prefix),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

/** This is for the 2FA Secrets */
export const apps2FASecrets = pgTable(
    "app_2fa_secrets",
    {
        appId: uuid("app_id").notNull(),
        encryptedSecret: text("secret").notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (table) => [
        index("secrets_2fa_appId_idx").on(table.appId),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

/** This is for the 2FA backup codes (codes are hashed instead of encrypted) */
export const apps2FACodes = pgTable(
    "app_2fa_codes",
    {
        appId: uuid("app_id").notNull(),
        hashedCode: text("code").notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    },
    (table) => [
        index("codes_2fa_appId_idx").on(table.appId),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

export const applicationSessions = pgTable(
    "app_sessions",
    {
        appId: uuid("app_id").notNull(),
        token: text("token").notNull(),
        ip: text("ip_address").notNull(),
        userAgent: text("user_agent"),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
        expiresAt: timestamp("updated_at", { mode: "date" }).notNull(),
    },
    (table) => [
        index("sessions_appId_idx").on(table.appId),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

export const plans = pgTable(
    "subscriptions_plans",
    {
        id: bigint("id", { mode: "bigint" })
            .primaryKey()
            .$defaultFn(() => snowflake.nextId()),
        appId: uuid("app_id").notNull(),
        name: text("name").notNull(),
        amount: decimal("amount", {
            mode: "string",
            precision: 15,
            scale: 4,
        }).notNull(),
        currency: text("currency").notNull().default("NGN"),
        status: planStatusEnum("status").notNull().default("enabled"),
        type: planTypeEnum("type").notNull().default("monthly"),
        details: jsonb("details").default({}),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        index("plans_appId_idx").on(table.appId),
        index("plans_amount_idx").on(table.amount),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

export const subscribers = pgTable(
    "subscribers",
    {
        subscriberId: bigint("subscriber_id", { mode: "bigint" })
            .primaryKey()
            .$defaultFn(() => snowflake.nextId()),
        appId: uuid("app_id").notNull(),
        userId: text("user_id").notNull(),
        email: text("email").notNull(),
        /** Amount remain from over-charge or undercharge */
        residualAmount: decimal("residual_amount", {
            mode: "string",
            precision: 15,
            scale: 4,
        })
            .notNull()
            .default("0.00"),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
        deletedAt: timestamp("deleted_at", { mode: "date" }),
    },
    (table) => [
        index("subscribers_appId_idx").on(table.appId),
        uniqueIndex("subscribers_userId_idx").on(table.appId, table.userId),
        index("subscribers_created_at_idx").on(table.createdAt),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

export const subscriberCards = pgTable(
    "subscriber_cards",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        appId: uuid("app_id").notNull(),
        subscriberId: bigint("subscriber_id", { mode: "bigint" }).notNull(),
        tokenizedCard: text("tokenized_card").notNull(),
        isDefault: boolean("is_default").default(false),
        brand: text("brand").notNull(), // "Mastercard"
        last4Digits: text("last4").notNull(),
        expiryMonth: smallint("expiry_month").notNull(),
        expiryYear: smallint("expiry_year").notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        index("subscriber_cards_subscriberId_idx").on(table.subscriberId),
        index("subscriber_cards_created_at_idx").on(table.createdAt),
        foreignKey({
            columns: [table.subscriberId],
            foreignColumns: [subscribers.subscriberId],
        }).onDelete("cascade"),
        check("month_check", sql`${table.expiryMonth} >= 1 AND ${table.expiryMonth} <= 12`),
    ],
);

export const saveCardConfirmation = pgTable(
    "save_card_confirmation",
    {
        orderReference: text("order_reference").notNull(),
        transactionId: text("transaction_id").notNull(),
        subscriberId: bigint("subscriber_id", { mode: "bigint" }).notNull(),
        status: smallint("status").notNull().default(CardConfirmationStatus.PENDING),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        index("card_confirmation_created_at").on(table.createdAt),
        foreignKey({
            columns: [table.subscriberId],
            foreignColumns: [subscribers.subscriberId],
        }).onDelete("cascade"),
    ],
);

export const subscriptions = pgTable(
    "subscriptions",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        subscriberId: bigint("subscriber_id", { mode: "bigint" }).notNull(),
        planId: bigint("plan_id", { mode: "bigint" }).notNull(),
        cardId: uuid("card_id").notNull(),
        amount: decimal("amount", {
            mode: "string",
            precision: 15,
            scale: 4,
        }).notNull(),
        status: subscriptionsStatusEnum("status").notNull().default("active"),
        startTime: timestamp("start_time", { mode: "date" }).notNull(),
        endTime: timestamp("end_time", { mode: "date" }).notNull(),
        createdAt: timestamp("created_at", { mode: "date" }).notNull(),
        cancelAtEnd: boolean("cancel_at_period_end").default(false),
    },
    (table) => [
        index("subscriptions_start_time_idx").on(table.startTime),
        index("subscriptions_end_time_idx").on(table.endTime),
        index("subscriptions_plan_id_idx").on(table.planId),
        foreignKey({
            columns: [table.subscriberId],
            foreignColumns: [subscribers.subscriberId],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.planId],
            foreignColumns: [plans.id],
        }).onDelete("restrict"),
        foreignKey({
            columns: [table.cardId],
            foreignColumns: [subscriberCards.id],
        }).onDelete("restrict"),
    ],
);

export const payments = pgTable(
    "payments",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        appId: uuid("app_id").notNull(),
        subscriberId: bigint("subscriber_id", { mode: "bigint" }).notNull(),
        subscriptionId: uuid("subscription_id").notNull(),
        cardToken: text("card_token").notNull(),
        orderReference: text("order_reference").notNull(),
        amount: decimal("amount", {
            mode: "string",
            precision: 15,
            scale: 4,
        }).notNull(),
        status: paymentStatusEnum("status").notNull(),
        transactionId: text("transaction_id"),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
        updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        index("payments_transactionId_idx").on(table.transactionId),
        index("payments_subscriberId_idx").on(table.subscriberId),
        index("payments_appId_idx").on(table.appId),
        foreignKey({
            columns: [table.subscriberId],
            foreignColumns: [subscribers.subscriberId],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
        foreignKey({
            columns: [table.subscriptionId],
            foreignColumns: [subscriptions.id],
        }).onDelete("cascade"),
    ],
);

export const applicationLogs = pgTable(
    "application_logs",
    {
        id: uuid("id")
            .primaryKey()
            .$defaultFn(() => uuidv7()),
        appId: uuid("app_id").notNull(),
        event: text("event").notNull(),
        description: text("description"),
        metadata: jsonb("metadata").default({}),
        createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    },
    (table) => [
        index("app_logs_app_id_idx").on(table.appId),
        index("app_logs_event_idx").on(table.event),
        index("app_logs_created_at_idx").on(table.createdAt),
        foreignKey({
            columns: [table.appId],
            foreignColumns: [applications.id],
        }).onDelete("cascade"),
    ],
);

// Analytics
export const analyticsTable = pgTable("analytics", {
    date: date("date", { mode: "date" }).notNull().unique(),
    periodType: smallint("period_type").$type<AnalyticsPeriodType>().notNull(),
    totalRevenue: decimal("total_revenue", {
        mode: "string",
        precision: 15,
        scale: 4,
    }).notNull(),
    newUsers: integer("new_users").notNull(),
    lostUsers: integer("lost_users").notNull(),
    ongoingSubscriptions: integer("ongoing_subscriptions").notNull(),
    // metrics: jsonb("metrics")
    //     .notNull()
    //     .default(sql`'{}'`),
});
