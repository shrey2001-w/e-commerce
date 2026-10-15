import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/adminAuth";
import { deleteCategory, saveCategory } from "../../../lib/store";

const fail = (e: unknown) => {
  console.error("Category API error:", e);
  return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
};

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const r = await saveCategory(await req.json());
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (e) {
    return fail(e);
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) return NextResponse.json({ error: "Missing category id." }, { status: 400 });
    const r = await saveCategory(body, id);
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (e) {
    return fail(e);
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing category id." }, { status: 400 });
    const r = await deleteCategory(id);
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  } catch (e) {
    return fail(e);
  }
}