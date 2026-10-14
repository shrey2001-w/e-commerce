// "Delivery by <today + N days>" — change DELIVERY_DAYS to suit your business.
export const DELIVERY_DAYS = 5;

function target(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// 20th October  (header)
export function deliveryLabel(days = DELIVERY_DAYS) {
  const d = target(days);
  const day = d.getDate();
  const suffix =
    day % 10 === 1 && day !== 11 ? "st"
    : day % 10 === 2 && day !== 12 ? "nd"
    : day % 10 === 3 && day !== 13 ? "rd"
    : "th";
  return `${day}${suffix} ${d.toLocaleString("en-IN", { month: "long" })}`;
}

// 20 Oct  (cart page)
export function deliveryShort(days = DELIVERY_DAYS) {
  const d = target(days);
  return `${d.getDate()} ${d.toLocaleString("en-IN", { month: "short" })}`;
}