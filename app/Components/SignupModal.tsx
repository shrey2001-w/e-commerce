"use client";

import { useEffect, useState } from "react";

type Props = { open: boolean; onClose: () => void };

const initialForm = { name: "", email: "", phone: "", password: "" };

export default function SignupModal({ open, onClose }: Props) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Close on Escape + lock background scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed.");
        return;
      }
      setSuccess(true);
      setForm(initialForm);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-[#F7F7F7] px-4 py-3 text-base text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signup-title"
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

        <h2 id="signup-title" className="mb-1 text-2xl font-bold text-[#1a1b2e]">
          Create your account
        </h2>
        <p className="mb-6 text-sm text-gray-500">Sign up to start shopping on CityMall.</p>

        {success ? (
          <p className="rounded-lg bg-green-50 px-4 py-3 text-center font-medium text-green-700">
            Account created successfully! 🎉
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              name="name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="Phone number (10 digits)"
              value={form.phone}
              onChange={handleChange}
              required
              className={inputClass}
            />
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 characters)"
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
              className={inputClass}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-600 py-3 text-base font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}