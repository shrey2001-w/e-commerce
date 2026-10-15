"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bungee } from "next/font/google";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import AdminLoginModal from "./AdminLoginModal";
import { useCart } from "../lib/cart";
import { useUser, refreshUser, clearUser } from "../lib/user";
import AddressModal from "./AddressModal";
import { deliveryLabel } from "../lib/delivery";
import { useCatalog, useSite } from "../lib/useSite";

// Chunky display font that matches the "CITYMALL" wordmark
const bungee = Bungee({ weight: "400", subsets: ["latin"] });

/* ---------- Icons ---------- */

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden="true">
      <path
        d="M9 12V9a7 7 0 0 1 14 0v3"
        fill="none"
        stroke="#DC2626"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M3 12h26l1.5 22a4 4 0 0 1-4 4.2H5.5a4 4 0 0 1-4-4.2L3 12Z"
        fill="#DC2626"
      />
      <path
        d="M10 22v3.5a6 6 0 0 0 12 0V22"
        fill="none"
        stroke="#fff"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="22" r="2" fill="#fff" />
    </svg>
  );
}

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

function CategoriesIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="2" y="2" width="9" height="9" rx="3" fill="#DC2626" />
      <rect x="13" y="2" width="9" height="9" rx="3" fill="#DC2626" />
      <rect x="2" y="13" width="9" height="9" rx="3" fill="#DC2626" />
      <rect x="13" y="13" width="9" height="9" rx="3" fill="#DC2626" />
    </svg>
  );
}

function OrdersIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9.5 4V2.8a.8.8 0 0 1 .8-.8h3.4a.8.8 0 0 1 .8.8V4" />
    </svg>
  );
}

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-.9 11.2a2 2 0 0 1-2 1.8H7.9a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </svg>
  );
}

function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CrownAvatar({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <defs>
        <clipPath id="crown-circle">
          <circle cx="32" cy="32" r="32" />
        </clipPath>
      </defs>
      <g clipPath="url(#crown-circle)">
        <rect width="64" height="64" fill="#fff" />
        <rect y="40" width="64" height="24" fill="#DC2626" />
        {/* crown */}
        <path d="M10 22 18 36h28l8-14-11 7-11-13-11 13-11-7Z" fill="#F2B233" />
        <rect x="16" y="36" width="32" height="8" rx="2" fill="#E8A21F" />
        <circle cx="32" cy="9" r="3" fill="#E8A21F" />
        <circle cx="9" cy="21" r="2.6" fill="#E8A21F" />
        <circle cx="55" cy="21" r="2.6" fill="#E8A21F" />
        <circle cx="32" cy="29" r="5.5" fill="#DC2626" />
        <path d="M29.5 31v-3.2a2.5 2.5 0 0 1 5 0V31" stroke="#fff" strokeWidth="1.2" fill="none" />
      </g>
    </svg>
  );
}

/* ---------- Search helpers ---------- */

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function SearchThumb({ src, emoji }: { src: string; emoji: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-2xl">
      {failed || !src ? (
        <span aria-hidden>{emoji}</span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-contain" onError={() => setFailed(true)} />
      )}
    </span>
  );
}

/* ---------- Header ---------- */

export default function Header({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { settings: s, loaded } = useSite();
  const { categories } = useCatalog();
  const cats = useMemo(() => categories ?? [], [categories]);

  const [query, setQuery] = useState("");
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useUser();
  const [showAddress, setShowAddress] = useState(false);
  const { count } = useCart();

  const availability = s.availabilityMessage.split("{city}").join(s.city);

  // is an admin session active? (cookie is httpOnly, so ask the server)
  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((j) => setIsAdmin(!!j.admin))
      .catch(() => {});
  }, []);

  /* publish the header's real height as a CSS variable so sticky elements sit below it */
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const set = () =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* categories dropdown */
  const [showCats, setShowCats] = useState(false);
  const catsRef = useRef<HTMLDivElement>(null);

  // close on outside click or Esc
  useEffect(() => {
    if (!showCats) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (catsRef.current && !catsRef.current.contains(e.target as Node)) setShowCats(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCats(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [showCats]);

  /* live search over the database catalog */
  const [showResults, setShowResults] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const searchIndex = useMemo(
    () =>
      cats.flatMap((c) =>
        c.products.map((p) => ({
          product: p,
          emoji: c.emoji,
          hay: `${p.name} ${p.brand ?? ""} ${c.name}`.toLowerCase(),
        }))
      ),
    [cats]
  );

  const results = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return [];
    return searchIndex.filter(({ hay }) => terms.every((t) => hay.includes(t))).slice(0, 8);
  }, [query, searchIndex]);

  // close the results when clicking outside the search box (works for both the desktop and mobile copy)
  useEffect(() => {
    if (!showResults) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (!(e.target as Element).closest("[data-search-root]")) setShowResults(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
    };
  }, [showResults]);

  const openProduct = (id: string) => {
    setShowResults(false);
    setQuery("");
    setActiveIdx(-1);
    router.push(`/product/${id}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (results.length === 0) return;
    openProduct(results[activeIdx >= 0 ? activeIdx : 0].product.id);
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setShowResults(false);
    } else if (e.key === "ArrowDown" && results.length) {
      e.preventDefault();
      setShowResults(true);
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp" && results.length) {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    clearUser();
  };

  const openLogin = () => {
    setShowSignup(false);
    setShowAdminLogin(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const openAdmin = () => {
    setShowLogin(false);
    setShowAdminLogin(true);
  };

  // rendered twice (desktop row + mobile row), so ids get a suffix
  const renderSearch = (suffix: string) => (
    <form
      onSubmit={handleSearch}
      role="search"
      data-search-root
      className="relative w-full"
    >
      <label htmlFor={`header-search-${suffix}`} className="sr-only">
        Search for products
      </label>
      <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-gray-300 bg-[#F7F7F7] px-4 transition focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-600/20 lg:h-[52px]">
        <SearchIcon className="h-5 w-5 shrink-0 text-gray-500" />
        <input
          id={`header-search-${suffix}`}
          type="search"
          value={query}
          autoComplete="off"
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(true);
            setActiveIdx(-1);
          }}
          onFocus={() => query.trim() && setShowResults(true)}
          onKeyDown={handleSearchKey}
          placeholder={s.searchPlaceholder}
          className="w-full bg-transparent text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
      </div>

      {showResults && query.trim() && (
        <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              No products found for “{query.trim()}”
            </p>
          ) : (
            <ul role="listbox" className="max-h-[70vh] overflow-y-auto py-1">
              {results.map(({ product: p, emoji }, i) => (
                <li key={p.id} role="option" aria-selected={i === activeIdx}>
                  <Link
                    href={`/product/${p.id}`}
                    onClick={() => {
                      setShowResults(false);
                      setQuery("");
                      setActiveIdx(-1);
                    }}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={`flex items-center gap-3 px-4 py-2.5 transition ${
                      i === activeIdx ? "bg-red-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <SearchThumb src={p.image} emoji={emoji} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-gray-900">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-gray-500">
                        {[p.brand, p.quantity].filter(Boolean).join(" · ")}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-sm font-bold text-gray-900">{inr(p.price)}</span>
                      <span className="block text-xs text-gray-400 line-through">{inr(p.mrp)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );

  return (
    <header
      ref={headerRef}
      style={{ borderTopColor: s.topBarColor }}
      className="sticky top-0 z-40 w-full border-t-4 bg-white shadow-sm"
    >
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* ===== Row 1: logo · search · links · categories · orders · cart ===== */}
        <div className="relative flex items-center justify-between gap-4 py-3 lg:gap-8 lg:py-4">
          {/* Logo (fades in once the admin settings have loaded, so the old logo never flashes) */}
          <Link
            href="/"
            aria-label={`${s.brandName || "Store"} home`}
            className={`flex shrink-0 items-center gap-3 transition-opacity duration-200 sm:gap-4 ${
              loaded ? "opacity-100" : "opacity-0"
            }`}
          >
            {s.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.logoUrl}
                alt={s.brandName || "Logo"}
                className="h-9 w-auto max-w-[140px] object-contain sm:h-11 sm:max-w-[200px]"
              />
            ) : (
              <LogoMark className="h-8 w-7 sm:h-10 sm:w-8" />
            )}
            {s.brandName && (
              <span
                style={{ color: s.brandColor }}
                className={`${bungee.className} text-xl leading-none tracking-wide sm:text-[28px]`}
              >
                {s.brandName}
              </span>
            )}
          </Link>

          {/* Search – inline on large screens */}
          <div className="hidden max-w-[700px] flex-1 md:block">{renderSearch("desktop")}</div>

          {/* Right actions */}
          <nav aria-label="Primary" className="flex shrink-0 items-center gap-4 sm:gap-6 lg:gap-8">
            {/* custom links set in the admin dashboard (desktop only) */}
            {s.navLinks.map((l) => (
              <Link
                key={`${l.label}-${l.href}`}
                href={l.href}
                className="hidden text-[17px] text-gray-700 hover:text-red-600 lg:inline"
              >
                {l.label}
              </Link>
            ))}

            {/* Categories dropdown */}
            {s.showCategories && (
              <div ref={catsRef} className="sm:relative">
                <button
                  type="button"
                  onClick={() => setShowCats((o) => !o)}
                  aria-haspopup="true"
                  aria-expanded={showCats}
                  aria-controls="categories-menu"
                  aria-label={s.categoriesLabel}
                  className={`flex items-center gap-2.5 text-[17px] hover:text-red-600 ${
                    showCats ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  <CategoriesIcon className="h-5 w-5" />
                  <span className="hidden lg:inline">{s.categoriesLabel}</span>
                  <ChevronDown
                    className={`hidden h-4 w-4 transition-transform lg:block ${showCats ? "rotate-180" : ""}`}
                  />
                </button>

                {showCats && (
                  <div
                    id="categories-menu"
                    className="absolute left-4 right-4 top-full z-50 mt-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl sm:left-auto sm:right-0 sm:mt-3 sm:w-80"
                  >
                    <p className="border-b border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900">
                      Shop by Category
                    </p>
                    <ul className="max-h-[60vh] overflow-y-auto py-1">
                      {cats
                        .filter((c) => c.products.length > 0)
                        .map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/#${c.id}`}
                              onClick={() => setShowCats(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-[15px] text-gray-800 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-lg" aria-hidden>
                                {c.emoji}
                              </span>
                              {c.name}
                            </Link>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {s.showOrders && (
              <Link href="/orders" className="flex items-center gap-2.5 text-[17px] text-gray-700 hover:text-red-600" aria-label={s.ordersLabel}>
                <OrdersIcon className="h-6 w-6" />
                <span className="hidden lg:inline">{s.ordersLabel}</span>
              </Link>
            )}

            <Link
              href="/cart"
              className="relative text-gray-800 hover:text-red-600"
              aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
            >
              <CartIcon className="h-8 w-8" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold leading-none text-white">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                className="rounded-lg bg-[#1a1b2e] px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-black"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Search – full width row on small screens */}
        <div className="pb-3 md:hidden">{renderSearch("mobile")}</div>
      </div>

      {/* ===== Row 2: delivery / location · auth buttons ===== */}
      {!(compact && user) && (
      <div className="border-t border-gray-200">
        <div className="mx-auto flex w-full max-w-[1280px] items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          {user ? (
            /* logged in: delivery date + address */
            <button
              type="button"
              onClick={() => setShowAddress(true)}
              aria-label="Change delivery address"
              className="flex min-w-0 items-center gap-3 rounded-md py-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-base font-bold text-white sm:h-12 sm:w-12 sm:text-lg"
                aria-hidden="true"
              >
                {user.name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold text-gray-900 sm:text-xl">
                  Delivery by {deliveryLabel()}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-600 sm:text-sm">
                  <span className="truncate">
                    {user.address?.line
                      ? `${user.address.line}, ${user.address.city} ${user.address.pincode}`
                      : "Add delivery address"}
                  </span>
                  <ChevronDown className="h-4 w-4 shrink-0" />
                </span>
              </span>
            </button>
          ) : (
            /* logged out: crown avatar + city + availability message */
            <div className="flex min-w-0 items-center gap-3 py-1">
              <CrownAvatar className="h-12 w-12 shrink-0 sm:h-[60px] sm:w-[60px]" />
              <span className="min-w-0">
                <span className="block text-base font-semibold text-gray-900 sm:text-xl">
                  {s.city}
                </span>
                {availability && (
                  <span className="block text-xs text-red-600 sm:text-sm">{availability}</span>
                )}
              </span>
            </div>
          )}

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-2 text-[15px] font-semibold text-red-600 shadow-sm transition hover:bg-red-50 sm:px-6 sm:py-2.5 sm:text-base"
            >
              Logout
            </button>
          ) : (
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={openSignup}
                className="rounded-lg border-2 border-red-600 px-4 py-2 text-[15px] font-semibold text-red-600 transition hover:bg-red-50 sm:px-5 sm:py-2.5 sm:text-base"
              >
                {s.signupLabel}
              </button>
              <button
                type="button"
                onClick={openLogin}
                className="rounded-lg border-2 border-red-600 bg-red-600 px-4 py-2 text-[15px] font-semibold text-white transition hover:border-red-700 hover:bg-red-700 sm:px-5 sm:py-2.5 sm:text-base"
              >
                {s.loginLabel}
              </button>
            </div>
          )}
        </div>
      </div>
      )}

      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSuccess={refreshUser}
        onSwitchToLogin={openLogin}
      />
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={refreshUser}
          onSwitchToSignup={openSignup}
          onSwitchToAdmin={openAdmin}
        />
      )}
      {showAdminLogin && (
        <AdminLoginModal
          onClose={() => setShowAdminLogin(false)}
          onSuccess={() => {
            setIsAdmin(true);
            router.push("/admin");
          }}
        />
      )}
      {showAddress && user && (
        <AddressModal
          initial={user.address}
          onClose={() => setShowAddress(false)}
          onSaved={refreshUser}
        />
      )}
    </header>
  );
}