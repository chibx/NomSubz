import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { saveCardConfirmation, subscriberCards } from "@/app/api/lib/db/schema";
import { GetSubscriberCardsResponse, SubscriberCard } from "@/app/api/lib/types/response";
import {
    DUMMY_401_MESSAGE,
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_FORBIDDEN,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import {
    dateToString,
    isSubscriberForApp,
    logger,
    nombaClient,
    structuredResponse,
    toGoErrorRet,
    toValidationError,
} from "@/app/api/lib/utils/utils";
import { AddCardDetailsSchema } from "@/app/api/lib/validation-schema/schema";
import { eq, getTableColumns } from "drizzle-orm";
import { NextRequest } from "next/server";
import { uuidv4 } from "uuidv7";
import * as v from "valibot";

//  Attach a new tokenized card to the customer.
export async function POST(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]/payment-methods">) {
    const { customerId } = await ctx.params;
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }
    const [subscriberId, error$1] = await toGoErrorRet(() => BigInt(customerId))();

    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid customer id, got ${customerId}`);
    }

    const [validatedBody, error$2] = await toGoErrorRet(async () => v.parse(AddCardDetailsSchema, await req.json()))();
    if (error$2 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Invalid request body`, null, toValidationError(error$2));
    }

    const [isAuthorized, error$3] = await isSubscriberForApp(appId, subscriberId);

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not verify app to subscriber privilege from db:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (isAuthorized === false) {
        return structuredResponse(STATUS_FORBIDDEN, "No rights to access this subscriber's data");
    }

    const orderRef = `${uuidv4()}-${Date.now()}`;

    const [submitCardResult, error$4] = await toGoErrorRet(() =>
        nombaClient.submitCardDetails({
            cardDetails: {
                cardCVV: validatedBody.cardCVV,
                cardExpiryMonth: validatedBody.cardExpiryMonth,
                cardExpiryYear: validatedBody.cardExpiryYear,
                cardNumber: validatedBody.cardNumber,
                cardPin: validatedBody.cardPin,
            },
            saveCard: "true",
            orderReference: orderRef,
        }),
    )();

    if (error$4 !== null) {
        logger.withTag(req.url).error("Could not submit customer's card details:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [, error$5] = await toGoErrorRet(() =>
        appDB.insert(saveCardConfirmation).values({
            orderReference: orderRef,
            subscriberId: subscriberId,
            transactionId: submitCardResult.data.transactionId,
        }),
    )();

    if (error$5 !== null) {
        logger.withTag(req.url).error("Could not insert card confirmation status:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const [, error$6] = await toGoErrorRet(() =>
        nombaClient.requestSaveCardOTP({
            orderReference: orderRef,
            phoneNumber: validatedBody.phoneNumber,
        }),
    )();

    if (error$6 !== null) {
        logger.withTag(req.url).error("Could not request card confirmation OTP:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    return structuredResponse(STATUS_OK, "Success. An OTP has been sent to the provided phone number");
}

//  List all saved cards for the user.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]/payment-methods">) {
    // TODO: Strictly rate-limit
    const { customerId } = await ctx.params;
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }
    const [subscriberId, error$1] = await toGoErrorRet(() => BigInt(customerId))();

    if (error$1 !== null) {
        return structuredResponse(STATUS_BAD_REQUEST, `Expected to see a valid customer id, got ${customerId}`);
    }

    const [isAuthorized, error$2] = await isSubscriberForApp(appId, subscriberId);

    if (error$2 !== null) {
        logger.withTag(req.url).error("Could not verify app to subscriber privilege from db:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (isAuthorized === false) {
        return structuredResponse(STATUS_FORBIDDEN, "No rights to access this subscriber's data");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { tokenizedCard: _, appId: __, ...rest } = getTableColumns(subscriberCards);
    const [result$2, error$3] = await toGoErrorRet(() => {
        return appDB.select(rest).from(subscriberCards).where(eq(subscriberCards.subscriberId, subscriberId));
    })();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not list card from db:", error$2);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const response = result$2.map<SubscriberCard>((table) => ({
        id: table.id,
        brand: table.brand,
        expiryMonth: table.expiryMonth,
        expiryYear: table.expiryYear,
        subscriberId: table.subscriberId,
        createdAt: dateToString(table.createdAt),
        last4: table.last4Digits,
    }));

    return structuredResponse<GetSubscriberCardsResponse>(STATUS_OK, "Success", { cards: response });
}
