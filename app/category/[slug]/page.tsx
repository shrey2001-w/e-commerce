import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryListing from "../../Components/CategoryListing";
import { getCategoryProducts, getFooterCategory } from "../../lib/catalog";
import { footerCategories, slugify } from "../../data/footer";

export function generateStaticParams() {
  return footerCategories.map((c) => ({ slug: slugify(c.title) }));
}

async function CategoryContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = getFooterCategory(slug);
  if (!cat) notFound();

  return (
    <CategoryListing
      title={cat.title}
      categorySlug={slug}
      categoryTitle={cat.title}
      subLinks={cat.links}
      products={getCategoryProducts(slug)}
    />
  );
}

export default function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <CategoryContent params={params} />
    </Suspense>
  );
}