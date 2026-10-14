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
  { id: "upi", title: "Pay with UPI", desc: "Scan the QR code with any UPI app", icon: "📱" },
];

export default function PaymentModal({ total, loading, error, onClose, onSelect }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("cod");
  const [step, setStep] = useState<"choose" | "upi">("choose");
  const [qrFailed, setQrFailed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, loading]);

  const handleContinue = () => {
    if (method === "upi") setStep("upi");
    else onSelect(method);
  };

  const continueLabel =
    method === "cod" ? "Place Order" : method === "stripe" ? "Pay with Stripe" : "Show QR Code";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !loading && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-title"
    >
      <div
        className="relative max-h-[95vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8"
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

        {step === "choose" ? (
          <>
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
              onClick={handleContinue}
              disabled={loading}
              className="mt-6 w-full rounded-xl bg-[#4FA571] py-3.5 text-lg font-semibold text-white transition hover:bg-[#43915f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait…" : continueLabel}
            </button>
          </>
        ) : (
          <>
            <h2 id="payment-title" className="mb-1 text-2xl font-bold text-[#1a1b2e]">
              Pay with UPI
            </h2>
            <p className="mb-5 text-sm text-gray-500">
              Scan this QR code with Google Pay, PhonePe, Paytm or any UPI app and pay{" "}
              <strong className="text-gray-900">{total}</strong>.
            </p>

            <div className="mx-auto flex h-64 w-64 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-2">
              {qrFailed ? (
                <p className="px-4 text-center text-sm text-gray-500">
                  QR image not found. Add your QR code at <code>public/upi-qr.png</code>.
                </p>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/upi-qr.png"
                  alt="UPI QR code"
                  onError={() => setQrFailed(true)}
                  className="h-full w-full object-contain"
                />
              )}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              After paying, tap the button below. We&apos;ll verify your payment and confirm your order.
            </p>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <button
              type="button"
              onClick={() => onSelect("upi")}
              disabled={loading}
              className="mt-5 w-full rounded-xl bg-[#4FA571] py-3.5 text-lg font-semibold text-white transition hover:bg-[#43915f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Placing order…" : "I have paid — Place Order"}
            </button>
            <button
              type="button"
              onClick={() => setStep("choose")}
              disabled={loading}
              className="mt-3 w-full text-center text-sm font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40"
            >
              ← Back to payment methods
            </button>
          </>
        )}
      </div>
    </div>
  );
}