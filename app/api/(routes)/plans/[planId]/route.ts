import { NextRequest } from "next/server";
import { getAppId } from "@/app/api/lib/auth";
import {
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_NOT_FOUND,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import { dateToString, structuredResponse } from "@/app/api/lib/utils/utils";
import { toGoErrorRet } from "@/app/api/lib/utils/utils";
import { plans } from "@/app/api/lib/db/tables";
import { appDB } from "@/app/api/lib/db/db";
import { and, eq } from "drizzle-orm";
import { GetPlanResponse } from "@/app/api/lib/types/response";

// Get details of a specific plan.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/plans/[planId]">) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, "Unauthorized");
    }

    const { planId: pId } = await ctx.params;
    const [planId, error$1] = await toGoErrorRet(() => BigInt(pId))();

    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid plan id, got ${pId}`);
    }

    const [result, error$2] = await toGoErrorRet(() => {
        return appDB
            .select()
            .from(plans)
            .where(and(eq(plans.appId, appId), eq(plans.id, planId)));
    })();

    if (error$2 !== null) {
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, "Failed to fetch plan info");
    }

    if (result.length == 0) {
        return structuredResponse(STATUS_NOT_FOUND, `Plan with id ${planId} not found`);
    }

    const plan = result[0];
    return structuredResponse<GetPlanResponse>(STATUS_OK, "Success", {
        id: plan.id.toString(),
        name: plan.name,
        amount: plan.amount,
        currency: plan.currency,
        type: plan.type,
        details: plan.details,
        status: plan.status,
        createdAt: dateToString(plan.createdAt),
        updatedAt: dateToString(plan.updatedAt),
    });
}
