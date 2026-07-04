import { logger, safeFormdata, structuredResponse, toGoErrorRet, toValidationError } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { decode } from "decode-formdata";
import * as v from "valibot";
import { TwoFAVerifySchema } from "@/app/api/lib/validation-schema/schema";
import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { applications, apps2FASecrets } from "@/app/api/lib/db/schema";
import { eq } from "drizzle-orm";
import {
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import { decrypt, verifyTOTP, SECRET_KEY } from "@/app/api/lib/auth";

/**
 * This route endpoint is to test if the user has indeed saved the backup codes
 * and/or has added the OTP to his authenticator app
 */
export async function POST(req: NextRequest) {
    const appId = getAppId(req);
    if (!appId) {
        return structuredResponse(STATUS_UNAUTHORIZED, "Unauthorized");
    }

    const [formData, error$1] = await safeFormdata(req);
    if (error$1 != null) {
        logger.withTag(req.url).debug("Failed to parse formdata", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const data = decode(formData);
    const [validBody, error$2] = await toGoErrorRet(() => v.parse(TwoFAVerifySchema, data))();

    if (error$2 !== null) {
        logger.withTag(req.url).debug("", error$2);
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid request", {}, toValidationError(error$2));
    }

    const [appData, error$3] = await toGoErrorRet(() =>
        appDB
            .select({
                id: applications.id,
                is2FAEnabled: applications.is2FAEnabled,
            })
            .from(applications)
            .where(eq(applications.id, appId)),
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Database Error:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (appData.length === 0) {
        return structuredResponse(STATUS_BAD_REQUEST, "Application not found");
    }

    const app = appData[0];

    if (app.is2FAEnabled) {
        return structuredResponse(STATUS_BAD_REQUEST, "2FA is already enabled");
    }

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
        return structuredResponse(
            STATUS_BAD_REQUEST,
            "2FA setup not initiated. Please call POST /api/auth/2fa/setup first",
        );
    }

    const [decryptedSecret, error$5] = await decrypt(secretData[0].encryptedSecret, SECRET_KEY);
    if (error$5 !== null) {
        logger.withTag(req.url).error("Failed to decrypt secret:", error$5);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [isValid, error$6] = await verifyTOTP(decryptedSecret, validBody.token);
    if (error$6 !== null) {
        logger.withTag(req.url).error("Failed to verify TOTP:", error$6);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (!isValid) {
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid token. Please try again.");
    }

    // Enable 2FA for the application
    const [, error$7] = await toGoErrorRet(() =>
        appDB
            .update(applications)
            .set({
                is2FAEnabled: true,
            })
            .where(eq(applications.id, appId)),
    )();

    if (error$7 !== null) {
        logger.withTag(req.url).error("Failed to enable 2FA:", error$7);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse(STATUS_OK, "2FA enabled successfully");
}
