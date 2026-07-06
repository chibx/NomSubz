import { STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE } from "@/app/api/lib/utils/constants";
import { structuredResponse } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";
import { getAppId } from "../../lib/auth";

//  Allow downstream product teams to register their own URLs here, so your engine
//  can send them events like subscription.created or subscription.past_due.
export async function GET(req: NextRequest) {
    const appId = getAppId(req);
    if (appId === null) {
        return structuredResponse(STATUS_UNAUTHORIZED, DUMMY_401_MESSAGE);
    }
}
