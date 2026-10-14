import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/app/lib/mongodb";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import { calcBilling } from "@/app/lib/pricing";
import { categories, type Product } from "@/app/data/products";
import User from "@/app/models/User";
import Order from "@/app/models/Order";

// Places an order. Prices are looked up on the server — never trusted from the browser.
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = token ? verifyToken(token) : null;
    if (!payload) {
      return NextResponse.json({ error: "Please log in to place your order." }, { status: 401 });
    }

    const { items } = await req.json();
    if (!Array.isArray(items) || items.length === 0 || items.length > 100) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const catalog = new Map<string, Product>();
    categories.forEach((c) =>
      c.products.forEach((p) => {
        if (!catalog.has(String(p.id))) catalog.set(String(p.id), p);
      })
    );

    const lines: { product: Product; qty: number }[] = [];
    for (const it of items) {
      const product = catalog.get(String(it?.id));
      const qty = Number(it?.qty);
      if (!product || !Number.isInteger(qty) || qty < 1 || qty > 99) {
        return NextResponse.json(
          { error: "Some items in your cart are no longer available." },
          { status: 400 }
        );
      }
      lines.push({ product, qty });
    }

    await dbConnect();

    const user = await User.findById(payload.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    if (!user.address?.line) {
      return NextResponse.json({ error: "Please add a delivery address first." }, { status: 400 });
    }

    const billing = calcBilling(
      lines.map((l) => ({ price: l.product.price, mrp: l.product.mrp, qty: l.qty }))
    );

    const order = await Order.create({
      user: user._id,
      items: lines.map((l) => ({
        productId: String(l.product.id),
        name: l.product.name,
        quantity: l.product.quantity,
        price: l.product.price,
        mrp: l.product.mrp,
        qty: l.qty,
      })),
      address: {
        line: user.address.line,
        city: user.address.city,
        pincode: user.address.pincode,
      },
      billing: {
        mrpTotal: billing.mrpTotal,
        discount: billing.discount,
        subtotal: billing.subtotal,
        platformFee: billing.platformFee,
        gst: billing.gst,
        total: billing.total,
      },
    });

    return NextResponse.json(
      { order: { id: order._id.toString(), total: billing.total } },
      { status: 201 }
    );
  } catch (err) {
    console.error("Order error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}