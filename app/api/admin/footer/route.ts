import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/adminAuth";
import { getFooter, saveFooter } from "../../../lib/footerDb";
import { sanitizeFooter } from "../../../lib/footerTypes";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { footer, saved } = await getFooter();
    return NextResponse.json({ footer, saved }, { headers: NO_STORE });
  } catch (e) {
    console.error("Admin footer load error:", e);
    return NextResponse.json({ error: "Could not load the footer. Check the database connection." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const problems: string[] = [];
  const footer = sanitizeFooter(body, problems);
  if (problems.length > 0) {
    return NextResponse.json({ error: problems[0] }, { status: 400 });
  }

  try {
    await saveFooter(footer);
    return NextResponse.json({ ok: true, footer });
  } catch (e) {
    console.error("Admin footer save error:", e);
    return NextResponse.json({ error: "Could not save the footer. Check the database connection." }, { status: 500 });
  }
}