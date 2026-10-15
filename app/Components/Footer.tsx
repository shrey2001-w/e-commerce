"use client";

import { Fragment } from "react";
import Link from "next/link";
import { DEFAULT_FOOTER, slugify, type FooterLink } from "../lib/footerTypes";
import { useFooter } from "../lib/useFooter";

const linkClass =
  "text-gray-400 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none";

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-white sm:h-8 sm:w-8" aria-hidden>
      <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 fill-white sm:h-8 sm:w-8" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full fill-current" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.971h-1.514c-1.491 0-1.956.931-1.956 1.886v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full fill-current" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function StoreButton({
  href,
  small,
  big,
  icon,
}: {
  href: string;
  small: string;
  big: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2.5 rounded-xl border border-gray-500/70 bg-black px-4 py-2 transition hover:border-gray-300 sm:px-6 sm:py-2.5"
    >
      {icon}
      <span className="flex flex-col leading-none">
        <span className="text-[9px] font-medium uppercase tracking-wide text-gray-200 sm:text-[10px]">
          {small}
        </span>
        <span className="mt-1 text-lg font-semibold text-white sm:text-xl">{big}</span>
      </span>
    </a>
  );
}

function LinkColumn({ title, links, className = "" }: { title: string; links: FooterLink[]; className?: string }) {
  return (
    <div className={className}>
      {title && <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>}
      <ul className={`${title ? "mt-5 sm:mt-6" : ""} flex flex-col gap-4 text-[15px] sm:gap-[18px] sm:text-base`}>
        {links.map((l) => (
          <li key={`${l.label}-${l.href}`}>
            <Link href={l.href} className={linkClass}>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const f = useFooter();

  // while the footer loads from the database, keep the space reserved
  if (!f) {
    return (
      <footer
        aria-hidden
        className="min-h-[260px] w-full"
        style={{ backgroundColor: DEFAULT_FOOTER.bgColor }}
      />
    );
  }

  const hasColumns = f.companyLinks.length > 0 || f.legalLinks.length > 0 || f.businessLinks.length > 0;
  const hasContact = !!(f.company || f.cin || f.registeredAddress || f.corporateOffice || f.email);
  const hasSocial = !!(f.facebookUrl || f.linkedinUrl);

  const blocks: { key: string; node: React.ReactNode }[] = [];

  /* ---------- brand + app buttons ---------- */
  blocks.push({
    key: "brand",
    node: (
      <div>
        {f.introText && <p className="text-base text-gray-400 sm:text-lg">{f.introText}</p>}

        {(f.brandName || f.brandShort) && (
          <div className="mt-3 flex items-center gap-3">
            {f.brandShort && (
              <span className="flex h-11 min-w-11 items-center justify-center rounded-xl bg-white px-1 text-sm font-extrabold text-rose-600 sm:h-12 sm:min-w-12 sm:text-base">
                {f.brandShort}
              </span>
            )}
            {f.brandName && <span className="text-3xl font-bold text-white sm:text-4xl">{f.brandName}</span>}
          </div>
        )}

        {f.tagline && <p className="mt-3 text-base text-gray-400 sm:text-lg">{f.tagline}</p>}

        {f.showAppButtons && (f.playStoreUrl || f.appStoreUrl) && (
          <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
            {f.playStoreUrl && (
              <StoreButton href={f.playStoreUrl} small="Get it on" big="Google Play" icon={<PlayIcon />} />
            )}
            {f.appStoreUrl && (
              <StoreButton href={f.appStoreUrl} small="Download on the" big="App Store" icon={<AppleIcon />} />
            )}
          </div>
        )}
      </div>
    ),
  });

  /* ---------- Company / Legal / Our Businesses ---------- */
  if (hasColumns) {
    blocks.push({
      key: "columns",
      node: (
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          {f.companyLinks.length > 0 && <LinkColumn title={f.companyTitle} links={f.companyLinks} />}
          {f.legalLinks.length > 0 && <LinkColumn title={f.legalTitle} links={f.legalLinks} />}
          {f.businessLinks.length > 0 && (
            <LinkColumn title={f.businessTitle} links={f.businessLinks} className="col-span-2 md:col-span-1" />
          )}
        </div>
      ),
    });
  }

  /* ---------- Shop by City ---------- */
  if (f.showCities && f.cities.length > 0) {
    blocks.push({
      key: "cities",
      node: (
        <section aria-labelledby="shop-by-city">
          {f.citiesTitle && (
            <h3 id="shop-by-city" className="text-lg font-semibold text-white sm:text-xl">
              {f.citiesTitle}
            </h3>
          )}
          <ul className={`${f.citiesTitle ? "mt-5" : ""} flex flex-wrap gap-x-5 gap-y-3 text-[15px] sm:text-base`}>
            {f.cities.map((city) => (
              <li key={city}>
                <Link href={`/city/${slugify(city)}`} className={linkClass}>
                  {city}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ),
    });
  }

  /* ---------- Shop by Category ---------- */
  if (f.showCategories && f.categories.length > 0) {
    blocks.push({
      key: "categories",
      node: (
        <section aria-labelledby="shop-by-category">
          {f.categoriesTitle && (
            <h3 id="shop-by-category" className="text-lg font-semibold text-white sm:text-xl">
              {f.categoriesTitle}
            </h3>
          )}

          <div className={`${f.categoriesTitle ? "mt-6" : ""} flex flex-col gap-6`}>
            {f.categories.map((cat) => (
              <div key={cat.title}>
                <h4 className="text-[15px] font-semibold text-gray-200 sm:text-base">
                  <Link href={`/category/${slugify(cat.title)}`} className="hover:text-white">
                    {cat.title}
                  </Link>
                </h4>
                {cat.links.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-[14px] sm:text-base">
                    {cat.links.map((sub) => (
                      <li key={sub}>
                        <Link href={`/category/${slugify(cat.title)}/${slugify(sub)}`} className={linkClass}>
                          {sub}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ),
    });
  }

  /* ---------- Contact Us ---------- */
  if (hasContact) {
    blocks.push({
      key: "contact",
      node: (
        <section aria-labelledby="contact-us">
          {f.contactTitle && (
            <h3 id="contact-us" className="text-lg font-semibold text-white sm:text-xl">
              {f.contactTitle}
            </h3>
          )}

          <div
            className={`${f.contactTitle ? "mt-5" : ""} flex flex-col gap-3 text-sm leading-relaxed sm:gap-4 sm:text-base`}
          >
            {f.company && <p className="font-medium text-gray-200">{f.company}</p>}
            {f.cin && <p className="break-words text-gray-400">CIN: {f.cin}</p>}
            {f.registeredAddress && <p className="text-gray-400">Registered Address: {f.registeredAddress}</p>}
            {f.corporateOffice && <p className="text-gray-400">Corporate office: {f.corporateOffice}</p>}
            {f.email && (
              <p className="break-all text-gray-400 sm:break-normal">
                Email:{" "}
                <a
                  href={`mailto:${f.email}`}
                  className="text-white underline underline-offset-2 hover:text-gray-200"
                >
                  {f.email}
                </a>
              </p>
            )}
          </div>
        </section>
      ),
    });
  }

  /* ---------- Social icons ---------- */
  if (hasSocial) {
    blocks.push({
      key: "social",
      node: (
        <div className="flex items-center gap-6">
          {f.facebookUrl && (
            <a
              href={f.facebookUrl}
              aria-label="Facebook"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 text-gray-400 transition-colors hover:text-white sm:h-12 sm:w-12"
            >
              <FacebookIcon />
            </a>
          )}
          {f.linkedinUrl && (
            <a
              href={f.linkedinUrl}
              aria-label="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 w-10 text-gray-400 transition-colors hover:text-white sm:h-12 sm:w-12"
            >
              <LinkedInIcon />
            </a>
          )}
        </div>
      ),
    });
  }

  /* ---------- bottom line ---------- */
  if (f.copyright) {
    blocks.push({
      key: "copyright",
      node: <p className="text-sm text-gray-500">{f.copyright}</p>,
    });
  }

  return (
    <footer className="w-full text-gray-400" style={{ backgroundColor: f.bgColor }}>
      <div className="mx-auto w-full max-w-[1600px] px-5 py-10 sm:px-8 lg:px-10">
        {blocks.map((b, i) => (
          <Fragment key={b.key}>
            {i > 0 && <hr className="my-8 border-white/10 sm:my-10" />}
            {b.node}
          </Fragment>
        ))}
      </div>
    </footer>
  );
}