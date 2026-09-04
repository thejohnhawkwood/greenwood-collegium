import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export type DatabaseStatus = "unwired" | "ok" | "unreachable";

export type Persistence = {
  db: NodePgDatabase;
  pool: Pool;
};

export function sslForConnection(databaseUrl: string): false | { rejectUnauthorized: false } {
  try {
    const { hostname } = new URL(databaseUrl);
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return false;
    }
  } catch {
    return { rejectUnauthorized: false };
  }
  return { rejectUnauthorized: false };
}

export function createPersistence(databaseUrl: string): Persistence {
  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: sslForConnection(databaseUrl),
  });
  return { db: drizzle(pool), pool };
}

export async function pingDatabase(persistence: Persistence): Promise<void> {
  await persistence.pool.query("select 1");
}

export async function closePersistence(persistence: Persistence): Promise<void> {
  await persistence.pool.end();
}
