import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryListing from "../../Components/CategoryListing";
import { getCatalog } from "../../lib/store";
import { cities, slugify } from "../../data/footer";

export function generateStaticParams() {
  return cities.map((c) => ({ slug: slugify(c) }));
}

async function CityContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const city = cities.find((c) => slugify(c) === slug);
  if (!city) notFound();
  const { categories } = await getCatalog();

  return (
    <CategoryListing
      title={`Shop online in ${city}`}
      categorySlug=""
      categoryTitle={city}
      subLinks={[]}
      products={categories.flatMap((c) => c.products)}
    />
  );
}

export default function CityPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <CityContent params={params} />
    </Suspense>
  );
}