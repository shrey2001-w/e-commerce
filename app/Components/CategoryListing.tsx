import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "../data/products";
import { slugify } from "../data/footer";

type Props = {
  title: string;
  categorySlug: string;
  categoryTitle: string;
  activeSub?: string;
  subLinks: string[];
  products: Product[];
  notice?: string;
};

export default function CategoryListing({
  title,
  categorySlug,
  categoryTitle,
  activeSub,
  subLinks,
  products,
  notice,
}: Props) {
  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-6 sm:px-6">
      <nav className="mb-4 text-[13px] text-gray-500 sm:text-base">
        <Link href="/" className="hover:text-red-600">Home</Link>
        <span className="mx-2">&gt;</span>
        {activeSub ? (
          <>
            <Link href={`/category/${categorySlug}`} className="hover:text-red-600">
              {categoryTitle}
            </Link>
            <span className="mx-2">&gt;</span>
            <span className="text-gray-900">{activeSub}</span>
          </>
        ) : (
          <span className="text-gray-900">{categoryTitle}</span>
        )}
      </nav>

      <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{title}</h1>

      {subLinks.length > 0 && (
        <ul className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {subLinks.map((s) => {
            const active = activeSub === s;
            return (
              <li key={s} className="shrink-0">
                <Link
                  href={`/category/${categorySlug}/${slugify(s)}`}
                  className={`block rounded-full border px-3.5 py-1.5 text-sm font-medium sm:text-base ${
                    active
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"
                  }`}
                >
                  {s}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {notice && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-800">{notice}</p>
      )}

      {products.length === 0 ? (
        <p className="py-20 text-center text-gray-500">No products found in this category yet.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} fluid />
          ))}
        </div>
      )}
    </div>
  );
}