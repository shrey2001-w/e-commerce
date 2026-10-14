import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbConnect } from "@/app/lib/mongodb";
import { COOKIE_NAME, verifyToken } from "@/app/lib/auth";
import User from "@/app/models/User";

// Saves the logged-in user's delivery address
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    const payload = token ? verifyToken(token) : null;

    // support whichever key your JWT uses for the user id
    const p = (payload ?? {}) as Record<string, unknown>;
    const userId = (p.id ?? p.userId ?? p._id ?? p.sub) as string | undefined;

    if (!payload || !userId) {
      return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    }

    const { line, city, pincode } = await req.json();

    if (!line?.trim() || !city?.trim() || !pincode?.trim()) {
      return NextResponse.json({ error: "All address fields are required." }, { status: 400 });
    }
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: "Enter a valid 6-digit pincode." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "address.line": line.trim(),
          "address.city": city.trim(),
          "address.pincode": pincode,
        },
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("Address error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}