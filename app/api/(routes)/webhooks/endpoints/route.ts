import { logger } from "@/app/api/lib/utils/utils";
import { NextRequest } from "next/server";

//  Allow downstream product teams to register their own URLs here, so your engine
//  can send them events like subscription.created or subscription.past_due.
export async function POST(req: NextRequest) {}
