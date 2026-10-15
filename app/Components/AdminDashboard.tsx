"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Category, Product } from "../data/products";
import { DEFAULT_SETTINGS, type SiteSettings } from "../lib/siteTypes";
import { refreshCatalog, refreshSite, useCatalog, useSite } from "../lib/useSite";
import FooterPanel from "./FooterPanel";

/* ------------------------------------------------------------------ */
/* shared bits                                                         */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600/20";
const btnPrimary =
  "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";
const btnGhost =
  "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60";
const btnDanger =
  "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60";

type ApiResult = { ok: boolean; data: Record<string, unknown> };

async function api(method: "POST" | "PUT" | "DELETE", url: string, body?: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 401) window.location.href = "/"; // session expired
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: "Network error. Please try again." } };
  }
}

const errMsg = (d: Record<string, unknown>) => (typeof d.error === "string" ? d.error : "Something went wrong.");

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || typeof data.url !== "string") throw new Error(data.error || "Upload failed.");
  return data.url as string;
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-gray-500">{hint}</span>}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-red-600"
      />
      {label}
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-gray-300 bg-white p-1"
        />
        <input className={inputCls} value={value} maxLength={7} onChange={(e) => onChange(e.target.value)} />
      </div>
    </Field>
  );
}

function ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    setBusy(true);
    setErr("");
    try {
      onChange(await uploadImage(file));
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-gray-400">No image</span>
          )}
        </div>
        <div className="space-y-2">
          <label className={`${btnGhost} inline-block cursor-pointer ${busy ? "opacity-60" : ""}`}>
            {busy ? "Uploading…" : value ? "Replace image" : "Upload image"}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={pick} disabled={busy} />
          </label>
          {value && (
            <button type="button" onClick={() => onChange("")} className="ml-2 text-sm font-medium text-red-600 hover:underline">
              Remove
            </button>
          )}
        </div>
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

function GalleryField({ value, onChange }: { value: string[]; onChange: (urls: string[]) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    input.value = "";
    if (files.length === 0) return;
    setBusy(true);
    setErr("");
    const added: string[] = [];
    try {
      for (const f of files) added.push(await uploadImage(f));
    } catch (x) {
      setErr(x instanceof Error ? x.message : "Upload failed.");
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(false);
    }
  };

  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-700">More images (gallery)</span>
      <div className="flex flex-wrap gap-2">
        {value.map((u) => (
          <div key={u} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-contain" />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => onChange(value.filter((x) => x !== u))}
              className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white hover:bg-black"
            >
              ×
            </button>
          </div>
        ))}
        <label className={`flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-center text-xs text-gray-500 hover:bg-gray-50 ${busy ? "opacity-60" : ""}`}>
          {busy ? "Uploading…" : "+ Add"}
          <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={pick} disabled={busy} />
        </label>
      </div>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Header settings tab                                                 */
/* ------------------------------------------------------------------ */

function HeaderPanel({ initial, notify }: { initial: SiteSettings; notify: (m: string) => void }) {
  const [s, setS] = useState<SiteSettings>(initial);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((p) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const r = await api("PUT", "/api/admin/settings", s);
    setSaving(false);
    if (!r.ok) return notify(errMsg(r.data));
    await refreshSite();
    notify("Header saved. Your store now shows the new header.");
  };

  const preview = s.availabilityMessage.split("{city}").join(s.city);

  return (
    <div className="space-y-6">
      {/* live preview */}
      <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ borderTop: `4px solid ${s.topBarColor}` }}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
        <div className="flex items-center gap-3">
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt="" className="h-10 w-auto max-w-[180px] object-contain" />
          ) : (
            <span className="text-3xl" aria-hidden>🛍️</span>
          )}
          {s.brandName && (
            <span className="text-2xl font-extrabold tracking-wide" style={{ color: s.brandColor }}>
              {s.brandName}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm font-semibold text-gray-900">{s.city}</p>
        {preview && <p className="text-xs text-red-600">{preview}</p>}
      </div>

      <div className="grid gap-5 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <ImageField
            label="Logo"
            value={s.logoUrl}
            onChange={(u) => set("logoUrl", u)}
            hint="PNG / WebP with a transparent background works best. Leave empty to use the default bag icon."
          />
        </div>
        <Field label="Brand name" hint="Shown next to the logo. Leave empty to show the logo only.">
          <input className={inputCls} value={s.brandName} maxLength={40} onChange={(e) => set("brandName", e.target.value)} />
        </Field>
        <Field label="Search box placeholder">
          <input className={inputCls} value={s.searchPlaceholder} maxLength={80} onChange={(e) => set("searchPlaceholder", e.target.value)} />
        </Field>
        <ColorField label="Brand name color" value={s.brandColor} onChange={(v) => set("brandColor", v)} />
        <ColorField label="Top bar color" value={s.topBarColor} onChange={(v) => set("topBarColor", v)} />
        <Field label="City">
          <input className={inputCls} value={s.city} maxLength={60} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="Availability message" hint="Use {city} to insert the city. Leave empty to hide it.">
          <input className={inputCls} value={s.availabilityMessage} maxLength={120} onChange={(e) => set("availabilityMessage", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-5 rounded-xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Toggle label="Show Categories menu" checked={s.showCategories} onChange={(v) => set("showCategories", v)} />
          <Field label="Categories label">
            <input className={inputCls} value={s.categoriesLabel} maxLength={30} onChange={(e) => set("categoriesLabel", e.target.value)} />
          </Field>
        </div>
        <div className="space-y-2">
          <Toggle label="Show Orders link" checked={s.showOrders} onChange={(v) => set("showOrders", v)} />
          <Field label="Orders label">
            <input className={inputCls} value={s.ordersLabel} maxLength={30} onChange={(e) => set("ordersLabel", e.target.value)} />
          </Field>
        </div>
        <Field label="Sign Up button text">
          <input className={inputCls} value={s.signupLabel} maxLength={30} onChange={(e) => set("signupLabel", e.target.value)} />
        </Field>
        <Field label="Login button text">
          <input className={inputCls} value={s.loginLabel} maxLength={30} onChange={(e) => set("loginLabel", e.target.value)} />
        </Field>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Extra header links</h3>
            <p className="text-xs text-gray-500">Up to 6. Shown on large screens. Use paths like /about-us or full https:// links.</p>
          </div>
          <button
            type="button"
            className={btnGhost}
            disabled={s.navLinks.length >= 6}
            onClick={() => set("navLinks", [...s.navLinks, { label: "", href: "" }])}
          >
            + Add link
          </button>
        </div>
        <div className="space-y-2">
          {s.navLinks.map((l, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                className={`${inputCls} flex-1`}
                placeholder="Label"
                value={l.label}
                maxLength={30}
                onChange={(e) => set("navLinks", s.navLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
              />
              <input
                className={`${inputCls} flex-1`}
                placeholder="/about-us"
                value={l.href}
                maxLength={300}
                onChange={(e) => set("navLinks", s.navLinks.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))}
              />
              <button type="button" className={btnDanger} onClick={() => set("navLinks", s.navLinks.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          {s.navLinks.length === 0 && <p className="text-sm text-gray-400">No extra links.</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" className={btnPrimary} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save header"}
        </button>
        <button type="button" className={btnGhost} onClick={() => setS(DEFAULT_SETTINGS)} disabled={saving}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Products tab                                                        */
/* ------------------------------------------------------------------ */

type PackForm = { label: string; price: string; mrp: string };
type PForm = {
  id?: string;
  categoryId: string;
  name: string;
  brand: string;
  image: string;
  images: string[];
  price: string;
  mrp: string;
  quantity: string;
  unitPrice: string;
  rating: string;
  ratingCount: string;
  options: string;
  badgeInRupees: boolean;
  description: string;
  breadcrumb: string;
  packs: PackForm[];
  express: boolean;
  nonReturnable: boolean;
  cod: boolean;
};

const blankForm = (categoryId: string): PForm => ({
  categoryId,
  name: "",
  brand: "",
  image: "",
  images: [],
  price: "",
  mrp: "",
  quantity: "",
  unitPrice: "",
  rating: "",
  ratingCount: "",
  options: "",
  badgeInRupees: false,
  description: "",
  breadcrumb: "",
  packs: [],
  express: true,
  nonReturnable: true,
  cod: true,
});

const fromProduct = (p: Product, categoryId: string): PForm => ({
  id: p.id,
  categoryId,
  name: p.name,
  brand: p.brand ?? "",
  image: p.image,
  images: p.images ?? [],
  price: String(p.price),
  mrp: String(p.mrp),
  quantity: p.quantity,
  unitPrice: p.unitPrice ?? "",
  rating: p.rating ? String(p.rating) : "",
  ratingCount: p.ratingCount === "0" ? "" : p.ratingCount,
  options: p.options ? String(p.options) : "",
  badgeInRupees: !!p.badgeInRupees,
  description: (p.description ?? []).join("\n"),
  breadcrumb: (p.breadcrumb ?? []).join(", "),
  packs: (p.packs ?? []).map((k) => ({ label: k.label, price: String(k.price), mrp: String(k.mrp) })),
  express: p.express !== false,
  nonReturnable: p.nonReturnable !== false,
  cod: p.cod !== false,
});

function ProductForm({
  initial,
  categories,
  onClose,
  onSaved,
}: {
  initial: PForm;
  categories: Category[];
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const [f, setF] = useState<PForm>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof PForm>(k: K, v: PForm[K]) => setF((p) => ({ ...p, [k]: v }));

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const r = f.id ? await api("PUT", "/api/admin/products", f) : await api("POST", "/api/admin/products", f);
    setSaving(false);
    if (!r.ok) return setError(errMsg(r.data));
    await refreshCatalog();
    onSaved(f.id ? "Product updated." : "Product added.");
  };

  const percent = (() => {
    const p = parseFloat(f.price);
    const m = parseFloat(f.mrp);
    return p > 0 && m >= p ? Math.round(((m - p) / m) * 100) : null;
  })();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="mx-auto my-6 w-full max-w-3xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1a1b2e]">{f.id ? "Edit product" : "Add product"}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-2xl leading-none text-gray-500 hover:text-gray-800">
            ×
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Product name *">
              <input className={inputCls} value={f.name} maxLength={200} onChange={(e) => set("name", e.target.value)} required />
            </Field>
          </div>

          <Field label="Category *">
            <select className={inputCls} value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} required>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Brand">
            <input className={inputCls} value={f.brand} maxLength={80} onChange={(e) => set("brand", e.target.value)} />
          </Field>

          <div className="sm:col-span-2">
            <ImageField label="Main image *" value={f.image} onChange={(u) => set("image", u)} hint="JPG, PNG, WebP or GIF up to 4 MB. Stored in Vercel Blob." />
          </div>
          <div className="sm:col-span-2">
            <GalleryField value={f.images} onChange={(u) => set("images", u)} />
          </div>

          <Field label="Selling price (₹) *">
            <input className={inputCls} type="number" min="0" step="any" value={f.price} onChange={(e) => set("price", e.target.value)} required />
          </Field>
          <Field label="MRP (₹) *" hint={percent !== null ? `${percent}% OFF` : undefined}>
            <input className={inputCls} type="number" min="0" step="any" value={f.mrp} onChange={(e) => set("mrp", e.target.value)} required />
          </Field>

          <Field label="Quantity label *" hint='For example "1 kg", "Pack of 2", "Free Size"'>
            <input className={inputCls} value={f.quantity} maxLength={40} onChange={(e) => set("quantity", e.target.value)} required />
          </Field>
          <Field label="Unit price label" hint='For example "₹107/kg"'>
            <input className={inputCls} value={f.unitPrice} maxLength={40} onChange={(e) => set("unitPrice", e.target.value)} />
          </Field>

          <Field label="Rating (0 to 5)">
            <input className={inputCls} type="number" min="0" max="5" step="0.1" value={f.rating} onChange={(e) => set("rating", e.target.value)} />
          </Field>
          <Field label="Rating count" hint='For example "386" or "1.2k"'>
            <input className={inputCls} value={f.ratingCount} maxLength={20} onChange={(e) => set("ratingCount", e.target.value)} />
          </Field>

          <Field label="Number of options" hint='Shows "N options" under the ADD button'>
            <input className={inputCls} type="number" min="0" step="1" value={f.options} onChange={(e) => set("options", e.target.value)} />
          </Field>
          <div className="flex items-end">
            <Toggle label="Show badge as ₹ amount instead of %" checked={f.badgeInRupees} onChange={(v) => set("badgeInRupees", v)} />
          </div>

          <div className="sm:col-span-2">
            <Field label="Description" hint="One line per row. Emojis are fine.">
              <textarea className={inputCls} rows={6} value={f.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Breadcrumb" hint="Optional. Comma separated levels between Home and the product, for example: Audio & Video, Headphones">
              <input className={inputCls} value={f.breadcrumb} onChange={(e) => set("breadcrumb", e.target.value)} />
            </Field>
          </div>

          <div className="sm:col-span-2 rounded-xl border border-gray-200 p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Packs</h3>
                <p className="text-xs text-gray-500">Optional. Each pack has its own price (for example Pack of 1 / Pack of 2).</p>
              </div>
              <button
                type="button"
                className={btnGhost}
                disabled={f.packs.length >= 8}
                onClick={() => set("packs", [...f.packs, { label: "", price: "", mrp: "" }])}
              >
                + Add pack
              </button>
            </div>
            <div className="space-y-2">
              {f.packs.map((p, i) => (
                <div key={i} className="grid grid-cols-[1fr_90px_90px_auto] gap-2">
                  <input className={inputCls} placeholder="Label" value={p.label} onChange={(e) => set("packs", f.packs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                  <input className={inputCls} placeholder="Price" type="number" min="0" step="any" value={p.price} onChange={(e) => set("packs", f.packs.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))} />
                  <input className={inputCls} placeholder="MRP" type="number" min="0" step="any" value={p.mrp} onChange={(e) => set("packs", f.packs.map((x, j) => (j === i ? { ...x, mrp: e.target.value } : x)))} />
                  <button type="button" className={btnDanger} onClick={() => set("packs", f.packs.filter((_, j) => j !== i))}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2 flex flex-wrap gap-x-6 gap-y-2">
            <Toggle label="Express delivery line" checked={f.express} onChange={(v) => set("express", v)} />
            <Toggle label="Non returnable" checked={f.nonReturnable} onChange={(v) => set("nonReturnable", v)} />
            <Toggle label="Cash on delivery" checked={f.cod} onChange={(v) => set("cod", v)} />
          </div>
        </div>

        {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" className={btnGhost} onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Saving…" : f.id ? "Save changes" : "Add product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ProductsPanel({ cats, locked, notify }: { cats: Category[]; locked: boolean; notify: (m: string) => void }) {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<PForm | null>(null);
  const [busyId, setBusyId] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return cats
      .filter((c) => filter === "all" || c.id === filter)
      .flatMap((c) => c.products.map((p) => ({ p, c })))
      .filter(({ p }) => !term || `${p.name} ${p.brand ?? ""}`.toLowerCase().includes(term));
  }, [cats, filter, q]);

  const remove = async (p: Product) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setBusyId(p.id);
    const r = await api("DELETE", `/api/admin/products?id=${encodeURIComponent(p.id)}`);
    setBusyId("");
    if (!r.ok) return notify(errMsg(r.data));
    await refreshCatalog();
    notify("Product deleted.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input className={`${inputCls} max-w-xs`} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={`${inputCls} max-w-[220px]`} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All categories</option>
          {cats.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${btnPrimary} ml-auto`}
          disabled={locked || cats.length === 0}
          onClick={() => setEditing(blankForm(filter !== "all" ? filter : cats[0]?.id ?? ""))}
        >
          + Add product
        </button>
      </div>

      {cats.length === 0 && !locked && <p className="text-sm text-gray-500">Create a category first (Categories tab).</p>}

      <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
        {rows.map(({ p, c }) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.image} alt="" className="h-full w-full object-contain" onError={(e) => (e.currentTarget.style.display = "none")} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{p.name}</p>
              <p className="truncate text-xs text-gray-500">
                {c.emoji} {c.name} · {p.quantity}
              </p>
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="font-bold text-gray-900">₹{p.price.toLocaleString("en-IN")}</p>
              <p className="text-xs text-gray-400 line-through">₹{p.mrp.toLocaleString("en-IN")}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" className={btnGhost} disabled={locked} onClick={() => setEditing(fromProduct(p, c.id))}>
                Edit
              </button>
              <button type="button" className={btnDanger} disabled={locked || busyId === p.id} onClick={() => remove(p)}>
                {busyId === p.id ? "…" : "Delete"}
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="p-6 text-center text-sm text-gray-400">No products found.</p>}
      </div>

      {editing && (
        <ProductForm
          initial={editing}
          categories={cats}
          onClose={() => setEditing(null)}
          onSaved={(m) => {
            setEditing(null);
            notify(m);
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Categories tab                                                      */
/* ------------------------------------------------------------------ */

function CategoryRow({ c, count, locked, notify }: { c: Category; count: number; locked: boolean; notify: (m: string) => void }) {
  const [name, setName] = useState(c.name);
  const [emoji, setEmoji] = useState(c.emoji);
  const [busy, setBusy] = useState(false);
  const dirty = name !== c.name || emoji !== c.emoji;

  const save = async () => {
    setBusy(true);
    const r = await api("PUT", "/api/admin/categories", { id: c.id, name, emoji });
    setBusy(false);
    if (!r.ok) return notify(errMsg(r.data));
    await refreshCatalog();
    notify("Category updated.");
  };

  const remove = async () => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    setBusy(true);
    const r = await api("DELETE", `/api/admin/categories?id=${encodeURIComponent(c.id)}`);
    setBusy(false);
    if (!r.ok) return notify(errMsg(r.data));
    await refreshCatalog();
    notify("Category deleted.");
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3">
      <input className={`${inputCls} w-16 text-center`} value={emoji} maxLength={8} onChange={(e) => setEmoji(e.target.value)} disabled={locked} aria-label="Emoji" />
      <input className={`${inputCls} flex-1`} value={name} maxLength={80} onChange={(e) => setName(e.target.value)} disabled={locked} aria-label="Category name" />
      <span className="text-xs text-gray-400">{count} products</span>
      <button type="button" className={btnPrimary} onClick={save} disabled={locked || busy || !dirty || !name.trim()}>
        Save
      </button>
      <button type="button" className={btnDanger} onClick={remove} disabled={locked || busy}>
        Delete
      </button>
    </div>
  );
}

function CategoriesPanel({ cats, locked, notify }: { cats: Category[]; locked: boolean; notify: (m: string) => void }) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🛍️");
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await api("POST", "/api/admin/categories", { name, emoji });
    setBusy(false);
    if (!r.ok) return notify(errMsg(r.data));
    setName("");
    await refreshCatalog();
    notify("Category added.");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={add} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-3">
        <input className={`${inputCls} w-16 text-center`} value={emoji} maxLength={8} onChange={(e) => setEmoji(e.target.value)} disabled={locked} aria-label="Emoji" />
        <input className={`${inputCls} flex-1`} placeholder="New category name" value={name} maxLength={80} onChange={(e) => setName(e.target.value)} disabled={locked} />
        <button type="submit" className={btnPrimary} disabled={locked || busy || !name.trim()}>
          + Add category
        </button>
      </form>

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {cats.map((c) => (
          <CategoryRow key={`${c.id}-${c.name}-${c.emoji}`} c={c} count={c.products.length} locked={locked} notify={notify} />
        ))}
        {cats.length === 0 && <p className="p-6 text-center text-sm text-gray-400">No categories yet.</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard shell                                                     */
/* ------------------------------------------------------------------ */

type Tab = "header" | "products" | "categories" | "footer";

const icons: Record<Tab, React.ReactNode> = {
  header: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="6" rx="1.5" />
      <path d="M3 15h18M3 19h12" />
    </svg>
  ),
  products: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8M12 13v8" />
    </svg>
  ),
  categories: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  footer: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 15h18M7 18.5h4" />
    </svg>
  ),
};

const sections: { id: Tab; label: string; title: string; desc: string }[] = [
  { id: "header", label: "Header", title: "Header settings", desc: "Logo, brand name, colors, city and navigation links." },
  { id: "products", label: "Products", title: "Products", desc: "Add, edit and delete the products in your store." },
  { id: "categories", label: "Categories", title: "Categories", desc: "Organise your store into categories." },
  { id: "footer", label: "Footer", title: "Footer settings", desc: "Brand, links, cities, categories, contact details and social links." },
];

export default function AdminDashboard() {
  const { settings, loaded } = useSite();
  const { categories, source } = useCatalog();
  const cats = useMemo(() => categories ?? [], [categories]);

  const [tab, setTab] = useState<Tab>("header");
  const [toast, setToast] = useState("");
  const [seeding, setSeeding] = useState(false);

  // make sure the dashboard always starts from fresh data
  useEffect(() => {
    void refreshSite();
    void refreshCatalog();
  }, []);

  const notify = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 3500);
  };

  const logout = async () => {
    await api("DELETE", "/api/admin/session");
    window.location.href = "/"; // full reload so the header forgets the admin session
  };

  const importCatalog = async () => {
    setSeeding(true);
    const r = await api("POST", "/api/admin/seed");
    setSeeding(false);
    if (!r.ok) return notify(errMsg(r.data));
    await refreshCatalog();
    notify("Sample catalog imported. You can now edit everything.");
  };

  const locked = source !== "db";
  const current = sections.find((s) => s.id === tab)!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* top bar */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1b2e] text-lg text-white" aria-hidden>
              🛍️
            </span>
            <div>
              <h1 className="text-lg font-bold leading-tight text-[#1a1b2e] sm:text-xl">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">Manage your store</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 sm:inline">
            ● Signed in as admin
          </span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1280px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
        {/* LEFT: functionality of the selected option */}
        <main className="order-2 min-w-0 lg:order-1">
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-[#1a1b2e]">{current.title}</h2>
            <p className="text-sm text-gray-500">{current.desc}</p>
          </div>

          {(tab === "products" || tab === "categories") && source === "static" && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                Your store is still showing the built-in sample products. Import them into the database once to start editing.
              </p>
              <button type="button" className={btnPrimary} onClick={importCatalog} disabled={seeding}>
                {seeding ? "Importing…" : "Import sample catalog"}
              </button>
            </div>
          )}

          {tab === "header" &&
            (loaded ? <HeaderPanel initial={settings} notify={notify} /> : <p className="text-gray-500">Loading…</p>)}
          {tab === "products" && <ProductsPanel cats={cats} locked={locked} notify={notify} />}
          {tab === "categories" && <CategoriesPanel cats={cats} locked={locked} notify={notify} />}
          {tab === "footer" && <FooterPanel notify={notify} />}
        </main>

        {/* RIGHT: headings / navigation */}
        <aside className="order-1 lg:order-2 lg:sticky lg:top-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="hidden px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide text-gray-400 lg:block">
              Manage
            </p>
            <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Admin sections">
              {sections.map((s) => {
                const active = tab === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setTab(s.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition lg:w-full ${
                      active
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {icons[s.id]}
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="mt-3 hidden space-y-2 border-t border-gray-100 pt-3 lg:block">
              <Link href="/" className={`${btnGhost} block w-full text-center`}>
                View store
              </Link>
              <button type="button" className={`${btnDanger} w-full py-2`} onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          {/* mobile-only actions */}
          <div className="mt-3 flex gap-2 lg:hidden">
            <Link href="/" className={`${btnGhost} flex-1 text-center`}>
              View store
            </Link>
            <button type="button" className={`${btnDanger} flex-1`} onClick={logout}>
              Logout
            </button>
          </div>
        </aside>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-[#1a1b2e] px-4 py-3 text-sm font-medium text-white shadow-lg"
        >
          {toast}
        </div>
      )}
    </div>
  );
}