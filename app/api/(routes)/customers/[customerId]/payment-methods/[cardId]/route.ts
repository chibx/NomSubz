import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { subscriberCards } from "@/app/api/lib/db/schema";
import { ParsedDbErrorType } from "@/app/api/lib/types/types";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    DUMMY_500_MESSAGE,
    STATUS_FORBIDDEN,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import {
    structuredResponse,
    toGoErrorRet,
    isSubscriberForApp,
    logger,
    parseDrizzleError,
} from "@/app/api/lib/utils/utils";
import { ERR_FIRST_UNBIND_CARD } from "@/app/shared/constants";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

//  Remove a card.
export async function DELETE(
    req: NextRequest,
    ctx: RouteContext<"/api/customers/[customerId]/payment-methods/[cardId]">,
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
            .delete(subscriberCards)
            .where(
                and(
                    eq(subscriberCards.appId, appId),
                    eq(subscriberCards.id, cardId),
                    eq(subscriberCards.subscriberId, subscriberId),
                ),
            );
    })();

    if (error$3 !== null) {
        const pgError = parseDrizzleError(error$3);
        if (pgError === null || pgError.type === ParsedDbErrorType.UNKNOWN_DB_ERROR) {
            logger.withTag(req.url).error("Could not delete subscriber card from db:", error$3);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        if (pgError.type === ParsedDbErrorType.FOREIGN_KEY_VIOLATION) {
            return structuredResponse(STATUS_BAD_REQUEST, ERR_FIRST_UNBIND_CARD);
        }
    }

    return structuredResponse(STATUS_OK, "Success");
}
