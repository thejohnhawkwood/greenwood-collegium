import { ContentValidationError } from "@greenwood/content";
import { argon2Hasher } from "./auth/hasher.js";
import { createAuthService } from "./auth/service.js";
import { createDevWorld } from "./application/dev-world.js";
import { hydrateWorldItems } from "./application/item-state.js";
import { buildApp } from "./app.js";
import { registerAuthRoutes } from "./http/auth.js";
import { safeErrorMessage } from "./application/safe-log.js";
import { productionStartError } from "./persistence/boot.js";
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
  PostgresAuditRepository,
  PostgresCharacterRepository,
  PostgresInviteRepository,
  PostgresItemRepository,
  PostgresQuestRepository,
  PostgresSessionRepository,
} from "./persistence/postgres.js";
import { attachRealtime, type InPlaySeat } from "./sockets/gateway.js";
import {
  PostgresClassroomResetRepository,
  PostgresModerationRepository,
} from "./persistence/moderation-postgres.js";
import { createClassroomService } from "./application/classroom.js";
import { createOperationQueue } from "./application/operation-queue.js";
import { registerClassroomRoutes } from "./http/classroom.js";

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

if (production) {
  const reason = productionStartError({ databaseUrl, databaseStatus });
  if (reason) {
    process.stderr.write(`${reason}\n`);
    process.exit(1);
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
        audit: new PostgresAuditRepository(persistence.db),
        moderation: new PostgresModerationRepository(persistence.db),
        reset: new PostgresClassroomResetRepository(persistence.db),
      };
    })()
  : createMemoryStores();

const auth = createAuthService({
  ...stores,
  hasher: argon2Hasher,
  bootstrapToken: process.env.ADMIN_BOOTSTRAP_TOKEN,
});
const runExclusive = createOperationQueue();
const classroom = createClassroomService({ ...stores, auth });

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

if (!process.env.ADMIN_BOOTSTRAP_TOKEN?.trim()) {
  app.log.warn("ADMIN_BOOTSTRAP_TOKEN is unset; owner bootstrap will reject every token");
}

const inPlay = { list: (): InPlaySeat[] => [] };
await registerAuthRoutes(app, {
  runExclusive,
  chatPaused: () => stores.moderation.chatPaused(),
  onDisabled: async (nameOrId) => {
    const account =
      (await stores.accounts.getById(nameOrId)) ?? (await stores.accounts.getByUsername(nameOrId));
    if (account) classroom.notifyDisabled(account.id);
  },
  auth,
  allowGuestPlay,
  secureCookies: production,
  persistence: persistence ? "postgres" : "memory",
  listInPlay: () => inPlay.list(),
});
await registerClassroomRoutes(app, { auth, classroom, runExclusive });
await classroom.prune();
const retentionTimer = setInterval(
  () => {
    void classroom
      .prune()
      .catch(() =>
        app.log.error({ event: "speech_retention_failed" }, "speech retention cleanup failed"),
      );
  },
  60 * 60 * 1000,
);
retentionTimer.unref();

app.addHook("onClose", async () => {
  clearInterval(retentionTimer);
  if (persistence) {
    await closePersistence(persistence);
  }
});

const persistItem = persistence ? new PostgresItemRepository(persistence.db) : undefined;
if (persistItem) {
  await hydrateWorldItems(world, persistItem);
}

await attachRealtime(app, world, {
  classroom,
  runExclusive,
  allowGuestPlay,
  resolveSession: (token) => auth.resolvePlayIdentity(token),
  resolveSocketTicket: (ticket) => auth.resolveSocketTicket(ticket),
  persistRoom: (characterId, roomId) => stores.characters.updateRoom(characterId, roomId),
  persistProgress: (characterId, input) => stores.characters.updateProgress(characterId, input),
  persistItem,
  persistQuest: stores.quests,
  auditLog: stores.audit,
  listClassroom: async (actorAccountId) => {
    const result = await auth.listClassroom(actorAccountId);
    return result.ok ? result : undefined;
  },
  bindInPlay: (listInPlay) => {
    inPlay.list = listInPlay;
  },
  disableAccount: async (actorAccountId, username) => {
    const result = await auth.disableAccountByUsername(actorAccountId, username);
    if (result.ok) {
      const account = await stores.accounts.getByUsername(username);
      if (account) classroom.notifyDisabled(account.id);
    }
    return result.ok ? { ok: true } : { ok: false, message: result.message };
  },
});
process.on("uncaughtException", (error) => {
  app.log.error({ event: "uncaught_exception", message: safeErrorMessage(error) }, "process crash");
});
process.on("unhandledRejection", (error) => {
  app.log.error(
    { event: "unhandled_rejection", message: safeErrorMessage(error) },
    "process crash",
  );
});

await app.listen({ port, host });
app.log.info(
  { event: "process_listening", host, port, worldVersion: process.env.WORLD_VERSION ?? "dev" },
  "courtyard listening",
);
