import { findProduct } from "../data/products";
import { calcBilling } from "./pricing";
import { deliveryShort } from "./delivery";
import type { SessionUser } from "./session";

export class OrderError extends Error {}

type Line = {
  id: string | number;
  name: string;
  price: number;
  mrp: number;
  qty: number;
  image: string;
  quantity: string;
  unitPrice: string;
};

const r2 = (n: number) => Math.round(n * 100) / 100;

// Re-prices the cart from your product data so the browser can't change amounts
export function priceOrder(input: unknown) {
  if (!Array.isArray(input) || input.length === 0) {
    throw new OrderError("Your cart is empty.");
  }

  const lines: Line[] = input.map((raw) => {
    const qty = Math.floor(Number(raw?.qty));
    const found = findProduct(String(raw?.id));
    if (!found || !Number.isFinite(qty) || qty < 1 || qty > 50) {
      throw new OrderError("One of the items in your cart is not valid.");
    }
    const p = found.product as unknown as {
      id: string | number;
      name: string;
      price: number;
      mrp?: number;
      image?: string;
      quantity?: string;
      unitPrice?: string;
    };
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      mrp: p.mrp ?? p.price,
      qty,
      image: p.image ?? "",
      quantity: p.quantity ?? "",
      unitPrice: p.unitPrice ?? "",
    };
  });

  const bill = calcBilling(lines as unknown as Parameters<typeof calcBilling>[0]);
  const total = r2(bill.total);
  return { lines, bill, total };
}

// Builds the complete document that gets saved in the "orders" collection
export function buildOrderDoc(
  user: SessionUser,
  priced: ReturnType<typeof priceOrder>,
  method: "cod" | "upi" | "stripe"
) {
  const { lines, bill, total } = priced;

  return {
    user: user._id,
    customer: { name: user.name, email: user.email, phone: user.phone },
    address: {
      line: user.address?.line,
      city: user.address?.city,
      pincode: user.address?.pincode,
    },
    items: lines.map((l) => ({
      productId: String(l.id),
      name: l.name,
      image: l.image,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      mrp: l.mrp,
      price: l.price,
      qty: l.qty,
      lineTotal: r2(l.price * l.qty),
    })),
    billing: {
      itemCount: bill.itemCount,
      qtyCount: bill.qtyCount,
      mrpTotal: r2(bill.mrpTotal),
      discount: r2(bill.discount),
      platformFee: r2(bill.platformFee),
      gst: r2(bill.gst),
      total,
    },
    total,
    currency: "INR",
    paymentMethod: method,
    // COD is paid on delivery; UPI must be checked against your UPI app; Stripe is set to paid after verification
    paymentStatus: method === "upi" ? "awaiting_verification" : "pending",
    orderStatus: "placed",
    deliveryEstimate: deliveryShort(),
  };
}