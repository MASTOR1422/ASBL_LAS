import { getCloudflareContext } from "@opennextjs/cloudflare";
export function getDB(): D1Database {
  const context = getCloudflareContext();
  const db = context.env.DB as D1Database | undefined;
  if (!db) throw new Error("Binding D1 DB absent. Configure wrangler.toml.");
  return db;
}
export function makeId(): string { return crypto.randomUUID(); }
