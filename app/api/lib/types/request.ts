import { InferInput } from "valibot";
import {
    AddCardDetailsSchema,
    AddWebhookUrlSchema,
    CreateSubscriberSchema,
    CreateSubscriptionPlanSchema,
    CreateSubscriptionSchema,
    LoginSchema,
    LoginWith2FASchema,
    RegisterSchema,
    TwoFAVerifySchema,
} from "@/app/api/lib/validation-schema/schema";

/** POST /api/auth/register */
export type RegisterRequest = InferInput<typeof RegisterSchema>;

/** POST /api/auth/login */
export type LoginRequest = InferInput<typeof LoginSchema>;

/** POST /api/customers */
export type CreateSubscriberRequest = InferInput<typeof CreateSubscriberSchema>;

/** GET /api/customers/[id] */
export type GetSubscriberRequest = null;

/** POST /api/customers/[customerId]/payment-methods */
export type AddCardDetailsRequest = InferInput<typeof AddCardDetailsSchema>;

/** POST /api/webhooks/endpoints */
export type AddWebhookUrlRequest = InferInput<typeof AddWebhookUrlSchema>;

/** POST /api/plans */
export type CreateSubscriptionPlanRequest = InferInput<typeof CreateSubscriptionPlanSchema>;

/** POST /api/customers/[customerId]/subscriptions */
export type CreateSubscriptionRequest = InferInput<typeof CreateSubscriptionSchema>;

/** POST /api/auth/2fa/enable */
export type TwoFAVerifyRequest = InferInput<typeof TwoFAVerifySchema>;

/** POST /api/auth/login/2fa */
export type LoginWith2FARequest = InferInput<typeof LoginWith2FASchema>;
