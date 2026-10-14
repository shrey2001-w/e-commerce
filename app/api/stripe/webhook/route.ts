import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/app/lib/stripe";
import { completeStripeOrder, markStripeOrderFailed } from "@/app/lib/stripeOrders";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");

  if (!secret || !signature) {
    return NextResponse.json({ error: "Webhook is not configured." }, { status: 400 });
  }

  // Stripe signs the raw body, so read it as text (not JSON)
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook signature check failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await completeStripeOrder(session.id);
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        await markStripeOrderFailed(event.data.object as Stripe.Checkout.Session);
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook handler error:", err);
    // a 500 makes Stripe retry later
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }
}