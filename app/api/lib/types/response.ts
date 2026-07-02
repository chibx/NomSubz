import { InferEnum } from "drizzle-orm";
import { ValidationError } from "../utils/utils";
import { NullT, PlanType } from "./types";
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

/** GET /api/customers/[id] */
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

export type GetSubscriberCardsResponse = {
    cards: SubscriberCard[];
};

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
