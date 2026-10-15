import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/adminAuth";
import { saveSettings } from "../../../lib/store";

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const saved = await saveSettings(await req.json());
    return NextResponse.json(saved);
  } catch (e) {
    console.error("Save settings error:", e);
    return NextResponse.json({ error: "Could not save the header settings." }, { status: 500 });
  }
}