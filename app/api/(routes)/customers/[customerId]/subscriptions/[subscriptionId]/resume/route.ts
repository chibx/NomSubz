import { NextRequest } from "next/server";
import { structuredResponse, toGoErrorRet, logger } from "@/app/api/lib/utils/utils";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    DUMMY_500_MESSAGE,
    STATUS_FORBIDDEN,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { subscriptions } from "@/app/api/lib/db/schema";
import { isSubscriberForApp } from "@/app/api/lib/utils/db";
import { and, eq } from "drizzle-orm";

// Reactivate a paused subscription.
export async function POST(
    req: NextRequest,
    ctx: RouteContext<"/api/customers/[customerId]/subscriptions/[subscriptionId]/resume">,
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

    const [isAuthorized, error$2] = await isSubscriberForApp(appId, subscriberId);

    if (error$2 !== null) {
        logger.withTag(req.url).error("Could not verify app to subscriber privilege from db:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (isAuthorized === false) {
        return structuredResponse(STATUS_FORBIDDEN, "No rights to access this subscriber's data");
    }

    const [currentSub, error$3] = await toGoErrorRet(() =>
        appDB
            .select({ status: subscriptions.status })
            .from(subscriptions)
            .where(and(eq(subscriptions.subscriberId, subscriberId), eq(subscriptions.id, subscriptionId))),
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not fetch subscription status:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (currentSub.length === 0) {
        return structuredResponse(STATUS_BAD_REQUEST, "Subscription not found");
    }

    const currentStatus = currentSub[0].status;

    if (currentStatus === "cancelled" || currentStatus === "pending") {
        return structuredResponse(
            STATUS_BAD_REQUEST,
            `Cannot resume subscription with status "${currentStatus}". Only paused subscriptions can be resumed. Start a new subscription instead.`,
        );
    }

    const [, error$4] = await toGoErrorRet(() =>
        appDB
            .update(subscriptions)
            .set({ status: "active" })
            .where(and(eq(subscriptions.subscriberId, subscriberId), eq(subscriptions.id, subscriptionId))),
    )();

    if (error$4 !== null) {
        logger.withTag(req.url).error("Could not resume subscription:", error$4);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse(STATUS_OK, "Success");
}
