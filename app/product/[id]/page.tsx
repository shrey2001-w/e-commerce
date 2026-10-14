import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import ProductHeader from "../../Components/ProductHeader";
import ProductDetails from "../../Components/ProductDetails";
import RecommendedProducts from "../../Components/RecommendedProducts";
import { categories, findProduct } from "../../data/products";

type PageProps = { params: Promise<{ id: string }> };

/** "19th Oct, Monday" – N days from today, in Indian time */
function deliveryLabel(daysAhead = 5) {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    weekday: "long",
  }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const day = Number(get("day"));
  const suffix =
    day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suffix} ${get("month")}, ${get("weekday")}`;
}

// Tells Next.js which product pages exist, so metadata can be built at build time
export function generateStaticParams() {
  return categories.flatMap((c) => c.products.map((p) => ({ id: String(p.id) })));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const found = findProduct(id);
  if (!found) return { title: "Product not found" };
  return {
    title: `${found.product.name} | CityMall`,
    description: found.product.description?.[0] ?? `Buy ${found.product.name} at ₹${found.product.price}`,
  };
}

async function ProductContent({ params }: PageProps) {
  const { id } = await params;
  const found = findProduct(id);
  if (!found) notFound();

  const { product, category } = found;

  // the delivery date depends on today's date, so render this part at request time
  await connection();
  const deliveryDate = deliveryLabel(5);

  return (
    <>
      <ProductDetails
        product={product}
        categoryId={category.id}
        categoryName={category.name}
        emoji={category.emoji}
        deliveryDate={deliveryDate}
      />
      <RecommendedProducts currentId={product.id} currentCategoryId={category.id} />
    </>
  );
}

export default function ProductPage({ params }: PageProps) {
  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-[#f8f8f8] pb-16">
        <Suspense fallback={<div className="min-h-[60vh]" />}>
          <ProductContent params={params} />
        </Suspense>
      </main>
    </>
  );
}