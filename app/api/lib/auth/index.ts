import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { hash, verify } from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { APP_NAME } from "@/app/shared/constants";
import { addToDate, toGoErrorRet, getEnv, FriendlyError } from "../utils/utils";
import {
    APIKEY_LENGTH,
    APIKEY_PREFIX_LENGTH,
    APIKEY_SECRET_LENGTH,
    APPID_KEY,
    ERR_INVALID_APIKEY,
    MINUTES_30,
    STATUS_BAD_REQUEST,
} from "../utils/constants";
import { NextRequest } from "next/server";
import { appDB } from "../db/db";
import { appApiKeys } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { TOTP } from "otpauth";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 12 bytes is the standard and most efficient size for GCM

export const SECRET_KEY = Buffer.from(getEnv("SECRET_KEY"), "base64");

export function getAppId(request: NextRequest) {
    return request.headers.get(APPID_KEY);
}

export const encrypt = toGoErrorRet((text: string, key: Buffer) => {
    const iv = randomBytes(IV_LENGTH);

    const cipher = createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, "utf8", "base64");
    encrypted += cipher.final("base64");

    const authTag = cipher.getAuthTag().toString("base64");

    return `${iv.toString("base64")}:${authTag}:${encrypted}`;
});

export const decrypt = toGoErrorRet((encryptedPayload: string, key: Buffer) => {
    const [ivHex, authTagHex, ciphertextHex] = encryptedPayload.split(":");

    if (!ivHex || !authTagHex || !ciphertextHex) {
        throw new Error("Invalid encrypted payload format.");
    }

    const iv = Buffer.from(ivHex, "base64");
    const authTag = Buffer.from(authTagHex, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "base64", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
});

export const generateOTPBackupCode = toGoErrorRet(() => {
    // Base32 alphabet excluding confusing characters: O, 0, I, 1
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = randomBytes(10);
    let code = "";

    for (let i = 0; i < 10; i++) {
        // Zero modulo bias because 256 % 32 === 0
        code += alphabet[bytes[i] % alphabet.length];
    }

    return `${code.slice(0, 5)}-${code.slice(5)}`;
});

export const generateRandomSafeString = toGoErrorRet((length: number) => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const alphabetLength = alphabet.length; // 62

    // Calculate the highest perfectly divisible limit: 248
    // 256 - (256 % 62) = 248
    const maxValidByte = 256 - (256 % alphabetLength);

    let string = "";

    while (string.length < length) {
        const bytes = randomBytes(length);

        for (let i = 0; i < bytes.length; i++) {
            // Only use the byte if it falls within our perfectly divisible range
            if (bytes[i] < maxValidByte) {
                string += alphabet[bytes[i] % alphabetLength];

                if (string.length === length) {
                    return string;
                }
            }
        }
    }

    return string;
});

export const hashText = toGoErrorRet((text: string) => {
    return hash(text, { secret: SECRET_KEY });
});

export const verifyHash = toGoErrorRet(async (hashedText: string, password: string) => {
    const isValid = await verify(hashedText, password, {
        secret: SECRET_KEY,
    });
    return isValid;
});

export const signJWT = toGoErrorRet(
    async (payload: { [index: string]: unknown }, secretKey: Buffer, expiresIn?: number) => {
        const signer = new SignJWT(payload)
            .setIssuer(APP_NAME)
            .setIssuedAt(new Date())
            .setExpirationTime(addToDate(expiresIn || MINUTES_30))
            .setProtectedHeader({ alg: "HS256" });

        const jwtToken = await signer.sign(secretKey);
        return jwtToken;
    },
);

export const verifyJWT = toGoErrorRet(async <T>(token: string, secretKey: Buffer) => {
    const result = await jwtVerify<T>(token, secretKey, {
        algorithms: ["HS256"],
    });
    return result;
});

export const safeRandomBytes = toGoErrorRet((size: number) => randomBytes(size));

export const generateApiKey = toGoErrorRet(async () => {
    const [prefix, error$1] = await generateRandomSafeString(APIKEY_PREFIX_LENGTH);
    const [secret, error$2] = await generateRandomSafeString(APIKEY_SECRET_LENGTH);
    if (error$1 !== null) {
        throw error$1;
    }
    if (error$2 !== null) {
        throw error$2;
    }
    const [hashedSecret, error$3] = await hashText(secret);
    if (error$3 !== null) {
        throw error$3;
    }

    return { prefix, secret, hashedSecret };
});

export const validateApiKey = toGoErrorRet(async (apiKey: string) => {
    apiKey = apiKey.trim();
    if (apiKey.length !== APIKEY_LENGTH) {
        throw new FriendlyError(STATUS_BAD_REQUEST, ERR_INVALID_APIKEY);
    }
    const [prefix, secret = ""] = apiKey.split("_");
    if (secret === "") {
        throw new FriendlyError(STATUS_BAD_REQUEST, ERR_INVALID_APIKEY);
    }
    const [hashedSecret, error$1] = await hashText(secret);
    if (error$1 !== null) {
        throw error$1;
    }

    const result = await appDB
        .select()
        .from(appApiKeys)
        .where(and(eq(appApiKeys.prefix, prefix), eq(appApiKeys.secret, hashedSecret)));

    if (result.length === 0) {
        throw new FriendlyError(STATUS_BAD_REQUEST, ERR_INVALID_APIKEY);
    }

    return result[0].appId;
});

export const generateTOTPSecret = toGoErrorRet((appName: string, email: string) => {
    const totp = new TOTP({
        issuer: appName,
        label: email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
    });

    return totp.secret;
});

export const generateTOTPURI = toGoErrorRet((secret: string, appName: string, email: string) => {
    const totp = new TOTP({
        issuer: appName,
        label: email,
        secret: secret,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
    });

    return totp.toString();
});

export const verifyTOTP = toGoErrorRet((secret: string, token: string) => {
    const totp = new TOTP({
        secret: secret,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
    });

    const delta = totp.validate({ token: token, window: 1 });

    if (delta === null) {
        throw new FriendlyError(STATUS_BAD_REQUEST, "Invalid TOTP token");
    }

    return true;
});

export const generateBackupCodes = toGoErrorRet(async (count: number) => {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
        const [code, error] = await generateOTPBackupCode();
        if (error !== null) {
            throw error;
        }
        codes.push(code);
    }
    return codes;
});
