import { InferInput } from "valibot";
import {
    AddCardDetailsSchema,
    AddWebhookUrlSchema,
    CreateSubscriberSchema,
    CreateSubscriptionPlanSchema,
    CreateSubscriptionSchema,
    LoginSchema,
    RegisterSchema,
} from "@/app/api/lib/validation-schema/schema";

/** POST /api/auth/register */
export type RegisterRequest = InferInput<typeof RegisterSchema>;

/** POST /api/auth/login */
export type LoginRequest = InferInput<typeof LoginSchema>;

/** POST /api/customers */
export type CreateSubscriberRequest = InferInput<typeof CreateSubscriberSchema>;

/** GET /api/customers/[id] */
export type GetSubscriberRequest = null;

export type AddCardDetailsRequest = InferInput<typeof AddCardDetailsSchema>;

export type AddWebhookUrlRequest = InferInput<typeof AddWebhookUrlSchema>;

export type CreateSubscriptionPlanRequest = InferInput<typeof CreateSubscriptionPlanSchema>;

export type CreateSubscriptionRequest = InferInput<typeof CreateSubscriptionSchema>;
