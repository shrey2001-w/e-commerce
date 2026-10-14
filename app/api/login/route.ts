import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/app/lib/mongodb";
import { signToken, setAuthCookie } from "@/app/lib/auth";
import User from "@/app/models/User";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase() });
    const valid = user && (await bcrypt.compare(password, user.password));

    // Same message for both cases so attackers can't tell which emails exist
    if (!user || !valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = signToken({ id: user._id.toString(), email: user.email });

    const res = NextResponse.json({
      message: "Logged in successfully.",
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    });
    setAuthCookie(res, token);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}