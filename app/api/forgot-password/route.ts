import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/app/lib/mongodb";
import { sendPasswordResetEmail } from "@/app/lib/email";
import User from "@/app/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email?.trim()) {
      return NextResponse.json({ error: "Please enter your email." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      // Random token goes in the email; only its hash is saved in the database
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex");
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const baseUrl = process.env.APP_URL || new URL(req.url).origin;
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      try {
        await sendPasswordResetEmail({ name: user.name, email: user.email }, resetUrl);
      } catch (err) {
        console.error("Reset email failed:", err);
      }
    }

    // Same answer whether or not the email exists, so nobody can probe for accounts
    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}