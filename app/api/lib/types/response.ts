import { InferEnum } from "drizzle-orm";
import { ValidationError } from "../utils/utils";
import { NullT, PlanStatus, PlanType } from "./types";
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

export type Agree2FAResponse = {
    secret: string;
    totpURI: string;
    backupCodes: string[];
};

export type LoginResponse = {
    requires2FA?: boolean;
    pendingToken?: string;
};

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
