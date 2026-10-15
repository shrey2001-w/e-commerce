"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import CategoryCircles from "./CategoryCircles";
import type { Category } from "../data/products";
import { useUser } from "../lib/user";
import { useCatalog } from "../lib/useSite";

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
      className={`scroll-mt-[calc(var(--header-h,170px)_+_72px)] rounded-3xl px-4 py-6 sm:px-6 ${bandClass}`}
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

function Skeleton() {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6" aria-busy="true" aria-label="Loading products">
      <div className="h-14 animate-pulse border-b border-gray-100" />
      <div className="mt-4 flex flex-col gap-6">
        {[0, 1].map((n) => (
          <div key={n} className="rounded-3xl bg-gray-50 px-4 py-6 sm:px-6">
            <div className="mb-5 h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="flex gap-4 overflow-hidden">
              {[0, 1, 2, 3, 4].map((k) => (
                <div key={k} className="h-72 w-[168px] shrink-0 animate-pulse rounded-3xl bg-gray-200 sm:w-[210px] lg:w-[240px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Products() {
  const { user } = useUser();
  const { categories, loading } = useCatalog();
  // hide categories that have no products yet
  const cats = useMemo(() => (categories ?? []).filter((c) => c.products.length > 0), [categories]);

  const [active, setActive] = useState("");
  const current = active || cats[0]?.id || "";

  // highlight the tab of the section currently in view while scrolling
  useEffect(() => {
    if (cats.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-35% 0px -60% 0px" }
    );
    cats.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, [cats]);

  const goTo = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) return <Skeleton />;

  if (cats.length === 0) {
    return <p className="py-20 text-center text-gray-500">No products available yet.</p>;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-6">
      {user ? (
        /* logged in: round category icons */
        <CategoryCircles categories={cats} onSelect={goTo} />
      ) : (
        /* logged out: sticky category tabs (sit right under the sticky header) */
        <nav
          aria-label="Product categories"
          className="sticky top-[var(--header-h,170px)] z-30 -mx-3 border-b border-gray-100 bg-white px-3 py-3 sm:-mx-6 sm:px-6"
        >
          <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c) => (
              <li key={c.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(c.id)}
                  aria-current={current === c.id}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition sm:text-base ${
                    current === c.id
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
        {cats.map((c, i) => (
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