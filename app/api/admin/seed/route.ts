import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/adminAuth";
import { seedFromStatic } from "../../../lib/store";

export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const r = await seedFromStatic();
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (e) {
    console.error("Seed error:", e);
    return NextResponse.json({ error: "Import failed." }, { status: 500 });
  }
}