import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { plans, subscriberCards, subscribers, subscriptions } from "@/app/api/lib/db/schema";
import { CreateSubscriptionResponse, ListSubscriptionsResponse } from "@/app/api/lib/types/response";
import { PlanSubscriptionWebhook, WebHookTypes } from "@/app/api/lib/types/types";
import {
    DUMMY_401_MESSAGE,
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_FORBIDDEN,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_NOT_FOUND,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import {
    dateToString,
    logger,
    nombaClient,
    structuredResponse,
    toGoErrorRet,
    toValidationError,
} from "@/app/api/lib/utils/utils";
import { isSubscriberForApp, updateCustomerResidual } from "@/app/api/lib/utils/db";
import { CreateSubscriptionSchema } from "@/app/api/lib/validation-schema/schema";
import { and, eq, gt, desc, asc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { uuidv4 } from "uuidv7";
import * as v from "valibot";
import Decimal from "decimal.js";

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

function computeFunds(
    planAmount: string,
    residualAmount: string,
): { amountToPay: string | undefined; newResidual: string } {
    const planAmountDec = new Decimal(planAmount);
    const residualDec = new Decimal(residualAmount);

    if (planAmountDec.equals(residualDec)) {
        // No payment needed, residual fully covers plan
        return { amountToPay: undefined, newResidual: "0" };
    } else if (planAmountDec.greaterThan(residualDec)) {
        // Payment needed, residual is less than plan amount
        return { amountToPay: planAmountDec.sub(residualDec).toString(), newResidual: "0" };
    } else {
        // Payment not needed, residual is greater than plan amount
        return { amountToPay: undefined, newResidual: residualDec.sub(planAmountDec).toString() };
    }
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
        .select({ email: subscribers.email, residualAmount: subscribers.residualAmount })
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
    const { amountToPay, newResidual } = computeFunds(planDetail[0].amount, emailRet[0].residualAmount);

    const sharedMetadata = {
        type: WebHookTypes.PLAN_SUBSCRIPTION as const,
        planId: validatedBody.planId.toString(),
        subscriberId: subscriberId.toString(),
        planAmount: planDetail[0].amount,
        amountToPay,
        appId: appId,
        currentDate: dateToString(new Date()),
    };

    if (!cardDetails) {
        let checkoutLink: string | undefined;
        if (amountToPay) {
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
                            amountToPay,
                            usedExistingCard: "false",
                        } satisfies PlanSubscriptionWebhook,
                    },
                    tokenizeCard: true,
                });
            })();

            if (error$4 !== null) {
                return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
            }

            checkoutLink = orderReturn.data.checkoutLink;
        }

        const [, error$5] = await toGoErrorRet(() => updateCustomerResidual(subscriberId, newResidual))();
        if (error$5 !== null) {
            logger.error("Failed to update customer residual", error$5);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        return structuredResponse<CreateSubscriptionResponse | null>(
            STATUS_OK,
            "Success",
            checkoutLink
                ? {
                      checkoutLink,
                  }
                : null,
        );
    } else {
        if (amountToPay) {
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
                            amountToPay,
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
        }

        const [, error$5] = await toGoErrorRet(() => updateCustomerResidual(subscriberId, newResidual))();
        if (error$5 !== null) {
            logger.error("Failed to update customer residual", error$5);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }
        return structuredResponse(STATUS_OK, "Success");
    }
}

//  List subscriptions (with query params like https://<url>?status=active )
export async function GET(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]/subscriptions">) {
    const { customerId } = await ctx.params;
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [subscriberId, error$1] = await toGoErrorRet(() => BigInt(customerId))();
    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid customer id, got ${customerId}`);
    }

    const [isAuthorized, error$2] = await isSubscriberForApp(appId, subscriberId);

    if (error$2 !== null) {
        logger.withTag(req.url).error("Could not verify app to subscriber privilege from db:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (isAuthorized === false) {
        return structuredResponse(STATUS_FORBIDDEN, "No rights to access this subscriber's data");
    }

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const countParam = searchParams.get("count");
    const cursor = searchParams.get("cursor");
    const statusFilter = searchParams.get("status");
    const order = searchParams.get("order") || "desc";

    const page = pageParam ? parseInt(pageParam, 10) || 1 : 1;
    const count = countParam ? Math.min(parseInt(countParam, 10) || 10, 30) : 10; // Max 30 per page

    const conditions = [eq(subscriptions.subscriberId, subscriberId)];

    if (statusFilter) {
        switch (statusFilter) {
            case "pending":
                conditions.push(eq(subscriptions.status, "past_due"));
                break;
            case "active":
                conditions.push(eq(subscriptions.status, "active"));
                break;
            case "cancelled":
                conditions.push(eq(subscriptions.status, "cancelled"));
                break;
            case "paused":
                conditions.push(eq(subscriptions.status, "paused"));
                break;
        }
    }

    if (cursor) {
        conditions.push(gt(subscriptions.id, cursor));
    }

    const [result, error$3] = await toGoErrorRet(
        () =>
            appDB
                .select({
                    id: subscriptions.id,
                    amount: subscriptions.amount,
                    status: subscriptions.status,
                    startTime: subscriptions.startTime,
                    endTime: subscriptions.endTime,
                    createdAt: subscriptions.createdAt,
                    cancelAtEnd: subscriptions.cancelAtEnd,
                    planId: subscriptions.planId,
                    planName: plans.name,
                    planType: plans.type,
                })
                .from(subscriptions)
                .innerJoin(plans, eq(plans.id, subscriptions.planId))
                .where(and(...conditions))
                .orderBy(order === "asc" ? asc(subscriptions.createdAt) : desc(subscriptions.createdAt))
                .limit(count + 1), // Fetch one extra to determine if there's a next page
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not list subscriptions:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const hasNextPage = result.length > count;
    // Remove the last item if there's a next page (without cloning the arr in memory)
    if (hasNextPage) {
        result.splice(result.length - 1, 1);
    }
    const subscriptionsList = result;

    const lastCursor = subscriptionsList.length > 0 ? subscriptionsList[subscriptionsList.length - 1].id : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const formattedList = subscriptionsList.map((sub) => ({
        id: sub.id,
        amount: sub.amount,
        status: sub.status,
        startTime: dateToString(sub.startTime),
        endTime: dateToString(sub.endTime),
        createdAt: dateToString(sub.createdAt),
        cancelAtEnd: sub.cancelAtEnd || false,
        planId: sub.planId.toString(),
        planName: sub.planName,
        planType: sub.planType,
    }));

    return structuredResponse<ListSubscriptionsResponse>(STATUS_OK, "Success", {
        subscriptions: formattedList,
        nextPage,
        cursor: lastCursor,
    });
}
