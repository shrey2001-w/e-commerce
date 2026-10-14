"use client";

import { useState } from "react";
import type { Category } from "../data/products";

function Circle({ category }: { category: Category }) {
  const [failed, setFailed] = useState(false);
  const image = category.products[0]?.image;

  return (
    <span className="relative block aspect-square w-full">
      {/* dashed gold ring + soft pink backdrop */}
      <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-amber-300 bg-rose-50 p-1.5">
        {failed || !image ? (
          <span className="text-4xl sm:text-5xl" aria-hidden>
            {category.emoji}
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full rounded-full bg-white object-contain p-1"
          />
        )}
      </span>
      {/* SALE tag */}
      <span className="absolute -right-1 top-1 rounded-sm bg-red-700 px-1.5 py-0.5 text-[8px] font-bold leading-none text-white sm:text-[10px]">
        SALE
      </span>
    </span>
  );
}

export default function CategoryCircles({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect: (id: string) => void;
}) {
  return (
    <nav aria-label="Shop by category" className="pt-4">
      {/*
        phones/tablets: 2 rows that scroll sideways
        laptops+: full 10-column grid, everything visible
      */}
      <ul
        className="grid auto-cols-[76px] grid-flow-col grid-rows-2 gap-x-3 gap-y-5 overflow-x-auto pb-2 [scrollbar-width:none] sm:auto-cols-[92px] md:auto-cols-[104px] lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-10 lg:grid-rows-none lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((c) => (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onSelect(c.id)}
              className="group flex w-full flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
            >
              <Circle category={c} />
              <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-gray-800 group-hover:text-red-600 sm:text-sm lg:text-base">
                {c.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}