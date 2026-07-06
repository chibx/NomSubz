import * as v from "valibot";

const httpRegex =
    /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;

export const RegisterSchema = v.pipe(
    v.object({
        appName: v.pipe(
            v.string("App Name must be a string"),
            v.title("User Name"),
            v.minLength(3, "App Name must not be less than 3 characters"),
        ),
        email: v.pipe(
            v.string("Email address must be a string"),
            v.trim(),
            v.title("Email"),
            v.email("Email address is invalid"),
        ),
        password: v.pipe(
            v.string(),
            v.minLength(8, "Password should be a minimum of 8 characters"),
            v.maxLength(30, "Password should be a maximum of 30 characters"),
        ),
        logoUrl: v.optional(v.pipe(v.string(), v.regex(httpRegex, "Logo should be a URL"))),
    }),
);

export const LoginSchema = v.pipe(
    v.object({
        email: v.pipe(
            v.string("Email address must be a string"),
            v.trim(),
            v.title("Email"),
            v.email("Email address is invalid"),
        ),
        password: v.pipe(
            v.string(),
            v.minLength(8, "Password should be a minimum of 8 characters"),
            v.maxLength(30, "Password should be a maximum of 30 characters"),
        ),
    }),
);

export const CreateSubscriberSchema = v.pipe(
    v.object({
        userId: v.pipe(
            v.string(),
            v.check((str) => str.length > 0),
        ),
        email: v.pipe(v.string(), v.email("Email address must be a valid email")),
    }),
);

export const UpdateSubscriptionDetailSchema = v.object({
    cardId: v.optional(v.string("'cardId' is meant to be a string")),
    planId: v.optional(v.pipe(v.string("'planId' is meant to be a string"), v.toBigint("Invalid plan id"))),
});

export const AddCardDetailsSchema = v.object({
    cardCVV: v.number(),
    cardExpiryMonth: v.number(),
    cardExpiryYear: v.number(),
    cardNumber: v.pipe(v.string(), v.digits()),
    cardPin: v.number(),
    phoneNumber: v.pipe(v.string(), v.regex(/^\+?[1-9]\d{1,14}$/)),
});

export const AddWebhookUrlSchema = v.object({
    webhookUrl: v.pipe(v.string(), v.regex(httpRegex, "Invalid webhook url")),
});

export const CreateSubscriptionPlanSchema = v.object({
    name: v.string(),
    amount: v.pipe(v.string(), v.decimal("Amount must be a valid decimal number")),
    currency: v.string(),
    status: v.optional(v.pipe(v.string(), v.picklist(["enabled", "disabled"]))),
    type: v.pipe(v.string(), v.picklist(["weekly", "monthly", "annually"])),
    details: v.optional(v.unknown()),
});

export const CreateSubscriptionSchema = v.object({
    planId: v.pipe(v.string(), v.toBigint("Invalid plan id")),
    cardId: v.optional(v.string()),
    callbackUrl: v.pipe(v.string(), v.regex(httpRegex, "Invalid callback url")),
});

export const TwoFAVerifySchema = v.object({
    token: v.pipe(
        v.string(),
        v.digits("Token must be a 6-digit number"),
        // v.length(6, "Token must be exactly 6 digits"),
    ),
});

export const LoginWith2FASchema = v.pipe(
    v.object({
        pendingToken: v.pipe(v.string("Pending token must be a string"), v.minLength(1, "Pending token is required")),
        token: v.pipe(v.string(), v.digits("Token must be a 6-digit number")),
    }),
);

export const CreateApiKeySchema = v.object({
    name: v.string(),
});
