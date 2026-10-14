import { NextResponse } from "next/server";
import { dbConnect } from "@/app/lib/mongodb";
import { getCurrentUser } from "@/app/lib/session";
import { priceOrder, buildOrderDoc, OrderError } from "@/app/lib/orders";
import { sendOrderEmails } from "@/app/lib/email";
import Order from "@/app/models/Order";

type OrderDoc = {
  _id: unknown;
  createdAt: Date;
  total: number;
  currency?: string;
  items: {
    productId: string;
    name: string;
    image?: string;
    quantity?: string;
    unitPrice?: string;
    mrp?: number;
    price: number;
    qty: number;
    lineTotal?: number;
  }[];
  billing?: {
    itemCount?: number;
    qtyCount?: number;
    mrpTotal?: number;
    discount?: number;
    platformFee?: number;
    gst?: number;
    total?: number;
  };
  address?: { line?: string; city?: string; pincode?: string };
  paymentMethod: "cod" | "upi" | "stripe";
  paymentStatus: string;
  orderStatus: string;
  deliveryEstimate?: string;
  paidAt?: Date;
  stripe?: {
    paymentMethodType?: string;
    cardBrand?: string;
    cardLast4?: string;
    receiptUrl?: string;
  };
};

// Returns all orders of the logged-in user, newest first
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to see your orders." }, { status: 401 });
    }

    await dbConnect();

    const docs = await Order.find({
      user: user._id,
      // hide Stripe checkouts that were abandoned or failed
      $nor: [{ paymentMethod: "stripe", paymentStatus: { $in: ["pending", "failed"] } }],
    })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean<OrderDoc[]>();

    const orders = docs.map((o) => ({
      id: String(o._id),
      createdAt: o.createdAt,
      total: o.total,
      items: (o.items ?? []).map((i) => ({
        productId: i.productId,
        name: i.name,
        image: i.image,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        mrp: i.mrp,
        price: i.price,
        qty: i.qty,
        lineTotal: i.lineTotal,
      })),
      billing: o.billing,
      address: o.address,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      orderStatus: o.orderStatus,
      deliveryEstimate: o.deliveryEstimate,
      paidAt: o.paidAt,
      stripe: o.stripe
        ? {
            paymentMethodType: o.stripe.paymentMethodType,
            cardBrand: o.stripe.cardBrand,
            cardLast4: o.stripe.cardLast4,
            receiptUrl: o.stripe.receiptUrl,
          }
        : undefined,
    }));

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("Orders list error:", err);
    return NextResponse.json({ error: "Could not load your orders." }, { status: 500 });
  }
}

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