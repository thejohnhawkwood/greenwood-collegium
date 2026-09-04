import { argon2Hasher } from "./auth/hasher.js";
import { createAuthService } from "./auth/service.js";
import { createDevWorld } from "./application/dev-world.js";
import { buildApp } from "./app.js";
import { registerAuthRoutes } from "./http/auth.js";
import {
  closePersistence,
  createPersistence,
  pingDatabase,
  type DatabaseStatus,
  type Persistence,
} from "./persistence/connection.js";
import { createMemoryStores } from "./persistence/memory.js";
import { applyMigrations } from "./persistence/migrator.js";
import {
  PostgresAccountRepository,
  PostgresCharacterRepository,
  PostgresInviteRepository,
  PostgresSessionRepository,
} from "./persistence/postgres.js";
import { attachRealtime } from "./sockets/gateway.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const databaseUrl = process.env.DATABASE_URL;
const production = process.env.NODE_ENV === "production";
const allowGuestPlay = !production;

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

const stores = persistence
  ? (() => {
      const accounts = new PostgresAccountRepository(persistence.db);
      return {
        accounts,
        characters: new PostgresCharacterRepository(persistence.db, accounts),
        sessions: new PostgresSessionRepository(persistence.db),
        invites: new PostgresInviteRepository(persistence.db),
      };
    })()
  : createMemoryStores();

const auth = createAuthService({
  ...stores,
  hasher: argon2Hasher,
  bootstrapToken: process.env.ADMIN_BOOTSTRAP_TOKEN,
});

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

await registerAuthRoutes(app, {
  auth,
  allowGuestPlay,
  secureCookies: production,
});

app.addHook("onClose", async () => {
  if (persistence) {
    await closePersistence(persistence);
  }
});

await attachRealtime(app, createDevWorld(), {
  allowGuestPlay,
  resolveSession: (token) => auth.resolvePlayIdentity(token),
  persistRoom: (characterId, roomId) => stores.characters.updateRoom(characterId, roomId),
});
await app.listen({ port, host });
