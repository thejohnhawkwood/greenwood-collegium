import { afterAll, beforeAll, describe } from "vitest";
import { applyMigrations } from "./migrator.js";
import {
  closePersistence,
  createPersistence,
  pingDatabase,
  type Persistence,
} from "./connection.js";
import { persistSessionsAndInvites } from "./persist-auth.contract.js";
import { persistAccountAndCharacter } from "./persist.contract.js";
import {
  PostgresAccountRepository,
  PostgresCharacterRepository,
  PostgresInviteRepository,
  PostgresSessionRepository,
} from "./postgres.js";

const testDatabaseUrl = process.env.GREENWOOD_TEST_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)("postgres persistence", () => {
  let persistence: Persistence;
  const accounts = () => new PostgresAccountRepository(persistence.db);
  const characters = () => new PostgresCharacterRepository(persistence.db, accounts());
  const sessions = () => new PostgresSessionRepository(persistence.db);
  const invites = () => new PostgresInviteRepository(persistence.db);

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      return;
    }
    persistence = createPersistence(testDatabaseUrl);
    await pingDatabase(persistence);
    await applyMigrations(persistence);
    await persistence.pool.query("delete from sessions");
    await persistence.pool.query("delete from invites");
    await persistence.pool.query("delete from characters");
    await persistence.pool.query("delete from accounts");
  });

  afterAll(async () => {
    if (persistence) {
      await closePersistence(persistence);
    }
  });

  persistAccountAndCharacter(
    {
      create: (input) => accounts().create(input),
      getById: (id) => accounts().getById(id),
      getByUsername: (username) => accounts().getByUsername(username),
      listByRole: (role) => accounts().listByRole(role),
      updateStatus: (id, status) => accounts().updateStatus(id, status),
      touchSignIn: (id, at) => accounts().touchSignIn(id, at),
    },
    {
      create: (input) => characters().create(input),
      getById: (id) => characters().getById(id),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
      updateRoom: (id, roomId) => characters().updateRoom(id, roomId),
    },
  );

  persistSessionsAndInvites(
    {
      create: (input) => accounts().create(input),
      getById: (id) => accounts().getById(id),
      getByUsername: (username) => accounts().getByUsername(username),
      listByRole: (role) => accounts().listByRole(role),
      updateStatus: (id, status) => accounts().updateStatus(id, status),
      touchSignIn: (id, at) => accounts().touchSignIn(id, at),
    },
    {
      create: (input) => characters().create(input),
      getById: (id) => characters().getById(id),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
      updateRoom: (id, roomId) => characters().updateRoom(id, roomId),
    },
    {
      create: (input) => sessions().create(input),
      getByTokenHash: (tokenHash) => sessions().getByTokenHash(tokenHash),
      revoke: (id, at) => sessions().revoke(id, at),
      revokeAllForAccount: (accountId, at) => sessions().revokeAllForAccount(accountId, at),
    },
    {
      create: (input) => invites().create(input),
      getByTokenHash: (tokenHash) => invites().getByTokenHash(tokenHash),
      consume: (id, at) => invites().consume(id, at),
    },
  );
});
