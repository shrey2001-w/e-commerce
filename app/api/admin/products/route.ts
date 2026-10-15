import { NextResponse } from "next/server";
import { requireAdmin } from "../../../lib/adminAuth";
import { deleteProduct, saveProduct } from "../../../lib/store";

const fail = (e: unknown) => {
  console.error("Product API error:", e);
  return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
};

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const r = await saveProduct(await req.json());
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
    if (!id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
    const r = await saveProduct(body, id);
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
    if (!id) return NextResponse.json({ error: "Missing product id." }, { status: 400 });
    return NextResponse.json(await deleteProduct(id));
  } catch (e) {
    return fail(e);
  }
}