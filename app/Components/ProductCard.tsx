"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "../data/products";
import { useCart } from "../lib/cart";

type Props = {
  product: Product;
  fallbackEmoji?: string;
  /** true = card fills its grid cell, false = fixed width for horizontal carousel */
  fluid?: boolean;
};

const BURST =
  "polygon(50% 0%,61% 10%,75% 6%,80% 20%,94% 25%,90% 39%,100% 50%,90% 61%,94% 75%,80% 80%,75% 94%,61% 90%,50% 100%,39% 90%,25% 94%,20% 80%,6% 75%,10% 61%,0% 50%,10% 39%,6% 25%,20% 20%,25% 6%,39% 10%)";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function Star() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-amber-400" aria-hidden>
      <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z" />
    </svg>
  );
}

export default function ProductCard({ product, fallbackEmoji = "🛍️", fluid }: Props) {
  const { items, addItem, increase, decrease } = useCart();
  const [imgFailed, setImgFailed] = useState(false);

  // quantity comes from the shared cart, so every card stays in sync with the cart drawer
  const qty = items.find((i) => i.id === product.id)?.qty ?? 0;

  const saved = product.mrp - product.price;
  const percent = Math.round((saved / product.mrp) * 100);
  const badgeAmount = product.badgeInRupees ? inr(saved) : `${percent}%`;

  return (
    <article
      className={`relative flex flex-col ${
        fluid ? "w-full" : "w-[168px] shrink-0 snap-start sm:w-[210px] lg:w-[240px]"
      }`}
    >
      {/* image card */}
      <div className="relative rounded-[28px] border border-gray-200/70 bg-white px-3 pb-6 pt-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:px-5">
        {/* discount burst */}
        <span
          className="pointer-events-none absolute -left-1 -top-1 z-10 flex h-[52px] w-[52px] flex-col items-center justify-center bg-green-600 text-center text-white sm:h-[60px] sm:w-[60px]"
          style={{ clipPath: BURST }}
        >
          <span className="text-[11px] font-extrabold leading-none sm:text-[13px]">
            {badgeAmount}
          </span>
          <span className="mt-0.5 text-[8px] font-bold leading-none sm:text-[9px]">OFF</span>
        </span>

        {/* image */}
        <div className="mx-auto flex aspect-square w-full max-w-[190px] items-center justify-center">
          {imgFailed || !product.image ? (
            <span className="text-6xl sm:text-7xl" aria-hidden>
              {fallbackEmoji}
            </span>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-contain"
            />
          )}
        </div>

        {/* price pill (overlaps card bottom) */}
        <div className="absolute inset-x-3 -bottom-5 flex h-10 overflow-hidden rounded-lg shadow-[0_3px_0_0_#b91c1c] sm:inset-x-5 sm:h-11">
          <div
            className="flex flex-[1.15] items-center justify-center bg-red-600 pr-3 text-lg font-extrabold text-white sm:text-2xl"
            style={{ clipPath: "polygon(0 0,100% 0,88% 100%,0 100%)" }}
          >
            {inr(product.price)}
          </div>
          <div className="-ml-2 flex flex-1 flex-col items-center justify-center border-y-2 border-r-2 border-red-600 bg-white pl-2 leading-none">
            <span className="text-[9px] font-semibold text-gray-500 sm:text-[11px]">MRP</span>
            <span className="text-xs font-semibold text-gray-700 line-through sm:text-sm">
              {inr(product.mrp)}
            </span>
          </div>
        </div>
      </div>

      {/* details */}
      <div className="mt-8 flex flex-1 flex-col px-1.5">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-900 ring-1 ring-indigo-100">
            {product.quantity}
          </span>
          {product.unitPrice && (
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-900 ring-1 ring-indigo-100">
              {product.unitPrice}
            </span>
          )}
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[2.75rem] text-[14px] font-medium leading-snug text-gray-800 sm:text-base">
          {/* stretched link: the whole card opens the product page */}
          <Link
            href={`/product/${product.id}`}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            {product.brand && (
              <p className="truncate text-xs text-gray-600 sm:text-sm">{product.brand}</p>
            )}
            {product.rating > 0 && (
              <p className="flex items-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
                <Star />
                {product.rating.toFixed(1)}
                <span className="text-xs font-normal text-gray-500">({product.ratingCount})</span>
              </p>
            )}
          </div>

          {qty === 0 ? (
            <button
              type="button"
              onClick={() => addItem(product)}
              className="relative z-10 flex shrink-0 flex-col items-center justify-center rounded-lg border-2 border-red-600 bg-white px-4 py-1.5 font-bold text-red-600 transition hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:px-6 sm:py-2"
            >
              <span className="text-sm leading-tight sm:text-base">ADD</span>
              {product.options && (
                <span className="text-[10px] font-medium leading-tight text-gray-500">
                  {product.options} options
                </span>
              )}
            </button>
          ) : (
            <div className="relative z-10 flex shrink-0 items-center overflow-hidden rounded-lg bg-red-600 text-white">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => decrease(product.id)}
                className="px-3 py-2 text-lg font-bold leading-none hover:bg-red-700"
              >
                −
              </button>
              <span className="min-w-6 text-center text-sm font-bold">{qty}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => increase(product.id)}
                className="px-3 py-2 text-lg font-bold leading-none hover:bg-red-700"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}