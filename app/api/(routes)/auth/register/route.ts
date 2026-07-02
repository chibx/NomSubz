import { logger, structuredResponse, toGoErrorRet, toValidationError } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { decode } from "decode-formdata";
import { REGISTER_FORM_INFO } from "@/app/shared/constants";
import * as v from "valibot";
import { RegisterSchema } from "@/app/api/lib/validation-schema/schema";
import { appDB } from "@/app/api/lib/db/db";
import { applications } from "@/app/api/lib/db/schema";
import { hashText } from "@/app/api/lib/auth";
import {
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
} from "@/app/api/lib/utils/constants";

export async function POST(req: NextRequest) {
    const [formData, error$1] = await toGoErrorRet(() => req.formData())();
    if (error$1 != null) {
        logger.withTag(req.url).debug("Failed to parse formdata", error$1);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const data = decode(formData!, REGISTER_FORM_INFO);
    const [result, error$2] = await toGoErrorRet(() => v.parse(RegisterSchema, data))();

    if (error$2 !== null) {
        logger.withTag(req.url).debug("", error$2);
        return structuredResponse(STATUS_BAD_REQUEST, "Invalid request", null, toValidationError(error$2));
    }

    const [hashedPassword, error$3] = await hashText(result.password);

    if (error$3 !== null) {
        logger.withTag(req.url).error(error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [, error$4] = await toGoErrorRet(() =>
        appDB.insert(applications).values({
            email: result.email,
            name: result.appName,
            password: hashedPassword,
            logoUrl: result.logoUrl,
        }),
    )();

    if (error$4 !== null) {
        logger.withTag(req.url).error("Database Error:", error$4);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    // TODO: Add email verification via link

    return structuredResponse(STATUS_OK, "Success");
}
