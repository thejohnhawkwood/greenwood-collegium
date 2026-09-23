import { expect, it } from "vitest";
import { DEFAULT_APPEARANCE, type Appearance } from "@greenwood/contracts";
import {
  AccountNotFoundError,
  DuplicateUsernameError,
  type AccountRepository,
  type CharacterRepository,
} from "./types.js";

export function persistAccountAndCharacter(
  accounts: AccountRepository,
  characters: CharacterRepository,
): void {
  it("saves appearance through repository reloads, replacement and teacher rename", async () => {
    const account = await accounts.create({
      username: "portrait-fixture",
      passwordHash: "pending",
      role: "student",
    });
    const appearance: Appearance = {
      ...DEFAULT_APPEARANCE,
      build: "sturdy",
      palette: "ash",
      accessory: "satchel",
    };
    const character = await characters.create({
      accountId: account.id,
      name: "Briar",
      speciesId: "badger",
      roomId: "lantern-court",
      appearance,
    });
    expect((await characters.getById(character.id))?.appearance).toEqual(appearance);
    const revised: Appearance = { ...appearance, clothing: "indigo", marking: "blaze" };
    await characters.updateCreation(character.id, {
      name: "Briar",
      speciesId: "badger",
      gender: "female",
      appearance: revised,
      creationCompletedAt: new Date(),
    });
    expect((await characters.listByAccountId(account.id))[0]?.appearance).toEqual(revised);
    await characters.updateCreation(character.id, {
      name: "Briarlight",
      speciesId: "badger",
      gender: "female",
      creationCompletedAt: new Date(),
    });
    expect((await characters.getById(character.id))?.appearance).toEqual(revised);
    const legacy = await characters.create({
      accountId: account.id,
      name: "Legacy",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    expect((await characters.getById(legacy.id))?.appearance).toEqual(DEFAULT_APPEARANCE);
  });
  it("saves discovery through repository reloads and keeps it after teacher rename", async () => {
    const account = await accounts.create({
      username: "chart-fixture",
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: "Chart",
      speciesId: "fox",
      roomId: "lantern-court",
    });
    expect((await characters.getById(character.id))?.discoveredRoomIds).toEqual(["lantern-court"]);
    await characters.updateDiscovery(character.id, ["lantern-court", "great-hall"]);
    expect((await characters.getById(character.id))?.discoveredRoomIds).toEqual([
      "lantern-court",
      "great-hall",
    ]);
    await characters.updateCreation(character.id, {
      name: "Chartreuse",
      speciesId: "fox",
      gender: "female",
      creationCompletedAt: new Date(),
    });
    expect((await characters.getById(character.id))?.discoveredRoomIds).toEqual([
      "lantern-court",
      "great-hall",
    ]);
  });
  it("saves a chosen school through repository reloads", async () => {
    const account = await accounts.create({
      username: "hearth-fixture",
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: "Hearth",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    expect((await characters.getById(character.id))?.schoolId).toBeUndefined();
    await characters.updateSchool(character.id, "steel");
    expect((await characters.getById(character.id))?.schoolId).toBe("steel");
  });
  it("saves defeated spawn memory through repository reloads", async () => {
    const account = await accounts.create({
      username: "orchard-fixture",
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: "Orchard",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    expect((await characters.getById(character.id))?.defeatedSpawnIds).toEqual([]);
    await characters.updateDefeatedSpawns(character.id, [
      "enemy-practice-dummy-south-orchard",
      "enemy-practice-dummy-south-orchard",
    ]);
    expect((await characters.getById(character.id))?.defeatedSpawnIds).toEqual([
      "enemy-practice-dummy-south-orchard",
    ]);
  });
  it("saves Primer leaves and a pending offer through repository reloads", async () => {
    const account = await accounts.create({
      username: "primer-fixture",
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: "Primer",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    expect((await characters.getById(character.id))?.knownSpells).toEqual([]);
    await characters.updatePrimer(character.id, {
      knownSpells: [{ spellId: "ember", rank: 2, pennedBy: "Mentor Cinder" }],
      pendingPrimerChoices: {
        level: 4,
        options: [
          { kind: "upgrade", spellId: "ember", rank: 3 },
          { kind: "unlock", spellId: "flame-breath", rank: 1 },
          { kind: "vital", vitalHealth: 2, vitalFocus: 1 },
        ],
      },
      primerAwardedLevels: [3, 4],
    });
    expect((await characters.getById(character.id))?.knownSpells).toEqual([
      { spellId: "ember", rank: 2, pennedBy: "Mentor Cinder" },
    ]);
    expect((await characters.getById(character.id))?.pendingPrimerChoices?.level).toBe(4);
    expect((await characters.getById(character.id))?.primerAwardedLevels).toEqual([3, 4]);
    expect((await characters.getById(character.id))?.equipment).toEqual({});
    await characters.updateEquipment(character.id, {
      "main-hand": "item-sword",
      cloak: "not a slot item",
      helmet: "helm-1",
    });
    expect((await characters.getById(character.id))?.equipment).toEqual({
      "main-hand": "item-sword",
      helmet: "helm-1",
    });
  });
  it("rewrites retired Ember leaf ids on reload", async () => {
    const account = await accounts.create({
      username: "ember-rename",
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: "Rename",
      speciesId: "fox",
      roomId: "lantern-court",
    });
    await characters.updatePrimer(character.id, {
      knownSpells: [{ spellId: "coal-breath", rank: 2, pennedBy: "Mentor Cinder" }],
      pendingPrimerChoices: {
        level: 8,
        options: [
          { kind: "unlock", spellId: "ash-shroud", rank: 1 },
          { kind: "unlock", spellId: "banked-coals", rank: 1 },
          { kind: "unlock", spellId: "kiln", rank: 1 },
        ],
      },
      primerAwardedLevels: [8],
    });
    expect((await characters.getById(character.id))?.knownSpells).toEqual([
      { spellId: "flame-breath", rank: 2, pennedBy: "Mentor Cinder" },
    ]);
    expect(
      (await characters.getById(character.id))?.pendingPrimerChoices?.options.map(
        (card) => card.spellId,
      ),
    ).toEqual(["blaze-mantle", "heart-fire", "stoke"]);
  });
  it("rewrites retired Steel Measure ids to Draw on reload", async () => {
    const account = await accounts.create({
      username: "steel-rename",
      passwordHash: "pending",
      role: "student",
    });
    const character = await characters.create({
      accountId: account.id,
      name: "Edge",
      speciesId: "fox",
      roomId: "lantern-court",
    });
    await characters.updatePrimer(character.id, {
      knownSpells: [{ spellId: "measure", rank: 2, pennedBy: "Mentor Edge" }],
      pendingPrimerChoices: {
        level: 8,
        options: [{ kind: "unlock", spellId: "measure", rank: 1 }],
      },
      primerAwardedLevels: [8],
    });
    expect((await characters.getById(character.id))?.knownSpells).toEqual([
      { spellId: "draw", rank: 2, pennedBy: "Mentor Edge" },
    ]);
    expect(
      (await characters.getById(character.id))?.pendingPrimerChoices?.options.map(
        (card) => card.spellId,
      ),
    ).toEqual(["draw"]);
  });
  it("persists an account and a character that can be read back", async () => {
    const account = await accounts.create({
      username: "Rowan",
      passwordHash: "pending",
      role: "student",
    });
    expect(account.username).toBe("rowan");
    expect(await accounts.getByUsername("ROWAN")).toMatchObject({ id: account.id });
    expect(await accounts.getById(account.id)).toMatchObject({ role: "student" });

    const character = await characters.create({
      accountId: account.id,
      name: "Rowan the Hare",
      speciesId: "hare",
      roomId: "lantern-court",
    });
    expect(await characters.getById(character.id)).toMatchObject({
      name: "Rowan the Hare",
      roomId: "lantern-court",
      level: 1,
    });
    expect(await characters.listByAccountId(account.id)).toHaveLength(1);
  });

  it("rejects a duplicate username and a character without an account", async () => {
    await accounts.create({
      username: "moss",
      passwordHash: "pending",
      role: "student",
    });
    await expect(
      accounts.create({ username: "MOSS", passwordHash: "pending", role: "student" }),
    ).rejects.toBeInstanceOf(DuplicateUsernameError);
    await expect(
      characters.create({
        accountId: "missing-account",
        name: "Ghost",
        speciesId: "mole",
        roomId: "lantern-court",
      }),
    ).rejects.toBeInstanceOf(AccountNotFoundError);
  });
}
