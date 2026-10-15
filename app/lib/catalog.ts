import { categories, type Product } from "../data/products";
import { footerCategories, slugify } from "../data/footer";

const STOP = new Set(["and", "the", "for", "of", "with", "all", "other", "more", "new"]);

/** "Sarees & Blouses" -> ["saree", "blouse"] (lowercase, no stopwords, plural stripped) */
const tokens = (s: string) =>
  s
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOP.has(t))
    .map((t) => (t.length > 3 && t.endsWith("s") ? t.slice(0, -1) : t));

/**
 * OPTIONAL manual mapping: footer category slug -> product category ids
 * (ids from data/products.ts). Rename the keys to match the slugs of the
 * titles in data/footer.ts.
 */
const CATEGORY_ALIASES: Record<string, string[]> = {
  grocery: ["staples", "brand-food-beverages", "fruits-vegetables"],
  "home-kitchen": ["home-kitchen", "home-personal-care"],
  fashion: ["women-fashion", "men-fashion"],
  beauty: ["beauty-cosmetics"],
  electronics: ["electronics"],
  toys: ["kids-toys"],
};

const haystack = (p: Product, categoryName: string) =>
  new Set(tokens(`${p.name} ${p.brand ?? ""} ${categoryName}`));

const allProducts = () =>
  categories.flatMap((c) => c.products.map((p) => ({ p, c, hay: haystack(p, c.name) })));

export function getFooterCategory(slug: string) {
  return footerCategories.find((c) => slugify(c.title) === slug) ?? null;
}

export function getCategoryProducts(slug: string): Product[] {
  const fc = getFooterCategory(slug);
  if (!fc) return [];

  const out = new Map<string, Product>();

  // 1) manual alias -> whole product categories
  (CATEGORY_ALIASES[slug] ?? []).forEach((id) =>
    categories.find((c) => c.id === id)?.products.forEach((p) => out.set(p.id, p))
  );

  // 2) keyword match on title + all sub categories
  const keys = new Set([...tokens(fc.title), ...fc.links.flatMap(tokens)]);
  allProducts().forEach(({ p, hay }) => {
    if ([...keys].some((k) => hay.has(k))) out.set(p.id, p);
  });

  return [...out.values()];
}

export function getSubProducts(slug: string, subSlug: string) {
  const fc = getFooterCategory(slug);
  const sub = fc?.links.find((l) => slugify(l) === subSlug) ?? null;
  if (!fc || !sub) return null;

  const keys = tokens(sub);
  const exact = allProducts()
    .filter(({ hay }) => keys.some((k) => hay.has(k)))
    .map(({ p }) => p);

  if (exact.length) return { sub, products: exact, fallback: false };
  // nothing matched: show the parent category's products instead
  return { sub, products: getCategoryProducts(slug), fallback: true };
}