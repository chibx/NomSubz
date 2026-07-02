import { structuredResponse } from "../../lib/utils/utils";
import { STATUS_OK } from "../../lib/utils/constants";

export function GET() {
    return structuredResponse(STATUS_OK, "OK");
}
