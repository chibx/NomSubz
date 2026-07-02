import { randomBytes, createCipheriv, createDecipheriv } from "crypto";
import { hash, verify } from "argon2";
import { SignJWT, jwtVerify } from "jose";
import { APP_NAME } from "@/app/shared/constants";
import { addToDate, toGoErrorRet, getEnv } from "../utils/utils";
import { APIKEY_LENGTH, APPID_KEY, ERR_INVALID_APIKEY, MINUTES_30 } from "../utils/constants";
import { NextRequest } from "next/server";
import { appDB } from "../db/db";
import { appApiKeys } from "../db/schema";
import { and, eq } from "drizzle-orm";

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

export const hashText = toGoErrorRet((text: string) => {
    return hash(text, { secret: SECRET_KEY });
});

export const verifyHash = toGoErrorRet(async (hashedText: string, password: string) => {
    const isValid = await verify(hashedText, password, {
        secret: SECRET_KEY,
    });
    return isValid;
});

export const signJWT = toGoErrorRet(async (payload: { [index: string]: unknown }, secretKey: Buffer) => {
    const signer = new SignJWT(payload)
        .setIssuer(APP_NAME)
        .setIssuedAt(new Date())
        .setExpirationTime(addToDate(MINUTES_30))
        .setProtectedHeader({ alg: "HS256" });

    const jwtToken = await signer.sign(secretKey);
    return jwtToken;
});

export const verifyJWT = toGoErrorRet(async <T>(token: string, secretKey: Buffer) => {
    const result = await jwtVerify<T>(token, secretKey, {
        algorithms: ["HS256"],
    });
    return result;
});

export const safeRandomBytes = toGoErrorRet((size: number) => randomBytes(size));

export const validateApiKey = toGoErrorRet(async (apiKey: string) => {
    apiKey = apiKey.trim();
    if (apiKey.length !== APIKEY_LENGTH) {
        throw new Error(ERR_INVALID_APIKEY);
    }
    const [prefix, secret = ""] = apiKey.split("-");
    if (secret === "") {
        throw new Error(ERR_INVALID_APIKEY);
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
        throw new Error(ERR_INVALID_APIKEY);
    }

    return result[0].appId;
});
