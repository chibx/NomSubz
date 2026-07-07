import { eq, gte, lte, and, desc, SQL } from "drizzle-orm";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_OK,
    STATUS_INTERNAL_SERVER_ERROR,
    DUMMY_500_MESSAGE,
} from "@/app/api/lib/utils/constants";
import { structuredResponse, toGoErrorRet, logger } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { getAppId } from "../../lib/auth";
import { appDB } from "../../lib/db/db";
import { analyticsTable } from "../../lib/db/schema";
import { GetAnalyticsResponse } from "../../lib/types/response";
import { Analytics } from "../../lib/types/types";
import { Decimal } from "decimal.js";

export async function GET(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get("start_date");
    const endDateParam = searchParams.get("end_date");
    const periodTypeParam = searchParams.get("periodType");

    const conditions: SQL[] = [];

    if (startDateParam) {
        const startDate = new Date(startDateParam);
        if (!isNaN(startDate.getTime())) {
            conditions.push(gte(analyticsTable.date, startDate));
        }
    }

    if (endDateParam) {
        const endDate = new Date(endDateParam);
        if (!isNaN(endDate.getTime())) {
            conditions.push(lte(analyticsTable.date, endDate));
        }
    }

    if (periodTypeParam) {
        const periodType = parseInt(periodTypeParam, 10);
        if (!isNaN(periodType)) {
            conditions.push(eq(analyticsTable.periodType, periodType));
        }
    }

    const [result, error] = await toGoErrorRet(() =>
        appDB
            .select({
                date: analyticsTable.date,
                periodType: analyticsTable.periodType,
                totalRevenue: analyticsTable.totalRevenue,
                newUsers: analyticsTable.newUsers,
                lostUsers: analyticsTable.lostUsers,
                ongoingSubscriptions: analyticsTable.ongoingSubscriptions,
            })
            .from(analyticsTable)
            .where(and(eq(analyticsTable.appId, appId), ...(conditions.length > 0 ? conditions : [])))
            .orderBy(desc(analyticsTable.date)),
    )();

    if (error !== null) {
        logger.withTag(req.url).error("Could not fetch analytics:", error);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const analytics = result.map<Analytics>((row) => ({
        totalRevenue: new Decimal(row.totalRevenue).toNumber(),
        newUsers: row.newUsers,
        lostUsers: row.lostUsers,
        ongoingSubscriptions: row.ongoingSubscriptions,
    }));

    return structuredResponse<GetAnalyticsResponse>(STATUS_OK, "Success", {
        analytics,
    });
}
