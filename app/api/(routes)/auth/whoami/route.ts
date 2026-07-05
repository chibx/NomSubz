import { structuredResponse } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { getAppId } from "@/app/api/lib/auth";
import { STATUS_OK, STATUS_UNAUTHORIZED } from "@/app/api/lib/utils/constants";

export async function GET(req: NextRequest) {
    const appId = getAppId(req);

    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, "Unauthorized");
    }

    return structuredResponse(STATUS_OK, "", {
        app_id: appId,
    });
}
