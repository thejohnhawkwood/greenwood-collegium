import { createDevWorld } from "./application/dev-world.js";
import { buildApp } from "./app.js";
import {
  closePersistence,
  createPersistence,
  pingDatabase,
  type DatabaseStatus,
  type Persistence,
} from "./persistence/connection.js";
import { applyMigrations } from "./persistence/migrator.js";
import { attachRealtime } from "./sockets/gateway.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const databaseUrl = process.env.DATABASE_URL;

let persistence: Persistence | undefined;
let databaseStatus: DatabaseStatus = "unwired";

if (databaseUrl) {
  const candidate = createPersistence(databaseUrl);
  try {
    await applyMigrations(candidate);
    await pingDatabase(candidate);
    persistence = candidate;
    databaseStatus = "ok";
  } catch {
    await closePersistence(candidate);
    databaseStatus = "unreachable";
  }
}

const app = await buildApp({
  async databaseStatus() {
    if (databaseStatus !== "ok" || !persistence) {
      return databaseStatus;
    }
    try {
      await pingDatabase(persistence);
      return "ok";
    } catch {
      return "unreachable";
    }
  },
});

if (databaseStatus === "unreachable") {
  app.log.error("database connection or migration failed");
}

app.addHook("onClose", async () => {
  if (persistence) {
    await closePersistence(persistence);
  }
});

await attachRealtime(app, createDevWorld());
await app.listen({ port, host });
