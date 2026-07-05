import { appDB } from "@/app/api/lib/db/db";
import { subscriberCards } from "@/app/api/lib/db/schema";
import { WebhookData, WebhookOrder } from "@/app/api/lib/nomba-client/types";
import { PlanSubscriptionWebhook, PlanUpgradeWebHook } from "@/app/api/lib/types/types";
import { STATUS_BAD_REQUEST, STATUS_INTERNAL_SERVER_ERROR } from "@/app/api/lib/utils/constants";
import { handleSuccessfulPlanChange, handleSuccessfulSubscription } from "@/app/api/lib/utils/db";
import { logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";

export async function doPlanUpgradeWebHook(order: WebhookOrder, extraData: PlanUpgradeWebHook) {
    if (order.isTokenizedCardPayment === "false") {
        logger.error("Order is not a tokenized card payment");
        return structuredResponse(STATUS_BAD_REQUEST, "Order does not involve tokenized card", null);
    }
    const [, err$2] = await toGoErrorRet(() =>
        handleSuccessfulPlanChange({
            newPlanId: extraData.newPlanId,
            subscriptionId: extraData.subscriptionId,
            appId: extraData.appId,
            currentDate: new Date(extraData.operationDate),
            subscriberId: BigInt(extraData.subscriberId),
            oldPlanId: extraData.oldPlanId,
            amountToPay: extraData.amountToPay,
            surplus: extraData.userRemaining,
        }),
    )();
    if (err$2 !== null) {
        logger.error("Failed to handle successful subscription payment", err$2);
        return structuredResponse(
            STATUS_INTERNAL_SERVER_ERROR,
            "Failed to handle successful subscription payment",
            null,
        );
    }
    return structuredResponse(200, "Subscription payment handled successfully", null);
}

export async function doPlanSubscriptionWebHook(
    data: WebhookData,
    order: WebhookOrder,
    extraData: PlanSubscriptionWebhook,
) {
    let cardId = "";
    if (data.tokenizedCardData) {
        const [row, err$3] = await toGoErrorRet(() =>
            appDB
                .insert(subscriberCards)
                .values({
                    expiryMonth: parseInt(data.tokenizedCardData!.tokenExpiryMonth),
                    expiryYear: parseInt(data.tokenizedCardData!.tokenExpiryYear),
                    last4Digits: data.tokenizedCardData!.cardPan.slice(-4),
                    brand: data.tokenizedCardData!.cardType,
                    tokenizedCard: data.tokenizedCardData!.tokenKey,
                    appId: extraData.appId,
                    subscriberId: BigInt(extraData.subscriberId),
                })
                .returning({ id: subscriberCards.id }),
        )();
        if (err$3 !== null) {
            logger.withTag(`subscriber:${extraData.subscriberId}`).error("Failed to save tokenized card", err$3);
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, "Failed to save tokenized card", null);
        }

        cardId = row[0].id;
    } else {
        if (extraData.usedExistingCard === "true") {
            cardId = extraData.cardId;
        } else {
            logger.warn("Webhook receives metadata without card data where needed");
            return structuredResponse(STATUS_BAD_REQUEST, "Invalid payload format");
        }
    }

    const [, err$4] = await toGoErrorRet(() =>
        handleSuccessfulSubscription({
            amount: extraData.amount,
            planId: BigInt(extraData.planId),
            subscriberId: BigInt(extraData.subscriberId),
            appId: extraData.appId,
            currentDate: new Date(extraData.currentDate),
            cardId: cardId,
            reference: order.orderReference,
            cardToken: data.tokenizedCardData!.tokenKey,
        }),
    )();
    if (err$4 !== null) {
        logger
            .withTag(`subscriber:${extraData.subscriberId}`)
            .error("Failed to handle successful subscription payment", err$4);
        return structuredResponse(
            STATUS_INTERNAL_SERVER_ERROR,
            "Failed to handle successful subscription payment",
            null,
        );
    }
    return structuredResponse(200, "Subscription payment handled successfully", null);
}
