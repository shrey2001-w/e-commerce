import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductHeader from "../../Components/ProductHeader";
import ProductDetails from "../../Components/ProductDetails";
import RecommendedProducts from "../../Components/RecommendedProducts";
import Footer from "../../Components/Footer";
import { findProduct } from "../../data/products";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const found = findProduct(id);
  if (!found) return { title: "Product not found" };
  return {
    title: `${found.product.name} | CityMall`,
    description: found.product.description?.[0] ?? `Buy ${found.product.name} at ₹${found.product.price}`,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const found = findProduct(id);
  if (!found) notFound();

  const { product, category } = found;

  return (
    <>
      <ProductHeader />
      <main className="min-h-screen bg-[#f8f8f8] pb-16">
        <ProductDetails
          product={product}
          categoryId={category.id}
          categoryName={category.name}
          emoji={category.emoji}
          deliveryDate={deliveryLabel(5)}
        />
        <RecommendedProducts currentId={product.id} currentCategoryId={category.id} />
      </main>
      <Footer />
    </>
  );
}