import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { subscribers } from "@/app/api/lib/db/schema";
import { GetSubscriberResponse } from "@/app/api/lib/types/response";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_BAD_REQUEST,
    STATUS_NOT_FOUND,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import { dateToString, logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { and, eq } from "drizzle-orm";
import { NextRequest } from "next/server";

// Get a specific customer (Admin/Downstream service)
export async function GET(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]">) {
    // logger.withTag(req.url).debug("", error$2)
    const { customerId } = await ctx.params;

    const [subscriberId, error$1] = await toGoErrorRet(() => BigInt(customerId))();

    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid customer id, got ${customerId}`);
    }

    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [result, error$2] = await toGoErrorRet(() => {
        return appDB
            .select()
            .from(subscribers)
            .where(and(eq(subscribers.appId, appId), eq(subscribers.subscriberId, subscriberId)));
    })();
    if (error$2 !== null || result.length == 0 /** Should not occur */) {
        logger.withTag(req.url).withTag(subscriberId.toString()).error(`Could not get subscriber`, error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, "Failed to fetch subscriber info");
    }

    if (result.length == 0) {
        return structuredResponse(STATUS_NOT_FOUND, `Subscriber with id ${customerId} not found`);
    }

    const subscriber = result[0];
    return structuredResponse<GetSubscriberResponse>(STATUS_OK, "Success", {
        appId: subscriber.appId,
        subscriberId: subscriber.subscriberId.toString(),
        userId: subscriber.userId,
        createdAt: dateToString(subscriber.createdAt),
        deletedAt: dateToString(subscriber.deletedAt),
    });
}
