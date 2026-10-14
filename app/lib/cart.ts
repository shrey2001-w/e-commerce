// Tiny cart store — no provider needed. Any component can call useCart().
// The cart is saved in localStorage, so it survives refreshes and is shared between tabs.

import { useSyncExternalStore } from "react";
import type { Product } from "../data/products";

export type CartItem = {
  id: Product["id"];
  name: Product["name"];
  price: Product["price"];
  mrp: Product["mrp"];
  image?: Product["image"];
  quantity: Product["quantity"]; // pack size label, e.g. "500 g"
  unitPrice?: Product["unitPrice"]; // e.g. "₹100/100g"
  qty: number; // how many the user added
};

const KEY = "citymall-cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) items = parsed;
    }
  } catch {
    /* ignore corrupted data */
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function commit(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full / blocked — cart still works for this session */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  // keep other open tabs in sync
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    try {
      items = e.newValue ? JSON.parse(e.newValue) : EMPTY;
    } catch {
      items = EMPTY;
    }
    emit();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getSnapshot = () => {
  load();
  return items;
};
const getServerSnapshot = () => EMPTY;

/* ---------- actions ---------- */

function addItem(p: Product) {
  load();
  const existing = items.find((i) => i.id === p.id);
  if (existing) {
    commit(items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i)));
  } else {
    commit([
      ...items,
      {
        id: p.id,
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        image: p.image,
        quantity: p.quantity,
        unitPrice: p.unitPrice,
        qty: 1,
      },
    ]);
  }
}

function increase(id: CartItem["id"]) {
  commit(items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));
}

function decrease(id: CartItem["id"]) {
  commit(
    items.flatMap((i) => {
      if (i.id !== id) return [i];
      return i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []; // qty 1 → removed
    })
  );
}

function remove(id: CartItem["id"]) {
  commit(items.filter((i) => i.id !== id));
}

function clear() {
  commit(EMPTY);
}

/* ---------- hook ---------- */

export function useCart() {
  const list = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const count = list.reduce((n, i) => n + i.qty, 0);
  const subtotal = list.reduce((n, i) => n + i.price * i.qty, 0);
  const mrpTotal = list.reduce((n, i) => n + i.mrp * i.qty, 0);

  return {
    items: list,
    count,
    subtotal,
    savings: Math.max(0, mrpTotal - subtotal),
    addItem,
    increase,
    decrease,
    remove,
    clear,
  };
}