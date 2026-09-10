import { describe } from "vitest";
import { createMemoryStores } from "./memory.js";
import { persistSessionsAndInvites } from "./persist-auth.contract.js";
import { persistInventoryOwnership } from "./persist-inventory.contract.js";
import { persistQuestProgressAndExperience } from "./persist-quest.contract.js";
import { persistAccountAndCharacter } from "./persist.contract.js";
import { persistModeration } from "./persist-moderation.contract.js";

describe("in-memory persistence", () => {
  const stores = createMemoryStores();
  persistAccountAndCharacter(stores.accounts, stores.characters);
  persistSessionsAndInvites(stores.accounts, stores.characters, stores.sessions, stores.invites);
  persistInventoryOwnership(stores.accounts, stores.characters, stores.items);
  persistQuestProgressAndExperience(stores.accounts, stores.characters, stores.quests);
  persistModeration(() => stores);
});
