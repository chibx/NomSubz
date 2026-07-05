import { NextRequest, NextResponse } from "next/server";
import {
    ACCESSTOKEN_COOKIE,
    APPID_KEY,
    DUMMY_500_MESSAGE,
    ERR_INVALID_APIKEY,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_UNAUTHORIZED,
} from "../utils/constants";
import { structuredResponse } from "../utils/utils";
import { SECRET_KEY, validateApiKey, verifyJWT } from "../auth";
import { JWTField } from "../types/types";
import { errors } from "jose";

export async function addAuthCtx(request: NextRequest, headers: Headers): Promise<NextResponse | null> {
    const cookies = request.cookies;
    const accessToken = cookies.get(ACCESSTOKEN_COOKIE)?.value;
    const authorization = request.headers.get("Authorization") || "";

    // Allow mfa_pending tokens only for the 2FA verification route
    const is2FAVerifyRoute = request.nextUrl.pathname === "/api/auth/login/2fa";

    if (accessToken) {
        const [res, error] = await verifyJWT<JWTField>(accessToken, SECRET_KEY);
        if (error != null) {
            switch (true) {
                case error instanceof errors.JWTExpired:
                    return structuredResponse(STATUS_UNAUTHORIZED, "Session Expired, login again.");
                case error instanceof errors.JWTInvalid || error instanceof errors.JWTClaimValidationFailed:
                    return structuredResponse(STATUS_UNAUTHORIZED, "Invalid auth token");
                default:
                    return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
            }
        }

        // Reject tokens with mfa_pending purpose except for the 2FA verification route
        if (res.payload.purpose === "mfa_pending" && !is2FAVerifyRoute) {
            return structuredResponse(STATUS_UNAUTHORIZED, "Invalid auth token");
        }

        const appId = res.payload.appId;

        headers.set(APPID_KEY, appId);
    } else if (authorization.startsWith("Bearer ")) {
        const apiKey = authorization.split(" ")[1].trim();
        const [appId, error] = await validateApiKey(apiKey);

        if (error != null) {
            if (error.message == ERR_INVALID_APIKEY) {
                return structuredResponse(STATUS_UNAUTHORIZED, ERR_INVALID_APIKEY);
            }
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
        }

        headers.set(APPID_KEY, appId);
    }

    return null;
}
