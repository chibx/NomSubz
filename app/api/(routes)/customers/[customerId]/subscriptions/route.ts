import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { plans, subscriberCards, subscribers } from "@/app/api/lib/db/tables";
import { CreateSubscriptionResponse } from "@/app/api/lib/types/response";
import { PlanSubscriptionWebhook, WebHookTypes } from "@/app/api/lib/types/types";
import {
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_NOT_FOUND,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import {
    dateToString,
    nombaClient,
    structuredResponse,
    toGoErrorRet,
    toValidationError,
} from "@/app/api/lib/utils/utils";
import { CreateSubscriptionSchema } from "@/app/api/lib/validation-schema/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { uuidv4 } from "uuidv7";
import * as v from "valibot";

async function getCardToken(appId: string, subscriberId: bigint, cardId: string): Promise<string | undefined> {
    return appDB
        .select({ tokenizedCard: subscriberCards.tokenizedCard })
        .from(subscriberCards)
        .where(
            and(
                eq(subscriberCards.appId, appId),
                eq(subscriberCards.subscriberId, subscriberId),
                eq(subscriberCards.id, cardId),
            ),
        )
        .then((rows) => rows[0]?.tokenizedCard);
}

//  Create a new subscription (Requires a Plan ID and a Default Payment Method).
export async function POST(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]/subscriptions">) {
    const appId = getAppId(req);
    const { customerId } = await ctx.params;

    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, "Unauthorized");
    }

    const [subscriberId, error$1] = await toGoErrorRet(() => BigInt(customerId))();
    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid customer id, got ${customerId}`);
    }

    const [validatedBody, error$2] = await toGoErrorRet(async () =>
        v.parse(CreateSubscriptionSchema, await req.json()),
    )();
    if (error$2 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Invalid request body`, null, toValidationError(error$2));
    }

    let cardDetails: { id: string; token: string } | undefined;
    if (validatedBody.cardId) {
        const token = await getCardToken(appId, subscriberId, validatedBody.cardId);
        if (token) {
            cardDetails = { id: validatedBody.cardId, token };
        }
    } else {
        const [res, error] = await toGoErrorRet(() => {
            return appDB
                .select({ id: subscriberCards.id, tokenizedCard: subscriberCards.tokenizedCard })
                .from(subscriberCards)
                .where(and(eq(subscriberCards.subscriberId, subscriberId), eq(subscriberCards.isDefault, true)));
        })();
        if (error !== null) {
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        if (res.length !== 0) {
            cardDetails = { id: res[0].id, token: res[0].tokenizedCard };
        }
    }

    // TODO: Cache
    const getEmailProm = appDB
        .select({ email: subscribers.email })
        .from(subscribers)
        .where(eq(subscribers.subscriberId, subscriberId));
    const getPlanDetail = appDB
        .select({
            amount: plans.amount,
            currency: plans.currency,
            status: plans.status,
            type: plans.type,
        })
        .from(plans)
        .where(and(eq(plans.appId, appId), eq(plans.id, validatedBody.planId)));

    const [result, error$3] = await toGoErrorRet(() => Promise.all([getEmailProm, getPlanDetail]))();
    if (error$3 !== null) {
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [emailRet, planDetail] = result;

    if (emailRet.length === 0) {
        return structuredResponse(STATUS_NOT_FOUND, "Subscriber not found");
    }

    if (planDetail.length === 0) {
        return structuredResponse(STATUS_NOT_FOUND, "Plan not found");
    }

    if (planDetail[0].status === "disabled") {
        return structuredResponse(STATUS_BAD_REQUEST, "Plan is currently disabled");
    }

    const orderRef = `${uuidv4()}-${new Date().getTime()}`;
    const sharedMetadata = {
        type: WebHookTypes.PLAN_SUBSCRIPTION as const,
        planId: validatedBody.planId.toString(),
        subscriberId: subscriberId.toString(),
        amount: planDetail[0].amount,
        appId: appId,
        currentDate: dateToString(new Date()),
    };

    if (!cardDetails) {
        const [orderReturn, error$4] = await toGoErrorRet(() => {
            return nombaClient.createOrder({
                order: {
                    orderReference: orderRef,
                    customerEmail: emailRet[0].email,
                    callbackUrl: validatedBody.callbackUrl,
                    amount: planDetail[0].amount,
                    currency: planDetail[0].currency,
                    allowedPaymentMethods: ["Card", "Intl Card"],
                    orderMetaData: {
                        ...sharedMetadata,
                        usedExistingCard: "false",
                    } satisfies PlanSubscriptionWebhook,
                },
                tokenizeCard: true,
            });
        })();

        if (error$4 !== null) {
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        return structuredResponse<CreateSubscriptionResponse>(STATUS_OK, "Success", {
            checkoutLink: orderReturn.data.checkoutLink,
        });
    } else {
        const [, error$4] = await toGoErrorRet(() => {
            return nombaClient.chargeTokenizedCard({
                order: {
                    amount: planDetail[0].amount,
                    currency: planDetail[0].currency,
                    customerEmail: emailRet[0].email,
                    orderReference: orderRef,
                    callbackUrl: validatedBody.callbackUrl,
                    orderMetaData: {
                        ...sharedMetadata,
                        usedExistingCard: "true",
                        cardId: cardDetails.id,
                    } satisfies PlanSubscriptionWebhook,
                },
                tokenKey: cardDetails.token,
            });
        })();

        if (error$4 !== null) {
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        return structuredResponse(STATUS_OK, "Success");
    }
}

//  List subscriptions (with query params like https://<url>?status=active )
export async function GET(req: NextRequest) {}
