"use client";

import { useEffect, useState } from "react";

export type PaymentMethod = "cod" | "stripe" | "upi";

type Props = {
  total: string;
  loading: boolean;
  error: string;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
};

const options: { id: PaymentMethod; title: string; desc: string; icon: string }[] = [
  { id: "cod", title: "Cash on Delivery", desc: "Pay in cash when your order arrives", icon: "💵" },
  { id: "stripe", title: "Pay with Stripe", desc: "Debit / credit card, securely online", icon: "💳" },
  { id: "upi", title: "Pay with UPI", desc: "Google Pay, PhonePe, Paytm and more", icon: "📱" },
];

export default function PaymentModal({ total, loading, error, onClose, onSelect }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cod");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, loading]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close"
          className="absolute right-4 top-4 text-2xl leading-none text-gray-500 hover:text-gray-800 disabled:opacity-40"
        >
          ×
        </button>

        <h2 id="payment-title" className="mb-1 text-2xl font-bold text-[#1a1b2e]">
          Choose payment method
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Total payable: <strong className="text-gray-900">{total}</strong>
        </p>

        <div className="space-y-3" role="radiogroup" aria-label="Payment method">
          {options.map((o) => {
            const active = method === o.id;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMethod(o.id)}
                className={`flex w-full items-center gap-4 rounded-xl border-2 px-4 py-3.5 text-left transition ${
                  active ? "border-red-600 bg-red-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {o.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-gray-900">{o.title}</span>
                  <span className="block text-sm text-gray-500">{o.desc}</span>
                </span>
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    active ? "border-red-600" : "border-gray-300"
                  }`}
                  aria-hidden
                >
                  {active && <span className="h-2.5 w-2.5 rounded-full bg-red-600" />}
                </span>
              </button>
            );
          })}
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={() => onSelect(method)}
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-[#4FA571] py-3.5 text-lg font-semibold text-white transition hover:bg-[#43915f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Placing order…" : method === "cod" ? "Place Order" : "Continue to Pay"}
        </button>
      </div>
    </div>
  );
}