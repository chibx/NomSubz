import { NextRequest } from "next/server";

// List all active plans (e.g., Basic, Pro, Enterprise).
export async function GET(_req: NextRequest) {
  return new Response("Not implemented", { status: 501 });
}

// Create a new plan.
export async function POST(_req: NextRequest) {
  return new Response("Not implemented", { status: 501 });
}
