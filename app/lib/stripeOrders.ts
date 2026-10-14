import type Stripe from "stripe";
import { dbConnect } from "./mongodb";
import { stripe } from "./stripe";
import { sendOrderEmails } from "./email";
import Order from "../models/Order";

type OrderLean = {
  _id: unknown;
  total: number;
  customer: { name: string; email: string; phone: string };
  items: { name: string; price: number; qty: number }[];
  address?: { line?: string; city?: string; pincode?: string };
  createdAt: Date;
};

type MethodInfo = {
  type?: string;
  brand?: string;
  last4?: string;
  detail?: string;
};

const TYPE_LABEL: Record<string, string> = {
  card: "Card",
  upi: "UPI",
  netbanking: "Net banking",
  wallet: "Wallet",
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// Works out what the customer really paid with (card, UPI, ...) from Stripe's charge
function describeMethod(charge: Stripe.Charge | null): MethodInfo {
  const d = charge?.payment_method_details;
  if (!d) return {};

  const type = d.type;
  if (type === "card" && d.card) {
    const brand = d.card.brand ?? undefined;
    const last4 = d.card.last4 ?? undefined;

    let detail = "Card";
    if (brand && brand !== "unknown") detail = `${cap(brand)} card`;
    if (last4) detail += ` ending ${last4}`;

    return { type, brand, last4, detail };
  }
  return { type, detail: TYPE_LABEL[type] ?? cap(type) };
}

// Marks the order paid, saves the payment method and sends the emails.
// Safe to call many times: only the first call does the work.
export async function completeStripeOrder(sessionId: string) {
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent.latest_charge"],
  });

  const orderId = session.metadata?.orderId;
  if (session.payment_status !== "paid" || !orderId) {
    return { paid: false as const };
  }

  const pi =
    session.payment_intent && typeof session.payment_intent !== "string"
      ? session.payment_intent
      : null;
  const charge =
    pi?.latest_charge && typeof pi.latest_charge !== "string" ? pi.latest_charge : null;
  const method = describeMethod(charge);

  const set: Record<string, unknown> = {
    paymentStatus: "paid",
    orderStatus: "confirmed",
    paidAt: new Date(),
    "stripe.amountPaid": (session.amount_total ?? 0) / 100,
    emailSent: true,
  };
  if (pi?.id) set["stripe.paymentIntentId"] = pi.id;
  if (method.type) set["stripe.paymentMethodType"] = method.type;
  if (method.brand) set["stripe.cardBrand"] = method.brand;
  if (method.last4) set["stripe.cardLast4"] = method.last4;
  if (charge?.receipt_url) set["stripe.receiptUrl"] = charge.receipt_url;

  await dbConnect();

  // only the first caller flips emailSent, so the save + emails happen exactly once
  const fresh = await Order.findOneAndUpdate(
    { _id: orderId, "stripe.sessionId": session.id, emailSent: false },
    { $set: set },
    { new: true }
  ).lean<OrderLean>();

  if (fresh) {
    await sendOrderEmails(
      {
        id: String(fresh._id),
        total: fresh.total,
        paymentMethod: "stripe",
        paymentDetail: method.detail,
        transactionId: pi?.id,
        items: fresh.items,
        address: fresh.address,
        createdAt: fresh.createdAt,
      },
      fresh.customer
    );
  }

  const order = await Order.findById(orderId).lean<{ total: number }>();
  return { paid: true as const, orderId, total: order?.total ?? 0 };
}

// Called when a checkout expires or an async payment fails
export async function markStripeOrderFailed(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  await dbConnect();
  await Order.updateOne(
    { _id: orderId, "stripe.sessionId": session.id, paymentStatus: "pending" },
    { $set: { paymentStatus: "failed" } }
  );
}