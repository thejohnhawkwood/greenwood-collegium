import { expect, it } from "vitest";
import type {
  AccountRepository,
  CharacterRepository,
  DefenseRepository,
  QuestProgressRepository,
} from "./types.js";

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
    expect(stored[0]?.outcome).toBeUndefined();
    expect(await characters.getById(character.id)).toMatchObject({
      experience: 10,
      level: 2,
    });

    // H1. A forked quest remembers which ending this Collegian reached.
    await quests.upsert({
      characterId: character.id,
      questId: "the-borrowed-ink",
      status: "completed",
      completedObjectiveIds: ["fetch", "give-back"],
      rewardGranted: true,
      outcome: "returned",
    });
    const forked = (await quests.listByCharacter(character.id)).find(
      (record) => record.questId === "the-borrowed-ink",
    );
    expect(forked?.outcome).toBe("returned");
  });
}

/** H3. The defense phase survives a restart so a redeploy mid-class does not lose it. */
export function persistCollegeDefense(defense: DefenseRepository): void {
  it("stores one defense row and overwrites it in place", async () => {
    expect(await defense.current()).toBeUndefined();

    const endsAt = new Date("2026-09-25T18:07:00.000Z");
    await defense.save({
      id: "defense-1",
      phase: "fighting",
      endsAt,
      startedByUsername: "arbird",
    });
    expect(await defense.current()).toMatchObject({
      id: "defense-1",
      phase: "fighting",
      startedByUsername: "arbird",
    });
    expect((await defense.current())?.endsAt?.toISOString()).toBe(endsAt.toISOString());

    await defense.save({ id: "defense-1", phase: "closed", startedByUsername: "arbird" });
    const closed = await defense.current();
    expect(closed?.phase).toBe("closed");
    expect(closed?.endsAt).toBeUndefined();
  });
}
