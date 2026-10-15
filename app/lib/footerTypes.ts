import {
    businessLinks,
    cities,
    companyLinks,
    footerCategories,
    legalLinks,
    type FooterLink,
  } from "../data/footer";
  
  export { slugify } from "../data/footer";
  export type { FooterLink };
  
  export type FooterCategory = { title: string; links: string[] };
  
  export type FooterSettings = {
    /* brand block */
    introText: string;
    brandName: string;
    brandShort: string;
    tagline: string;
    bgColor: string;
    showAppButtons: boolean;
    playStoreUrl: string;
    appStoreUrl: string;
  
    /* three link columns */
    companyTitle: string;
    companyLinks: FooterLink[];
    legalTitle: string;
    legalLinks: FooterLink[];
    businessTitle: string;
    businessLinks: FooterLink[];
  
    /* shop by city */
    showCities: boolean;
    citiesTitle: string;
    cities: string[];
  
    /* shop by category */
    showCategories: boolean;
    categoriesTitle: string;
    categories: FooterCategory[];
  
    /* contact */
    contactTitle: string;
    company: string;
    cin: string;
    registeredAddress: string;
    corporateOffice: string;
    email: string;
  
    /* social + bottom line */
    facebookUrl: string;
    linkedinUrl: string;
    copyright: string;
  };
  
  /** Used until the admin saves the footer for the first time. */
  export const DEFAULT_FOOTER: FooterSettings = {
    introText: "Shop Unlimited on",
    brandName: "CityMall",
    brandShort: "CM",
    tagline: "Cash on delivery | Free Delivery",
    bgColor: "#1a1b2e",
    showAppButtons: true,
    playStoreUrl: "#",
    appStoreUrl: "#",
  
    companyTitle: "Company",
    companyLinks,
    legalTitle: "Legal",
    legalLinks,
    businessTitle: "Our Businesses",
    businessLinks,
  
    showCities: true,
    citiesTitle: "Shop by City",
    cities,
  
    showCategories: true,
    categoriesTitle: "Shop by Category",
    categories: footerCategories,
  
    contactTitle: "Contact Us",
    company: "Rashanbox Retail Private Limited",
    cin: "U52190HR2020PTC086114",
    registeredAddress:
      "Unit No. 1103 Plus Office, 1st Floor, Landmark Cyber Park, Sector 67, Badshahpur, Gurgaon, Haryana, India, 122101",
    corporateOffice: "12th Floor, Imperia MindSpace Golf Course Ext Rd, Sector 62, Gurgaon, Haryana 122001",
    email: "support@citymall.live",
  
    facebookUrl: "#",
    linkedinUrl: "#",
    copyright: "",
  };
  
  /* ------------------------------------------------------------------ */
  /* sanitizing (runs on the server before anything is saved)            */
  /* ------------------------------------------------------------------ */
  
  // Only allow normal site paths, #anchors, http(s), mailto and tel links (blocks javascript: etc.)
  const SAFE_HREF = /^(\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i;
  const HEX = /^#[0-9a-fA-F]{6}$/;
  
  const str = (v: unknown, max: number, fallback: string) =>
    typeof v === "string" ? v.trim().slice(0, max) : fallback;
  
  const bool = (v: unknown, fallback: boolean) => (typeof v === "boolean" ? v : fallback);
  
  function url(v: unknown, fallback: string, what: string, problems: string[]) {
    if (typeof v !== "string") return fallback;
    const t = v.trim().slice(0, 300);
    if (t === "") return "";
    if (!SAFE_HREF.test(t)) {
      problems.push(`${what} is not a valid address. Use /page, https://…, mailto: or tel:.`);
      return fallback;
    }
    return t;
  }
  
  function links(v: unknown, fallback: FooterLink[], max: number, problems: string[]): FooterLink[] {
    if (!Array.isArray(v)) return fallback;
    const out: FooterLink[] = [];
    for (const x of v.slice(0, max)) {
      if (!x || typeof x !== "object") continue;
      const o = x as Record<string, unknown>;
      const label = str(o.label, 40, "");
      const href = typeof o.href === "string" ? o.href.trim().slice(0, 300) : "";
      if (!label && !href) continue; // empty row
      if (!label || !href) {
        problems.push("Every footer link needs both a label and an address.");
        continue;
      }
      if (!SAFE_HREF.test(href)) {
        problems.push(`The link "${label}" has an invalid address. Use /page, https://…, mailto: or tel:.`);
        continue;
      }
      out.push({ label, href });
    }
    return out;
  }
  
  function stringList(v: unknown, fallback: string[], maxItems: number, maxLen: number): string[] {
    if (!Array.isArray(v)) return fallback;
    return v
      .filter((x): x is string => typeof x === "string")
      .map((x) => x.trim().slice(0, maxLen))
      .filter(Boolean)
      .slice(0, maxItems);
  }
  
  function categories(v: unknown, fallback: FooterCategory[], problems: string[]): FooterCategory[] {
    if (!Array.isArray(v)) return fallback;
    const out: FooterCategory[] = [];
    for (const x of v.slice(0, 30)) {
      if (!x || typeof x !== "object") continue;
      const o = x as Record<string, unknown>;
      const title = str(o.title, 60, "");
      const subs = stringList(o.links, [], 40, 60);
      if (!title && subs.length === 0) continue; // empty row
      if (!title) {
        problems.push("Every footer category needs a name.");
        continue;
      }
      out.push({ title, links: subs });
    }
    return out;
  }
  
  /**
   * Turns anything into a valid FooterSettings. Missing fields fall back to the defaults.
   * Pass an array as `problems` to collect messages for values that were rejected.
   */
  export function sanitizeFooter(input: unknown, problems: string[] = []): FooterSettings {
    const d = DEFAULT_FOOTER;
    const o = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  
    return {
      introText: str(o.introText, 60, d.introText),
      brandName: str(o.brandName, 40, d.brandName),
      brandShort: str(o.brandShort, 4, d.brandShort),
      tagline: str(o.tagline, 120, d.tagline),
      bgColor: typeof o.bgColor === "string" && HEX.test(o.bgColor) ? o.bgColor : d.bgColor,
      showAppButtons: bool(o.showAppButtons, d.showAppButtons),
      playStoreUrl: url(o.playStoreUrl, d.playStoreUrl, "The Google Play link", problems),
      appStoreUrl: url(o.appStoreUrl, d.appStoreUrl, "The App Store link", problems),
  
      companyTitle: str(o.companyTitle, 40, d.companyTitle),
      companyLinks: links(o.companyLinks, d.companyLinks, 12, problems),
      legalTitle: str(o.legalTitle, 40, d.legalTitle),
      legalLinks: links(o.legalLinks, d.legalLinks, 12, problems),
      businessTitle: str(o.businessTitle, 40, d.businessTitle),
      businessLinks: links(o.businessLinks, d.businessLinks, 12, problems),
  
      showCities: bool(o.showCities, d.showCities),
      citiesTitle: str(o.citiesTitle, 40, d.citiesTitle),
      cities: stringList(o.cities, d.cities, 200, 60),
  
      showCategories: bool(o.showCategories, d.showCategories),
      categoriesTitle: str(o.categoriesTitle, 40, d.categoriesTitle),
      categories: categories(o.categories, d.categories, problems),
  
      contactTitle: str(o.contactTitle, 40, d.contactTitle),
      company: str(o.company, 120, d.company),
      cin: str(o.cin, 60, d.cin),
      registeredAddress: str(o.registeredAddress, 300, d.registeredAddress),
      corporateOffice: str(o.corporateOffice, 300, d.corporateOffice),
      email: str(o.email, 120, d.email),
  
      facebookUrl: url(o.facebookUrl, d.facebookUrl, "The Facebook link", problems),
      linkedinUrl: url(o.linkedinUrl, d.linkedinUrl, "The LinkedIn link", problems),
      copyright: str(o.copyright, 160, d.copyright),
    };
  }