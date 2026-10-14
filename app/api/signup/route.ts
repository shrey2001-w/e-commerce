import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/app/lib/mongodb";
import { signToken, setAuthCookie } from "@/app/lib/auth";
import { sendSignupEmails } from "@/app/lib/email";
import User from "@/app/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    // Validation
    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid 10-digit phone number." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, phone, password: hashed });

    // Send welcome email to the user + notification to the admin (never throws)
    await sendSignupEmails({
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    });

    // Create JWT and log the new user in right away
    const token = signToken({ id: user._id.toString(), email: user.email });

    const res = NextResponse.json(
      {
        message: "Account created successfully.",
        user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
      },
      { status: 201 }
    );
    setAuthCookie(res, token);
    return res;
  } catch (err) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}