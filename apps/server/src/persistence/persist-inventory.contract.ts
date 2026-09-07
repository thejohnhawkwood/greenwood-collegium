import { expect, it } from "vitest";
import type { AccountRepository, CharacterRepository, ItemInstanceRepository } from "./types.js";

export function persistInventoryOwnership(
  accounts: AccountRepository,
  characters: CharacterRepository,
  items: ItemInstanceRepository,
): void {
  it("gives a unique item to only one of two concurrent claims", async () => {
    const account = await accounts.create({
      username: `claim-${crypto.randomUUID().slice(0, 8)}`,
      passwordHash: "pending",
      role: "student",
    });
    const first = await characters.create({
      accountId: account.id,
      name: "Rowan the Hare",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    const second = await characters.create({
      accountId: account.id,
      name: "Moss the Mole",
      speciesId: "mole",
      roomId: "lantern-court",
    });
    const itemId = `item-key-${crypto.randomUUID()}`;
    await items.ensurePlacements([
      { id: itemId, templateId: "small-copper-key", roomId: "lantern-court" },
    ]);

    const [claimedByFirst, claimedBySecond] = await Promise.all([
      items.claim(itemId, first.id, "lantern-court"),
      items.claim(itemId, second.id, "lantern-court"),
    ]);

    expect([claimedByFirst, claimedBySecond].filter(Boolean)).toHaveLength(1);
    const stored = (await items.list()).find((item) => item.id === itemId);
    expect(stored?.holderCharacterId).toBe(claimedByFirst ? first.id : second.id);
    expect(stored?.roomId).toBeUndefined();

    const ownerId = stored?.holderCharacterId;
    if (!ownerId) {
      throw new Error("expected an owner");
    }
    expect(await items.release(itemId, ownerId, "lantern-court")).toBe(true);
    expect(await items.claim(itemId, first.id, "great-hall")).toBe(false);
    expect(await items.claim(itemId, first.id, "lantern-court")).toBe(true);
  });
}
