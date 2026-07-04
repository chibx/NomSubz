import {
    addToDate,
    FriendlyError,
    logger,
    safeFormdata,
    structuredResponse,
    toGoErrorRet,
    toValidationError,
} from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { decode } from "decode-formdata";
import * as v from "valibot";
import { LoginWith2FASchema } from "@/app/api/lib/validation-schema/schema";
import { appDB } from "@/app/api/lib/db/db";
import { applicationSessions, applications, apps2FASecrets } from "@/app/api/lib/db/schema";
import { safeRandomBytes, SECRET_KEY, signJWT, decrypt, verifyTOTP, verifyJWT } from "@/app/api/lib/auth";
import {
    ACCESSTOKEN_COOKIE,
    DAYS_7,
    DUMMY_500_MESSAGE,
    MINUTES_30,
    REFRESHTOKEN_COOKIE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { JWTField } from "@/app/api/lib/types/types";
import { errors } from "jose";

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
    const [validBody, error$2] = await toGoErrorRet(() => v.parse(LoginWith2FASchema, data))();

    if (error$2 !== null) {
        logger.withTag(req.url).debug("", error$2);
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid request", {}, toValidationError(error$2));
    }

    // Verify the pending token
    const [pendingTokenData, error$3] = await verifyJWT<JWTField>(validBody.pendingToken, SECRET_KEY);

    if (error$3 !== null) {
        logger.withTag(req.url).debug("Invalid pending token:", error$3);
        if (error$3 instanceof errors.JWTExpired) {
            return structuredResponse(STATUS_BAD_REQUEST, "Pending token expired. Please login again.");
        }
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid pending token");
    }

    // Verify the token has the correct purpose
    if (pendingTokenData.payload.purpose !== "mfa_pending") {
        logger.withTag(req.url).debug("Invalid token purpose:", pendingTokenData.payload.purpose);
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid pending token");
    }

    const appId = pendingTokenData.payload.appId;

    // Get the 2FA secret
    const [secretData, error$4] = await toGoErrorRet(() =>
        appDB
            .select({
                encryptedSecret: apps2FASecrets.encryptedSecret,
            })
            .from(apps2FASecrets)
            .where(eq(apps2FASecrets.appId, appId)),
    )();

    if (error$4 !== null) {
        logger.withTag(req.url).error("Database Error:", error$4);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (secretData.length === 0) {
        return structuredResponse(STATUS_BAD_REQUEST, "2FA secret not found");
    }

    const [decryptedSecret, error$5] = await decrypt(secretData[0].encryptedSecret, SECRET_KEY);
    if (error$5 !== null) {
        logger.withTag(req.url).error("Failed to decrypt secret:", error$5);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [, /*isTOTPValid*/ error$6] = await verifyTOTP(decryptedSecret, validBody.token);
    if (error$6 !== null) {
        if (error$6 instanceof FriendlyError) {
            return structuredResponse(error$6.code, error$6.message);
        }
        logger.withTag(req.url).error("Failed to verify TOTP:", error$6);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    // if (!isTOTPValid) {
    //     return structuredResponse(STATUS_BAD_REQUEST, "Invalid TOTP token");
    // }

    // Issue real access token
    const [accessToken, error$7] = await signJWT(
        {
            appId: appId,
            purpose: "access",
        } satisfies JWTField,
        SECRET_KEY,
    );

    if (error$7 !== null) {
        logger.withTag(req.url).error("Failed to generate access token:", error$7);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [result$3, error$8] = await safeRandomBytes(32);
    if (error$8 !== null) {
        logger.withTag(req.url).error("Could not generate refresh token");
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const cookieStore = await cookies();

    const accessTokenExp = addToDate(MINUTES_30);
    const refreshTokenExp = addToDate(DAYS_7);
    const refreshToken = result$3.toString("base64");

    const [, error$9] = await toGoErrorRet(() =>
        appDB.insert(applicationSessions).values({
            appId: appId,
            expiresAt: refreshTokenExp,
            ip: ipAddr,
            token: refreshToken,
        }),
    )();

    if (error$9 !== null) {
        logger.withTag(req.url).error("Could not save login refresh token: ", error$9);
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
