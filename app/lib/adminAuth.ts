import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse, connection } from "next/server";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET is missing or too short");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

export function createAdminToken() {
  const payload = `admin.${Date.now() + ADMIN_MAX_AGE * 1000}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string | null) {
  try {
    if (!token) return false;
    const i = token.lastIndexOf(".");
    if (i < 0) return false;
    const payload = token.slice(0, i);
    const a = Buffer.from(token.slice(i + 1));
    const b = Buffer.from(sign(payload));
    if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
    const [tag, exp] = payload.split(".");
    return tag === "admin" && Number(exp) > Date.now();
  } catch {
    return false;
  }
}

function safeEqual(a: string, b: string) {
  const ha = createHmac("sha256", "cmp").update(a).digest();
  const hb = createHmac("sha256", "cmp").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkAdminCredentials(email: string, password: string) {
  const e = process.env.ADMIN_EMAIL;
  const p = process.env.ADMIN_PASSWORD;
  if (!e || !p) return false;
  const okEmail = safeEqual(email.trim().toLowerCase(), e.trim().toLowerCase());
  const okPass = safeEqual(password, p);
  return okEmail && okPass;
}

export async function isAdmin() {
  await connection(); // run at request time, so Date.now() is safe
  const store = await cookies();
  return verifyAdminToken(store.get(ADMIN_COOKIE)?.value);
}

/** returns a 401 response when not admin, otherwise null */
export async function requireAdmin(): Promise<NextResponse | null> {
  return (await isAdmin())
    ? null
    : NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}