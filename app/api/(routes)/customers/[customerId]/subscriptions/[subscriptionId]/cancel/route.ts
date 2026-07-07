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

// Schedule cancellation. (Sets cancel_at_period_end = true;
// but does not instantly kill access).
export async function POST(
    req: NextRequest,
    ctx: RouteContext<"/api/customers/[customerId]/subscriptions/[subscriptionId]/cancel">,
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

    const [, error$3] = await toGoErrorRet(() =>
        appDB
            .update(subscriptions)
            .set({ cancelAtEnd: true })
            .where(
                and(
                    eq(subscriptions.appId, appId),
                    eq(subscriptions.subscriberId, subscriberId),
                    eq(subscriptions.id, subscriptionId),
                ),
            ),
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not schedule subscription cancellation:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse(STATUS_OK, "Success");
}
