import Link from "next/link";
import {
  businessLinks,
  cities,
  companyLinks,
  footerCategories,
  legalLinks,
  slugify,
  type FooterLink,
} from "../data/footer";

/* ---- change these to rebrand ---- */
const BRAND_NAME = "CityMall";
const BRAND_SHORT = "CM";
const TAGLINE = "Cash on delivery | Free Delivery";
const PLAY_STORE_URL = "#";
const APP_STORE_URL = "#";

const CONTACT = {
  company: "Rashanbox Retail Private Limited",
  cin: "U52190HR2020PTC086114",
  registeredAddress:
    "Unit No. 1103 Plus Office, 1st Floor, Landmark Cyber Park, Sector 67, Badshahpur, Gurgaon, Haryana, India, 122101",
  corporateOffice:
    "12th Floor, Imperia MindSpace Golf Course Ext Rd, Sector 62, Gurgaon, Haryana 122001",
  email: "support@citymall.live",
};

const FACEBOOK_URL = "#";
const LINKEDIN_URL = "#";

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
      <h3 className="text-lg font-semibold text-white sm:text-xl">{title}</h3>
      <ul className="mt-5 flex flex-col gap-4 text-[15px] sm:mt-6 sm:gap-[18px] sm:text-base">
        {links.map((l) => (
          <li key={l.label}>
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
  return (
    <footer className="w-full bg-[#1a1b2e] text-gray-400">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-10 sm:px-8 lg:px-10">
        {/* ---------- brand + app buttons ---------- */}
        <div>
          <p className="text-base text-gray-400 sm:text-lg">Shop Unlimited on</p>

          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-rose-600 sm:h-12 sm:w-12 sm:text-base">
              {BRAND_SHORT}
            </span>
            <span className="text-3xl font-bold text-white sm:text-4xl">{BRAND_NAME}</span>
          </div>

          <p className="mt-3 text-base text-gray-400 sm:text-lg">{TAGLINE}</p>

          <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
            <StoreButton href={PLAY_STORE_URL} small="Get it on" big="Google Play" icon={<PlayIcon />} />
            <StoreButton href={APP_STORE_URL} small="Download on the" big="App Store" icon={<AppleIcon />} />
          </div>
        </div>

        <hr className="my-8 border-white/10 sm:my-10" />

        {/* ---------- Company / Legal / Our Businesses ---------- */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3">
          <LinkColumn title="Company" links={companyLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
          <LinkColumn title="Our Businesses" links={businessLinks} className="col-span-2 md:col-span-1" />
        </div>

        <hr className="my-8 border-white/10 sm:my-10" />

        {/* ---------- Shop by City ---------- */}
        <section aria-labelledby="shop-by-city">
          <h3 id="shop-by-city" className="text-lg font-semibold text-white sm:text-xl">
            Shop by City
          </h3>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-[15px] sm:text-base">
            {cities.map((city) => (
              <li key={city}>
                <Link href={`/city/${slugify(city)}`} className={linkClass}>
                  {city}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-8 border-white/10 sm:my-10" />

        {/* ---------- Shop by Category ---------- */}
        <section aria-labelledby="shop-by-category">
          <h3 id="shop-by-category" className="text-lg font-semibold text-white sm:text-xl">
            Shop by Category
          </h3>

          <div className="mt-6 flex flex-col gap-6">
            {footerCategories.map((cat) => (
              <div key={cat.title}>
                <h4 className="text-[15px] font-semibold text-gray-200 sm:text-base">
                  <Link href={`/category/${slugify(cat.title)}`} className="hover:text-white">
                    {cat.title}
                  </Link>
                </h4>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-3 text-[14px] sm:text-base">
                  {cat.links.map((sub) => (
                    <li key={sub}>
                      <Link
                        href={`/category/${slugify(cat.title)}/${slugify(sub)}`}
                        className={linkClass}
                      >
                        {sub}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <hr className="my-8 border-white/10 sm:my-10" />

        {/* ---------- Contact Us ---------- */}
        <section aria-labelledby="contact-us">
          <h3 id="contact-us" className="text-lg font-semibold text-white sm:text-xl">
            Contact Us
          </h3>

          <div className="mt-5 flex flex-col gap-3 text-sm leading-relaxed sm:gap-4 sm:text-base">
            <p className="font-medium text-gray-200">{CONTACT.company}</p>
            <p className="break-words text-gray-400">CIN: {CONTACT.cin}</p>
            <p className="text-gray-400">Registered Address: {CONTACT.registeredAddress}</p>
            <p className="text-gray-400">Corporate office: {CONTACT.corporateOffice}</p>
            <p className="break-all text-gray-400 sm:break-normal">
              Email:{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="text-white underline underline-offset-2 hover:text-gray-200"
              >
                {CONTACT.email}
              </a>
            </p>
          </div>
        </section>

        <hr className="my-8 border-white/10 sm:my-10" />

        {/* ---------- Social icons ---------- */}
        <div className="flex items-center gap-6">
          <a
            href={FACEBOOK_URL}
            aria-label="Facebook"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 text-gray-400 transition-colors hover:text-white sm:h-12 sm:w-12"
          >
            <FacebookIcon />
          </a>
          <a
            href={LINKEDIN_URL}
            aria-label="LinkedIn"
            target="_blank"
            rel="noopener noreferrer"
            className="h-10 w-10 text-gray-400 transition-colors hover:text-white sm:h-12 sm:w-12"
          >
            <LinkedInIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}