import jwt, { JwtPayload } from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Please define JWT_SECRET in .env.local");
}

export const COOKIE_NAME = "token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days (in seconds)

export type TokenPayload = JwtPayload & { id: string; email: string };

export function signToken(payload: { id: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null; // expired or tampered token
  }
}

// Stores the JWT in an httpOnly cookie (JavaScript in the browser cannot read it)
export function setAuthCookie(res: NextResponse, token: string) {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function clearAuthCookie(res: NextResponse) {
  res.cookies.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}