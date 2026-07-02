import { NextResponse, NextProxy } from "next/server";
import { addAuthCtx } from "./app/api/lib/middlewares/auth";

const allowedOrigins = [""];

const corsOptions = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const proxy: NextProxy = async (req) => {
    const headers = new Headers(req.headers);
    // const ipAddr = headers.get("X-Forwarded-For");
    const isPreflight = req.method === "OPTIONS";

    const origin = headers.get("origin") ?? "";
    const isAllowedOrigin = allowedOrigins.includes(origin);

    // Handle preflighted requests

    if (isPreflight) {
        const preflightHeaders = {
            ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
            ...corsOptions,
        };
        return NextResponse.json({}, { headers: preflightHeaders });
    }

    // Other middleware stuffs go here
    const middlewareResp = await addAuthCtx(req, headers);
    if (middlewareResp !== null) {
        return middlewareResp;
    }

    // Main route call
    return NextResponse.next({
        headers,
    });
};
