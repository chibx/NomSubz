import { InferEnum } from "drizzle-orm";
import { planStatusEnum, planTypeEnum, subscriptionsStatusEnum } from "../db/schema";

export type NullT<T> = T | null;

export enum ApplicationLogEvents {
    PLAN_CHANGE = "0",
    PLAN_SUBSCRIPTION = "1",
}

export type ApplicationLogMeta = {
    [ApplicationLogEvents.PLAN_CHANGE]: {
        appId: string;
        subscriptionId: string;
        oldPlanId: string;
        newPlanId: string;
        currentDate: string;
        userRemaining?: string;
        amountToPay?: string;
        transactionId: string;
    };
    [ApplicationLogEvents.PLAN_SUBSCRIPTION]: {
        appId: string;
        newPlanAmount: string;
        amountToPay: string;
        subscriptionId: string;
        planId: string;
        currentDate: string;
        transactionId: string;
    };
};

export type Analytics = {
    totalRevenue: number;
    newUsers: number;
    lostUsers: number;
    ongoingSubscriptions: number;
};

export type JWTField = {
    appId: string;
    purpose?: "access" | "mfa_pending";
};

export type PlanType = InferEnum<typeof planTypeEnum>;
export type PlanStatus = InferEnum<typeof planStatusEnum>;
export type SubscriptionStatus = InferEnum<typeof subscriptionsStatusEnum>;

export enum ParsedDbErrorType {
    UNIQUE_VIOLATION = 0,
    FOREIGN_KEY_VIOLATION = 1,
    NOT_NULL_VIOLATION = 2,
    CHECK_VIOLATION = 3,
    UNKNOWN_DB_ERROR = 4,
}

export interface ParsedDbError {
    type: ParsedDbErrorType;
    message: string;
    detail?: string;
    table?: string;
    column?: string;
    constraint?: string;
}

export enum WebHookTypes {
    PLAN_CHANGE_UPGRADE = "Plan Change - Upgrade",
    PLAN_SUBSCRIPTION = "Plan Subscription",
    RESUBSCRIBE = "Resubscribe",
}

export type PlanUpgradeWebHook = {
    type: WebHookTypes.PLAN_CHANGE_UPGRADE;
    newPlanId: string;
    oldPlanId: string;
    amountToPay?: string;
    userRemaining?: string;
    subscriptionId: string;
    subscriberId: string;
    appId: string;
    operationDate: string;
    transactionId: string;
};

export type PlanSubscriptionWebhook = {
    type: WebHookTypes.PLAN_SUBSCRIPTION;
    // usedExistingCard: "true" | "false";
    planAmount: string;
    amountToPay: string;
    planId: string;
    subscriberId: string;
    appId: string;
    currentDate: string;
} & (
    | {
          usedExistingCard: "true";
          cardId: string;
      }
    | {
          usedExistingCard: "false";
      }
);

export type ProcessPaymentWebHook = {
    type: WebHookTypes.RESUBSCRIBE;
    planId: string;
    amountToPay: string;
    userRemaining?: string;
    subscriptionId: string;
    subscriberId: string;
    appId: string;
    operationDate: string;
    transactionId: string;
};

export type WebHookVariants = PlanUpgradeWebHook | PlanSubscriptionWebhook | ProcessPaymentWebHook;

export type ProcessPaymentJobData = {
    appId: string;
    subscriptionId: string;
    endTime: string;
};

export type DunningJobData = {
    appId: string;
    subscriptionId: string;
    subscriberId: string;
    attempt: number;
    initialEndTime: string;
};

export type AttemptReCharge = {
    appId: string;
    subscriptionId: string;
    initialEndTime: string;
};
