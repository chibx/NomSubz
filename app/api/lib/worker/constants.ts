export const DUNNING_PERIOD = 3 * 24 * 60 * 60;
export const MAX_DB_LIMIT = 100;

export enum QUEUES {
    SCHEDULE_RENEWALS = "schedule-renewals",
    CANCEL_SUBSCRIPTION = "cancel-subscription",
    PROCESS_PAYMENT = "process-payment",
    DUNNING_RETRY = "dunning-retry",
}
