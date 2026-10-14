// Bill breakdown. Used on the cart page and again on the server when an order is placed,
// so the amount the customer sees is the amount that gets saved.

export const PLATFORM_FEE_INCL_GST = 6; // ₹6 total, GST included

const round2 = (n: number) => Math.round(n * 100) / 100;

export type Line = { price: number; mrp: number; qty: number };

export function calcBilling(lines: Line[]) {
  const mrpTotal = lines.reduce((n, l) => n + l.mrp * l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.price * l.qty, 0);
  const qtyCount = lines.reduce((n, l) => n + l.qty, 0);

  const hasItems = lines.length > 0;
  const platformFee = hasItems ? round2(PLATFORM_FEE_INCL_GST / 1.18) : 0; // 5.08
  const gst = hasItems ? round2(PLATFORM_FEE_INCL_GST - platformFee) : 0; // 0.92

  return {
    itemCount: lines.length, // "Price (3 Items)"
    qtyCount, // "5 Items"
    mrpTotal: round2(mrpTotal),
    discount: round2(Math.max(0, mrpTotal - subtotal)), // "CityMall Offer"
    subtotal: round2(subtotal),
    platformFee,
    gst,
    total: round2(subtotal + platformFee + gst),
  };
}