"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { categories, type Product } from "../data/products";
import ExpressBadge from "./ExpressBadge";

type Item = { product: Product; emoji: string; categoryId: string };

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const allItems: Item[] = categories.flatMap((c) =>
  c.products.map((product) => ({ product, emoji: c.emoji, categoryId: c.id }))
);

/* ---------------- small compact card ---------------- */

function RecommendedCard({ item }: { item: Item }) {
  const { product, emoji } = item;
  const [qty, setQty] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const percent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const sellingFast = product.ratingCount.toLowerCase().includes("k");

  return (
    <article className="relative flex flex-col">
      {/* image */}
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
        {imgFailed ? (
          <span className="text-6xl" aria-hidden>
            {emoji}
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
        {sellingFast && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-t-xl bg-blue-600 px-4 py-1 text-xs font-semibold text-white sm:text-sm">
            Selling Fast
          </span>
        )}
      </div>

      {/* rating + discount */}
      <div className="mt-3 flex items-center justify-between gap-2">
        {product.rating > 0 ? (
          <p className="flex items-center gap-1 text-sm font-semibold text-gray-800 sm:text-base">
            <svg viewBox="0 0 20 20" className="h-4 w-4 fill-amber-400" aria-hidden>
              <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z" />
            </svg>
            {product.rating.toFixed(1)}
            <span className="text-xs font-normal text-gray-500">({product.ratingCount})</span>
          </p>
        ) : (
          <span />
        )}
        <span className="shrink-0 rounded-md border border-green-600/40 bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 sm:text-sm">
          {percent}% OFF
        </span>
      </div>

      {/* name (stretched link → whole card opens the product page) */}
      <h3 className="mt-2 line-clamp-2 min-h-[2.5rem] text-[13px] leading-snug text-gray-600 sm:text-sm">
        <Link
          href={`/product/${product.id}`}
          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
        >
          {product.name}
        </Link>
      </h3>

      {/* price pill + add */}
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="flex h-9 min-w-0 flex-1 overflow-hidden rounded-lg shadow-[0_2px_0_0_#b91c1c] sm:max-w-[190px] sm:h-10">
          <div
            className="flex flex-[1.1] items-center justify-center bg-red-600 pr-2 text-sm font-extrabold text-white sm:text-lg"
            style={{ clipPath: "polygon(0 0,100% 0,86% 100%,0 100%)" }}
          >
            {inr(product.price)}
          </div>
          <div className="-ml-1.5 flex flex-1 flex-col items-center justify-center border-y-2 border-r-2 border-red-600 bg-white pl-1.5 leading-none">
            <span className="text-[8px] font-semibold text-gray-500 sm:text-[10px]">MRP</span>
            <span className="text-[10px] font-semibold text-gray-700 line-through sm:text-xs">
              {inr(product.mrp)}
            </span>
          </div>
        </div>

        {qty === 0 ? (
          <button
            type="button"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => setQty(1)}
            className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-red-600 bg-white text-red-600 transition hover:bg-red-50 sm:h-10 sm:w-10"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        ) : (
          <div className="relative z-10 flex h-9 shrink-0 items-center overflow-hidden rounded-lg bg-red-600 text-white sm:h-10">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => q - 1)} className="px-2.5 text-lg font-bold hover:bg-red-700">
              −
            </button>
            <span className="min-w-5 text-center text-sm font-bold">{qty}</span>
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)} className="px-2.5 text-lg font-bold hover:bg-red-700">
              +
            </button>
          </div>
        )}
      </div>

      {product.express !== false && <ExpressBadge className="mt-2 text-sm sm:text-base" />}
    </article>
  );
}

/* ---------------- section with tabs ---------------- */

export default function RecommendedProducts({
  currentId,
  currentCategoryId,
}: {
  currentId: string;
  currentCategoryId: string;
}) {
  const [tab, setTab] = useState<string>("recommended");

  const items = useMemo(() => {
    const others = allItems.filter((i) => i.product.id !== currentId);
    if (tab === "recommended") {
      const same = others.filter((i) => i.categoryId === currentCategoryId);
      const rest = others.filter((i) => i.categoryId !== currentCategoryId);
      return [...same, ...rest].slice(0, 10);
    }
    return others.filter((i) => i.categoryId === tab);
  }, [tab, currentId, currentCategoryId]);

  const chip = (active: boolean) =>
    `flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition sm:px-5 sm:py-2.5 sm:text-base ${
      active
        ? "border-red-600 bg-red-50 text-red-600"
        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
    }`;

  return (
    <section aria-label="Recommended products" className="mx-auto mt-8 w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-white p-4 sm:p-6">
        <ul className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li>
            <button type="button" onClick={() => setTab("recommended")} aria-pressed={tab === "recommended"} className={chip(tab === "recommended")}>
              <span className="grid grid-cols-2 gap-0.5" aria-hidden>
                {[0, 1, 2, 3].map((n) => (
                  <span key={n} className="h-1.5 w-1.5 rounded-[2px] bg-red-600" />
                ))}
              </span>
              Recommended
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setTab(c.id)} aria-pressed={tab === c.id} className={chip(tab === c.id)}>
                {c.name}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <RecommendedCard key={item.product.id} item={item} />
          ))}
        </div>

        {items.length === 0 && (
          <p className="py-10 text-center text-gray-500">No other products in this category yet.</p>
        )}
      </div>
    </section>
  );
}