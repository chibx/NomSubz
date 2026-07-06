import { and, eq, inArray, lte, sql } from "drizzle-orm";
import { appDB } from "../db/db";
import { fromDrizzle, Job } from "pg-boss";
import { subscriptions } from "../db/schema";
import { DunningJobData, ProcessPaymentJobData } from "../types/types";
import { addWithSubscriptionDuration, logger, nombaClient, pgBoss } from "../utils/utils";
import { QUEUES } from "./constants";
import { CALLBACK_URL } from "@/app/shared/constants";
import { attemptCharge, dunningPeriod, getSubscriptionDetails } from "./utils";
import { NombaRateLimitError } from "../nomba-client/types";

export async function ScheduleRenewalsWork() {
    const dueSubscriptions = await appDB
        .select({ id: subscriptions.id, endTime: subscriptions.endTime })
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.status, "active"),
                lte(subscriptions.endTime, new Date()),
                eq(subscriptions.cancelAtEnd, false),
            ),
        );

    for (const sub of dueSubscriptions) {
        await pgBoss.send(QUEUES.PROCESS_PAYMENT, {
            subscriptionId: sub.id,
            endTime: sub.endTime.toISOString(),
        } satisfies ProcessPaymentJobData);
    }
}

export async function CancelSubscriptionWork([]: Job<unknown>[]) {
    const subsToCancel = await appDB
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(
            and(
                inArray(subscriptions.status, ["active", "paused"]),
                lte(subscriptions.endTime, new Date()),
                eq(subscriptions.cancelAtEnd, true),
            ),
        )
        .limit(100);

    const promises: Promise<unknown>[] = [];
    for (const sub of subsToCancel) {
        promises.push(
            appDB
                .update(subscriptions)
                .set({
                    status: "cancelled",
                })
                .where(eq(subscriptions.id, sub.id)),
        );
    }
    await Promise.all(promises);
}

export async function ProcessPaymentWork([job]: Job<ProcessPaymentJobData>[]) {
    const { subscriptionId, endTime } = job.data;

    // Fetch full sub details & user's default tokenized card via Drizzle
    const [sub, error$1] = await getSubscriptionDetails(subscriptionId);
    if (error$1 !== null) {
        logger.error("[PGBoss]: Failed to get subscription with card", error$1);
        return;
    }

    try {
        const orderRef = `renewal-${subscriptionId}-${Date.now()}`;
        await nombaClient.chargeTokenizedCard({
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

        await appDB
            .update(subscriptions)
            .set({
                startTime: new Date(),
                endTime: addWithSubscriptionDuration(new Date(), sub.planType),
            })
            .where(eq(subscriptions.id, subscriptionId));
    } catch (error) {
        if (error instanceof NombaRateLimitError) {
            logger.warn("[PGBoss]: Nomba API rate limit exceeded, retrying later", error);
            return;
        }

        logger.error("[PGBoss]: Failed to process payment", error);
        await appDB.transaction(async (tx) => {
            await Promise.all([
                await tx.update(subscriptions).set({ status: "past_due" }).where(eq(subscriptions.id, subscriptionId)),
                pgBoss.send(
                    QUEUES.DUNNING_RETRY,
                    {
                        subscriptionId,
                        attempt: 1,
                        initialEndTime: endTime,
                    } as DunningJobData,
                    {
                        startAfter: dunningPeriod, // pg-boss will hide this job for 3 days!
                        db: fromDrizzle(tx, sql),
                        retryLimit: 5,
                    },
                ),
            ]);
        });
    }
}

export async function DunningRetryWork([job]: Job<DunningJobData>[]) {
    const { subscriptionId, attempt, initialEndTime } = job.data;

    const [, error$1] = await attemptCharge(subscriptionId);

    if (error$1 === null) {
        await appDB.update(subscriptions).set({ status: "active" }).where(eq(subscriptions.id, subscriptionId));
    } else {
        if (attempt === 1) {
            await pgBoss.send(
                QUEUES.DUNNING_RETRY,
                { subscriptionId, attempt: 2, initialEndTime },
                { startAfter: 5 * 24 * 60 * 60, retryLimit: 5 },
            );
        } else {
            // Final failure. Game over. Cancel the subscription.
            await appDB.transaction(async (tx) => {
                await tx.update(subscriptions).set({ status: "cancelled" }).where(eq(subscriptions.id, subscriptionId));
                await pgBoss.fail(QUEUES.DUNNING_RETRY, job.id, { db: fromDrizzle(tx, sql) });
            });
        }
    }
}
