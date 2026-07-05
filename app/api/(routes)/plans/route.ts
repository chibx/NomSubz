import { NextRequest } from "next/server";
import { getAppId } from "@/app/api/lib/auth";
import { dateToString, logger, structuredResponse, toValidationError } from "@/app/api/lib/utils/utils";
import {
    DUMMY_401_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import { plans } from "../../lib/db/schema";
import { toGoErrorRet } from "@/app/api/lib/utils/utils";
import { appDB } from "@/app/api/lib/db/db";
import { getTableColumns } from "drizzle-orm";
import { eq } from "drizzle-orm";
import { ListPlansResponse } from "../../lib/types/response";
import { CreateSubscriptionPlanSchema } from "../../lib/validation-schema/schema";
import * as v from "valibot";
import Decimal from "decimal.js";

// List all active plans (e.g., Basic, Pro, Enterprise).
export async function GET(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [result, error$1] = await toGoErrorRet(() => {
        const { appId, ...rest } = getTableColumns(plans);
        return appDB.select(rest).from(plans).where(eq(plans.appId, appId));
    })();

    if (error$1 !== null) {
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, error$1.message);
    }

    return structuredResponse<ListPlansResponse>(STATUS_OK, "Success", {
        plans: result.map((plan) => ({
            id: plan.id.toString(),
            name: plan.name,
            amount: plan.amount,
            currency: plan.currency,
            status: plan.status,
            type: plan.type,
            details: plan.details,
            createdAt: dateToString(plan.createdAt),
            updatedAt: dateToString(plan.updatedAt),
        })),
    });
}

//  Create a new plan.
export async function POST(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [validatedBody, error$2] = await toGoErrorRet(async () =>
        v.parse(CreateSubscriptionPlanSchema, await req.json()),
    )();
    if (error$2 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Invalid request body`, null, toValidationError(error$2));
    }

    // Validate further if it is a valid <number> decimal
    const [amount, error$3] = await toGoErrorRet(() => new Decimal(validatedBody.amount).toFixed(2))();
    if (error$3 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Invalid amount`, null, toValidationError(error$3));
    }

    const [, error$4] = await toGoErrorRet(() => {
        return appDB.insert(plans).values({
            ...validatedBody,
            appId,
            amount,
        });
    })();

    if (error$4 !== null) {
        logger.withTag(`${req.method} ${req.url}`).error("Could not create plan", error$4);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, error$4.message);
    }

    // TODO: Implement plan creation logic
    return structuredResponse(STATUS_OK, "Success");
}
