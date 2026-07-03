import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { subscriberCards } from "@/app/api/lib/db/schema";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    DUMMY_500_MESSAGE,
    STATUS_FORBIDDEN,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import { isSubscriberForApp } from "@/app/api/lib/utils/db";
import { structuredResponse, toGoErrorRet, logger } from "@/app/api/lib/utils/utils";
import { and, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";

// Set a specific card as the default for upcoming subscriptions.
export async function PUT(
    req: NextRequest,
    ctx: RouteContext<"/api/customers/[customerId]/payment-methods/[cardId]/default">,
) {
    // TODO: Strictly rate-limit
    const { customerId, cardId } = await ctx.params;
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

    const [, error$3] = await toGoErrorRet(() => {
        return appDB
            .update(subscriberCards)
            .set({ isDefault: sql`${subscriberCards.id} = ${cardId}` })
            .where(
                and(
                    eq(subscriberCards.appId, appId),
                    eq(subscriberCards.id, cardId),
                    eq(subscriberCards.subscriberId, subscriberId),
                ),
            );
    })();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not set defaults for the subscriber's card:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse(STATUS_OK, "Success");
}
