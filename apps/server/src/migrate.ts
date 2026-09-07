import { migrateCliError } from "./persistence/boot.js";
import { closePersistence, createPersistence, pingDatabase } from "./persistence/connection.js";
import { applyMigrations } from "./persistence/migrator.js";

const databaseUrl = process.env.DATABASE_URL;
const missing = migrateCliError(databaseUrl);
if (missing || !databaseUrl) {
  process.stderr.write(`${missing ?? "DATABASE_URL is required to migrate."}\n`);
  process.exit(1);
}

const persistence = createPersistence(databaseUrl);
try {
  await applyMigrations(persistence);
  await pingDatabase(persistence);
} catch {
  process.stderr.write("database migration failed\n");
  await closePersistence(persistence);
  process.exit(1);
}
await closePersistence(persistence);
