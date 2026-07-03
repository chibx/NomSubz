import { InferEnum } from "drizzle-orm";
import { planTypeEnum } from "../db/schema";

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
    };
    [ApplicationLogEvents.PLAN_SUBSCRIPTION]: {
        appId: string;
        subscriptionId: string;
        planId: string;
        amount: string;
        currentDate: string;
    };
};

export type Analytics = {
    TotalRevenue: number;
    NewUsers: number;
    LostUsers: number;
    OngoingSubscriptions: number;
};

export type JWTField = {
    appId: string;
};

export type PlanType = InferEnum<typeof planTypeEnum>;

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
};

export type PlanSubscriptionWebhook = {
    type: WebHookTypes.PLAN_SUBSCRIPTION;
    // usedExistingCard: "true" | "false";
    amount: string;
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

export type WebHookVariants = PlanUpgradeWebHook | PlanSubscriptionWebhook;
