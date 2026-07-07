import { NextRequest } from "next/server";
import { FriendlyError, logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { parseWebhookEvent } from "@/app/api/lib/nomba-client/utils";
import { DUMMY_500_MESSAGE, STATUS_BAD_REQUEST, STATUS_INTERNAL_SERVER_ERROR } from "@/app/api/lib/utils/constants";
import { nombaWebhookSecret } from "@/app/api/lib/utils/env";
import { WebHookTypes, WebHookVariants } from "@/app/api/lib/types/types";
import { EventType } from "@/app/api/lib/nomba-client/types";
import { doPlanSubscriptionWebHook, doPlanUpgradeWebHook } from "./webhook";

// The endpoint Nomba hits when an asynchronous payment succeeds or fails.
export async function POST(req: NextRequest) {
    logger.debug("NOMBA WEBHOOK RECEIVED");
    // TODO: This is for testing in my logs
    const rawBody = await req.text();
    logger.info("Webhook parsed successfully", rawBody);
    const signature = req.headers.get("nomba-signature");
    const [webhook, err$1] = await toGoErrorRet(() => parseWebhookEvent(rawBody, signature!, nombaWebhookSecret))();
    if (err$1 !== null) {
        if (err$1 instanceof FriendlyError) {
            logger.debug(err$1);
            if (err$1.code === STATUS_INTERNAL_SERVER_ERROR) {
                return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE, null);
            } else if (err$1.code === STATUS_BAD_REQUEST) {
                return structuredResponse(STATUS_BAD_REQUEST, err$1.message, null);
            }
        }
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE, null);
    }

    if (webhook.event_type === EventType.PAYMENT_SUCCESS) {
        const data = webhook.data;
        const order = data?.order;
        if (!order) {
            logger.error("Order data not found");
            return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, "Invalid webhook signature", null);
        }
        if (!order.orderMetaData) {
            logger.error("Order metadata not found");
            return structuredResponse(STATUS_BAD_REQUEST, "No webhook metadata found", null);
        }
        const extraData = order.orderMetaData as WebHookVariants;
        if (extraData.type === WebHookTypes.PLAN_CHANGE_UPGRADE) {
            return doPlanUpgradeWebHook(order, extraData);
        }
        if (extraData.type === WebHookTypes.PLAN_SUBSCRIPTION) {
            return await doPlanSubscriptionWebHook(data, order, extraData);
        }
    }
}
