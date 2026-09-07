import type { DatabaseStatus } from "./connection.js";

export function productionStartError(input: {
  databaseUrl: string | undefined;
  databaseStatus: DatabaseStatus;
}): string | undefined {
  if (!input.databaseUrl?.trim()) {
    return "DATABASE_URL is required in production.";
  }
  if (input.databaseStatus !== "ok") {
    return "database connection or migration failed";
  }
  return undefined;
}

export function migrateCliError(databaseUrl: string | undefined): string | undefined {
  if (!databaseUrl?.trim()) {
    return "DATABASE_URL is required to migrate.";
  }
  return undefined;
}
