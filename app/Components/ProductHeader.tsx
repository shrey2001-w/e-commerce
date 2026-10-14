"use client";

import { useState } from "react";
import Link from "next/link";
import { Bungee } from "next/font/google";

const bungee = Bungee({ weight: "400", subsets: ["latin"] });

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" className={className} aria-hidden="true">
      <path d="M9 12V9a7 7 0 0 1 14 0v3" fill="none" stroke="#DC2626" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M3 12h26l1.5 22a4 4 0 0 1-4 4.2H5.5a4 4 0 0 1-4-4.2L3 12Z" fill="#DC2626" />
      <path d="M10 22v3.5a6 6 0 0 0 12 0V22" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="16" cy="22" r="2" fill="#fff" />
    </svg>
  );
}

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </svg>
  );
}

function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
      <path d="M12 15V3" />
      <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
      <path d="M5 11H4.5A1.5 1.5 0 0 0 3 12.5v7A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H19" />
    </svg>
  );
}

function CartIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...iconProps} aria-hidden="true">
      <path d="M5 8h14l-.9 11.2a2 2 0 0 1-2 1.8H7.9a2 2 0 0 1-2-1.8L5 8Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </svg>
  );
}

export default function ProductHeader() {
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const onSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: router.push(`/search?q=${encodeURIComponent(query)}`)
    console.log("search:", query);
  };

  const onShare = async () => {
    const data = { title: document.title, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      /* user cancelled */
    }
  };

  const search = (
    <form onSubmit={onSearch} role="search" className="w-full">
      <label htmlFor="pdp-search" className="sr-only">
        Search for products
      </label>
      <div className="flex h-11 w-full items-center gap-3 rounded-xl border border-gray-300 bg-[#F7F7F7] px-4 transition focus-within:border-gray-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-red-600/20 sm:h-[52px]">
        <SearchIcon className="h-5 w-5 shrink-0 text-gray-500" />
        <input
          id="pdp-search"
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
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 border-t-4 border-t-[#1a1b2e] bg-white">
      <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3 lg:gap-8">
          <Link href="/" aria-label="CityMall home" className="flex shrink-0 items-center gap-3 sm:gap-4">
            <LogoMark className="h-8 w-7 sm:h-10 sm:w-8" />
            <span className={`${bungee.className} text-xl leading-none tracking-wide text-red-600 sm:text-[28px]`}>
              CITYMALL
            </span>
          </Link>

          <div className="hidden max-w-[700px] flex-1 md:block">{search}</div>

          <div className="relative flex shrink-0 items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={onShare}
              aria-label="Share this product"
              className="text-gray-800 transition hover:text-red-600"
            >
              <ShareIcon className="h-7 w-7" />
            </button>
            {copied && (
              <span
                role="status"
                className="absolute right-12 top-full mt-2 whitespace-nowrap rounded-md bg-gray-900 px-3 py-1.5 text-xs text-white sm:right-14"
              >
                Link copied
              </span>
            )}
            <Link href="/cart" aria-label="Cart" className="text-gray-800 transition hover:text-red-600">
              <CartIcon className="h-8 w-8" />
            </Link>
          </div>
        </div>

        <div className="pb-3 md:hidden">{search}</div>
      </div>
    </header>
  );
}