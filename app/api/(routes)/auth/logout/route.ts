import { logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { appDB } from "@/app/api/lib/db/db";
import { applicationSessions } from "@/app/api/lib/db/schema";
import { getAppId } from "@/app/api/lib/auth";
import { ACCESSTOKEN_COOKIE, REFRESHTOKEN_COOKIE, STATUS_OK } from "@/app/api/lib/utils/constants";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();

    try {
        const appId = getAppId(req);
        const refreshToken = cookieStore.get(REFRESHTOKEN_COOKIE);

        if (appId === null || refreshToken === undefined) {
            return structuredResponse(STATUS_OK, "");
        }

        const [, error] = await toGoErrorRet(() =>
            appDB
                .delete(applicationSessions)
                .where(and(eq(applicationSessions.token, refreshToken.value), eq(applicationSessions.appId, appId))),
        )();

        if (error !== null) {
            logger.withTag(req.url).error("Database Error:", error);
        }
    } finally {
        cookieStore.delete(REFRESHTOKEN_COOKIE);
        cookieStore.delete(ACCESSTOKEN_COOKIE);
    }

    return structuredResponse(STATUS_OK, "Success");
}
