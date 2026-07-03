import { getAppId } from "@/app/api/lib/auth";
import { GetSubscriptionResponse } from "@/app/api/lib/types/response";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_BAD_REQUEST,
    DUMMY_500_MESSAGE,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_NOT_FOUND,
    STATUS_OK,
    STATUS_FORBIDDEN,
    DUMMY_400_MESSAGE,
} from "@/app/api/lib/utils/constants";
import { getSubscription, isSubscriberForApp, updateSubscription } from "@/app/api/lib/utils/db";
import { logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { parseDrizzleError, toValidationError } from "@/app/api/lib/utils/utils";
import { ParsedDbErrorType } from "@/app/api/lib/types/types";
import { UpdateSubscriptionDetailSchema } from "@/app/api/lib/validation-schema/schema";
import { parse } from "valibot";

// Get details of a specific subscription
export async function GET(
    req: NextRequest,
    ctx: RouteContext<"/api/customers/[customerId]/subscriptions/[subscriptionId]">,
) {
    const { customerId, subscriptionId } = await ctx.params;
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }
    const [subscriberId, error$1] = await toGoErrorRet(() => BigInt(customerId))();

    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid customer id, got ${customerId}`);
    }

    const [result, error$2] = await getSubscription(appId, subscriberId, subscriptionId);
    if (error$2 !== null) {
        logger.withTag(req.url).error("Could not verify app to subscriber privilege from db:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (result.length == 0) {
        return structuredResponse(STATUS_NOT_FOUND, `Subscription with id ${subscriptionId} not found`);
    }

    return structuredResponse<GetSubscriptionResponse>(STATUS_OK, "Success", result[0]);
}

// Upgrade or downgrade a plan. (This triggers your proration math).
export async function PUT(
    req: NextRequest,
    ctx: RouteContext<"/api/customers/[customerId]/subscriptions/[subscriptionId]">,
) {
    // TODO: Strictly rate-limit
    const { customerId, subscriptionId } = await ctx.params;
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

    const [body, error$3] = await toGoErrorRet(() => req.json())();
    if (error$3 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, DUMMY_400_MESSAGE);
    }

    const [validatedBody, error$4] = await toGoErrorRet(() => parse(UpdateSubscriptionDetailSchema, body))();
    if (error$4 !== null) {
        const validationErrors = toValidationError(error$4);
        return structuredResponse(STATUS_BAD_REQUEST, "invalid values provided", {}, validationErrors);
    }

    const [, error$5] = await updateSubscription({
        appId: appId,
        subscriberId: subscriberId,
        subscriptionId: subscriptionId,
        cardId: validatedBody.cardId,
        planId: validatedBody.planId,
    });

    if (error$5 !== null) {
        const pgError = parseDrizzleError(error$5);
        if (pgError === null || pgError.type === ParsedDbErrorType.UNKNOWN_DB_ERROR) {
            logger.withTag(req.url).error("Could not update subscription:", error$5);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }
        if (pgError.type === ParsedDbErrorType.FOREIGN_KEY_VIOLATION) {
            return structuredResponse(STATUS_BAD_REQUEST, `planId ${validatedBody.planId} is invalid`);
        }
    }

    return structuredResponse(STATUS_OK, "Success");
}
