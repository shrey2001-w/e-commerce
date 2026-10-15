import { MongoClient } from "mongodb";
import { DEFAULT_FOOTER, sanitizeFooter, type FooterSettings } from "./footerTypes";

/*
 * Footer settings live in one document: collection "footer_settings", _id "footer".
 * This file opens its own cached connection from MONGODB_URI so it works on its own.
 * (If you prefer, replace col() to reuse the client from lib/mongodb.ts.)
 */

type FooterDoc = { _id: string; data: FooterSettings; updatedAt: Date };

const g = globalThis as unknown as { _footerMongo?: Promise<MongoClient> };

function client() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!g._footerMongo) g._footerMongo = new MongoClient(uri).connect();
  return g._footerMongo;
}

async function col() {
  const c = await client();
  return c.db().collection<FooterDoc>("footer_settings"); // db name comes from the MONGODB_URI path
}

/** `saved` is false until the admin saves the footer once (defaults are shown until then). */
export async function getFooter(): Promise<{ footer: FooterSettings; saved: boolean }> {
  const doc = await (await col()).findOne({ _id: "footer" });
  if (!doc) return { footer: DEFAULT_FOOTER, saved: false };
  return { footer: sanitizeFooter(doc.data), saved: true };
}

export async function saveFooter(footer: FooterSettings): Promise<void> {
  await (await col()).replaceOne(
    { _id: "footer" },
    { data: footer, updatedAt: new Date() },
    { upsert: true },
  );
}