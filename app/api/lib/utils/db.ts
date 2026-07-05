import { eq, and, exists, getTableColumns, SQL, sql } from "drizzle-orm";
import { appDB } from "../db/db";
import {
    applicationLogs,
    applications,
    payments,
    plans,
    subscriberCards,
    subscribers,
    subscriptions,
} from "../db/schema";
import { addWithSubscriptionDuration, FriendlyError, nombaClient, toGoErrorRet } from "./utils";
import { STATUS_BAD_REQUEST, STATUS_INTERNAL_SERVER_ERROR, STATUS_NOT_FOUND, subscriptionDurations } from "./constants";
import { ApplicationLogEvents, ApplicationLogMeta, PlanType, PlanUpgradeWebHook, WebHookTypes } from "../types/types";
import { Decimal } from "decimal.js";
import { CALLBACK_URL } from "@/app/shared/constants";

export const isSubscriberForApp = toGoErrorRet(async (appId: string, subscriberId: bigint) => {
    let result = false;
    const b = await appDB
        .select({
            a: sql<number>`1`,
        })
        .from(subscribers)
        .where(and(eq(subscribers.appId, appId), eq(subscribers.subscriberId, subscriberId)));

    if (b.length > 0) {
        result = true;
    }
    return result;
});

export const getSubscription = toGoErrorRet((appId: string, subscriberId: bigint, subscriptionId: string) => {
    return appDB
        .select({
            id: subscriptions.id,
            amount: subscriptions.amount,
            createdAt: subscriptions.createdAt,
            startTime: subscriptions.startTime,
            endTime: subscriptions.endTime,
            status: subscriptions.status,
            planName: plans.name,
            planType: plans.type,
        })
        .from(subscribers)
        .innerJoin(subscriptions, eq(subscribers.subscriberId, subscriptions.subscriberId))
        .innerJoin(plans, eq(plans.id, subscriptions.planId))
        .where(
            and(
                eq(subscribers.appId, appId),
                eq(subscriptions.subscriberId, subscriberId),
                eq(subscriptions.id, subscriptionId),
            ),
        );
});

type ProrateOption = {
    oldAmount: string;
    newAmount: string;
    residualAmount: string;
    startTime: Date;
    type: PlanType;
    now: Date;
    // endTime: Date;
};

type ProrateResult = {
    surplus?: string;
    amountToPay?: string;
};

type UpdateSubscriptionArg = {
    appId: string;
    subscriberId: bigint;
    subscriptionId: string;
    planId?: bigint;
    cardId?: string;
};

type extraMeta = {
    customerEmail: string;
    cardToken: string;
    oldPlanId: string;
    oldAmount: string;
    newPlanId: string;
    newAmount: string;
};

type extraAmountToPayArg = UpdateSubscriptionArg & {
    amountX100: string;
    currentDate: Date;
    cardToken: string;
    customerEmail: string;
    oldPlanId: string;
    amountToPay?: string;
    userRemaining?: string;
};

type handleSuccessfulPlanChangeArg = ProrateResult & {
    currentDate: Date;
    oldPlanId: string;
    newPlanId: string;
    appId: string;
    subscriberId: bigint;
    subscriptionId: string;
};

type handleSuccessfulSubscriptionArg = {
    amount: string;
    planId: bigint;
    subscriberId: bigint;
    appId: string;
    cardId: string;
    cardToken: string;
    reference: string;
    currentDate: Date;
};

function prorate({
    newAmount: new_,
    oldAmount: old,
    residualAmount,
    startTime,
    type,
    now: currentDate,
}: ProrateOption): ProrateResult {
    const oldAmount = new Decimal(old);
    const newAmount = new Decimal(new_);
    const totalDuration = subscriptionDurations[type];
    const durationDiff = currentDate.getTime() - startTime.getTime();
    // const usedDurationFrac = durationDiff / totalDuration;
    // const usedOld = oldAmount.mul(usedDurationFrac);
    const residual = new Decimal(residualAmount);
    const remainingDurationFrac = new Decimal(totalDuration - durationDiff).div(totalDuration);
    const remainingOld = oldAmount.mul(remainingDurationFrac);
    const newAmountToPay = newAmount.mul(remainingDurationFrac);

    // TODO: Check if the new amount to pay is below a minimum card charge threshold

    // The remainder cash may or may not be able to cover the expenses of the new plan
    const newRemaining = remainingOld.sub(newAmountToPay).plus(residual);

    if (newRemaining.isZero()) {
        return {};
    }

    return {
        surplus: newRemaining.isPositive() ? newRemaining.toFixed(2) : undefined,
        amountToPay: newRemaining.isNegative() ? newRemaining.abs().toFixed(2) : undefined,
    };
}

async function handleExtraAmountToPay(arg: extraAmountToPayArg) {
    const orderReference = `${arg.appId}-${arg.subscriberId}-${arg.subscriptionId}-${arg.currentDate.getTime()}`;

    await nombaClient.chargeTokenizedCard({
        order: {
            orderReference: orderReference,
            customerId: String(arg.subscriberId),
            callbackUrl: CALLBACK_URL,
            customerEmail: arg.customerEmail,
            amount: arg.amountX100,
            currency: "NGN",
            orderMetaData: {
                type: WebHookTypes.PLAN_CHANGE_UPGRADE,
                newPlanId: arg.planId!.toString(),
                subscriptionId: arg.subscriptionId,
                subscriberId: arg.subscriberId.toString(),
                appId: arg.appId,
                operationDate: arg.currentDate.toISOString(),
                oldPlanId: arg.oldPlanId,
                amountToPay: arg.amountToPay!,
                userRemaining: arg.userRemaining!,
            } satisfies PlanUpgradeWebHook,
        },
        tokenKey: arg.cardToken,
    });

    return {
        orderReference,
    };
}

async function getCompoundSubscription(arg: UpdateSubscriptionArg) {
    const { amount, startTime, endTime, planId, cardId } = getTableColumns(subscriptions);
    return (
        await appDB
            .select({
                amount,
                planId,
                startTime,
                endTime,
                planAmount: plans.amount,
                residualAmount: subscribers.residualAmount,
                cardToken: subscriberCards.tokenizedCard,
                type: plans.type,
                customerEmail: applications.email,
            })
            .from(subscriptions)
            .innerJoin(subscribers, eq(subscriptions.subscriberId, subscribers.subscriberId))
            .innerJoin(applications, eq(applications.id, subscribers.appId))
            .innerJoin(subscriberCards, eq(cardId, subscriberCards.id))
            .innerJoin(plans, eq(plans.id, subscriptions.planId))
            .where(and(eq(subscriptions.id, arg.subscriptionId), eq(subscriptions.id, arg.subscriptionId)))
    )[0];
}

function runComplexUpdateTx({
    conditions,
    arg,
    prorationResult,
    extraData,
    currentDate,
}: {
    conditions: (SQL | undefined)[];
    arg: UpdateSubscriptionArg;
    prorationResult: ProrateResult | undefined;
    extraData: extraMeta | undefined;
    currentDate: Date;
}) {
    let planId: bigint | undefined = arg.planId;

    return appDB.transaction(async (tx) => {
        // So glad QueryPromise class doesn't execute instantly
        const promises: Promise<unknown>[] = [];

        if (prorationResult) {
            if (prorationResult.amountToPay) {
                planId = undefined;

                const amountIn100 = new Decimal(prorationResult.amountToPay).mul(100).toFixed(2);

                // Charge the client for more
                const paymentInfo = await handleExtraAmountToPay({
                    ...arg,
                    amountX100: amountIn100,
                    currentDate: currentDate,
                    cardToken: extraData!.cardToken,
                    customerEmail: extraData!.customerEmail,
                    oldPlanId: extraData!.oldPlanId,
                    amountToPay: prorationResult.amountToPay,
                    userRemaining: prorationResult.surplus,
                });

                promises.push(
                    tx.insert(payments).values({
                        amount: prorationResult.amountToPay,
                        orderReference: paymentInfo.orderReference,
                        subscriberId: arg.subscriberId,
                        appId: arg.appId,
                        subscriptionId: arg.subscriptionId,
                        cardToken: extraData!.cardToken,
                        status: "pending",
                    }),
                );
            }

            // If the new plan remains some change, we store that in the user's residual balance
            // this balance can be used in future payments, either in full or partially
            if (prorationResult.surplus) {
                promises.push(
                    tx.insert(applicationLogs).values({
                        appId: arg.appId,
                        event: ApplicationLogEvents.PLAN_CHANGE,
                        metadata: {
                            appId: arg.appId,
                            oldPlanId: extraData!.oldPlanId,
                            newPlanId: extraData!.newPlanId,
                            subscriptionId: arg.subscriptionId,
                            amountToPay: prorationResult.amountToPay,
                            userRemaining: prorationResult.surplus,
                            currentDate: currentDate.toISOString(),
                        } satisfies ApplicationLogMeta[ApplicationLogEvents.PLAN_CHANGE],
                    }),
                );

                promises.push(
                    tx
                        .update(subscribers)
                        .set({ residualAmount: prorationResult.surplus })
                        .where(eq(subscribers.subscriberId, arg.subscriberId)),
                );
            }
        }

        promises.push(
            tx
                .update(subscriptions)
                .set({
                    // We don't update the plan_id until we confirm payment
                    // would be set to `undefined` if payment is needed (it will be set over in the webhook handler)
                    planId: planId,
                    cardId: arg.cardId,
                })
                .where(and(...conditions)),
        );

        await Promise.all(promises);
    });
}

export const updateSubscription = toGoErrorRet(async (arg: UpdateSubscriptionArg) => {
    let prorationResult: ProrateResult | undefined;
    const currentDate = new Date();
    let extraData: extraMeta | undefined;

    const conditions = [
        eq(subscriptions.id, arg.subscriptionId),
        eq(subscriptions.subscriberId, arg.subscriberId),
        arg.planId
            ? exists(
                  appDB
                      .select()
                      .from(plans)
                      .where(and(eq(plans.id, arg.planId), eq(plans.appId, arg.appId))),
              )
            : undefined,
        arg.cardId
            ? exists(
                  appDB
                      .select()
                      .from(subscriberCards)
                      .where(
                          and(eq(subscriberCards.id, arg.cardId), eq(subscriberCards.subscriberId, arg.subscriberId)),
                      ),
              )
            : undefined,
    ];

    if (arg.planId) {
        // Check if payment is needed or not
        // Also automatically prorate if needed
        const newPlan = await appDB
            .select({ id: plans.id, amount: plans.amount, type: plans.type })
            .from(plans)
            .where(and(eq(plans.id, arg.planId), eq(plans.appId, arg.appId)));
        if (newPlan.length === 0) {
            throw new FriendlyError(STATUS_NOT_FOUND, `Plan ${arg.planId} not found`);
        }

        const currentSubz = await getCompoundSubscription(arg);

        if (!currentSubz) {
            throw new FriendlyError(STATUS_NOT_FOUND, `Subscription with ID ${arg.subscriptionId} not found`);
        }

        if (newPlan[0].id === currentSubz.planId) {
            return;
        }

        if (currentSubz.type != newPlan[0].type) {
            throw new FriendlyError(
                STATUS_BAD_REQUEST,
                "Can't switch to plan with a different duration.\nYou have to cancel this subscription and create a new one",
            );
        }

        extraData = {
            cardToken: currentSubz.cardToken,
            customerEmail: currentSubz.customerEmail,
            newAmount: newPlan[0].amount,
            newPlanId: newPlan[0].id.toString(),
            oldAmount: currentSubz.planAmount,
            oldPlanId: currentSubz.planId.toString(),
        };

        prorationResult = prorate({
            newAmount: newPlan[0].amount,
            oldAmount: currentSubz.planAmount,
            startTime: currentSubz.startTime,
            type: newPlan[0].type,
            now: currentDate,
            residualAmount: currentSubz.residualAmount || "0",
        });
    }

    await runComplexUpdateTx({
        conditions,
        arg,
        prorationResult,
        extraData,
        currentDate,
    });

    return;
});

export async function handleSuccessfulPlanChange(arg: handleSuccessfulPlanChangeArg) {
    return appDB.transaction(async (tx) => {
        const promises: Promise<unknown>[] = [];

        promises.push(
            tx
                .update(subscriptions)
                .set({
                    planId: BigInt(arg.newPlanId),
                })
                .where(and(eq(subscriptions.id, arg.subscriptionId), eq(subscriptions.subscriberId, arg.subscriberId))),
        );

        promises.push(
            tx.insert(applicationLogs).values({
                appId: arg.appId,
                event: ApplicationLogEvents.PLAN_CHANGE,
                metadata: {
                    appId: arg.appId,
                    oldPlanId: arg.oldPlanId,
                    newPlanId: arg.newPlanId,
                    subscriptionId: arg.subscriptionId,
                    amountToPay: arg.amountToPay,
                    userRemaining: arg.surplus,
                    currentDate: arg.currentDate.toISOString(),
                } satisfies ApplicationLogMeta[ApplicationLogEvents.PLAN_CHANGE],
            }),
        );

        await Promise.all(promises);
    });
}

export async function handleSuccessfulSubscription(arg: handleSuccessfulSubscriptionArg) {
    const planDetails = await appDB
        .select({ id: plans.id, durationType: plans.type, amount: plans.amount })
        .from(plans)
        .where(eq(plans.id, arg.planId));
    if (planDetails.length === 0) {
        throw new FriendlyError(STATUS_NOT_FOUND, `Plan ${arg.planId} not found`);
    }

    const startTime = new Date();
    const endTime = addWithSubscriptionDuration(startTime, planDetails[0].durationType);

    return appDB.transaction(async (tx) => {
        const res = await tx
            .insert(subscriptions)
            .values({
                planId: arg.planId,
                subscriberId: arg.subscriberId,
                cardId: arg.cardId,
                startTime: startTime,
                endTime: endTime,
                amount: arg.amount,
                createdAt: startTime,
            })
            .returning({ subscriptionId: subscriptions.id });
        if (res.length === 0) {
            throw new FriendlyError(STATUS_INTERNAL_SERVER_ERROR, `Couldn't get inserted subscription ID`);
        }

        tx.insert(applicationLogs).values({
            appId: arg.appId,
            event: ApplicationLogEvents.PLAN_CHANGE,
            metadata: {
                amount: arg.amount,
                planId: arg.planId.toString(),
                appId: arg.appId,
                currentDate: startTime.toISOString(),
                subscriptionId: res[0].subscriptionId,
            } satisfies ApplicationLogMeta[ApplicationLogEvents.PLAN_SUBSCRIPTION],
        });
    });
}
