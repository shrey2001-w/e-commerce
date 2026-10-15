import { NextResponse, connection } from "next/server";
import { getFooter } from "../../../lib/footerDb";
import { DEFAULT_FOOTER } from "../../../lib/footerTypes";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET() {
  await connection(); // always run at request time
  try {
    const { footer } = await getFooter();
    return NextResponse.json({ footer }, { headers: NO_STORE });
  } catch (e) {
    console.error("Footer load error:", e);
    // never break the storefront because of the footer
    return NextResponse.json({ footer: DEFAULT_FOOTER }, { headers: NO_STORE });
  }
}