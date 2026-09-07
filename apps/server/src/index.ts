import { ContentValidationError } from "@greenwood/content";
import { argon2Hasher } from "./auth/hasher.js";
import { createAuthService } from "./auth/service.js";
import { createDevWorld } from "./application/dev-world.js";
import { hydrateWorldItems } from "./application/item-state.js";
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
  PostgresItemRepository,
  PostgresQuestRepository,
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
        quests: new PostgresQuestRepository(persistence.db),
      };
    })()
  : createMemoryStores();

const auth = createAuthService({
  ...stores,
  hasher: argon2Hasher,
  bootstrapToken: process.env.ADMIN_BOOTSTRAP_TOKEN,
});

let world;
try {
  world = createDevWorld();
} catch (error) {
  const message =
    error instanceof ContentValidationError ? error.message : "world content failed validation";
  process.stderr.write(`${message}\n`);
  process.exit(1);
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
  contentStatus: () => "ok",
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

const persistItem = persistence ? new PostgresItemRepository(persistence.db) : undefined;
if (persistItem) {
  await hydrateWorldItems(world, persistItem);
}

await attachRealtime(app, world, {
  allowGuestPlay,
  resolveSession: (token) => auth.resolvePlayIdentity(token),
  persistRoom: (characterId, roomId) => stores.characters.updateRoom(characterId, roomId),
  persistProgress: (characterId, input) => stores.characters.updateProgress(characterId, input),
  persistItem,
  persistQuest: stores.quests,
});
await app.listen({ port, host });
