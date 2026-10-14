// Shared "who is logged in" store — Header, Products etc. all read the same user.
// No provider needed. The user comes from /api/me (JWT cookie).

import { useSyncExternalStore } from "react";

export type Address = { line: string; city: string; pincode: string };

export type User = {
  name: string;
  email: string;
  phone: string;
  address?: Address;
};

type State = { user: User | null; ready: boolean };

const SERVER_STATE: State = { user: null, ready: false };
let state: State = SERVER_STATE;
let started = false;
const listeners = new Set<() => void>();

function setState(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

export async function refreshUser() {
  try {
    const res = await fetch("/api/me");
    const data = res.ok ? await res.json() : null;
    setState({ user: data?.user ?? null, ready: true });
  } catch {
    setState({ user: null, ready: true });
  }
}

// Put a known user straight into the store (no extra network call)
export function setUser(user: User | null) {
  setState({ user, ready: true });
}

export function clearUser() {
  setState({ user: null, ready: true });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!started) {
    started = true;
    refreshUser(); // first component to mount triggers the one-time fetch
  }
  return () => {
    listeners.delete(listener);
  };
}

export function useUser() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE
  );
}