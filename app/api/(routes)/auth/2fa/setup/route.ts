import { logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { applications, apps2FASecrets, apps2FACodes } from "@/app/api/lib/db/schema";
import { eq } from "drizzle-orm";
import {
    DUMMY_500_MESSAGE,
    OTP_BACKUP_CODES_COUNT,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import {
    generateTOTPSecret,
    generateTOTPURI,
    generateBackupCodes,
    encrypt,
    hashText,
    SECRET_KEY,
} from "@/app/api/lib/auth";
import { Agree2FAResponse } from "@/app/api/lib/types/response";

export async function POST(req: NextRequest) {
    const appId = getAppId(req);
    if (!appId) {
        return structuredResponse(STATUS_UNAUTHORIZED, "Unauthorized");
    }

    const [appData, error$1] = await toGoErrorRet(() =>
        appDB
            .select({
                id: applications.id,
                email: applications.email,
                name: applications.name,
                is2FAEnabled: applications.is2FAEnabled,
            })
            .from(applications)
            .where(eq(applications.id, appId)),
    )();

    if (error$1 !== null) {
        logger.withTag(req.url).error("Database Error:", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (appData.length === 0) {
        return structuredResponse(STATUS_BAD_REQUEST, "Application not found");
    }

    const app = appData[0];

    if (app.is2FAEnabled) {
        return structuredResponse(STATUS_BAD_REQUEST, "2FA is already enabled");
    }

    // Generate TOTP secret
    const [secret, error$2] = await generateTOTPSecret(app.name, app.email);
    if (error$2 !== null) {
        logger.withTag(req.url).error("Failed to generate TOTP secret:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const secretString = secret.base32;

    // Generate TOTP URI for QR code
    const [totpURI, error$3] = await generateTOTPURI(secretString, app.name, app.email);
    if (error$3 !== null) {
        logger.withTag(req.url).error("Failed to generate TOTP URI:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    // Generate backup codes
    const [backupCodes, error$4] = await generateBackupCodes(OTP_BACKUP_CODES_COUNT);
    if (error$4 !== null) {
        logger.withTag(req.url).error("Failed to generate backup codes:", error$4);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    // Encrypt the secret
    const [encryptedSecret, error$5] = await encrypt(secretString, SECRET_KEY);
    if (error$5 !== null) {
        logger.withTag(req.url).error("Failed to encrypt secret:", error$5);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    // Hash backup codes
    const hashedBackupCodes: string[] = [];
    for (const code of backupCodes) {
        const [hashedCode, error$6] = await hashText(code);
        if (error$6 !== null) {
            logger.withTag(req.url).error("Failed to hash backup code:", error$6);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }
        hashedBackupCodes.push(hashedCode);
    }

    // Store in database
    const [, error$7] = await toGoErrorRet(() =>
        appDB.transaction(async (tx) => {
            // Delete any existing 2FA data for this app
            await Promise.all([
                tx.delete(apps2FASecrets).where(eq(apps2FASecrets.appId, appId)),
                tx.delete(apps2FACodes).where(eq(apps2FACodes.appId, appId)),
            ]);

            const promises: Promise<unknown>[] = [];
            // Insert new secret
            promises.push(
                tx.insert(apps2FASecrets).values({
                    appId: appId,
                    encryptedSecret: encryptedSecret,
                }),
            );

            // Insert backup codes
            for (const hashedCode of hashedBackupCodes) {
                promises.push(
                    tx.insert(apps2FACodes).values({
                        appId: appId,
                        hashedCode: hashedCode,
                    }),
                );
            }

            await Promise.all(promises);
        }),
    )();

    if (error$7 !== null) {
        logger.withTag(req.url).error("Failed to store 2FA data:", error$7);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse<Agree2FAResponse>(STATUS_OK, "2FA setup initiated", {
        secret: secretString,
        totpURI: totpURI,
        backupCodes: backupCodes,
    });
}
