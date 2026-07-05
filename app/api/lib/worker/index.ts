import { addWithSubscriptionDuration, logger, nombaClient, pgBoss } from "@/app/api/lib/utils/utils";
import { appDB } from "@/app/api/lib/db/db"; // Your Drizzle instance
import { subscriptions } from "@/app/api/lib/db/schema";
import { lte, eq, and, sql } from "drizzle-orm";
import { ProcessPaymentJobData } from "../types/types";
import { getSubscriptionDetails } from "./utils";
import { CALLBACK_URL } from "@/app/shared/constants";
import { fromDrizzle } from "pg-boss";

const dunningPeriod = 3 * 24 * 60 * 60;

// 1. Tell pg-boss to run this job every hour automatically
await pgBoss.schedule("schedule-renewals", "0 * * * *");

// 2. Define what the job actually does
pgBoss.work("schedule-renewals", async () => {
    // Find all active subscriptions where the period has ended
    const dueSubscriptions = await appDB
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.status, "active"), lte(subscriptions.endTime, new Date())));

    // Push each ID into the payment queue.
    // We do this so each payment is isolated and can succeed/fail on its own.
    for (const sub of dueSubscriptions) {
        await pgBoss.send("process-payment", { subscriptionId: sub.id } satisfies ProcessPaymentJobData);
    }
});

pgBoss.work<ProcessPaymentJobData>("process-payment", async ([job]) => {
    const { subscriptionId } = job.data;

    // 1. Fetch full sub details & user's default tokenized card via Drizzle
    const [sub, error$1] = await getSubscriptionDetails(subscriptionId);
    if (error$1 !== null) {
        logger.error("[PGBoss]: Failed to get subscription with card", error$1);
        return;
    }

    try {
        const orderRef = `renewal-${subscriptionId}-${Date.now()}`;
        // 2. Hit the Nomba API
        const paymentResult = await nombaClient.chargeTokenizedCard({
            order: {
                amount: sub.planAmount,
                callbackUrl: CALLBACK_URL,
                customerEmail: sub.email,
                currency: "NGN",
                orderReference: orderRef,
                orderMetaData: {
                    subscriptionId,
                    subscriberId: sub.subscriberId.toString(),
                    planId: sub.planId.toString(),
                },
            },
            tokenKey: sub.cardToken,
        });

        if (paymentResult.data) {
            // 3. Success! Extend the period end date by 30 days using Drizzle
            await appDB
                .update(subscriptions)
                .set({
                    startTime: new Date(),
                    endTime: addWithSubscriptionDuration(new Date(), sub.planType),
                })
                .where(eq(subscriptions.id, subscriptionId));
        } else {
            // 4. Soft decline (e.g., insufficient funds). Kick off Dunning!
            throw new Error("Payment declined");
        }
    } catch (error) {
        logger.error("[PGBoss]: Failed to process payment", error);
        // If the API times out OR the payment was declined, it lands here.
        // We push it to the dunning queue to try again in 3 days.

        await appDB.transaction(async (tx) => {
            await pgBoss.send(
                "dunning-retry",
                {
                    subscriptionId,
                    attempt: 1,
                },
                {
                    startAfter: dunningPeriod, // pg-boss will hide this job for 3 days!
                    db: fromDrizzle(tx, sql),
                    retryLimit: 5,
                },
            );
        });

        await appDB.update(subscriptions).set({ status: "past_due" }).where(eq(subscriptions.id, subscriptionId));

        await pgBoss.send(
            "dunning-retry",
            {
                subscriptionId,
                attempt: 1,
            },
            {
                startAfter: dunningPeriod, // pg-boss will hide this job for 3 days!
            },
        );
    }
});
