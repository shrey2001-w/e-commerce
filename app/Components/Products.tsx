"use client";

import { useRef, useState } from "react";
import ProductCard from "./ProductCard";
import CategoryCircles from "./CategoryCircles";
import { categories, type Category } from "../data/products";
import { useUser } from "../lib/user";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current" strokeWidth={2.2} aria-hidden>
      <path d={dir === "left" ? "M12.5 4l-6 6 6 6" : "M7.5 4l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CategorySection({ category, bandClass }: { category: Category; bandClass: string }) {
  const [viewAll, setViewAll] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) =>
    scroller.current?.scrollBy({ left: dir * 520, behavior: "smooth" });

  return (
    <section
      id={category.id}
      className={`scroll-mt-24 rounded-3xl px-4 py-6 sm:px-6 ${bandClass}`}
    >
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl lg:text-3xl">
          {category.name}
        </h2>
        <button
          type="button"
          onClick={() => setViewAll((v) => !v)}
          className="shrink-0 text-sm font-medium text-gray-900 hover:text-red-600 sm:text-lg"
        >
          {viewAll ? "Show Less" : "View All"}
        </button>
      </div>

      {viewAll ? (
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {category.products.map((p) => (
            <ProductCard key={p.id} product={p} fallbackEmoji={category.emoji} fluid />
          ))}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            aria-label={`Scroll ${category.name} left`}
            onClick={() => scrollBy(-1)}
            className="absolute -left-3 top-24 z-20 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-md ring-1 ring-gray-200 hover:bg-gray-50 md:flex"
          >
            <Chevron dir="left" />
          </button>

          <div
            ref={scroller}
            className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-8 pt-1 [scrollbar-width:none] sm:-mx-6 sm:gap-5 sm:px-6 [&::-webkit-scrollbar]:hidden"
          >
            {category.products.map((p) => (
              <ProductCard key={p.id} product={p} fallbackEmoji={category.emoji} />
            ))}
          </div>

          <button
            type="button"
            aria-label={`Scroll ${category.name} right`}
            onClick={() => scrollBy(1)}
            className="absolute -right-3 top-24 z-20 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-gray-800 shadow-md ring-1 ring-gray-200 hover:bg-gray-50 md:flex"
          >
            <Chevron dir="right" />
          </button>
        </div>
      )}
    </section>
  );
}

export default function Products() {
  const { user } = useUser();
  const [active, setActive] = useState(categories[0].id);

  const goTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6">
      {user ? (
        /* logged in: round category icons */
        <CategoryCircles categories={categories} onSelect={goTo} />
      ) : (
        /* logged out: sticky category tabs */
        <nav
          aria-label="Product categories"
          className="sticky top-0 z-30 -mx-3 border-b border-gray-100 bg-white/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6"
        >
          <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((c) => (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(c.id)}
                  aria-current={active === c.id}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition sm:text-base ${
                    active === c.id
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  <span aria-hidden>{c.emoji}</span>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      <div className="mt-4 flex flex-col gap-6">
        {categories.map((c, i) => (
          <CategorySection
            key={c.id}
            category={c}
            bandClass={
              user ? "bg-[#fbe4a1]" : i % 2 === 0 ? "bg-[#fdf3ee]" : "bg-transparent"
            }
          />
        ))}
      </div>
    </div>
  );
}