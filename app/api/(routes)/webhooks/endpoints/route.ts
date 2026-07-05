import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { applications } from "@/app/api/lib/db/schema";
import { GetWebhookUrlResponse } from "@/app/api/lib/types/response";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    DUMMY_500_MESSAGE,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";
import { logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { AddWebhookUrlSchema } from "@/app/api/lib/validation-schema/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import * as v from "valibot";

//  Allow downstream product teams to register their own URLs here, so your engine
//  can send them events like subscription.created or subscription.past_due.
export async function POST(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [validatedBody, error$1] = await toGoErrorRet(async () => v.parse(AddWebhookUrlSchema, await req.json()))();
    if (error$1 !== null) {
        logger.withTag(req.url).error("Could not parse request json body", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [, error$2] = await toGoErrorRet(() =>
        appDB.update(applications).set({
            webhookUrl: validatedBody.webhookUrl,
        }),
    )();

    if (error$2 !== null) {
        logger.withTag(req.url).error("Could not save webhook url", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, "Failed to save webhook url");
    }

    return structuredResponse(STATUS_OK, "Success");
}

export async function GET(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [webhookUrl, error$1] = await toGoErrorRet(() =>
        appDB.select({ webhookUrl: applications.webhookUrl }).from(applications).where(eq(applications.id, appId)),
    )();

    if (error$1 !== null) {
        logger.withTag(req.url).error("Could not get webhook url", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, "Failed to get webhook url");
    }

    return structuredResponse<GetWebhookUrlResponse>(STATUS_OK, "Success", {
        webhookUrl: webhookUrl[0]?.webhookUrl || null,
    });
}
