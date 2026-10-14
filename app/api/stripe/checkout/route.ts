import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { dbConnect } from "@/app/lib/mongodb";
import { getCurrentUser } from "@/app/lib/session";
import { priceOrder, buildOrderDoc, OrderError } from "@/app/lib/orders";
import { stripe } from "@/app/lib/stripe";
import Order from "@/app/models/Order";

export async function POST(req: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 500 });
    }

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }
    if (!user.address?.line) {
      return NextResponse.json({ error: "Please add a delivery address first." }, { status: 400 });
    }

    const body = await req.json();
    const priced = priceOrder(body.items);
    const { lines, total } = priced;

    // save the full order first (payment still "pending")
    await dbConnect();
    const order = await Order.create(buildOrderDoc(user, priced, "stripe"));

    // item lines + one line for platform fees/GST so the Stripe total matches your bill
    const itemsSum = lines.reduce((s, l) => s + l.price * l.qty, 0);
    const feePaise = Math.round((total - itemsSum) * 100);

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[];
    if (feePaise >= 0) {
      line_items = lines.map((l) => ({
        quantity: l.qty,
        price_data: {
          currency: "inr",
          unit_amount: Math.round(l.price * 100),
          product_data: { name: l.name },
        },
      }));
      if (feePaise > 0) {
        line_items.push({
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: feePaise,
            product_data: { name: "Platform fees & GST" },
          },
        });
      }
    } else {
      line_items = [
        {
          quantity: 1,
          price_data: {
            currency: "inr",
            unit_amount: Math.round(total * 100),
            product_data: { name: "CityMall order" },
          },
        },
      ];
    }

    const appUrl = process.env.APP_URL || new URL(req.url).origin;

    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items,
        customer_email: user.email,
        client_reference_id: String(order._id),
        metadata: { orderId: String(order._id) },
        success_url: `${appUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/cart`,
      });
    } catch (err) {
      // Stripe refused to create the session: record that on the order
      await Order.findByIdAndUpdate(order._id, { paymentStatus: "failed" });
      throw err;
    }

    await Order.findByIdAndUpdate(order._id, { "stripe.sessionId": session.id });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Could not start Stripe checkout." }, { status: 500 });
  }
}