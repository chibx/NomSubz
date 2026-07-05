import { NextRequest } from "next/server";
import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { payments, subscriptions, plans } from "@/app/api/lib/db/schema";
import {
    DUMMY_401_MESSAGE,
    DUMMY_500_MESSAGE,
    STATUS_BAD_REQUEST,
    STATUS_FORBIDDEN,
    STATUS_INTERNAL_SERVER_ERROR,
    STATUS_NOT_FOUND,
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import { dateToString, logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { isSubscriberForApp } from "@/app/api/lib/utils/db";
import { and, eq } from "drizzle-orm";
import { GetInvoiceResponse } from "@/app/api/lib/types/response";

// Get details of a specific invoice
export async function GET(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]/invoices/[invoiceId]">) {
    const { customerId, invoiceId } = await ctx.params;
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

    const [result, error$3] = await toGoErrorRet(() =>
        appDB
            .select({
                paymentId: payments.id,
                amount: payments.amount,
                status: payments.status,
                transactionId: payments.transactionId,
                orderReference: payments.orderReference,
                createdAt: payments.createdAt,
                updatedAt: payments.updatedAt,
                subscriptionId: payments.subscriptionId,
                planName: plans.name,
                planType: plans.type,
                planAmount: plans.amount,
                currency: plans.currency,
            })
            .from(payments)
            .innerJoin(subscriptions, eq(subscriptions.id, payments.subscriptionId))
            .innerJoin(plans, eq(plans.id, subscriptions.planId))
            .where(and(eq(payments.subscriberId, subscriberId), eq(payments.id, invoiceId))),
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not fetch invoice:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    if (result.length === 0) {
        return structuredResponse(STATUS_NOT_FOUND, "Invoice not found");
    }

    const invoice = result[0];

    return structuredResponse<GetInvoiceResponse>(STATUS_OK, "Success", {
        paymentId: invoice.paymentId,
        amount: invoice.amount,
        status: invoice.status,
        transactionId: invoice.transactionId,
        orderReference: invoice.orderReference,
        createdAt: dateToString(invoice.createdAt),
        updatedAt: dateToString(invoice.updatedAt),
        subscriptionId: invoice.subscriptionId,
        planName: invoice.planName,
        planType: invoice.planType,
        planAmount: invoice.planAmount,
        currency: invoice.currency,
    });
}
