import { NextResponse, connection } from "next/server";
import { completeStripeOrder } from "../../../lib/stripeOrders";

export async function GET(req: Request) {
  await connection(); // always run at request time, never during build
  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ paid: false }, { status: 400 });

    const result = await completeStripeOrder(sessionId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Stripe verify error:", err);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}