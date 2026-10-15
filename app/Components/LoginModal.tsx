"use client";

import { useEffect, useState } from "react";

type Props = {
  onClose: () => void;
  onSuccess: () => void; // called after a successful login
  onSwitchToSignup: () => void;
  /** when provided, shows a "Login as Admin" button */
  onSwitchToAdmin?: () => void;
};

export default function LoginModal({ onClose, onSuccess, onSwitchToSignup, onSwitchToAdmin }: Props) {
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  // Close on Escape + lock background scroll
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

  const goTo = (next: "login" | "forgot") => {
    setView(next);
    setError("");
    setInfo("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      onSuccess();
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }
      setInfo(data.message);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const primaryBtn =
    "w-full rounded-lg bg-red-600 py-3 text-base font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-title"
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

        {view === "login" ? (
          <>
            <h2 id="login-title" className="mb-1 text-2xl font-bold text-[#1a1b2e]">
              Welcome back
            </h2>
            <p className="mb-6 text-sm text-gray-500">Log in to your CityMall account.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className={inputClass}
              />

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => goTo("forgot")}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" disabled={loading} className={primaryBtn}>
                {loading ? "Logging in…" : "Login"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button type="button" onClick={onSwitchToSignup} className="font-semibold text-red-600 hover:underline">
                Sign Up
              </button>
            </p>

            {onSwitchToAdmin && (
              <div className="mt-5 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={onSwitchToAdmin}
                  className="w-full rounded-lg border-2 border-[#1a1b2e] py-2.5 text-sm font-semibold text-[#1a1b2e] transition hover:bg-gray-50"
                >
                  Login as Admin
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <h2 id="login-title" className="mb-1 text-2xl font-bold text-[#1a1b2e]">
              Forgot password?
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {info ? (
              <p className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{info}</p>
            ) : (
              <form onSubmit={handleForgot} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={inputClass}
                />

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button type="submit" disabled={loading} className={primaryBtn}>
                  {loading ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-sm text-gray-500">
              <button type="button" onClick={() => goTo("login")} className="font-semibold text-red-600 hover:underline">
                ← Back to login
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}