import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/app/lib/mongodb";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import User from "@/app/models/User";

// Returns the currently logged-in user (or 401 if not logged in)
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(payload.id).select("-password");
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}