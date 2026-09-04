import { expect, it } from "vitest";
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
