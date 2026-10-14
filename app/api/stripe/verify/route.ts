import { NextResponse } from "next/server";
import { completeStripeOrder } from "@/app/lib/stripeOrders";

export async function GET(req: Request) {
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