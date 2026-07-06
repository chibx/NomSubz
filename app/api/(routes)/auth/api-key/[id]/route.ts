import { getAppId } from "@/app/api/lib/auth";
import { appDB } from "@/app/api/lib/db/db";
import { appApiKeys } from "@/app/api/lib/db/schema";
import { DUMMY_401_MESSAGE, STATUS_OK, STATUS_UNAUTHORIZED } from "@/app/api/lib/utils/constants";
import { logger, structuredResponse, toGoErrorRet } from "@/app/api/lib/utils/utils";
import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";

export async function DELETE(req: NextRequest, ctx: RouteContext<"/api/auth/api-key/[id]">) {
    const { id } = await ctx.params;

    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }

    const [, error$1] = await toGoErrorRet(() => {
        return appDB.delete(appApiKeys).where(eq(appApiKeys.id, id));
    })();

    if (error$1 !== null) {
        logger.error("Failed to delete API key:", error$1);
        return structuredResponse(500, "Failed to delete API key");
    }

    return structuredResponse(STATUS_OK, "Success");
}
