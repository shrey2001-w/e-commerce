import { MongoClient, type Db } from "mongodb";

const g = globalThis as unknown as { __storeMongo?: Promise<MongoClient> };

export async function getDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set in .env");

  if (!g.__storeMongo) {
    g.__storeMongo = new MongoClient(uri).connect().catch((e) => {
      g.__storeMongo = undefined; // allow a retry on the next request
      throw e;
    });
  }
  const client = await g.__storeMongo;
  return client.db(process.env.MONGODB_DB || undefined);
}