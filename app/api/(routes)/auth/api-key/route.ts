import { generateApiKey, getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { appApiKeys } from "@/app/api/lib/db/schema";
import { CreateAPIKeyResponse, GetApiKeysResponse } from "@/app/api/lib/types/response";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_OK,
    DUMMY_500_MESSAGE,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_BAD_REQUEST,
    DUMMY_400_MESSAGE,
} from "@/app/api/lib/utils/constants";
import { dateToString, logger, structuredResponse, toGoErrorRet, toValidationError } from "@/app/api/lib/utils/utils";
import { CreateApiKeySchema } from "@/app/api/lib/validation-schema/schema";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import * as v from "valibot";

export async function POST(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [validatedBody, error$1] = await toGoErrorRet(async () => v.parse(CreateApiKeySchema, await req.json()))();
    if (error$1 !== null) {
        logger.withTag(req.url).error("Could not parse request json body", error$1);
        return structuredResponse(STATUS_BAD_REQUEST, DUMMY_400_MESSAGE, null, toValidationError(error$1));
    }

    const [apiKey, error$2] = await generateApiKey();
    if (error$2 !== null) {
        logger.withTag(req.url).error("Could not generate API key", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [, error$3] = await toGoErrorRet(() => {
        return appDB.insert(appApiKeys).values({
            name: validatedBody.name,
            appId: appId,
            prefix: apiKey.prefix,
            secret: apiKey.hashedSecret,
        });
    })();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not create API key:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse<CreateAPIKeyResponse>(STATUS_OK, "Success", {
        apiKey: `${apiKey.prefix}_${apiKey.secret}`,
    });
}

/** Get all API keys */
export async function GET(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [apiKeys, error$1] = await toGoErrorRet(() =>
        appDB
            .select({
                id: appApiKeys.id,
                name: appApiKeys.name,
                createdAt: appApiKeys.createdAt,
            })
            .from(appApiKeys)
            .where(eq(appApiKeys.appId, appId)),
    )();
    if (error$1 !== null) {
        logger.withTag(req.url).error("Could not get API keys:", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const resp = apiKeys.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        createdAt: dateToString(apiKey.createdAt),
    }));

    return structuredResponse<GetApiKeysResponse>(STATUS_OK, "Success", {
        apiKeys: resp,
    });
}
