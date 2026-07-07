import { logger, pgBoss } from "@/app/api/lib/utils/utils";
import { DunningJobData, ProcessPaymentJobData } from "../types/types";
import { QUEUES } from "./constants";
import { CancelSubscriptionWork, DunningRetryWork, ProcessPaymentWork, ScheduleRenewalsWork } from "./works";

export async function initializeBackgroundJobs() {
    pgBoss.on("error", (error) => logger.error("[PGBoss]:", error));
    pgBoss.on("warning", (warning) => logger.warn("[PGBoss]:", warning.message));

    await pgBoss.start();
    await Promise.all([
        pgBoss.createQueue(QUEUES.SCHEDULE_RENEWALS, { retryLimit: 5, retryDelay: 60 }),
        pgBoss.createQueue(QUEUES.CANCEL_SUBSCRIPTION, { retryLimit: 5, retryDelay: 60 }),
        pgBoss.createQueue(QUEUES.PROCESS_PAYMENT, { retryLimit: 5, retryDelay: 60 }),
        pgBoss.createQueue(QUEUES.DUNNING_RETRY, { retryLimit: 5, retryDelay: 60 }),
    ]);

    // Tell pg-boss to run this job every hour automatically
    await pgBoss.schedule(QUEUES.SCHEDULE_RENEWALS, "0 * * * *");
    await pgBoss.schedule(QUEUES.CANCEL_SUBSCRIPTION, "*/30 * * * *"); // Every 30 minutes

    pgBoss.work(QUEUES.SCHEDULE_RENEWALS, ScheduleRenewalsWork);

    pgBoss.work(QUEUES.CANCEL_SUBSCRIPTION, CancelSubscriptionWork);

    pgBoss.work<ProcessPaymentJobData>(QUEUES.PROCESS_PAYMENT, ProcessPaymentWork);

    pgBoss.work<DunningJobData>(QUEUES.DUNNING_RETRY, DunningRetryWork);
}
