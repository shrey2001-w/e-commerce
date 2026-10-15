import { Suspense } from "react";
import { notFound } from "next/navigation";
import InfoPage from "../Components/InfoPage";
import { buildInfoPage } from "../data/pages";
import { businessLinks, companyLinks, legalLinks, slugify } from "../data/footer";

const allLinks = [...companyLinks, ...legalLinks, ...businessLinks].filter((l) =>
  l.href.startsWith("/")
);

const clean = (href: string) => href.replace(/^\//, "");

export function generateStaticParams() {
  return allLinks.map((l) => ({ page: clean(l.href) }));
}

async function PageContent({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  const link = allLinks.find((l) => clean(l.href) === page);
  if (!link) notFound();
  return <InfoPage page={buildInfoPage(page, link.label, slugify(link.label))} />;
}

export default function Page({ params }: { params: Promise<{ page: string }> }) {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-500">Loading…</div>}>
      <PageContent params={params} />
    </Suspense>
  );
}