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
