import {
    addToDate,
    logger,
    safeFormdata,
    structuredResponse,
    toGoErrorRet,
    toValidationError,
} from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { decode } from "decode-formdata";
import * as v from "valibot";
import { LoginSchema } from "@/app/api/lib/validation-schema/schema";
import { appDB } from "@/app/api/lib/db/db";
import { applicationSessions, applications } from "@/app/api/lib/db/schema";
import { safeRandomBytes, SECRET_KEY, signJWT, verifyHash } from "@/app/api/lib/auth";
import {
    ACCESSTOKEN_COOKIE,
    DAYS_7,
    DUMMY_500_MESSAGE,
    MINUTES_30,
    MINUTES_5,
    REFRESHTOKEN_COOKIE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { JWTField } from "@/app/api/lib/types/types";
import { LoginResponse } from "@/app/api/lib/types/response";

export async function POST(req: NextRequest) {
    const headers = new Headers(req.headers);
    const ipAddr = headers.get("X-Forwarded-For");
    if (ipAddr == null || !v.IP_REGEX.test(ipAddr)) {
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid request");
    }
    const [formData, error$1] = await safeFormdata(req);
    if (error$1 != null) {
        logger.withTag(req.url).debug("Failed to parse formdata", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const data = decode(formData);
    const [validBody, error$2] = await toGoErrorRet(() => v.parse(LoginSchema, data))();

    if (error$2 !== null) {
        logger.withTag(req.url).debug("", error$2);
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid request", {}, toValidationError(error$2));
    }

    const [result$2, error$3] = await toGoErrorRet(() =>
        appDB
            .select({
                appId: applications.id,
                email: applications.email,
                password: applications.password,
                is2FAEnabled: applications.is2FAEnabled,
            })
            .from(applications)
            .where(eq(applications.email, validBody.email)),
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Database Error:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (result$2.length == 0) return structuredResponse(STATUS_BAD_REQUEST, "Invalid email or password");

    const appData = result$2[0];

    const [isValid, error$4] = await verifyHash(appData.password, validBody.password);

    if (error$4 !== null) {
        logger.withTag(req.url).error(error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (!isValid) {
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid email or password");
    }

    // If 2FA is enabled, issue a short-lived pending MFA token
    if (appData.is2FAEnabled) {
        const [pendingToken, error$5] = await signJWT(
            {
                appId: appData.appId,
                purpose: "mfa_pending",
            } satisfies JWTField,
            SECRET_KEY,
            MINUTES_5,
        );

        if (error$5 !== null) {
            logger.withTag(req.url).error("Failed to generate pending MFA token:", error$5);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        return structuredResponse<LoginResponse>(STATUS_OK, "2FA required", {
            requires2FA: true,
            pendingToken: pendingToken,
        });
    }

    const [accessToken, error$6] = await signJWT(
        {
            appId: appData.appId,
        } satisfies JWTField,
        SECRET_KEY,
    );

    if (error$6 !== null) {
        logger.withTag(req.url).error(error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [result$3, error$7] = await safeRandomBytes(32);
    if (error$7 !== null) {
        logger.withTag(req.url).error("Could not generate refresh token");
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const cookieStore = await cookies();

    const accessTokenExp = addToDate(MINUTES_30);
    const refreshTokenExp = addToDate(DAYS_7);
    const refreshToken = result$3.toString("base64");

    const [, error$8] = await toGoErrorRet(() =>
        appDB.insert(applicationSessions).values({
            appId: appData.appId,
            expiresAt: refreshTokenExp,
            ip: ipAddr,
            token: refreshToken,
        }),
    )();

    if (error$8 !== null) {
        logger.withTag(req.url).error("Could not save login refresh token: ", error$8);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    cookieStore.set(ACCESSTOKEN_COOKIE, accessToken, {
        httpOnly: true,
        secure: true,
        expires: accessTokenExp,
        sameSite: "lax",
    });

    cookieStore.set(REFRESHTOKEN_COOKIE, refreshToken, {
        httpOnly: true,
        secure: true,
        expires: refreshTokenExp,
        sameSite: "lax",
    });

    return structuredResponse(STATUS_OK, "Success");
}
