import { migrate } from "drizzle-orm/node-postgres/migrator";
import { fileURLToPath } from "node:url";
import type { Persistence } from "./connection.js";

export function migrationsFolder(): string {
  return fileURLToPath(new URL("../../../../drizzle", import.meta.url));
}

export async function applyMigrations(persistence: Persistence): Promise<void> {
  await migrate(persistence.db, { migrationsFolder: migrationsFolder() });
}
