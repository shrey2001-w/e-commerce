import type { Category, Product } from "../data/products";
import { footerCategories, slugify } from "../data/footer";

const STOP = new Set(["and", "the", "for", "of", "with", "all", "other", "more", "new"]);

const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));

/**
 * Optional: footer category slug -> product category ids.
 * Add entries using the slugified titles from your data/footer.ts.
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  // "grocery": ["staples", "brand-food-beverages", "fruits-vegetables"],
};

const matches = (p: Product, keys: string[]) => {
  const w = new Set(tokens(`${p.name} ${p.brand ?? ""}`));
  return keys.some((k) => w.has(k));
};

const allProducts = (cats: Category[]) => cats.flatMap((c) => c.products);

export function getFooterCategory(slug: string) {
  return footerCategories.find((c) => slugify(c.title) === slug) ?? null;
}

export function getCategoryProducts(cats: Category[], slug: string): Product[] {
  const out = new Map<string, Product>();

  cats.find((c) => c.id === slug)?.products.forEach((p) => out.set(p.id, p));

  (CATEGORY_ALIASES[slug] ?? []).forEach((id) =>
    cats.find((c) => c.id === id)?.products.forEach((p) => out.set(p.id, p))
  );

  const fc = getFooterCategory(slug);
  if (fc) {
    const keys = [...new Set([...tokens(fc.title), ...fc.links.flatMap(tokens)])];
    allProducts(cats).forEach((p) => {
      if (matches(p, keys)) out.set(p.id, p);
    });
  }
  return [...out.values()];
}

export function getSubProducts(cats: Category[], slug: string, subSlug: string) {
  const fc = getFooterCategory(slug);
  const sub = fc?.links.find((l) => slugify(l) === subSlug) ?? null;
  if (!fc || !sub) return null;

  const hits = allProducts(cats).filter((p) => matches(p, tokens(sub)));
  if (hits.length) return { sub, products: hits, fallback: false };
  return { sub, products: getCategoryProducts(cats, slug), fallback: true };
}