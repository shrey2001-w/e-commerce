import { NextResponse } from "next/server";
import { getCatalog } from "../../../lib/store";

export async function GET() {
  return NextResponse.json(await getCatalog(), { headers: { "Cache-Control": "no-store" } });
}