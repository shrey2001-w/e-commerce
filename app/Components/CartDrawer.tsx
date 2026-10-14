"use client";

import { useEffect, useState } from "react";
import { useCart, type CartItem } from "../lib/cart";

type Props = {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Thumb({ item }: { item: CartItem }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-1 sm:h-20 sm:w-20">
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

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
    </svg>
  );
}

export default function CartDrawer({ open, onClose, onCheckout }: Props) {
  const { items, count, subtotal, savings, increase, decrease, remove } = useCart();

  // Close on Escape + lock background scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-[visibility] duration-300 ${open ? "visible" : "invisible"}`}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
      />

      {/* panel: full width on phones, 28rem slide-over on larger screens */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white shadow-2xl transition-transform duration-300 sm:max-w-md ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-gray-200 border-t-4 border-t-[#1a1b2e] px-4 py-4 sm:px-6">
          <h2 className="text-xl font-bold text-[#1a1b2e]">
            Your Cart
            {count > 0 && (
              <span className="ml-2 text-base font-medium text-gray-500">
                ({count} {count === 1 ? "item" : "items"})
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="text-3xl leading-none text-gray-500 hover:text-gray-800"
          >
            ×
          </button>
        </div>

        {items.length === 0 ? (
          /* empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-6xl" aria-hidden>
              🛒
            </span>
            <p className="text-lg font-semibold text-gray-800">Your cart is empty</p>
            <p className="text-sm text-gray-500">Add some products and they&apos;ll show up here.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 rounded-lg bg-red-600 px-6 py-2.5 font-semibold text-white transition hover:bg-red-700"
            >
              Start shopping
            </button>
          </div>
        ) : (
          <>
            {/* items (scrolls when the list is long) */}
            <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto px-4 sm:px-6">
              {items.map((item) => (
                <li key={String(item.id)} className="flex gap-3 py-4">
                  <Thumb item={item} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-2 text-sm font-medium leading-snug text-gray-800 sm:text-base">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="shrink-0 text-gray-400 transition hover:text-red-600"
                      >
                        <TrashIcon />
                      </button>
                    </div>

                    <p className="mt-0.5 text-xs text-gray-500">{item.quantity}</p>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      {/* quantity stepper */}
                      <div className="flex items-center overflow-hidden rounded-lg bg-red-600 text-white">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => decrease(item.id)}
                          className="px-3 py-1.5 text-lg font-bold leading-none hover:bg-red-700"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm font-bold">{item.qty}</span>
                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() => increase(item.id)}
                          className="px-3 py-1.5 text-lg font-bold leading-none hover:bg-red-700"
                        >
                          +
                        </button>
                      </div>

                      {/* line price */}
                      <div className="text-right">
                        <p className="text-base font-bold text-gray-900">{inr(item.price * item.qty)}</p>
                        {item.mrp > item.price && (
                          <p className="text-xs text-gray-400 line-through">{inr(item.mrp * item.qty)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* footer with totals + checkout */}
            <div className="border-t border-gray-200 bg-white px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6">
              {savings > 0 && (
                <p className="mb-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                  🎉 You&apos;re saving {inr(savings)} on this order
                </p>
              )}

              <div className="mb-3 flex items-center justify-between">
                <span className="text-base text-gray-600">Subtotal</span>
                <span className="text-xl font-extrabold text-[#1a1b2e]">{inr(subtotal)}</span>
              </div>

              <button
                type="button"
                onClick={onCheckout}
                className="w-full rounded-lg bg-red-600 py-3.5 text-base font-semibold text-white shadow-[0_3px_0_0_#b91c1c] transition hover:bg-red-700 active:translate-y-px active:shadow-none"
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                onClick={onClose}
                className="mt-2 w-full py-2 text-sm font-medium text-gray-600 hover:text-red-600"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}