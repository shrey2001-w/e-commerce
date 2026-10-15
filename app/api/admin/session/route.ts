import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_MAX_AGE,
  checkAdminCredentials,
  createAdminToken,
  isAdmin,
} from "../../../lib/adminAuth";

export async function GET() {
  return NextResponse.json({ admin: await isAdmin() });
}

export async function POST(req: Request) {
  let body: { email?: unknown; password?: unknown } = {};
  try {
    body = await req.json();
  } catch {
    /* empty body */
  }
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!checkAdminCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return NextResponse.json({ error: "Invalid admin email or password." }, { status: 401 });
  }

  try {
    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, createAdminToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: ADMIN_MAX_AGE,
    });
    return res;
  } catch (e) {
    console.error("Admin login error:", e);
    return NextResponse.json({ error: "Admin login is not configured on the server." }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}