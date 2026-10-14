import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/app/lib/auth";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out." });
  clearAuthCookie(res);
  return res;
}