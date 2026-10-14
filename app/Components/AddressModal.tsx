"use client";

import { useEffect, useState } from "react";
import { setUser, type Address } from "../lib/user";

type Props = {
  initial?: Address;
  onClose: () => void;
  onSaved: () => void;
};

export default function AddressModal({ initial, onClose, onSaved }: Props) {
  const [line, setLine] = useState(initial?.line ?? "");
  const [city, setCity] = useState(initial?.city ?? "");
  const [pincode, setPincode] = useState(initial?.pincode ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-[#F7F7F7] px-4 py-3 text-base text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ line, city, pincode }),
      });

      let data: { error?: string; user?: Parameters<typeof setUser>[0] } = {};
      try {
        data = await res.json();
      } catch {
        // response was not JSON (e.g. a 404 page)
      }

      if (!res.ok) {
        setError(data.error || `Could not save address (error ${res.status}).`);
        return;
      }

      // show the new address immediately, then re-sync with the server
      if (data.user) setUser(data.user);
      onSaved();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-title"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-2xl leading-none text-gray-500 hover:text-gray-800"
        >
          ×
        </button>

        <h2 id="address-title" className="mb-1 text-2xl font-bold text-[#1a1b2e]">
          Delivery address
        </h2>
        <p className="mb-6 text-sm text-gray-500">Where should we deliver your orders?</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="House no., street, area"
            value={line}
            onChange={(e) => setLine(e.target.value)}
            required
            autoComplete="street-address"
            className={inputClass}
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              autoComplete="address-level2"
              className={inputClass}
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              autoComplete="postal-code"
              className={inputClass}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 py-3 text-base font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving…" : "Save Address"}
          </button>
        </form>
      </div>
    </div>
  );
}