import { NextResponse } from "next/server";
import { getSettings } from "../../../lib/store";

export async function GET() {
  return NextResponse.json(await getSettings(), { headers: { "Cache-Control": "no-store" } });
}