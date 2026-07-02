import { addToDate, logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import * as v from "valibot";
import { appDB } from "@/app/api/lib/db/db";
import { applicationSessions } from "@/app/api/lib/db/schema";
import { safeRandomBytes, SECRET_KEY, signJWT } from "@/app/api/lib/auth";
import {
    ACCESSTOKEN_COOKIE,
    DAYS_7,
    DUMMY_500_MESSAGE,
    REFRESHTOKEN_COOKIE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { JWTField } from "@/app/api/lib/types/types";
import { ERR_EXPIRED_SESSION, ERR_INVALID_ACCESSTOKEN, ERR_NO_ACCESSTOKEN } from "@/app/shared/constants";
import { decodeJwt } from "jose";

// function deleteAuthCookies(cookieStore: ReadonlyRequestCookies) {
//     cookieStore.delete(ACCESSTOKEN_COOKIE);
//     cookieStore.delete(REFRESHTOKEN_COOKIE);
// }

export async function POST(req: NextRequest) {
    const headers = new Headers(req.headers);
    const ipAddr = headers.get("X-Forwarded-For");
    const cookieStore = await cookies();
    if (ipAddr == null || !v.IP_REGEX.test(ipAddr)) {
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid request");
    }
    const refreshToken = cookieStore.get(REFRESHTOKEN_COOKIE)?.value;
    if (refreshToken == undefined) {
        return structuredResponse(STATUS_UNAUTHORIZED, "Unauthorized");
    }

    const accessToken = cookieStore.get(ACCESSTOKEN_COOKIE)?.value;
    if (accessToken == undefined) return structuredResponse(STATUS_UNAUTHORIZED, ERR_NO_ACCESSTOKEN);
    const [parsedAccessToken, error$1] = await toGoErrorRet(() => decodeJwt<JWTField>(accessToken))();
    if (error$1 != null) {
        logger.withTag(req.url).error("Decode JWT error:", error$1);
        return structuredResponse(STATUS_BAD_REQUEST, ERR_INVALID_ACCESSTOKEN);
    }

    if (!("appId" in parsedAccessToken)) {
        return structuredResponse(STATUS_BAD_REQUEST, ERR_INVALID_ACCESSTOKEN);
    }

    const [result, error$2] = await toGoErrorRet(() =>
        appDB
            .select({
                appId: applicationSessions.appId,
                expiresAt: applicationSessions.expiresAt,
                ip: applicationSessions.ip,
            })
            .from(applicationSessions)
            .where(
                and(
                    eq(applicationSessions.token, refreshToken),
                    eq(applicationSessions.appId, parsedAccessToken.appId),
                ),
            ),
    )();

    if (error$2 !== null) {
        logger.withTag(req.url).error("Error fetching session data:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (result.length === 0) {
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid session token");
    }

    const appSession = result[0];

    if (appSession.expiresAt.getTime() < new Date().getTime()) {
        return structuredResponse(STATUS_UNAUTHORIZED, ERR_EXPIRED_SESSION);
    }

    const [newAccessToken, error$3] = await signJWT(
        {
            appId: appSession.appId,
        } satisfies JWTField,
        SECRET_KEY,
    );

    if (error$3 !== null) {
        logger.withTag(req.url).error(error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [result$3, error$4] = await safeRandomBytes(32);
    if (error$4 !== null) {
        logger.withTag(req.url).error("Could not generate refresh token");
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const accessTokenExp = addToDate(DAYS_7);
    const refreshTokenExp = addToDate(DAYS_7);
    const newRefreshToken = result$3.toString("base64");

    const [, error$5] = await toGoErrorRet(async () =>
        appDB.transaction(async (tx) => {
            await Promise.allSettled([
                tx
                    .delete(applicationSessions)
                    .where(
                        and(
                            eq(applicationSessions.token, refreshToken),
                            eq(applicationSessions.appId, parsedAccessToken.appId),
                        ),
                    ),
                tx.insert(applicationSessions).values({
                    appId: appSession.appId,
                    expiresAt: refreshTokenExp,
                    ip: ipAddr,
                    token: refreshToken,
                }),
            ]);
        }),
    )();

    if (error$5 !== null) {
        logger.withTag(req.url).error("Could not save login refresh token: ", error$5);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    cookieStore.set(ACCESSTOKEN_COOKIE, newAccessToken, {
        httpOnly: true,
        secure: true,
        expires: accessTokenExp,
        sameSite: "lax",
    });

    cookieStore.set(REFRESHTOKEN_COOKIE, newRefreshToken, {
        httpOnly: true,
        secure: true,
        expires: refreshTokenExp,
        sameSite: "lax",
    });

    return structuredResponse(STATUS_OK, "Success");
}
