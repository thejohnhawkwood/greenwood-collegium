import { expect, it } from "vitest";
import type { AccountRepository, CharacterRepository, QuestProgressRepository } from "./types.js";

export function persistQuestProgressAndExperience(
  accounts: AccountRepository,
  characters: CharacterRepository,
  quests: QuestProgressRepository,
): void {
  it("stores quest progress and keeps experience at the awarded total", async () => {
    const account = await accounts.create({
      username: `quest-${crypto.randomUUID().slice(0, 8)}`,
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: `Rowan ${crypto.randomUUID().slice(0, 8)}`,
      speciesId: "hare",
      roomId: "lantern-court",
    });

    await quests.upsert({
      characterId: character.id,
      questId: "arrival-at-the-collegium",
      status: "completed",
      completedObjectiveIds: ["look", "speak", "take", "arrive"],
      rewardGranted: true,
    });
    await characters.updateProgress(character.id, { experience: 10, level: 2 });

    await quests.upsert({
      characterId: character.id,
      questId: "arrival-at-the-collegium",
      status: "completed",
      completedObjectiveIds: ["look", "speak", "take", "arrive"],
      rewardGranted: true,
    });
    await characters.updateProgress(character.id, { experience: 10, level: 2 });

    const stored = await quests.listByCharacter(character.id);
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      questId: "arrival-at-the-collegium",
      status: "completed",
      rewardGranted: true,
    });
    expect(stored[0]?.completedObjectiveIds).toEqual(["look", "speak", "take", "arrive"]);
    expect(await characters.getById(character.id)).toMatchObject({
      experience: 10,
      level: 2,
    });
  });
}
