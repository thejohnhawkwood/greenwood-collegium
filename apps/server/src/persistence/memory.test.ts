import { describe } from "vitest";
import { createMemoryStores } from "./memory.js";
import { persistSessionsAndInvites } from "./persist-auth.contract.js";
import { persistAccountAndCharacter } from "./persist.contract.js";

describe("in-memory persistence", () => {
  const stores = createMemoryStores();
  persistAccountAndCharacter(stores.accounts, stores.characters);
  persistSessionsAndInvites(stores.accounts, stores.characters, stores.sessions, stores.invites);
});
