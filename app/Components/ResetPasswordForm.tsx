"use client";

import { useState } from "react";
import Link from "next/link";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-[#F7F7F7] px-4 py-3 text-base text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-600/20";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not reset password.");
        return;
      }
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <h1 className="mb-1 text-2xl font-bold text-[#1a1b2e]">Reset your password</h1>

        {!token ? (
          <>
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              This reset link is invalid. Please request a new one from the Login box.
            </p>
            <Link href="/" className="mt-5 block text-center font-semibold text-red-600 hover:underline">
              Back to home
            </Link>
          </>
        ) : done ? (
          <>
            <p className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-center font-medium text-green-700">
              Password updated successfully! 🎉
            </p>
            <Link
              href="/"
              className="mt-5 block w-full rounded-lg bg-red-600 py-3 text-center text-base font-semibold text-white transition hover:bg-red-700"
            >
              Go to home &amp; log in
            </Link>
          </>
        ) : (
          <>
            <p className="mb-6 text-sm text-gray-500">Choose a new password for your account.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
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
                {loading ? "Updating…" : "Update Password"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}