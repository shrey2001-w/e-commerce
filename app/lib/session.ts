import { cookies } from "next/headers";
import { dbConnect } from "./mongodb";
import { COOKIE_NAME, verifyToken } from "./auth";
import User from "../models/User";

export type SessionUser = {
  _id: unknown;
  name: string;
  email: string;
  phone: string;
  address?: { line?: string; city?: string; pincode?: string };
};

// Returns the logged-in user (from the JWT cookie) or null
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;
  const p = (payload ?? {}) as Record<string, unknown>;
  const id = (p.id ?? p.userId ?? p._id ?? p.sub) as string | undefined;
  if (!id) return null;

  await dbConnect();
  return (await User.findById(id).select("-password").lean()) as unknown as SessionUser | null;
}