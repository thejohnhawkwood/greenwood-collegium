import { afterAll, beforeAll, describe } from "vitest";
import { applyMigrations } from "./migrator.js";
import {
  closePersistence,
  createPersistence,
  pingDatabase,
  type Persistence,
} from "./connection.js";
import { persistAccountAndCharacter } from "./persist.contract.js";
import { PostgresAccountRepository, PostgresCharacterRepository } from "./postgres.js";

const testDatabaseUrl = process.env.GREENWOOD_TEST_DATABASE_URL;

describe.skipIf(!testDatabaseUrl)("postgres persistence", () => {
  let persistence: Persistence;
  const accounts = () => new PostgresAccountRepository(persistence.db);
  const characters = () => new PostgresCharacterRepository(persistence.db, accounts());

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      return;
    }
    persistence = createPersistence(testDatabaseUrl);
    await pingDatabase(persistence);
    await applyMigrations(persistence);
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
    },
    {
      create: (input) => characters().create(input),
      getById: (id) => characters().getById(id),
      listByAccountId: (accountId) => characters().listByAccountId(accountId),
    },
  );
});
