"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import AddressModal from "./AddressModal";
import PaymentModal, { type PaymentMethod } from "./PaymentModal";
import { categories } from "../data/products";
import { useCart, type CartItem } from "../lib/cart";
import { calcBilling } from "../lib/pricing";
import { deliveryShort } from "../lib/delivery";
import { useUser, refreshUser } from "../lib/user";

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const money = (n: number) =>
  `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ---------- icons ---------- */

const svg = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" strokeWidth="2" {...svg} aria-hidden="true">
      <path d="m15 5-7 7 7 7" />
    </svg>
  );
}
function CheckCircle() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#16a34a" />
      <path d="m7 12.5 3.2 3.2L17 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" strokeWidth="2" {...svg} aria-hidden="true">
      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Z" fill="#16a34a" />
      <circle cx="12" cy="9" r="2.6" fill="#fff" />
    </svg>
  );
}
function ChevronUp({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-5 w-5 transition-transform ${open ? "" : "rotate-180"}`} strokeWidth="2.4" {...svg} aria-hidden="true">
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}
function Minus() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" strokeWidth="3" {...svg} aria-hidden="true">
      <path d="M5 12h14" />
    </svg>
  );
}
function Plus() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" strokeWidth="3" {...svg} aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

/* ---------- pieces ---------- */

function Thumb({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1 sm:h-[72px] sm:w-[72px]">
      {failed || !item.image ? (
        <span className="text-3xl" aria-hidden>
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

function Stepper({
  qty,
  onMinus,
  onPlus,
}: {
  qty: number;
  onMinus: () => void;
  onPlus: () => void;
}) {
  return (
    <div className="flex h-10 shrink-0 overflow-hidden rounded-lg border-2 border-red-600 sm:h-12">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={onMinus}
        className="flex w-9 items-center justify-center bg-white text-red-600 hover:bg-red-50 sm:w-12"
      >
        <Minus />
      </button>
      <span className="flex w-9 items-center justify-center bg-red-600 text-base font-bold text-white sm:w-12 sm:text-lg">
        {qty}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={onPlus}
        className="flex w-9 items-center justify-center bg-white text-red-600 hover:bg-red-50 sm:w-12"
      >
        <Plus />
      </button>
    </div>
  );
}

function BillRow({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 text-base text-gray-600 sm:text-lg">
      <span>{label}</span>
      <span className={green ? "font-semibold text-green-600" : "text-gray-700"}>{value}</span>
    </div>
  );
}

/* ---------- page ---------- */

export default function CartView() {
  // avoid a flash of "empty cart" while the saved cart loads in the browser
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const { items, count, increase, decrease, clear } = useCart();
  const { user } = useUser();

  const [billOpen, setBillOpen] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{ id: string; total: number; method: PaymentMethod } | null>(null);

  if (!hydrated) return <main className="min-h-[60vh]" />;

  const bill = calcBilling(items);
  const addressText = user?.address?.line
    ? `${user.address.line} , ${user.address.city} ${user.address.pincode}`
    : null;

  // Step 1: "Confirm Order" -> check login + address, then open payment modal
  const handleConfirm = () => {
    setError("");
    if (!user) {
      setError("Please log in to place your order.");
      return;
    }
    if (!user.address?.line) {
      setShowAddress(true);
      return;
    }
    setShowPayment(true);
  };

  // Step 2: user picked a payment method in the modal
  const placeOrder = async (method: PaymentMethod) => {
    setError("");
    setPlacing(true);
    let redirecting = false;
    try {
      const orderItems = items.map((i) => ({ id: i.id, qty: i.qty }));

      // Stripe: create a Checkout Session and send the customer to Stripe
      if (method === "stripe") {
        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: orderItems }),
        });
        const data = await res.json();
        if (!res.ok || !data.url) {
          setError(data.error || "Could not start Stripe checkout.");
          return;
        }
        redirecting = true;
        window.location.href = data.url;
        return;
      }

      // Cash on delivery / UPI: place the order (emails are sent by the server)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: orderItems, paymentMethod: method }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not place your order.");
        return;
      }
      clear();
      setShowPayment(false);
      setPlaced({ id: data.order.id, total: data.order.total, method });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      if (!redirecting) setPlacing(false);
    }
  };

  /* ----- order placed ----- */
  if (placed) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-6xl" aria-hidden>
          🎉
        </span>
        <h1 className="text-2xl font-bold text-[#1a1b2e]">Order placed!</h1>
        <p className="text-gray-600">
          Thank you for shopping with CityMall. Your order of{" "}
          <strong>{money(placed.total)}</strong> will be delivered by {deliveryShort()}.
        </p>
        {placed.method === "cod" && (
          <p className="text-sm text-gray-500">Please keep the cash ready at the time of delivery.</p>
        )}
        {placed.method === "upi" && (
          <p className="text-sm text-gray-500">
            We&apos;ll verify your UPI payment and confirm by email shortly.
          </p>
        )}
        <p className="break-all text-xs text-gray-400">Order ID: {placed.id}</p>
        <Link
          href="/"
          className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  /* ----- empty cart ----- */
  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-6xl" aria-hidden>
          🛒
        </span>
        <h1 className="text-xl font-semibold text-gray-800">Your cart is empty</h1>
        <p className="text-sm text-gray-500">Add some products and they&apos;ll show up here.</p>
        <Link
          href="/"
          className="mt-2 rounded-xl bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-700"
        >
          Start shopping
        </Link>
      </main>
    );
  }

  const inCart = new Set(items.map((i) => String(i.id)));
  const suggestions = categories
    .flatMap((c) => c.products.map((p) => ({ p, emoji: c.emoji })))
    .filter((s) => !inCart.has(String(s.p.id)))
    .slice(0, 12);

  const confirmBtn = (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={placing}
      className="w-full rounded-2xl bg-[#4FA571] py-3.5 text-lg font-semibold text-white transition hover:bg-[#43915f] disabled:cursor-not-allowed disabled:opacity-60 sm:py-4 sm:text-xl"
    >
      Confirm Order
    </button>
  );

  return (
    <main className="mx-auto w-full max-w-[1280px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-10">
      {/* title */}
      <div className="mb-6 flex items-center gap-4 lg:mb-10 lg:gap-8">
        <Link href="/" aria-label="Back to shopping" className="text-gray-800 hover:text-red-600">
          <BackIcon />
        </Link>
        <h1 className="text-2xl font-medium text-gray-800 sm:text-3xl">My Cart</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_460px]">
        {/* ================= LEFT ================= */}
        <div className="min-w-0">
          {bill.discount > 0 && (
            <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-4 py-3.5 text-base font-medium text-green-700 sm:px-5 sm:text-lg">
              <CheckCircle />
              You are saving {rupee(bill.discount)} on this order
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1.5 text-base font-medium text-red-600 hover:text-red-700 sm:text-lg"
            >
              <TrashIcon />
              Clear Cart
            </button>
          </div>

          <h2 className="mt-4 border-b border-gray-200 pb-4 text-lg font-bold text-gray-900 sm:text-xl">
            Delivery on {deliveryShort()}
          </h2>

          {/* items */}
          <ul className="divide-y divide-gray-100">
            {items.map((item) => (
              <li
                key={String(item.id)}
                className="grid grid-cols-[64px_1fr] items-center gap-x-3 gap-y-3 py-4 sm:grid-cols-[72px_1fr_auto_96px] sm:gap-x-6"
              >
                <Thumb item={item} />

                <div className="min-w-0">
                  <h3 className="line-clamp-2 text-base font-medium leading-snug text-gray-800 sm:text-lg">
                    {item.name}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500 sm:text-base">
                    {item.unitPrice ? `${item.quantity} • ${item.unitPrice}` : item.quantity}
                  </p>
                </div>

                {/* phones: stepper + price on their own row · sm+: they become grid columns */}
                <div className="col-start-2 flex items-center justify-between gap-3 sm:contents">
                  <Stepper
                    qty={item.qty}
                    onMinus={() => decrease(item.id)}
                    onPlus={() => increase(item.id)}
                  />
                  <div className="text-right">
                    {item.mrp > item.price && (
                      <p className="text-xs text-gray-400 line-through sm:text-sm">{rupee(item.mrp)}</p>
                    )}
                    <p className="text-lg font-bold text-gray-900">{rupee(item.price)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* you may also like */}
          {suggestions.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 sm:text-2xl">You may also like</h2>
              <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-8 pt-1 [scrollbar-width:none] sm:-mx-6 sm:gap-5 sm:px-6 lg:mx-0 lg:px-0 [&::-webkit-scrollbar]:hidden">
                {suggestions.map((s, i) => (
                  <ProductCard key={`${s.p.id}-${i}`} product={s.p} fallbackEmoji={s.emoji} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ================= RIGHT ================= */}
        <aside className="min-w-0 lg:sticky lg:top-6 lg:self-start">
          {/* delivering to */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 px-3 py-3 sm:gap-4 sm:px-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-50">
              <PinIcon />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-gray-500 sm:text-base">Delivering to HOME</p>
              <p className="text-base font-medium text-gray-900 sm:text-lg">
                {user
                  ? addressText ?? "No address added yet"
                  : "Log in to choose your delivery address"}
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={() => setShowAddress(true)}
                className="shrink-0 text-base font-semibold text-blue-500 hover:text-blue-600 sm:text-lg"
              >
                {addressText ? "Change" : "Add"}
              </button>
            )}
          </div>

          {/* billing */}
          <section className="mt-6">
            <button
              type="button"
              onClick={() => setBillOpen((o) => !o)}
              aria-expanded={billOpen}
              className="flex w-full items-center justify-between border-b border-gray-200 px-1 py-4 text-left text-lg font-bold text-gray-900 sm:text-xl"
            >
              Billing Details
              <ChevronUp open={billOpen} />
            </button>

            {billOpen && (
              <div className="px-1">
                <BillRow label={`Price (${bill.itemCount} ${bill.itemCount === 1 ? "Item" : "Items"})`} value={money(bill.mrpTotal)} />
                <BillRow label="CityMall Offer" value={`-${money(bill.discount)}`} />
                <BillRow label="Surge Fee" value="FREE" green />
                <BillRow label="Platform Fees" value={`+${money(bill.platformFee)}`} />
                <BillRow label="GST on Fees" value={`+${money(bill.gst)}`} />

                <div className="mt-3 flex items-center justify-between border-t border-gray-300 pt-4 text-xl font-bold text-gray-900 sm:text-2xl">
                  <span>Total Payable</span>
                  <span>{money(bill.total)}</span>
                </div>

                {bill.discount > 0 && (
                  <>
                    <p className="mt-4 border-t border-dashed border-gray-300 pt-4 text-base font-semibold text-green-600 sm:text-lg">
                      You saved {money(bill.discount)} on this order
                    </p>
                    <p className="mt-4 rounded-2xl bg-green-50 px-4 py-3.5 text-center text-base font-medium text-green-700 sm:text-lg">
                      You are saving {bill.discount.toFixed(2)} on this order
                    </p>
                  </>
                )}
              </div>
            )}
          </section>

          {/* big total + confirm (desktop) */}
          <div className="mt-10 hidden lg:block">
            <p className="text-gray-900">
              <span className="text-lg font-bold">₹</span>
              <span className="text-5xl font-extrabold">{Math.floor(bill.total)}</span>
              <span className="text-2xl font-bold">.{bill.total.toFixed(2).split(".")[1]}</span>
            </p>
            <p className="mb-5 mt-1 text-lg text-gray-500">
              {bill.qtyCount} {bill.qtyCount === 1 ? "Item" : "Items"}
            </p>
            {confirmBtn}
            {error && !showPayment && (
              <p className="mt-3 text-center text-sm text-red-600">{error}</p>
            )}
          </div>
        </aside>
      </div>

      {/* confirm bar (phones & tablets): always visible at the bottom */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] lg:hidden">
        {error && !showPayment && <p className="mb-2 text-center text-sm text-red-600">{error}</p>}
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="shrink-0">
            <p className="text-2xl font-extrabold leading-none text-gray-900">{money(bill.total)}</p>
            <p className="mt-1 text-xs text-gray-500">
              {count} {count === 1 ? "Item" : "Items"}
            </p>
          </div>
          <div className="flex-1">{confirmBtn}</div>
        </div>
      </div>

      {showAddress && user && (
        <AddressModal
          initial={user.address}
          onClose={() => setShowAddress(false)}
          onSaved={refreshUser}
        />
      )}

      {showPayment && (
        <PaymentModal
          total={money(bill.total)}
          loading={placing}
          error={error}
          onClose={() => {
            setShowPayment(false);
            setError("");
          }}
          onSelect={placeOrder}
        />
      )}
    </main>
  );
}