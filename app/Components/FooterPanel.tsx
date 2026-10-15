"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_FOOTER,
  type FooterCategory,
  type FooterLink,
  type FooterSettings,
} from "../lib/footerTypes";
import { refreshFooter } from "../lib/useFooter";

/* ------------------------------------------------------------------ */
/* small shared bits (same look as the rest of the dashboard)          */
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

async function putJson(url: string, body: unknown): Promise<ApiResult> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (res.status === 401) window.location.href = "/"; // session expired
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { error: "Network error. Please try again." } };
  }
}

const errMsg = (d: Record<string, unknown>) => (typeof d.error === "string" ? d.error : "Something went wrong.");

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

function Card({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {desc && <p className="text-xs text-gray-500">{desc}</p>}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* link list editor (Company / Legal / Our Businesses)                 */
/* ------------------------------------------------------------------ */

function LinkListEditor({
  heading,
  title,
  onTitle,
  links,
  onLinks,
  max = 12,
}: {
  heading: string;
  title: string;
  onTitle: (v: string) => void;
  links: FooterLink[];
  onLinks: (l: FooterLink[]) => void;
  max?: number;
}) {
  const update = (i: number, patch: Partial<FooterLink>) =>
    onLinks(links.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <p className="mb-3 text-sm font-semibold text-gray-900">{heading}</p>
      <Field label="Column title" hint="Leave empty to hide the title.">
        <input className={inputCls} value={title} maxLength={40} onChange={(e) => onTitle(e.target.value)} />
      </Field>

      <div className="mt-4 space-y-2">
        {links.map((l, i) => (
          <div key={i} className="flex flex-wrap gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="Label"
              value={l.label}
              maxLength={40}
              onChange={(e) => update(i, { label: e.target.value })}
            />
            <input
              className={`${inputCls} flex-1`}
              placeholder="/about-us"
              value={l.href}
              maxLength={300}
              onChange={(e) => update(i, { href: e.target.value })}
            />
            <button type="button" className={btnDanger} onClick={() => onLinks(links.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        ))}
        {links.length === 0 && <p className="text-sm text-gray-400">No links. This column is hidden.</p>}
      </div>

      <button
        type="button"
        className={`${btnGhost} mt-3`}
        disabled={links.length >= max}
        onClick={() => onLinks([...links, { label: "", href: "" }])}
      >
        + Add link
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* the form                                                            */
/* ------------------------------------------------------------------ */

function FooterForm({
  initial,
  saved,
  notify,
}: {
  initial: FooterSettings;
  saved: boolean;
  notify: (m: string) => void;
}) {
  const [f, setF] = useState<FooterSettings>(initial);
  const [isSaved, setIsSaved] = useState(saved);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FooterSettings>(k: K, v: FooterSettings[K]) => setF((p) => ({ ...p, [k]: v }));

  const setCategory = (i: number, patch: Partial<FooterCategory>) =>
    set("categories", f.categories.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  const moveCategory = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= f.categories.length) return;
    const next = [...f.categories];
    [next[i], next[j]] = [next[j], next[i]];
    set("categories", next);
  };

  const save = async () => {
    setSaving(true);
    const r = await putJson("/api/admin/footer", f);
    setSaving(false);
    if (!r.ok) return notify(errMsg(r.data));
    const clean = r.data.footer as FooterSettings | undefined;
    if (clean) setF(clean); // the server removes empty rows and trims text
    setIsSaved(true);
    await refreshFooter();
    notify("Footer saved. Your store now shows the new footer.");
  };

  const reset = () => {
    if (!window.confirm("Reset the form to the built-in defaults? Nothing changes in your store until you click Save footer.")) return;
    setF(DEFAULT_FOOTER);
  };

  return (
    <div className="space-y-6">
      {!isSaved && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          The footer is not saved in the database yet, so your store shows the built-in default. Change anything you like,
          then click <strong>Save footer</strong> to store it.
        </div>
      )}

      {/* live preview */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <p className="bg-white px-4 pt-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Preview</p>
        <div className="bg-white p-3">
          <div className="rounded-lg p-5 text-gray-400" style={{ backgroundColor: f.bgColor }}>
            {f.introText && <p className="text-sm">{f.introText}</p>}
            <div className="mt-2 flex items-center gap-2">
              {f.brandShort && (
                <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-white px-1 text-xs font-extrabold text-rose-600">
                  {f.brandShort}
                </span>
              )}
              {f.brandName && <span className="text-xl font-bold text-white">{f.brandName}</span>}
            </div>
            {f.tagline && <p className="mt-2 text-sm">{f.tagline}</p>}
            {f.showAppButtons && (
              <div className="mt-3 flex gap-2 text-xs text-white">
                {f.playStoreUrl && <span className="rounded-md border border-gray-500 bg-black px-3 py-1.5">Google Play</span>}
                {f.appStoreUrl && <span className="rounded-md border border-gray-500 bg-black px-3 py-1.5">App Store</span>}
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs">
              {f.companyLinks.length > 0 && <span className="font-semibold text-white">{f.companyTitle || "Column 1"}</span>}
              {f.legalLinks.length > 0 && <span className="font-semibold text-white">{f.legalTitle || "Column 2"}</span>}
              {f.businessLinks.length > 0 && <span className="font-semibold text-white">{f.businessTitle || "Column 3"}</span>}
              {f.showCities && f.cities.length > 0 && <span className="font-semibold text-white">{f.citiesTitle || "Cities"}</span>}
              {f.showCategories && f.categories.length > 0 && (
                <span className="font-semibold text-white">{f.categoriesTitle || "Categories"}</span>
              )}
              {f.contactTitle && <span className="font-semibold text-white">{f.contactTitle}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* brand + app buttons */}
      <Card title="Brand and app buttons" desc="The top part of the footer.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Intro line" hint='For example "Shop Unlimited on". Leave empty to hide.'>
            <input className={inputCls} value={f.introText} maxLength={60} onChange={(e) => set("introText", e.target.value)} />
          </Field>
          <Field label="Tagline">
            <input className={inputCls} value={f.tagline} maxLength={120} onChange={(e) => set("tagline", e.target.value)} />
          </Field>
          <Field label="Brand name">
            <input className={inputCls} value={f.brandName} maxLength={40} onChange={(e) => set("brandName", e.target.value)} />
          </Field>
          <Field label="Brand short text" hint="Shown in the white badge, up to 4 characters. Leave empty to hide the badge.">
            <input className={inputCls} value={f.brandShort} maxLength={4} onChange={(e) => set("brandShort", e.target.value)} />
          </Field>
          <ColorField label="Footer background color" value={f.bgColor} onChange={(v) => set("bgColor", v)} />
          <div className="flex items-end">
            <Toggle label="Show app download buttons" checked={f.showAppButtons} onChange={(v) => set("showAppButtons", v)} />
          </div>
          <Field label="Google Play link" hint="Leave empty to hide this button.">
            <input className={inputCls} value={f.playStoreUrl} maxLength={300} placeholder="https://play.google.com/…" onChange={(e) => set("playStoreUrl", e.target.value)} />
          </Field>
          <Field label="App Store link" hint="Leave empty to hide this button.">
            <input className={inputCls} value={f.appStoreUrl} maxLength={300} placeholder="https://apps.apple.com/…" onChange={(e) => set("appStoreUrl", e.target.value)} />
          </Field>
        </div>
      </Card>

      {/* link columns */}
      <Card
        title="Link columns"
        desc="Use paths like /about-us, or full links like https://example.com. A column with no links is hidden."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <LinkListEditor
            heading="Column 1"
            title={f.companyTitle}
            onTitle={(v) => set("companyTitle", v)}
            links={f.companyLinks}
            onLinks={(l) => set("companyLinks", l)}
          />
          <LinkListEditor
            heading="Column 2"
            title={f.legalTitle}
            onTitle={(v) => set("legalTitle", v)}
            links={f.legalLinks}
            onLinks={(l) => set("legalLinks", l)}
          />
          <LinkListEditor
            heading="Column 3"
            title={f.businessTitle}
            onTitle={(v) => set("businessTitle", v)}
            links={f.businessLinks}
            onLinks={(l) => set("businessLinks", l)}
          />
        </div>
      </Card>

      {/* cities */}
      <Card title="Shop by city" desc="Each city links to /city/<city-name>.">
        <div className="space-y-4">
          <Toggle label="Show this section" checked={f.showCities} onChange={(v) => set("showCities", v)} />
          <Field label="Section title">
            <input className={inputCls} value={f.citiesTitle} maxLength={40} onChange={(e) => set("citiesTitle", e.target.value)} />
          </Field>
          <Field label="Cities" hint={`One city per line. ${f.cities.filter((c) => c.trim()).length} cities.`}>
            <textarea
              className={inputCls}
              rows={8}
              value={f.cities.join("\n")}
              onChange={(e) => set("cities", e.target.value.split("\n"))}
            />
          </Field>
        </div>
      </Card>

      {/* categories */}
      <Card
        title="Shop by category"
        desc="Each category links to /category/<name>, and each sub-link to /category/<name>/<sub-link>."
      >
        <div className="space-y-4">
          <Toggle label="Show this section" checked={f.showCategories} onChange={(v) => set("showCategories", v)} />
          <Field label="Section title">
            <input className={inputCls} value={f.categoriesTitle} maxLength={40} onChange={(e) => set("categoriesTitle", e.target.value)} />
          </Field>

          <div className="space-y-3">
            {f.categories.map((c, i) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    className={`${inputCls} flex-1`}
                    placeholder="Category name"
                    value={c.title}
                    maxLength={60}
                    onChange={(e) => setCategory(i, { title: e.target.value })}
                  />
                  <button type="button" className={btnGhost} aria-label="Move up" disabled={i === 0} onClick={() => moveCategory(i, -1)}>
                    ↑
                  </button>
                  <button
                    type="button"
                    className={btnGhost}
                    aria-label="Move down"
                    disabled={i === f.categories.length - 1}
                    onClick={() => moveCategory(i, 1)}
                  >
                    ↓
                  </button>
                  <button type="button" className={btnDanger} onClick={() => set("categories", f.categories.filter((_, j) => j !== i))}>
                    Remove
                  </button>
                </div>
                <textarea
                  className={`${inputCls} mt-2`}
                  rows={3}
                  placeholder="Sub-links, one per line"
                  value={c.links.join("\n")}
                  onChange={(e) => setCategory(i, { links: e.target.value.split("\n") })}
                />
              </div>
            ))}
            {f.categories.length === 0 && <p className="text-sm text-gray-400">No categories. This section is hidden.</p>}
          </div>

          <button
            type="button"
            className={btnGhost}
            disabled={f.categories.length >= 30}
            onClick={() => set("categories", [...f.categories, { title: "", links: [] }])}
          >
            + Add category
          </button>
        </div>
      </Card>

      {/* contact */}
      <Card title="Contact details" desc="Leave a field empty to hide that line.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Section title">
            <input className={inputCls} value={f.contactTitle} maxLength={40} onChange={(e) => set("contactTitle", e.target.value)} />
          </Field>
          <Field label="Company name">
            <input className={inputCls} value={f.company} maxLength={120} onChange={(e) => set("company", e.target.value)} />
          </Field>
          <Field label="CIN">
            <input className={inputCls} value={f.cin} maxLength={60} onChange={(e) => set("cin", e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputCls} type="email" value={f.email} maxLength={120} onChange={(e) => set("email", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Registered address">
              <textarea className={inputCls} rows={2} value={f.registeredAddress} maxLength={300} onChange={(e) => set("registeredAddress", e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Corporate office">
              <textarea className={inputCls} rows={2} value={f.corporateOffice} maxLength={300} onChange={(e) => set("corporateOffice", e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      {/* social + copyright */}
      <Card title="Social links and bottom line" desc="Leave a link empty to hide its icon.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Facebook link">
            <input className={inputCls} value={f.facebookUrl} maxLength={300} placeholder="https://facebook.com/…" onChange={(e) => set("facebookUrl", e.target.value)} />
          </Field>
          <Field label="LinkedIn link">
            <input className={inputCls} value={f.linkedinUrl} maxLength={300} placeholder="https://linkedin.com/…" onChange={(e) => set("linkedinUrl", e.target.value)} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Copyright line" hint='For example "© 2026 Sharma Traders. All rights reserved." Leave empty to hide.'>
              <input className={inputCls} value={f.copyright} maxLength={160} onChange={(e) => set("copyright", e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <button type="button" className={btnPrimary} onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save footer"}
        </button>
        <button type="button" className={btnGhost} onClick={reset} disabled={saving}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* loads the saved footer, then shows the form                         */
/* ------------------------------------------------------------------ */

export default function FooterPanel({ notify }: { notify: (m: string) => void }) {
  const [data, setData] = useState<{ footer: FooterSettings; saved: boolean } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let off = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/footer", { cache: "no-store" });
        const json = (await res.json().catch(() => ({}))) as {
          footer?: FooterSettings;
          saved?: boolean;
          error?: string;
        };
        if (off) return;
        if (res.status === 401) {
          window.location.href = "/";
          return;
        }
        if (res.ok && json.footer) setData({ footer: json.footer, saved: !!json.saved });
        else setError(json.error || "Could not load the footer.");
      } catch {
        if (!off) setError("Network error. Please try again.");
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  if (error) return <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>;
  if (!data) return <p className="text-gray-500">Loading…</p>;
  return <FooterForm initial={data.footer} saved={data.saved} notify={notify} />;
}