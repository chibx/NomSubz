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
    STATUS_OK,
    STATUS_UNAUTHORIZED,
} from "@/app/api/lib/utils/constants";
import { dateToString, logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { isSubscriberForApp } from "@/app/api/lib/utils/db";
import { and, eq, gt, desc } from "drizzle-orm";
import { ListCustomerInvoiceRequest } from "@/app/api/lib/types/response";

// List all invoices for the current user.
export async function GET(req: NextRequest, ctx: RouteContext<"/api/customers/[customerId]/invoices">) {
    const { customerId } = await ctx.params;
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

    const { searchParams } = new URL(req.url);
    const pageParam = searchParams.get("page");
    const countParam = searchParams.get("count");
    const cursor = searchParams.get("cursor");
    const statusFilter = searchParams.get("status");

    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const count = countParam ? Math.min(parseInt(countParam, 10), 100) : 10;

    const conditions = [eq(payments.subscriberId, subscriberId)];

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
            .where(and(eq(subscriptions.appId, appId), ...conditions))
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
        orderReference: invoice.orderReference,
        createdAt: dateToString(invoice.createdAt),
        updatedAt: dateToString(invoice.updatedAt),
        subscriptionId: invoice.subscriptionId,
        planName: invoice.planName,
        planType: invoice.planType,
    }));

    return structuredResponse<ListCustomerInvoiceRequest>(STATUS_OK, "Success", {
        invoices: formattedList,
        nextPage,
        cursor: lastCursor,
    });
}
