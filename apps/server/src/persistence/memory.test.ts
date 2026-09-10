import { describe, expect, it } from "vitest";
import { createMemoryStores } from "./memory.js";
import { persistSessionsAndInvites } from "./persist-auth.contract.js";
import { persistInventoryOwnership } from "./persist-inventory.contract.js";
import { persistQuestProgressAndExperience } from "./persist-quest.contract.js";
import { persistAccountAndCharacter } from "./persist.contract.js";

describe("in-memory persistence", () => {
  const stores = createMemoryStores();
  persistAccountAndCharacter(stores.accounts, stores.characters);
  persistSessionsAndInvites(stores.accounts, stores.characters, stores.sessions, stores.invites);
  persistInventoryOwnership(stores.accounts, stores.characters, stores.items);
  persistQuestProgressAndExperience(stores.accounts, stores.characters, stores.quests);

  it("keeps recent room chat and drops older lines", async () => {
    const chat = createMemoryStores().chat;
    await chat.append({
      at: new Date("2020-01-01T00:00:00.000Z"),
      characterId: "old",
      characterName: "Old",
      roomId: "lantern-court",
      text: "gone",
    });
    await chat.append({
      at: new Date(),
      characterId: "pip",
      username: "pip",
      characterName: "Pip the Sparrow",
      roomId: "lantern-court",
      text: "hello",
    });
    const recent = await chat.listRecent(10);
    expect(recent).toEqual([
      expect.objectContaining({ username: "pip", text: "hello" }),
    ]);
  });
});
