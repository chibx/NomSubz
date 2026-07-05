import { NextRequest } from "next/server";

// Schedule cancellation. (Sets cancel_at_period_end = true;
// but does not instantly kill access).
export async function POST(req: NextRequest) {}
