import {
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    DUMMY_400_MESSAGE,
    STATUS_BAD_REQUEST,
    NAIRA,
    DUMMY_500_MESSAGE,
} from "@/app/api/lib/utils/constants";
import { logger, nombaClient, structuredResponse, toGoErrorRet, toValidationError } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import * as v from "valibot";

const TestSchema = v.object({
    amount: v.pipe(v.string(), v.decimal()),
});

//  Allow downstream product teams to register their own URLs here, so your engine
//  can send them events like subscription.created or subscription.past_due.
export async function POST(req: NextRequest) {
    const json = await req.json();
    console.log("JSON:", json);
    const [validatedBody, error$1] = await toGoErrorRet(async () => v.parse(TestSchema, json))();
    if (error$1 !== null) {
        logger.withTag(req.url).error("Could not parse request json body", error$1);
        return structuredResponse(STATUS_BAD_REQUEST, DUMMY_400_MESSAGE, null, toValidationError(error$1));
    }

    const [res, error$2] = await toGoErrorRet(() =>
        nombaClient.createOrder({
            order: {
                amount: validatedBody.amount,
                callbackUrl: "https://google.com",
                currency: NAIRA,
                customerEmail: "test@gmail.com",
                orderReference: "1234567890",
                allowedPaymentMethods: ["Card"],
                orderMetaData: {
                    info: "It worked!!!",
                },
            },
        }),
    )();

    if (error$2) {
        console.error("Nomba Error:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }
    console.log(res.data);

    console.log(res.data?.orderReference, "|", res.data?.checkoutLink);

    return structuredResponse(STATUS_OK, "Success");
}
