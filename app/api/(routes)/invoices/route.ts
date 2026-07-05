import { eq, gt, and, desc } from "drizzle-orm";
import { NextRequest } from "next/server";
import { getAppId } from "../../lib/auth";
import { appDB } from "../../lib/db/db";
import { payments, plans, subscriptions, subscribers } from "../../lib/db/schema";
import {
    STATUS_UNAUTHORIZED,
    DUMMY_401_MESSAGE,
    STATUS_INTERNAL_SERVER_ERROR,
    DUMMY_500_MESSAGE,
    STATUS_OK,
} from "../../lib/utils/constants";
import { structuredResponse, toGoErrorRet, logger, dateToString } from "../../lib/utils/utils";
import { ListAppInvoicesResponse } from "../../lib/types/response";

// List all invoices (Admin)
export async function GET(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const countParam = searchParams.get("count");
    const cursor = searchParams.get("cursor");
    const statusFilter = searchParams.get("status");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const count = countParam ? Math.min(parseInt(countParam, 10), 100) : 10;

    const conditions = [eq(payments.appId, appId)];

    if (statusFilter && ["success", "pending", "failed"].includes(statusFilter)) {
        switch (statusFilter) {
            case "success":
                conditions.push(eq(payments.status, "success"));
                break;
            case "pending":
                conditions.push(eq(payments.status, "pending"));
                break;
            case "failed":
                conditions.push(eq(payments.status, "failed"));
                break;
        }
    }

    if (cursor) {
        conditions.push(gt(payments.id, cursor));
    }

    const [result, error$3] = await toGoErrorRet(() =>
        appDB
            .select({
                paymentId: payments.id,
                amount: payments.amount,
                status: payments.status,
                transactionId: payments.transactionId,
                userId: subscribers.userId,
                orderReference: payments.orderReference,
                createdAt: payments.createdAt,
                updatedAt: payments.updatedAt,
                subscriptionId: payments.subscriptionId,
                planName: plans.name,
                planType: plans.type,
            })
            .from(payments)
            .innerJoin(subscriptions, eq(subscriptions.id, payments.subscriptionId))
            .innerJoin(plans, eq(plans.id, subscriptions.planId))
            .innerJoin(subscribers, eq(subscribers.subscriberId, payments.subscriberId))
            .where(and(...conditions))
            .orderBy(desc(payments.createdAt))
            .limit(count + 1),
    )();

    if (error$3 !== null) {
        logger.withTag(req.url).error("Could not list invoices:", error$3);
        return structuredResponse(STATUS_INTERNAL_SERVER_ERROR, DUMMY_500_MESSAGE);
    }

    const hasNextPage = result.length > count;
    const invoicesList = hasNextPage ? result.slice(0, count) : result;

    const lastCursor = invoicesList.length > 0 ? invoicesList[invoicesList.length - 1].paymentId : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const formattedList = invoicesList.map((invoice) => ({
        paymentId: invoice.paymentId,
        amount: invoice.amount,
        status: invoice.status,
        transactionId: invoice.transactionId,
        userId: invoice.userId,
        orderReference: invoice.orderReference,
        createdAt: dateToString(invoice.createdAt),
        updatedAt: dateToString(invoice.updatedAt),
        subscriptionId: invoice.subscriptionId,
        planName: invoice.planName,
        planType: invoice.planType,
    }));

    return structuredResponse<ListAppInvoicesResponse>(STATUS_OK, "Success", {
        invoices: formattedList,
        nextPage,
        cursor: lastCursor,
    });
}
