import { InferEnum } from "drizzle-orm";
import { ValidationError } from "../utils/utils";
import { NullT, PlanStatus, PlanType, Analytics } from "./types";
import { subscriptionsStatusEnum } from "../db/schema";

export type StructuredResponse<T = unknown> = {
    status: number;
    message: string;
    data: NullT<T>;
    errors?: ValidationError[];
};

/** POST /api/customers */
export type CreateSubscriberResponse = {
    /** Subscriber is a bigint (int64) string */
    subscriberId: string;
};

/** GET /api/customers/[customeId] */
export type GetSubscriberResponse = {
    /** Subscriber is a bigint (int64) string */
    subscriberId: string;
    appId: string;
    userId: string;
    createdAt: string;
    deletedAt: string | null;
};

export type SubscriberCard = {
    id: string;
    subscriberId: bigint;
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
    createdAt: string;
};

/** GET /api/customers/[customerId]/payment-methods */
export type GetSubscriberCardsResponse = {
    cards: SubscriberCard[];
};

/** GET /api/customers/[customerId]/subscriptions/[subscriptionId] */
export type GetSubscriptionResponse = {
    id: string;
    amount: string;
    createdAt: Date;
    startTime: Date;
    endTime: Date;
    status: InferEnum<typeof subscriptionsStatusEnum>;
    planName: string;
    planType: PlanType;
};

/** GET /api/plans/[planId] */
export type GetPlanResponse = {
    id: string;
    name: string;
    amount: string;
    currency: string;
    status: PlanStatus;
    type: PlanType;
    details: unknown;
    createdAt: string;
    updatedAt: string;
};

/** GET /api/plans */
export type ListPlansResponse = {
    plans: GetPlanResponse[];
};

/** POST /api/customers/[customerId]/subscriptions */
export type CreateSubscriptionResponse = {
    checkoutLink?: string;
};

/** POST /api/auth/2fa/setup */
export type Agree2FAResponse = {
    secret: string;
    totpURI: string;
    backupCodes: string[];
};

/** POST /api/auth/login */
export type LoginResponse = {
    requires2FA?: boolean;
    pendingToken?: string; // Should be sent back as cookie
};

/** GET /api/customers/[customerId]/subscriptions */
export interface ListSubscriptionsResponse {
    subscriptions: Array<{
        id: string;
        amount: string;
        status: InferEnum<typeof subscriptionsStatusEnum>;
        startTime: string;
        endTime: string;
        createdAt: string;
        cancelAtEnd: boolean;
        planId: string;
        planName: string;
        planType: PlanType;
    }>;
    nextPage: number | null;
    cursor: string | null;
}

/** GET /api/invoices */
export type ListAppInvoicesResponse = {
    invoices: Array<{
        paymentId: string;
        amount: string;
        status: string;
        userId: string;
        transactionId: string | null;
        orderReference: string;
        createdAt: string;
        updatedAt: string;
        subscriptionId: string;
        planName: string;
        planType: PlanType;
    }>;
    nextPage: number | null;
    cursor: string | null;
};

/** GET /api/customers/[customerId]/invoices */
export type ListCustomerInvoiceRequest = {
    invoices: Array<{
        paymentId: string;
        amount: string;
        status: string;
        transactionId: string | null;
        orderReference: string;
        createdAt: string;
        updatedAt: string;
        subscriptionId: string;
        planName: string;
        planType: PlanType;
    }>;
    nextPage: number | null;
    cursor: string | null;
};

/** GET /api/customers/[customerId]/invoices/[invoiceId] */
export type GetInvoiceResponse = {
    paymentId: string;
    amount: string;
    status: string;
    transactionId: string | null;
    orderReference: string;
    createdAt: string;
    updatedAt: string;
    subscriptionId: string;
    planName: string;
    planType: PlanType;
    planAmount: string;
    currency: string;
};

/** GET /api/webhooks/endpoints */
export type GetWebhookUrlResponse = {
    webhookUrl: string | null;
};

/** POST /api/auth/api-key */
export type CreateAPIKeyResponse = {
    apiKey: string;
};

/** GET /api/auth/api-key */
export type GetApiKeysResponse = {
    apiKeys: Array<{
        id: string;
        name: string;
        createdAt: string;
    }>;
};

/** GET /api/analytics */
export type GetAnalyticsResponse = {
    analytics: Analytics[];
};
