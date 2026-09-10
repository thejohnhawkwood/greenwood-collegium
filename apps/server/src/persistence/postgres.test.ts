import { afterAll, beforeAll, describe } from "vitest";
import { applyMigrations } from "./migrator.js";
import {
  closePersistence,
  createPersistence,
  pingDatabase,
  type Persistence,
} from "./connection.js";
import { persistSessionsAndInvites } from "./persist-auth.contract.js";
import { persistInventoryOwnership } from "./persist-inventory.contract.js";
import { persistQuestProgressAndExperience } from "./persist-quest.contract.js";
import { persistAccountAndCharacter } from "./persist.contract.js";
import { persistModeration } from "./persist-moderation.contract.js";
import {
  PostgresClassroomResetRepository,
  PostgresModerationRepository,
} from "./moderation-postgres.js";
import {
  PostgresAccountRepository,
  PostgresCharacterRepository,
  PostgresInviteRepository,
  PostgresItemRepository,
  PostgresQuestRepository,
  PostgresSessionRepository,
} from "./postgres.js";

const testDatabaseUrl = process.env.GREENWOOD_TEST_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)("postgres persistence", () => {
  let persistence: Persistence;
  const accounts = () => new PostgresAccountRepository(persistence.db);
  const characters = () => new PostgresCharacterRepository(persistence.db, accounts());
  const sessions = () => new PostgresSessionRepository(persistence.db);
  const invites = () => new PostgresInviteRepository(persistence.db);
  const items = () => new PostgresItemRepository(persistence.db);
  const quests = () => new PostgresQuestRepository(persistence.db);

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      return;
    }
    persistence = createPersistence(testDatabaseUrl);
    await pingDatabase(persistence);
    await applyMigrations(persistence);
    await persistence.pool.query("delete from speech_log");
    await persistence.pool.query("delete from classroom_settings");
    await persistence.pool.query("delete from quest_progress");
    await persistence.pool.query("delete from item_instances");
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
      rename: (id, username) => accounts().rename(id, username),
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
      getByNormalizedName: (name) => characters().getByNormalizedName(name),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
      updateCreation: (id, input) => characters().updateCreation(id, input),
      updateRoom: (id, roomId) => characters().updateRoom(id, roomId),
      updateProgress: (id, input) => characters().updateProgress(id, input),
    },
  );

  persistSessionsAndInvites(
    {
      rename: (id, username) => accounts().rename(id, username),
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
      getByNormalizedName: (name) => characters().getByNormalizedName(name),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
      updateCreation: (id, input) => characters().updateCreation(id, input),
      updateRoom: (id, roomId) => characters().updateRoom(id, roomId),
      updateProgress: (id, input) => characters().updateProgress(id, input),
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
      list: () => invites().list(),
      consume: (id, at, consumedByAccountId) => invites().consume(id, at, consumedByAccountId),
    },
  );

  persistInventoryOwnership(
    {
      rename: (id, username) => accounts().rename(id, username),
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
      getByNormalizedName: (name) => characters().getByNormalizedName(name),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
      updateCreation: (id, input) => characters().updateCreation(id, input),
      updateRoom: (id, roomId) => characters().updateRoom(id, roomId),
      updateProgress: (id, input) => characters().updateProgress(id, input),
    },
    {
      ensurePlacements: (seeds) => items().ensurePlacements(seeds),
      list: () => items().list(),
      claim: (itemId, characterId, roomId) => items().claim(itemId, characterId, roomId),
      release: (itemId, characterId, roomId) => items().release(itemId, characterId, roomId),
    },
  );

  persistQuestProgressAndExperience(
    {
      rename: (id, username) => accounts().rename(id, username),
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
      getByNormalizedName: (name) => characters().getByNormalizedName(name),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
      updateCreation: (id, input) => characters().updateCreation(id, input),
      updateRoom: (id, roomId) => characters().updateRoom(id, roomId),
      updateProgress: (id, input) => characters().updateProgress(id, input),
    },
    {
      listByCharacter: (characterId) => quests().listByCharacter(characterId),
      upsert: (record) => quests().upsert(record),
    },
  );
  persistModeration(() => ({
    accounts: accounts(),
    characters: characters(),
    sessions: sessions(),
    invites: invites(),
    items: items(),
    quests: quests(),
    moderation: new PostgresModerationRepository(persistence.db),
    reset: new PostgresClassroomResetRepository(persistence.db),
  }));
});
