import { connection } from "next/server";
import { getDb } from "./db";
import { categories as staticCategories, type Category, type Product } from "../data/products";
import { DEFAULT_SETTINGS, type SiteSettings } from "./siteTypes";

type CategoryDoc = { id: string; name: string; emoji: string; order: number };
type ProductDoc = Product & { categoryId: string; order: number };
type SettingsDoc = { _id: string } & Partial<SiteSettings>;

export type CatalogResult = { categories: Category[]; source: "db" | "static" };
type Ok = { ok: true; id: string };
type Fail = { ok: false; error: string };

/* ------------------------------------------------------------------ */
/* sanitizing helpers (never trust the browser)                        */
/* ------------------------------------------------------------------ */

const str = (v: unknown, max = 200) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  return Number.isFinite(n) ? n : NaN;
};
const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
const url = (v: unknown) => {
  const s = str(v, 1000);
  return /^(https:\/\/|\/)/.test(s) ? s : "";
};
const href = (v: unknown) => {
  const s = str(v, 300);
  return /^(\/|https:\/\/|mailto:|tel:)/.test(s) ? s : "";
};
const HEX = /^#[0-9a-fA-F]{6}$/;
const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
const asObj = (v: unknown) =>
  (typeof v === "object" && v !== null ? v : {}) as Record<string, unknown>;

export function sanitizeSettings(input: unknown): SiteSettings {
  const i = asObj(input);
  const d = DEFAULT_SETTINGS;
  const links = (Array.isArray(i.navLinks) ? i.navLinks : [])
    .map((l: unknown) => {
      const o = asObj(l);
      return { label: str(o.label, 30), href: href(o.href) };
    })
    .filter((l) => l.label && l.href)
    .slice(0, 6);

  return {
    brandName: str(i.brandName, 40),
    logoUrl: url(i.logoUrl),
    brandColor: HEX.test(String(i.brandColor)) ? String(i.brandColor) : d.brandColor,
    topBarColor: HEX.test(String(i.topBarColor)) ? String(i.topBarColor) : d.topBarColor,
    searchPlaceholder: str(i.searchPlaceholder, 80) || d.searchPlaceholder,
    city: str(i.city, 60) || d.city,
    availabilityMessage: str(i.availabilityMessage, 120),
    showCategories: bool(i.showCategories, true),
    categoriesLabel: str(i.categoriesLabel, 30) || d.categoriesLabel,
    showOrders: bool(i.showOrders, true),
    ordersLabel: str(i.ordersLabel, 30) || d.ordersLabel,
    signupLabel: str(i.signupLabel, 30) || d.signupLabel,
    loginLabel: str(i.loginLabel, 30) || d.loginLabel,
    navLinks: links,
  };
}

type ProductResult =
  | { ok: true; product: Product; categoryId: string }
  | { ok: false; error: string };

export function sanitizeProduct(input: unknown): ProductResult {
  const i = asObj(input);
  const fail = (error: string): ProductResult => ({ ok: false, error });

  const name = str(i.name, 200);
  const categoryId = str(i.categoryId, 100);
  const image = url(i.image);
  const quantity = str(i.quantity, 40);
  const price = num(i.price);
  const mrp = num(i.mrp);

  if (!name) return fail("Product name is required.");
  if (!categoryId) return fail("Choose a category.");
  if (!image) return fail("Upload a main product image.");
  if (!quantity) return fail('Quantity is required (for example "1 kg" or "Pack of 2").');
  if (!(price > 0)) return fail("Enter a valid selling price.");
  if (!(mrp >= price)) return fail("MRP must be greater than or equal to the selling price.");

  const rating = num(i.rating);
  const product: Product = {
    id: "",
    name,
    image,
    price,
    mrp,
    quantity,
    rating: Number.isNaN(rating) ? 0 : Math.min(5, Math.max(0, rating)),
    ratingCount: str(i.ratingCount, 20) || "0",
    express: bool(i.express, true),
    nonReturnable: bool(i.nonReturnable, true),
    cod: bool(i.cod, true),
  };

  const brand = str(i.brand, 80);
  if (brand) product.brand = brand;
  const unitPrice = str(i.unitPrice, 40);
  if (unitPrice) product.unitPrice = unitPrice;
  const options = Math.round(num(i.options));
  if (options > 0) product.options = options;
  if (i.badgeInRupees === true) product.badgeInRupees = true;

  const gallery = (Array.isArray(i.images) ? i.images : []).map((x: unknown) => url(x)).filter(Boolean).slice(0, 12);
  if (gallery.length) product.images = gallery.includes(image) ? gallery : [image, ...gallery];

  const rawDesc: unknown[] = Array.isArray(i.description)
    ? i.description
    : typeof i.description === "string"
      ? i.description.split("\n")
      : [];
  const description = rawDesc.map((l) => str(l, 500)).filter(Boolean).slice(0, 60);
  if (description.length) product.description = description;

  const rawCrumbs: unknown[] = Array.isArray(i.breadcrumb)
    ? i.breadcrumb
    : typeof i.breadcrumb === "string"
      ? i.breadcrumb.split(",")
      : [];
  const crumbs = rawCrumbs.map((l) => str(l, 80)).filter(Boolean).slice(0, 6);
  if (crumbs.length) product.breadcrumb = crumbs;

  const packs = (Array.isArray(i.packs) ? i.packs : [])
    .map((p: unknown) => {
      const o = asObj(p);
      return { label: str(o.label, 40), price: num(o.price), mrp: num(o.mrp) };
    })
    .filter((p) => p.label && p.price > 0 && p.mrp >= p.price)
    .slice(0, 8);
  if (packs.length) product.packs = packs;

  return { ok: true, product, categoryId };
}

/* ------------------------------------------------------------------ */
/* reads                                                               */
/* ------------------------------------------------------------------ */

export async function getSettings(): Promise<SiteSettings> {
  await connection(); // always request-time, never baked into the build
  try {
    const db = await getDb();
    const doc = await db.collection<SettingsDoc>("settings").findOne({ _id: "site" });
    return sanitizeSettings({ ...DEFAULT_SETTINGS, ...(doc ?? {}) });
  } catch (e) {
    console.error("getSettings failed:", e);
    return DEFAULT_SETTINGS;
  }
}

export async function getCatalog(): Promise<CatalogResult> {
  await connection();
  try {
    const db = await getDb();
    const cats = (await db
      .collection("categories")
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray()) as unknown as CategoryDoc[];

    // nothing in the database yet -> keep showing the built-in sample catalog
    if (cats.length === 0) return { categories: staticCategories, source: "static" };

    const prods = (await db
      .collection("products")
      .find({}, { projection: { _id: 0 } })
      .sort({ order: 1 })
      .toArray()) as unknown as ProductDoc[];

    const categories: Category[] = cats.map((c) => ({
      id: c.id,
      name: c.name,
      emoji: c.emoji,
      products: prods
        .filter((p) => p.categoryId === c.id)
        .map(({ categoryId, order, ...p }) => p as Product),
    }));
    return { categories, source: "db" };
  } catch (e) {
    console.error("getCatalog failed:", e);
    return { categories: staticCategories, source: "static" };
  }
}

/** use this wherever the old static findProduct() was used (product page, pricing, orders) */
export async function findProductAny(id: string): Promise<{ product: Product; category: Category } | null> {
  const { categories } = await getCatalog();
  for (const category of categories) {
    const product = category.products.find((p) => p.id === id);
    if (product) return { product, category };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* writes                                                              */
/* ------------------------------------------------------------------ */

export async function saveSettings(input: unknown): Promise<SiteSettings> {
  const s = sanitizeSettings(input);
  const db = await getDb();
  await db.collection<SettingsDoc>("settings").updateOne({ _id: "site" }, { $set: s }, { upsert: true });
  return s;
}

export async function saveProduct(input: unknown, id?: string): Promise<Ok | Fail> {
  const r = sanitizeProduct(input);
  if (!r.ok) return r;

  const db = await getDb();
  const cats = db.collection("categories");
  const prods = db.collection("products");

  if (!(await cats.findOne({ id: r.categoryId }))) return { ok: false, error: "Category not found." };

  if (id) {
    const existing = await prods.findOne({ id });
    if (!existing) return { ok: false, error: "Product not found." };
    await prods.replaceOne(
      { id },
      { ...r.product, id, categoryId: r.categoryId, order: existing.order ?? Date.now() }
    );
    return { ok: true, id };
  }

  const newId = `${slug(r.product.name) || "product"}-${Math.random().toString(36).slice(2, 6)}`;
  await prods.insertOne({ ...r.product, id: newId, categoryId: r.categoryId, order: Date.now() });
  return { ok: true, id: newId };
}

export async function deleteProduct(id: string): Promise<Ok | Fail> {
  const db = await getDb();
  await db.collection("products").deleteOne({ id });
  return { ok: true, id };
}

export async function saveCategory(input: unknown, id?: string): Promise<Ok | Fail> {
  const i = asObj(input);
  const name = str(i.name, 80);
  const emoji = str(i.emoji, 8) || "🛍️";
  if (!name) return { ok: false, error: "Category name is required." };

  const db = await getDb();
  const cats = db.collection("categories");

  if (id) {
    const res = await cats.updateOne({ id }, { $set: { name, emoji } });
    if (res.matchedCount === 0) return { ok: false, error: "Category not found." };
    return { ok: true, id };
  }

  const base = slug(name) || "category";
  let newId = base;
  let n = 2;
  while (await cats.findOne({ id: newId })) newId = `${base}-${n++}`;
  await cats.insertOne({ id: newId, name, emoji, order: Date.now() });
  return { ok: true, id: newId };
}

export async function deleteCategory(id: string): Promise<Ok | Fail> {
  const db = await getDb();
  if ((await db.collection("products").countDocuments({ categoryId: id })) > 0) {
    return { ok: false, error: "This category still has products. Move or delete them first." };
  }
  await db.collection("categories").deleteOne({ id });
  return { ok: true, id };
}

/** one-time import of the sample catalog from data/products.ts */
export async function seedFromStatic(): Promise<{ ok: true } | Fail> {
  const db = await getDb();
  const cats = db.collection("categories");
  const prods = db.collection("products");
  if ((await cats.countDocuments()) > 0) return { ok: false, error: "The catalog is already imported." };

  await cats.insertMany(
    staticCategories.map((c, i) => ({ id: c.id, name: c.name, emoji: c.emoji, order: i }))
  );
  const docs = staticCategories.flatMap((c, ci) =>
    c.products.map((p, pi) => ({ ...p, categoryId: c.id, order: ci * 1000 + pi }))
  );
  if (docs.length) await prods.insertMany(docs);
  return { ok: true };
}