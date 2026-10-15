"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "../data/products";
import ExpressBadge from "./ExpressBadge";
import LoginModal from "./LoginModal";
import SignupModal from "./SignupModal";
import { useUser, refreshUser } from "../lib/user";
import { useCart } from "../lib/cart";

type Props = {
  product: Product;
  categoryId: string;
  categoryName: string;
  emoji: string;
  /** e.g. "19th Oct, Monday" (computed on the server) */
  deliveryDate: string;
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const svg = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svg} aria-hidden="true">
      <path d="M2 3h3l2.2 11.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.5L21 7H6" />
      <circle cx="9.5" cy="20" r="1.4" />
      <circle cx="17.5" cy="20" r="1.4" />
    </svg>
  );
}

function ChevronUp({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svg} strokeWidth={2.4} aria-hidden="true">
      <path d="m6 15 6-6 6 6" />
    </svg>
  );
}

function ZoomIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svg} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8M11 8v6M8 11h6" />
    </svg>
  );
}

function TruckIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 24" className={className} {...svg} aria-hidden="true">
      <path d="M2 4h16v13H2zM18 8h6l4 4v5h-10" />
      <circle cx="8" cy="19" r="2" fill="#fff" />
      <circle cx="23" cy="19" r="2" fill="#fff" />
      <path d="m6 10 2.5 2.5L13 8" />
    </svg>
  );
}

function NoReturnIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svg} aria-hidden="true">
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h9a4 4 0 0 1 0 8h-2" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function CashIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...svg} aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6.5 9.5v.01M17.5 14.5v.01" />
    </svg>
  );
}

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" {...svg} strokeWidth={2.2} aria-hidden="true">
      <path d={dir === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}

export default function ProductDetails({ product, categoryId, categoryName, emoji, deliveryDate }: Props) {
  const packs = product.packs;
  const [pack, setPack] = useState(() => Math.max(0, packs?.findIndex((p) => p.price === product.price) ?? 0));
  const active = packs?.[pack] ?? { label: product.quantity, price: product.price, mrp: product.mrp };
  const percent = Math.round(((active.mrp - active.price) / active.mrp) * 100);

  const images = product.images?.length ? product.images : [product.image];
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState(false);

  const [descOpen, setDescOpen] = useState(true);

  /* ---- shared cart (same cart as the home page cards, drawer and /cart) ---- */
  const { items, addItem, increase, decrease } = useCart();
  const qty = items.find((i) => i.id === product.id)?.qty ?? 0;

  /* ---- login gate ---- */
  const { user } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // logged out -> open the login modal, nothing is added
  const handleAdd = () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    if (qty === 0) addItem(product);
    else increase(product.id);
  };

  const handleDecrease = () => decrease(product.id);

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };
  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  // after login/signup, add the product the user originally tried to add
  const afterAuth = () => {
    refreshUser();
    setShowLogin(false);
    setShowSignup(false);
    if (qty === 0) addItem(product);
  };

  const description =
    product.description ??
    [product.name, product.brand ? `Brand: ${product.brand}` : "", `Quantity: ${product.quantity}`].filter(Boolean);

  const crumbs = product.breadcrumb
    ? product.breadcrumb.map((label) => ({ label, href: undefined as string | undefined }))
    : [{ label: categoryName, href: `/#${categoryId}` as string | undefined }];

  const go = useCallback(
    (d: 1 | -1) => setIdx((i) => (i + d + images.length) % images.length),
    [images.length]
  );

  /* lightbox: Esc / arrow keys + lock page scroll */
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom, go]);

  const renderImg = (src: string, alt: string, className: string) =>
    failed[src] ? (
      <span className="select-none text-5xl sm:text-8xl" aria-hidden>
        {emoji}
      </span>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        onError={() => setFailed((f) => ({ ...f, [src]: true }))}
      />
    );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
      {/* ---------------- breadcrumb ---------------- */}
      <nav aria-label="Breadcrumb" className="py-4 text-[13px] text-gray-500 sm:py-6 sm:text-base">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link href="/" className="hover:text-red-600">
              Home
            </Link>
          </li>
          {crumbs.map((c) => (
            <li key={c.label} className="flex items-center gap-2">
              <span aria-hidden>&gt;</span>
              {c.href ? (
                <Link href={c.href} className="hover:text-red-600">
                  {c.label}
                </Link>
              ) : (
                <span>{c.label}</span>
              )}
            </li>
          ))}
          <li aria-current="page" className="flex items-center gap-2 text-gray-900">
            <span aria-hidden className="text-gray-500">&gt;</span>
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start lg:gap-7">
        {/* ================= gallery ================= */}
        <section aria-label="Product images" className="rounded-3xl bg-white p-3 sm:p-5 lg:sticky lg:top-28">
          <div className="grid gap-3 md:grid-cols-[88px_minmax(0,1fr)] md:gap-4">
            {/* main image */}
            <div className="relative order-1 aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 md:order-2">
              <div className="flex h-full w-full items-center justify-center p-4 sm:p-8">
                {renderImg(images[idx], product.name, "h-full w-full object-contain")}
              </div>

              {product.rating > 0 && (
                <span className="absolute bottom-3 left-3 rounded-full bg-green-500 px-3 py-1.5 text-sm font-bold text-white sm:bottom-4 sm:left-4 sm:text-base">
                  {product.rating.toFixed(1)} ★ | {product.ratingCount}
                </span>
              )}

              <button
                type="button"
                onClick={() => setZoom(true)}
                aria-label="Zoom image"
                className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-200/80 text-gray-700 transition hover:bg-gray-300 sm:bottom-4 sm:right-4 sm:h-12 sm:w-12"
              >
                <ZoomIcon className="h-5 w-5" />
              </button>
            </div>

            {/* thumbnails: horizontal on mobile, vertical column on md+ */}
            {images.length > 1 && (
              <div className="relative order-2 md:order-1">
                <ul className="flex gap-2.5 overflow-x-auto pb-1 [scrollbar-width:none] md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto md:pb-0 [&::-webkit-scrollbar]:hidden">
                  {images.map((src, i) => (
                    <li key={src} className="shrink-0">
                      <button
                        type="button"
                        onClick={() => setIdx(i)}
                        aria-label={`Show image ${i + 1}`}
                        aria-current={i === idx}
                        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border-2 bg-white p-1 transition md:h-[84px] md:w-[84px] ${
                          i === idx ? "border-red-600" : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {failed[src] ? (
                          <span className="text-2xl" aria-hidden>
                            {emoji}
                          </span>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={src}
                            alt=""
                            className="h-full w-full rounded-lg object-cover"
                            onError={() => setFailed((f) => ({ ...f, [src]: true }))}
                          />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        {/* ================= details ================= */}
        <section className="rounded-3xl bg-white p-5 sm:p-8">
          <h1 className="text-xl font-medium leading-snug text-gray-900 sm:text-2xl lg:text-[28px]">
            {product.name}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-3xl font-bold text-gray-900 sm:text-4xl">{inr(active.price)}</span>
            <span className="text-base font-medium text-gray-500 line-through sm:text-lg">{inr(active.mrp)}</span>
            <span className="rounded-full border border-green-600 bg-green-50 px-2.5 py-0.5 text-sm font-medium text-green-700 sm:text-base">
              {percent}% OFF
            </span>
          </div>

          {product.express !== false && (
            <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-gray-600 sm:text-lg">
              <ExpressBadge />
              <span className="text-gray-300">|</span>
              <span>On or Before {deliveryDate}</span>
            </p>
          )}

          {/* pack selector */}
          {packs && packs.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Select</h2>
              <div role="radiogroup" aria-label="Select pack" className="mt-3 flex flex-wrap gap-3 sm:gap-4">
                {packs.map((p, i) => (
                  <button
                    key={p.label}
                    type="button"
                    role="radio"
                    aria-checked={i === pack}
                    onClick={() => setPack(i)}
                    className={`rounded-xl border px-5 py-3.5 text-base font-semibold transition sm:px-8 sm:py-5 sm:text-lg ${
                      i === pack
                        ? "border-green-600 bg-green-600 text-white"
                        : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* add to cart */}
          <div className="mt-6 sm:mt-8">
            {qty === 0 ? (
              <button
                type="button"
                onClick={handleAdd}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-red-600 text-lg font-medium text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:h-16 sm:text-2xl"
              >
                <CartIcon className="h-7 w-7 sm:h-8 sm:w-8" />
                Add to Cart
              </button>
            ) : (
              <div className="flex h-14 w-full items-center justify-between rounded-2xl bg-red-600 px-2 text-white sm:h-16">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={handleDecrease}
                  className="h-11 w-14 rounded-xl text-3xl leading-none hover:bg-red-700"
                >
                  −
                </button>
                <span className="text-lg font-semibold sm:text-2xl">{qty} in cart</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={handleAdd}
                  className="h-11 w-14 rounded-xl text-3xl leading-none hover:bg-red-700"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* description (collapsible) */}
          <div className="mt-6 border-t border-gray-200 sm:mt-8">
            <button
              type="button"
              onClick={() => setDescOpen((o) => !o)}
              aria-expanded={descOpen}
              aria-controls="product-description"
              className="flex w-full items-center justify-between border-b border-gray-200 py-5 text-left sm:py-6"
            >
              <span className="text-xl font-semibold text-gray-900 sm:text-2xl">Description</span>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                <ChevronUp
                  className={`h-4 w-4 transition-transform duration-300 ${descOpen ? "" : "rotate-180"}`}
                />
              </span>
            </button>

            <div
              id="product-description"
              className={`grid transition-[grid-template-rows] duration-300 ${
                descOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="space-y-0.5 pt-5 text-[15px] leading-7 text-gray-600 sm:text-lg sm:leading-8">
                  {description.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {product.nonReturnable !== false && (
            <p className="mt-5 text-[15px] leading-7 text-gray-600 sm:text-lg sm:leading-8">
              This item is non- returnable. Please check for any damage, missing or wrong items at the time of
              delivery. In rare cases, refunds may be issued after verification through images and customer support.
            </p>
          )}

          {/* delivery + policies */}
          <div className="mt-6 flex items-center gap-4 rounded-2xl bg-gray-50 p-4 sm:p-5">
            <TruckIcon className="h-9 w-9 shrink-0 text-gray-700 sm:h-10 sm:w-10" />
            <div>
              <p className="text-base font-semibold text-gray-900 sm:text-xl">On or Before {deliveryDate}</p>
              <p className="text-sm text-gray-600 sm:text-lg">Order now to get this item</p>
            </div>
          </div>

          <ul className="mt-5 space-y-4 sm:text-xl">
            {product.nonReturnable !== false && (
              <li className="flex items-center gap-4 text-base text-gray-800 sm:text-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                  <NoReturnIcon className="h-5 w-5" />
                </span>
                Non returnable
              </li>
            )}
            {product.cod !== false && (
              <li className="flex items-center gap-4 text-base text-gray-800 sm:text-xl">
                <span className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700">
                  <CashIcon className="h-6 w-6" />
                </span>
                Cash on delivery
              </li>
            )}
          </ul>
        </section>
      </div>

      {/* ---------------- zoom lightbox ---------------- */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setZoom(false)}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-3xl leading-none text-white hover:bg-white/25"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={(e) => {
                  e.stopPropagation();
                  go(-1);
                }}
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:left-6"
              >
                <Arrow dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={(e) => {
                  e.stopPropagation();
                  go(1);
                }}
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 sm:right-6"
              >
                <Arrow dir="right" />
              </button>
            </>
          )}

          <div
            className="flex h-full max-h-[90vh] w-full max-w-5xl items-center justify-center rounded-2xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {renderImg(images[idx], product.name, "max-h-full max-w-full object-contain")}
          </div>
        </div>
      )}

      {/* ---------------- login / signup modals ---------------- */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSuccess={afterAuth}
          onSwitchToSignup={openSignup}
        />
      )}
      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSuccess={afterAuth}
        onSwitchToLogin={openLogin}
      />
    </div>
  );
}