"use client";

import { useState } from "react";
import Link from "next/link";
import { Bungee } from "next/font/google";
import SignupModal from "./SignupModal";
import LoginModal from "./LoginModal";
import { useCart } from "../lib/cart";
import { useUser, refreshUser, clearUser } from "../lib/user";
import AddressModal from "./AddressModal";
import { deliveryLabel } from "../lib/delivery";

// Chunky display font that matches the "CITYMALL" wordmark
const bungee = Bungee({ weight: "400", subsets: ["latin"] });

/*
  Header colors now match the rest of the website:
    primary red   #DC2626  (same as price pill / ADD button)
    dark red      #B91C1C  (hover, same as pill shadow)
    navy          #1a1b2e  (same as footer background)
*/

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

/* ---------- Header ---------- */

export default function Header({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [city] = useState("Gurgaon");
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { user } = useUser();
  const [showAddress, setShowAddress] = useState(false);
  const { count } = useCart();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    clearUser();
  };

  const openLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  const openSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: router.push(`/search?q=${encodeURIComponent(query)}`)
    console.log("search:", query);
  };

  const searchForm = (
    <form onSubmit={handleSearch} role="search" className="w-full">
      <label htmlFor="header-search" className="sr-only">
        Search for products
      </label>
      <div className="flex h-12 w-full items-center gap-3 rounded-xl border border-gray-300 bg-[#F7F7F7] px-4 transition focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-600/20 lg:h-[52px]">
        <SearchIcon className="h-5 w-5 shrink-0 text-gray-500" />
        <input
          id="header-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for products…"
          className="w-full bg-transparent text-base text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
    </form>
  );

  return (
    <header className="w-full border-t-4 border-t-[#1a1b2e] bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        {/* ===== Row 1: logo · search · categories · orders · cart ===== */}
        <div className="flex items-center justify-between gap-4 py-3 lg:gap-8 lg:py-4">
          {/* Logo */}
          <Link href="/" aria-label="CityMall home" className="flex shrink-0 items-center gap-3 sm:gap-4">
            <LogoMark className="h-8 w-7 sm:h-10 sm:w-8" />
            <span
              className={`${bungee.className} text-xl leading-none tracking-wide text-red-600 sm:text-[28px]`}
            >
              CITYMALL
            </span>
          </Link>

          {/* Search – inline on large screens */}
          <div className="hidden max-w-[700px] flex-1 md:block">{searchForm}</div>

          {/* Right actions */}
          <nav aria-label="Primary" className="flex shrink-0 items-center gap-4 sm:gap-6 lg:gap-10">
            <Link href="/categories" className="flex items-center gap-2.5 text-[17px] text-gray-700 hover:text-red-600" aria-label="Categories">
              <CategoriesIcon className="h-5 w-5" />
              <span className="hidden lg:inline">Categories</span>
            </Link>

            <Link href="/orders" className="flex items-center gap-2.5 text-[17px] text-gray-700 hover:text-red-600" aria-label="Orders">
              <OrdersIcon className="h-6 w-6" />
              <span className="hidden lg:inline">Orders</span>
            </Link>

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
          </nav>
        </div>

        {/* Search – full width row on small screens */}
        <div className="pb-3 md:hidden">{searchForm}</div>
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
            /* logged out: crown avatar + city */
            <button
              type="button"
              className="flex items-center gap-3 rounded-md py-1 text-[15px] text-gray-600 hover:text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600/40"
              aria-haspopup="listbox"
            >
              <CrownAvatar className="h-12 w-12 sm:h-[60px] sm:w-[60px]" />
              <span className="flex items-center gap-1.5">
                {city}
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>
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
                Sign Up
              </button>
              <button
                type="button"
                onClick={openLogin}
                className="rounded-lg border-2 border-red-600 bg-red-600 px-4 py-2 text-[15px] font-semibold text-white transition hover:border-red-700 hover:bg-red-700 sm:px-5 sm:py-2.5 sm:text-base"
              >
                Login
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