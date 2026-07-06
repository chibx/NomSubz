import { CALLBACK_URL } from "@/app/shared/constants";
import { appDB } from "../db/db";
import { plans, subscriberCards, subscribers, subscriptions } from "../db/schema";
import { NAIRA, STATUS_NOT_FOUND } from "../utils/constants";
import { FriendlyError, logger, nombaClient, toGoErrorRet } from "../utils/utils";
import { and, eq } from "drizzle-orm";
import { AttemptReCharge } from "../types/types";

export const getSubscriptionDetails = toGoErrorRet(async (appId: string, subscriptionId: string) => {
    const result = await appDB
        .select({
            planId: plans.id,
            planAmount: plans.amount,
            cardToken: subscriberCards.tokenizedCard,
            email: subscribers.email,
            planType: plans.type,
            subscriberId: subscribers.subscriberId,
        })
        .from(subscriptions)
        .innerJoin(subscriberCards, eq(subscriptions.cardId, subscriberCards.id))
        .innerJoin(plans, eq(subscriptions.planId, plans.id))
        .innerJoin(subscribers, eq(subscriptions.subscriberId, subscribers.subscriberId))
        .where(and(eq(subscriptions.appId, appId), eq(subscriptions.id, subscriptionId)));

    if (result.length === 0) {
        throw new FriendlyError(STATUS_NOT_FOUND, "Subscription not found");
    }

    return {
        planId: result[0].planId,
        planAmount: result[0].planAmount,
        cardToken: result[0].cardToken,
        email: result[0].email,
        planType: result[0].planType,
        subscriberId: result[0].subscriberId,
    };
});

export const attemptCharge = toGoErrorRet(
    async ({ appId, subscriptionId, initialEndTime: endTime }: AttemptReCharge) => {
        const [sub, error$1] = await getSubscriptionDetails(appId, subscriptionId);
        if (error$1 !== null) {
            logger.error("[PGBoss]: Failed to get subscription with card", error$1);
            return;
        }
        const orderRef = `renewal-${appId}-${subscriptionId}-${Date.now()}`;
        await nombaClient.chargeTokenizedCard({
            order: {
                amount: sub.planAmount,
                callbackUrl: CALLBACK_URL,
                customerEmail: sub.email,
                currency: NAIRA,
                orderReference: orderRef,
                orderMetaData: {
                    appId,
                    subscriptionId,
                    subscriberId: sub.subscriberId.toString(),
                    planId: sub.planId.toString(),
                    endTime,
                },
            },
            tokenKey: sub.cardToken,
        });

        return true;
    },
);
