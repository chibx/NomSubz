import { appDB } from "../db/db";
import { plans, subscriberCards, subscribers, subscriptions } from "../db/schema";
import { STATUS_NOT_FOUND } from "../utils/constants";
import { FriendlyError, toGoErrorRet } from "../utils/utils";
import { eq } from "drizzle-orm";

export const getSubscriptionDetails = toGoErrorRet(async (subscriptionId: string) => {
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
        .where(eq(subscriptions.id, subscriptionId));

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
