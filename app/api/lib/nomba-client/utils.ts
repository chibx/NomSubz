import { createHmac, timingSafeEqual } from "crypto";
import { WebhookPayload } from "./types";
import { FriendlyError } from "../utils/utils";
import { STATUS_BAD_REQUEST, STATUS_INTERNAL_SERVER_ERROR } from "../utils/constants";

export enum NombaWebHookEvent {
    PAYMENT_SUCCESS = "payment.success",
}

export function getNombaUrl(endpoint: string, environment?: "sandbox" | "production", customBaseUrl?: string): string {
    const defaultBaseUrl = environment === "production" ? "https://api.nomba.com/v1" : "https://sandbox.nomba.com/v1";

    const base = customBaseUrl || defaultBaseUrl;
    // Remove trailing slash if any
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    // Remove leading slash if any
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

    return `${cleanBase}/${cleanEndpoint}`;
}

/**
 * Verifies a incoming Nomba webhook payload signature.
 *
 * @throws {Error} if crypto operations fail
 * @throws {FriendlyError} if the signature or signingKey is not provided
 */
export function verifyWebhookSignature(rawBody: string, signature: string, signingKey: string): boolean {
    if (!signature || !signingKey) {
        throw new FriendlyError(STATUS_INTERNAL_SERVER_ERROR, "WebHook signature or/and signing key is required");
    }

    const hmac = createHmac("sha256", signingKey);
    const expectedSignature = hmac.update(rawBody).digest("hex");
    // Use utf8 buffers so timingSafeEqual doesn't throw on different hex lengths
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");
    if (expectedBuf.length !== receivedBuf.length) return false;
    return timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Parses and verifies a incoming Nomba webhook payload.
 *
 * @param rawBody The raw stringified JSON body of the request
 * @param signature The signature from the nomba-signature header
 * @param signingKey Your Nomba account webhook secret/signing key
 * @returns The parsed WebhookPayload if signature is valid
 * @throws {Error} if the signature is invalid
 * @throws {FriendlyError} if the signature or signingKey is not provided
 * @throws {SyntaxError} if the payload is malformed
 */
export function parseWebhookEvent(rawBody: string, signature: string, signingKey: string): WebhookPayload {
    if (!verifyWebhookSignature(rawBody, signature, signingKey)) {
        throw new FriendlyError(STATUS_BAD_REQUEST, "Invalid webhook signature");
    }

    return JSON.parse(rawBody) as WebhookPayload;
}

/**
 * Sandbox test cards from Nomba docs.
 * https://developer.nomba.com/docs/api-basics/testing
 *
 * Card PIN for all cards: 9999
 * OTP (Approved): 9999
 * OTP (Timeout):  1234
 * OTP (Invalid):  5464
 */
export const NOMBA_TEST_CARDS = Object.freeze({
    /** Mastercard — OTP required → leads to approval */
    MASTERCARD_OTP: {
        number: "5434621074252808",
        description: "Mastercard: OTP required (use OTP 9999 to approve)",
    },
    /** Visa — 3DS authentication required */
    VISA_3DS: {
        number: "4000000000002503",
        description: "Visa: 3DS authentication required",
    },
    /** Mastercard — Declined (do not honor) */
    MASTERCARD_DECLINED: {
        number: "5484497218317651",
        description: "Mastercard: Declined (do not honor)",
    },
    /** OTP values */
    OTP: Object.freeze({
        APPROVED: "9999",
        TIMEOUT: "1234",
        INVALID: "5464",
    }),
    /** Card PIN to use for all test cards */
    PIN: "9999",
});
