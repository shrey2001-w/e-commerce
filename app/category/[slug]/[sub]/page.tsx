import { Suspense } from "react";
import { notFound } from "next/navigation";
import CategoryListing from "../../../Components/CategoryListing";
import { getFooterCategory, getSubProducts } from "../../../lib/catalog";
import { getCatalog } from "../../../lib/store";
import { footerCategories, slugify } from "../../../data/footer";

export function generateStaticParams() {
  return footerCategories.flatMap((c) =>
    c.links.map((l) => ({ slug: slugify(c.title), sub: slugify(l) }))
  );
}

async function SubContent({ params }: { params: Promise<{ slug: string; sub: string }> }) {
  const { slug, sub } = await params;
  const cat = getFooterCategory(slug);
  if (!cat) notFound();
  const { categories } = await getCatalog();
  const result = getSubProducts(categories, slug, sub);
  if (!result) notFound();

  return (
    <CategoryListing
      title={result.sub}
      categorySlug={slug}
      categoryTitle={cat.title}
      activeSub={result.sub}
      subLinks={cat.links}
      products={result.products}
      notice={
        result.fallback
          ? `No exact matches for "${result.sub}" yet, showing popular items from ${cat.title}.`
          : undefined
      }
    />
  );
}

export default function SubCategoryPage({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>;
}) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <SubContent params={params} />
    </Suspense>
  );
}