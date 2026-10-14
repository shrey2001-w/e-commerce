"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "../lib/cart";

type State =
  | { status: "loading" }
  | { status: "paid"; orderId: string; total: number }
  | { status: "failed" };

export default function StripeSuccess({ sessionId }: { sessionId: string }) {
  const { clear } = useCart();
  const [state, setState] = useState<State>(sessionId ? { status: "loading" } : { status: "failed" });

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    fetch(`/api/stripe/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.paid) {
          clear();
          setState({ status: "paid", orderId: d.orderId, total: d.total });
        } else {
          setState({ status: "failed" });
        }
      })
      .catch(() => !cancelled && setState({ status: "failed" }));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
      {state.status === "loading" && <p className="text-gray-600">Confirming your payment…</p>}

      {state.status === "paid" && (
        <>
          <span className="text-6xl" aria-hidden>
            🎉
          </span>
          <h1 className="text-2xl font-bold text-[#1a1b2e]">Payment successful!</h1>
          <p className="text-gray-600">
            Thank you for shopping with CityMall. We&apos;ve emailed you the order details.
          </p>
          <p className="break-all text-xs text-gray-400">Order ID: {state.orderId}</p>
        </>
      )}

      {state.status === "failed" && (
        <>
          <span className="text-6xl" aria-hidden>
            ⚠️
          </span>
          <h1 className="text-xl font-semibold text-gray-800">We couldn&apos;t confirm your payment</h1>
          <p className="text-sm text-gray-500">
            If money was deducted, please contact us with your payment receipt.
          </p>
        </>
      )}

      <Link
        href="/"
        className="mt-3 w-full rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700"
      >
        Continue shopping
      </Link>
    </main>
  );
}