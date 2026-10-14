import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import { getCurrentUser } from "@/app/lib/session";
import { priceOrder, buildOrderDoc, OrderError } from "@/app/lib/orders";
import { sendOrderEmails } from "@/app/lib/email";
import Order from "@/app/models/Order";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }
    if (!user.address?.line) {
      return NextResponse.json({ error: "Please add a delivery address first." }, { status: 400 });
    }

    const body = await req.json();
    const method = body.paymentMethod;
    if (method !== "cod" && method !== "upi") {
      return NextResponse.json({ error: "Invalid payment method." }, { status: 400 });
    }

    const priced = priceOrder(body.items);

    await dbConnect();
    const order = await Order.create({
      ...buildOrderDoc(user, priced, method),
      emailSent: true,
    });

    await sendOrderEmails(
      {
        id: String(order._id),
        total: priced.total,
        paymentMethod: method,
        items: priced.lines.map((l) => ({ name: l.name, price: l.price, qty: l.qty })),
        address: user.address,
        createdAt: order.createdAt,
      },
      { name: user.name, email: user.email, phone: user.phone }
    );

    return NextResponse.json({ order: { id: String(order._id), total: priced.total } });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Order error:", err);
    return NextResponse.json({ error: "Could not place your order." }, { status: 500 });
  }
}