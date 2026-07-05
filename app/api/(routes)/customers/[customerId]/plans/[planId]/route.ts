import { NextRequest } from "next/server";

// Get details of a specific plan.
export async function GET(_req: NextRequest) {
  return new Response("Not implemented", { status: 501 });
}

// Update plan details (Usually just names or
// descriptions; pricing is typically immutable once created).
export async function PUT(_req: NextRequest) {
  return new Response("Not implemented", { status: 501 });
}
