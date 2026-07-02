import { NextRequest } from "next/server";
import { getAppId } from "../../lib/auth";
import { logger, safeFormdata, structuredResponse, toGoErrorRet, toValidationError } from "../../lib/utils/utils";
import {
    DUMMY_200_MESSAGE,
    DUMMY_400_MESSAGE,
    DUMMY_401_MESSAGE,
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "../../lib/utils/constants";
import { decode } from "decode-formdata";
import { CreateSubscriberSchema } from "../../lib/validation-schema/schema";
import * as v from "valibot";
import { appDB } from "../../lib/db/db";
import { subscribers } from "../../lib/db/schema";
import { CreateSubscriberResponse } from "../../lib/types/response";

// Create a billing profile for an authenticated user.
export async function POST(req: NextRequest) {
    // logger.withTag(req.url).debug("", error$2)
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [formData, error$1] = await safeFormdata(req);
    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, "Formdata invalid or not found");
    }
    const data = decode(formData);
    const [validBody, error$2] = await toGoErrorRet(() => v.parse(CreateSubscriberSchema, data))();
    if (error$2 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, DUMMY_400_MESSAGE, null, toValidationError(error$2));
    }

    const [result, error$3] = await toGoErrorRet(() => {
        return appDB
            .insert(subscribers)
            .values({
                appId: appId,
                userId: validBody.userId,
                email: validBody.email,
            })
            .returning({ subscriberId: subscribers.subscriberId });
    })();
    if (error$3 !== null || result.length == 0 /** Should not occur */) {
        logger.withTag(req.url).error("Could not insert subscriber", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse<CreateSubscriberResponse>(STATUS_OK, DUMMY_200_MESSAGE, {
        subscriberId: result[0].subscriberId.toString(),
    });
}
