"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useUser } from "../lib/user";

type OrderItem = {
  productId: string;
  name: string;
  image?: string;
  quantity?: string;
  unitPrice?: string;
  mrp?: number;
  price: number;
  qty: number;
  lineTotal?: number;
};

type OrderData = {
  id: string;
  createdAt: string;
  total: number;
  items: OrderItem[];
  billing?: {
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
  paidAt?: string;
  stripe?: {
    paymentMethodType?: string;
    cardBrand?: string;
    cardLast4?: string;
    receiptUrl?: string;
  };
};

type Loaded = { email: string; orders?: OrderData[]; error?: string };

/* ---------- helpers ---------- */

const money = (n = 0) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

function paymentLabel(o: OrderData) {
  if (o.paymentMethod === "cod") return "Cash on Delivery";
  if (o.paymentMethod === "upi") return "UPI (QR code)";

  const s = o.stripe;
  if (s?.paymentMethodType === "card") {
    const brand = s.cardBrand && s.cardBrand !== "unknown" ? `${cap(s.cardBrand)} card` : "Card";
    return `Stripe · ${brand}${s.cardLast4 ? ` ending ${s.cardLast4}` : ""}`;
  }
  if (s?.paymentMethodType) return `Stripe · ${cap(s.paymentMethodType)}`;
  return "Stripe";
}

const PAYMENT_STATUS: Record<string, { text: string; cls: string }> = {
  paid: { text: "Paid", cls: "bg-green-50 text-green-700" },
  pending: { text: "Pay on delivery", cls: "bg-amber-50 text-amber-700" },
  awaiting_verification: { text: "Payment under verification", cls: "bg-amber-50 text-amber-700" },
  failed: { text: "Payment failed", cls: "bg-red-50 text-red-700" },
};

const ORDER_STATUS: Record<string, { text: string; cls: string }> = {
  placed: { text: "Order placed", cls: "bg-blue-50 text-blue-700" },
  confirmed: { text: "Confirmed", cls: "bg-blue-50 text-blue-700" },
  shipped: { text: "Shipped", cls: "bg-indigo-50 text-indigo-700" },
  delivered: { text: "Delivered", cls: "bg-green-50 text-green-700" },
  cancelled: { text: "Cancelled", cls: "bg-red-50 text-red-700" },
};

function Badge({ text, cls }: { text: string; cls: string }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold sm:text-sm ${cls}`}>{text}</span>
  );
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 text-sm text-gray-600 sm:text-base">
      <span>{label}</span>
      <span className={green ? "font-semibold text-green-600" : "text-gray-800"}>{value}</span>
    </div>
  );
}

function Thumb({ item }: { item: OrderItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1">
      {failed || !item.image ? (
        <span className="text-2xl" aria-hidden>
          🛍️
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain"
        />
      )}
    </div>
  );
}

function OrderCard({ order, defaultOpen }: { order: OrderData; defaultOpen: boolean }) {
  const pay = PAYMENT_STATUS[order.paymentStatus] ?? { text: order.paymentStatus, cls: "bg-gray-100 text-gray-700" };
  const status = ORDER_STATUS[order.orderStatus] ?? { text: order.orderStatus, cls: "bg-gray-100 text-gray-700" };
  const address = order.address?.line
    ? `${order.address.line}, ${order.address.city ?? ""} ${order.address.pincode ?? ""}`
    : "Not available";
  const b = order.billing;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-4 sm:px-6">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">Order ID</p>
          <p className="break-all text-base font-semibold text-gray-900">{order.id}</p>
          <p className="mt-1 text-sm text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge {...status} />
          <Badge {...pay} />
        </div>
      </div>

      {/* items */}
      <ul className="divide-y divide-gray-100 px-4 sm:px-6">
        {order.items.map((item, idx) => (
          <li key={`${item.productId}-${idx}`} className="flex items-center gap-4 py-4">
            <Thumb item={item} />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-base font-medium text-gray-800">{item.name}</p>
              <p className="mt-0.5 text-sm text-gray-500">
                {item.quantity ? `${item.quantity} • ` : ""}
                {item.qty} × {money(item.price)}
              </p>
            </div>
            <p className="shrink-0 text-base font-bold text-gray-900">
              {money(item.lineTotal ?? item.price * item.qty)}
            </p>
          </li>
        ))}
      </ul>

      {/* total */}
      <div className="flex items-center justify-between border-t border-gray-100 px-4 py-4 sm:px-6">
        <span className="text-base font-semibold text-gray-700">Total</span>
        <span className="text-xl font-extrabold text-gray-900">{money(order.total)}</span>
      </div>

      {/* details */}
      <details open={defaultOpen} className="group border-t border-gray-100">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 text-base font-semibold text-red-600 sm:px-6">
          Order details
          <span className="text-sm transition-transform group-open:rotate-180" aria-hidden>
            ▼
          </span>
        </summary>

        <div className="grid gap-6 px-4 pb-6 sm:px-6 md:grid-cols-2">
          <section>
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Delivery</h3>
            <p className="text-sm text-gray-800 sm:text-base">{address}</p>
            {order.deliveryEstimate && (
              <p className="mt-1 text-sm text-gray-600 sm:text-base">
                Delivery by <strong>{order.deliveryEstimate}</strong>
              </p>
            )}

            <h3 className="mb-2 mt-5 text-sm font-bold uppercase tracking-wide text-gray-500">Payment</h3>
            <p className="text-sm text-gray-800 sm:text-base">{paymentLabel(order)}</p>
            <p className="mt-1 text-sm text-gray-600 sm:text-base">Status: {pay.text}</p>
            {order.paidAt && (
              <p className="mt-1 text-sm text-gray-600 sm:text-base">Paid on {formatDate(order.paidAt)}</p>
            )}
            {order.stripe?.receiptUrl && (
              <a
                href={order.stripe.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-blue-500 hover:text-blue-600"
              >
                View payment receipt
              </a>
            )}
          </section>

          {b && (
            <section>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-500">Bill details</h3>
              <Row label="Price" value={money(b.mrpTotal)} />
              <Row label="CityMall Offer" value={`-${money(b.discount)}`} />
              <Row label="Surge Fee" value="FREE" green />
              <Row label="Platform Fees" value={`+${money(b.platformFee)}`} />
              <Row label="GST on Fees" value={`+${money(b.gst)}`} />
              <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
                <span>Total Payable</span>
                <span>{money(b.total ?? order.total)}</span>
              </div>
            </section>
          )}
        </div>
      </details>
    </article>
  );
}

/* ---------- page body ---------- */

export default function OrdersView() {
  const { user, ready } = useUser();
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  const email = user?.email;

  useEffect(() => {
    if (!email) return;
    let cancelled = false;

    fetch("/api/orders")
      .then(async (res) => {
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) setLoaded({ email, error: data.error || "Could not load your orders." });
        else setLoaded({ email, orders: data.orders });
      })
      .catch(() => {
        if (!cancelled) setLoaded({ email, error: "Network error. Please try again." });
      });

    return () => {
      cancelled = true;
    };
  }, [email]);

  const current = loaded && loaded.email === email ? loaded : null;

  return (
    <main className="mx-auto w-full max-w-[900px] px-4 pb-16 pt-6 sm:px-6 lg:pt-10">
      <h1 className="mb-6 text-2xl font-medium text-gray-800 sm:text-3xl">My Orders</h1>

      {/* still checking who is logged in */}
      {!ready && <p className="text-gray-500">Loading…</p>}

      {/* logged out */}
      {ready && !user && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-6xl" aria-hidden>
            🔒
          </span>
          <h2 className="text-xl font-semibold text-gray-800">Please log in to see your orders</h2>
          <p className="text-sm text-gray-500">Use the Login button at the top of the page.</p>
        </div>
      )}

      {/* logged in */}
      {ready && user && !current && <p className="text-gray-500">Loading your orders…</p>}

      {ready && user && current?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{current.error}</p>
      )}

      {ready && user && current?.orders && current.orders.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-6xl" aria-hidden>
            📦
          </span>
          <h2 className="text-xl font-semibold text-gray-800">No orders yet</h2>
          <p className="text-sm text-gray-500">When you place an order, it will show up here.</p>
          <Link
            href="/"
            className="mt-2 rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700"
          >
            Start shopping
          </Link>
        </div>
      )}

      {ready && user && current?.orders && current.orders.length > 0 && (
        <div className="space-y-6">
          {current.orders.map((o, i) => (
            <OrderCard key={o.id} order={o} defaultOpen={i === 0} />
          ))}
        </div>
      )}
    </main>
  );
}